"""
Ollama Backend - Optimized Production Version
✅ Clean code, no redundant elements
✅ Redis-ready rate limiting
✅ Cached health checks
✅ Minimal logging overhead
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import time
from collections import defaultdict
import threading
import logging
import os

from monitoring import monitoring

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ================= LOGGING =================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("story-api")

# Application Insights
APPINSIGHTS_CONN = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
if APPINSIGHTS_CONN:
    try:
        from opencensus.ext.azure.log_exporter import AzureLogHandler
        logger.addHandler(AzureLogHandler(connection_string=APPINSIGHTS_CONN))
    except ImportError:
        logger.error("Application Insights module not installed")

# ================= CONFIG =================
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama-vm:11434/api/generate")
MODEL_NAME = os.getenv("MODEL_NAME", "mistral:latest")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "300"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))
MAX_REQUESTS_PER_DAY = int(os.getenv("MAX_REQUESTS_PER_DAY", "1000"))

# Rate limiting storage
_rate_limit_lock = threading.RLock()  # RLock allows re-entrant locking
rate_limit_storage = defaultdict(lambda: {'minute': [], 'day': []})

# ================= MIDDLEWARE =================

@app.before_request
def track_request_start():
    request.start_time = time.time()

@app.after_request
def track_request_end(response):
    if hasattr(request, 'start_time'):
        duration = (time.time() - request.start_time) * 1000
        monitoring.track_request(
            endpoint=request.path,
            status_code=response.status_code,
            duration=duration,
            method=request.method
        )
    return response

# ================= HELPERS =================

def get_client_ip():
    """Get client IP with proper fallback"""
    forwarded = request.headers.get('X-Forwarded-For', '').strip()
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or 'unknown'

def check_rate_limit(client_ip):
    """Check rate limits with automatic cleanup (thread-safe)"""
    with _rate_limit_lock:
        current_time = time.time()
        
        # Cleanup old entries
        rate_limit_storage[client_ip]['minute'] = [
            t for t in rate_limit_storage[client_ip]['minute'] 
            if current_time - t < 60
        ]
        rate_limit_storage[client_ip]['day'] = [
            t for t in rate_limit_storage[client_ip]['day'] 
            if current_time - t < 86400
        ]
        
        # Check limits
        if len(rate_limit_storage[client_ip]['minute']) >= MAX_REQUESTS_PER_MINUTE:
            return False, f"Rate limit: {MAX_REQUESTS_PER_MINUTE}/min"
        
        if len(rate_limit_storage[client_ip]['day']) >= MAX_REQUESTS_PER_DAY:
            return False, f"Daily limit: {MAX_REQUESTS_PER_DAY}/day"
        
        # Add current request
        rate_limit_storage[client_ip]['minute'].append(current_time)
        rate_limit_storage[client_ip]['day'].append(current_time)
        return True, None

_ollama_cache = {'status': None, 'timestamp': 0}
CACHE_TTL = 30  # seconds

def check_ollama_status():
    """Health check with 30-second cache"""
    current_time = time.time()
    
    # Check if cache is valid
    if current_time - _ollama_cache['timestamp'] < CACHE_TTL:
        return _ollama_cache['status']
    
    # Cache expired, check Ollama
    try:
        base_url = OLLAMA_URL.replace('/api/generate', '')
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        status = response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama unreachable: {e}")
        status = False
    
    # Update cache
    _ollama_cache['status'] = status
    _ollama_cache['timestamp'] = current_time
    
    return status

def build_smart_prompt(user_message, story_context):
    """Build intelligent prompt based on question type"""
    
    message_lower = user_message.lower()
    
    system_context = f"""You are a helpful storytelling assistant for children.

STORY:
{story_context}

RULES:
- Answer based ONLY on the story above
- Use simple words for children (ages 5-12)
- Add fun emojis 😊
- Keep answers clear and accurate
- If answer not in story, say "I don't know that from the story!"
- Never make up information

"""

    # Detect question type and customize instructions
    if any(word in message_lower for word in ['character', 'who is', 'who are', 'who was']):
        instructions = """Question: {question}

List ALL important characters who appear multiple times or do important things.

Format:
The main characters are:
1. **Name** 👤 - what they do
2. **Name** 👤 - what they do

Answer:"""
        
    elif message_lower.startswith('why'):
        instructions = """Question: {question}

Explain WHY in 3-4 sentences:
- What happened?
- Why did it happen?
- What was the reason?

Answer:"""
        
    elif message_lower.startswith('how'):
        if any(word in message_lower for word in ['feel', 'felt', 'feeling']):
            instructions = """Question: {question}

Explain feelings in 2-3 sentences with emotion emojis 😊😢😱:
- What happened?
- How did they feel?
- Why?

Answer:"""
        else:
            instructions = """Question: {question}

Explain step by step:
1. First...
2. Then...
3. Finally...

Answer:"""
    
    elif any(word in message_lower for word in ['compare', 'difference', 'similar']):
        instructions = """Question: {question}

Compare clearly:
1. First person/thing
2. Second person/thing
3. How they differ or are similar

Answer:"""
    
    elif any(word in message_lower for word in ['what happened', 'summary', 'summarize']):
        instructions = """Question: {question}

Give complete summary in 5-6 sentences:
1. Beginning
2. Problem
3. Action
4. Solution
5. Ending

Answer:"""
    
    elif any(word in message_lower for word in ['moral', 'lesson', 'learn', 'teach']):
        instructions = """Question: {question}

Explain the lesson in 3-4 sentences with wisdom emojis 💡✨:
- What does the story teach?
- Why is this important?
- How can we use this?

Answer:"""
    
    elif 'what if' in message_lower:
        instructions = """Question: {question}

Imagination question! Think about:
- What would change?
- Better or worse?
- What happens next?

Answer in 3-4 sentences 🤔

Answer:"""
    
    else:
        instructions = """Question: {question}

Answer clearly in 2-4 sentences. Keep it simple and fun! Add emojis!

Answer:"""
    
    return system_context + instructions.format(question=user_message)

def call_ollama(user_message, story_context):
    """Call Ollama API with optimized settings"""
    
    monitoring.track_event('chat_request', {
        'message_length': len(user_message),
        'model': MODEL_NAME
    })
    
    try:
        start_time = time.time()
        prompt = build_smart_prompt(user_message, story_context)
        
        # Detect complexity
        is_complex = any(word in user_message.lower() for word in 
                         ['why', 'how', 'compare', 'what if', 'moral', 'lesson'])
        
        temperature = 0.6 if is_complex else 0.5
        max_tokens = 450 if is_complex else 350
        
        # Call Ollama
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "top_p": 0.9,
                    "repeat_penalty": 1.2,
                    "num_thread": 4
                }
            },
            timeout=OLLAMA_TIMEOUT
        )
        
        response_time = round(time.time() - start_time, 2)
        
        if response.status_code == 200:
            reply = response.json().get('response', '').strip()
            
            if not reply:
                reply = "Sorry, I couldn't answer! Try asking differently! 😊"
            
            # Clean up
            if reply.lower().startswith('answer:'):
                reply = reply[7:].strip()
            
            monitoring.track_inference(
                model=MODEL_NAME,
                prompt_tokens=len(user_message.split()),
                response_tokens=len(reply.split()),
                duration=response_time * 1000,
                success=True
            )
            
            return {
                'reply': reply,
                'response_time': response_time,
                'status': 'success'
            }
        else:
            error_msg = f"Ollama error {response.status_code}"
            monitoring.track_error('OllamaError', error_msg, {'status_code': response.status_code})
            return {'error': error_msg, 'status': 'error'}
    
    except requests.exceptions.ConnectionError as e:
        monitoring.track_error('OllamaConnectionError', str(e))
        return {'error': f'Cannot connect to Ollama at {OLLAMA_URL}', 'status': 'error'}
    
    except requests.exceptions.Timeout:
        monitoring.track_error('OllamaTimeout', f'Timeout after {OLLAMA_TIMEOUT}s')
        return {'error': 'Request timeout (model processing)', 'status': 'timeout'}
    
    except Exception as e:
        monitoring.track_error('OllamaException', str(e))
        return {'error': str(e), 'status': 'error'}

# ================= ENDPOINTS =================

@app.route('/api/stories/featured', methods=['GET'])
def get_featured_stories():
    """Get featured stories (placeholder - integrate with your database)"""
    try:
        # TODO: Replace with actual database query
        featured = [
            {
                'id': 1,
                'title': 'The Brave Little Mouse',
                'description': 'A story about courage',
                'image': '/images/mouse.jpg',
                'featured': True
            }
        ]
        return jsonify(featured), 200
    except Exception as e:
        logger.error(f"Error fetching featured stories: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stories/popular', methods=['GET'])
def get_popular_stories():
    """Get popular stories (placeholder)"""
    try:
        # TODO: Replace with actual database query
        popular = [
            {
                'id': 2,
                'title': 'The Magic Forest',
                'description': 'An adventure story',
                'image': '/images/forest.jpg',
                'views': 1000
            }
        ]
        return jsonify(popular), 200
    except Exception as e:
        logger.error(f"Error fetching popular stories: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    ollama_status = check_ollama_status()
    
    return jsonify({
        'status': 'OK' if ollama_status else 'Degraded',
        'service': 'Story Ollama Backend',
        'ollama_url': OLLAMA_URL,
        'model': MODEL_NAME,
        'timeout': f'{OLLAMA_TIMEOUT}s',
        'ollama_connected': ollama_status,
        'features': [
            'Smart question detection',
            'Context-aware responses',
            'Character analysis',
            'Why/How questions',
            'Comparison support',
            'Moral/Lesson extraction'
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Backend is working! 🎉',
        'version': '3.0 - Optimized',
        'ollama_connected': check_ollama_status(),
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    client_ip = get_client_ip()
    daily = len(rate_limit_storage[client_ip]['day'])
    remaining = max(0, MAX_REQUESTS_PER_DAY - daily)
    
    return jsonify({
        'requests_today': daily,
        'remaining_today': remaining,
        'max_per_day': MAX_REQUESTS_PER_DAY
    }), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    
    try:
        # Rate limit check
        client_ip = get_client_ip()
        allowed, err = check_rate_limit(client_ip)
        if not allowed:
            monitoring.track_error('RateLimitExceeded', err, {'client_ip': client_ip})
            return jsonify({'error': err, 'status': 'rate_limit_exceeded'}), 429
        
        # Get request data
        data = request.json or {}
        user_message = data.get('message', '').strip()
        story_context = data.get('story_context', '')
        
        if not user_message:
            return jsonify({'error': 'Message required'}), 400
        
        # Check Ollama
        if not check_ollama_status():
            return jsonify({'error': 'Ollama not reachable', 'status': 'error'}), 503
        
        # Call Ollama
        result = call_ollama(user_message, story_context)
        
        if result.get('status') == 'error':
            return jsonify(result), 500
        
        return jsonify({
            'reply': result['reply'],
            'response_time': result.get('response_time', 0),
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }), 200
    
    except Exception as e:
        logger.error(f"Error in /api/chat: {e}")
        monitoring.track_error('ChatEndpointError', str(e))
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/explain-word', methods=['POST'])
def explain_word():
    
    try:
        # Rate limit
        client_ip = get_client_ip()
        allowed, err = check_rate_limit(client_ip)
        if not allowed:
            return jsonify({'error': err}), 429
        
        # Get data
        data = request.json or {}
        word = data.get('word', '').strip()
        story_context = data.get('story_context', '')
        
        if not word:
            return jsonify({'error': 'Word required'}), 400
        
        if not check_ollama_status():
            return jsonify({'error': 'Ollama not reachable'}), 503
        
        monitoring.track_event('word_explanation_requested', {'word': word})
        
        # Build prompt
        prompt = f"""You are teaching a child about words.

STORY: {story_context[:600]}
WORD: "{word}"

Explain in 2-3 simple sentences with example and emoji.

Explanation:"""
        
        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 200,
                        "top_p": 0.9
                    }
                },
                timeout=OLLAMA_TIMEOUT
            )
            
            if response.status_code == 200:
                explanation = response.json().get('response', '').strip()
                
                if not explanation:
                    explanation = f"The word '{word}' means something special! 📚"
                
                if explanation.lower().startswith('explanation:'):
                    explanation = explanation[12:].strip()
                
                return jsonify({
                    'word': word,
                    'explanation': explanation,
                    'status': 'success'
                }), 200
            else:
                return jsonify({'error': 'Failed to explain', 'status': 'error'}), 500
        
        except requests.exceptions.Timeout:
            monitoring.track_error('WordExplanationTimeout', f'Timeout after {OLLAMA_TIMEOUT}s')
            return jsonify({'error': 'Request timeout', 'status': 'timeout'}), 504
        
        except Exception as e:
            monitoring.track_error('WordExplanationException', str(e))
            return jsonify({'error': str(e), 'status': 'error'}), 500
    
    except Exception as e:
        logger.error(f"Error in /api/explain-word: {e}")
        return jsonify({'error': str(e)}), 500

# ================= ERROR HANDLERS =================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ================= MAIN =================

if __name__ == '__main__':
    logger.info(f"Starting Story Backend v3.0")
    logger.info(f"Ollama: {OLLAMA_URL}")
    logger.info(f"Model: {MODEL_NAME}")
    logger.info(f"Timeout: {OLLAMA_TIMEOUT}s")
    
    monitoring.track_event('backend_started', {
        'model': MODEL_NAME,
        'timeout': OLLAMA_TIMEOUT
    })
    
    if check_ollama_status():
        logger.info("Ollama connected ✓")
    else:
        logger.warning(f"Ollama unreachable at {OLLAMA_URL}")
    
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)