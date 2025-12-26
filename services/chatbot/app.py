"""
Ollama Backend - Production Version for Azure VM
Works with external Ollama server (VM or local)
✅ TIMEOUT FIXED: 300 seconds for CPU-only mode
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import time
from collections import defaultdict
import logging
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ================= LOGGING =================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("story-api")

# Application Insights (optional)
try:
    from opencensus.ext.azure.log_exporter import AzureLogHandler
    APPINSIGHTS_CONN = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
    if APPINSIGHTS_CONN:
        handler = AzureLogHandler(connection_string=APPINSIGHTS_CONN)
        logger.addHandler(handler)
        logger.info("Application Insights connected")
except ImportError:
    logger.warning("Application Insights not available")

# ================= CONFIG =================
# Ollama Configuration - points to external VM
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama-vm:11434/api/generate")
MODEL_NAME = os.getenv("MODEL_NAME", "mistral:latest")
# ✅ TIMEOUT INCREASED TO 300 SECONDS (5 minutes)
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "300"))

# Rate limiting
rate_limit_storage = defaultdict(lambda: {'minute': [], 'day': []})
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))
MAX_REQUESTS_PER_DAY = int(os.getenv("MAX_REQUESTS_PER_DAY", "1000"))

logger.info(f"Ollama URL: {OLLAMA_URL}")
logger.info(f"Model: {MODEL_NAME}")
logger.info(f"✅ Timeout: {OLLAMA_TIMEOUT} seconds")

# ================= HELPERS =================

def get_client_ip():
    """Get client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr or 'unknown'

def check_rate_limit(client_ip):
    """Check if client exceeded rate limits"""
    current_time = time.time()
    
    rate_limit_storage[client_ip]['minute'] = [
        t for t in rate_limit_storage[client_ip]['minute'] 
        if current_time - t < 60
    ]
    rate_limit_storage[client_ip]['day'] = [
        t for t in rate_limit_storage[client_ip]['day'] 
        if current_time - t < 86400
    ]
    
    if len(rate_limit_storage[client_ip]['minute']) >= MAX_REQUESTS_PER_MINUTE:
        logger.warning(f"Rate limit exceeded (minute): {client_ip}")
        return False, f"Rate limit: {MAX_REQUESTS_PER_MINUTE}/min"
    
    if len(rate_limit_storage[client_ip]['day']) >= MAX_REQUESTS_PER_DAY:
        logger.warning(f"Rate limit exceeded (day): {client_ip}")
        return False, f"Daily limit: {MAX_REQUESTS_PER_DAY}/day"
    
    rate_limit_storage[client_ip]['minute'].append(current_time)
    rate_limit_storage[client_ip]['day'].append(current_time)
    return True, None

def check_ollama_status():
    """Check if Ollama server is accessible"""
    try:
        # Extract base URL (remove /api/generate)
        base_url = OLLAMA_URL.replace('/api/generate', '')
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama health check failed: {e}")
        return False

def build_smart_prompt(user_message, story_context):
    """Build intelligent prompt based on question type"""
    
    message_lower = user_message.lower()
    
    # System context for ALL questions
    system_context = f"""You are a helpful storytelling assistant for children.

STORY:
{story_context}

RULES:
- Answer based ONLY on the story above
- Use simple words for children (ages 5-12)
- Add fun emojis 😊
- Keep answers clear and accurate
- If the answer is not in the story, say "I don't know that from the story!"
- Never make up information

"""

    # Detect question type and add specific instructions
    if any(word in message_lower for word in ['character', 'who is', 'who are', 'who was']):
        instructions = """Question: {question}

INSTRUCTIONS:
List ALL important characters who:
- Appear multiple times
- Do important things
- Help tell the story

Format:
The main characters are:
1. **Name** 👤 - what they do
2. **Name** 👤 - what they do

Answer:"""
        
    elif message_lower.startswith('why'):
        instructions = """Question: {question}

INSTRUCTIONS:
Think carefully and explain WHY in 3-4 sentences:
- What happened?
- Why did it happen?
- What was the reason?

Use simple words and explain clearly!

Answer:"""
        
    elif message_lower.startswith('how'):
        if any(word in message_lower for word in ['feel', 'felt', 'feeling']):
            instructions = """Question: {question}

INSTRUCTIONS:
Explain the character's feelings:
- What happened to them?
- How did they feel? (happy, sad, scared, excited?)
- Why did they feel that way?

Answer with 2-3 sentences and emotion emojis! 😊😢😱

Answer:"""
        else:
            instructions = """Question: {question}

INSTRUCTIONS:
Explain the process step by step:
1. First...
2. Then...
3. Finally...

Keep it simple for children!

Answer:"""
    
    elif any(word in message_lower for word in ['compare', 'difference', 'similar', 'same']):
        instructions = """Question: {question}

INSTRUCTIONS:
Compare clearly:
1. First person/thing: describe them
2. Second person/thing: describe them
3. How they're different OR similar

Answer:"""
    
    elif any(word in message_lower for word in ['what happened', 'summary', 'summarize', 'tell me about']):
        instructions = """Question: {question}

INSTRUCTIONS:
Give a complete summary with 5-6 sentences:
1. Beginning - how it starts
2. Problem - what goes wrong
3. Action - what characters do
4. Solution - how it's fixed
5. Ending - how it ends

Be detailed and fun! Use emojis!

Answer:"""
    
    elif message_lower.startswith('where'):
        instructions = """Question: {question}

INSTRUCTIONS:
Tell me the location/place:
- Describe where it is
- What does it look like?
- Why is this place important?

Answer in 2-3 sentences with place emojis! 🏰🌳🏡

Answer:"""
    
    elif message_lower.startswith('when'):
        instructions = """Question: {question}

INSTRUCTIONS:
Tell me when it happened:
- What time or day?
- What was happening before/after?

Answer in 2-3 sentences with time emojis! ⏰🌙☀️

Answer:"""
    
    elif any(word in message_lower for word in ['moral', 'lesson', 'learn', 'teach']):
        instructions = """Question: {question}

INSTRUCTIONS:
Explain the lesson in 3-4 sentences:
- What does the story teach us?
- Why is this lesson important?
- How can we use this lesson in our lives?

Be inspiring! Use wisdom emojis! 💡✨🌟

Answer:"""
    
    elif 'what if' in message_lower:
        instructions = """Question: {question}

INSTRUCTIONS:
This is an imagination question! Think about:
- What would change in the story?
- Would it be better or worse?
- What would happen next?

Answer in 3-4 sentences. Use thinking emoji! 🤔

Answer:"""
    
    else:
        instructions = """Question: {question}

INSTRUCTIONS:
Answer the question clearly and accurately based on the story.
Use 2-4 sentences. Keep it simple and fun! Add emojis!

Answer:"""
    
    return system_context + instructions.format(question=user_message)

def call_ollama(user_message, story_context):
    """Call Ollama API with smart prompts"""
    
    logger.info(f"Processing question: {user_message[:50]}...")
    
    try:
        start_time = time.time()
        
        # Build smart prompt
        prompt = build_smart_prompt(user_message, story_context)
        
        # Detect question complexity
        message_lower = user_message.lower()
        is_complex = any(word in message_lower for word in 
                         ['why', 'how', 'compare', 'what if', 'moral', 'lesson'])
        
        temperature = 0.6 if is_complex else 0.5
        max_tokens = 450 if is_complex else 350
        
        logger.info(f"Question complexity: {'high' if is_complex else 'normal'}")
        
        # Call Ollama with ✅ INCREASED TIMEOUT
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
            timeout=OLLAMA_TIMEOUT  # ✅ 300 seconds
        )
        
        end_time = time.time()
        response_time = round(end_time - start_time, 2)
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get('response', '').strip()
            
            if not reply:
                reply = "Sorry, I couldn't answer! Try asking differently! 😊"
            
            # Clean up reply
            if reply.lower().startswith('answer:'):
                reply = reply[7:].strip()
            
            logger.info(f"Response generated: {len(reply)} chars, {response_time}s")
            
            return {
                'reply': reply,
                'response_time': response_time,
                'status': 'success'
            }
        else:
            error_msg = f"Ollama error {response.status_code}"
            logger.error(error_msg)
            return {
                'error': error_msg,
                'status': 'error'
            }
    
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama server")
        return {
            'error': f'Cannot connect to Ollama at {OLLAMA_URL}',
            'status': 'error'
        }
    except requests.exceptions.Timeout:
        logger.error(f"Request timeout after {OLLAMA_TIMEOUT}s")
        return {
            'error': f'Request timeout (model is slow on CPU)',
            'status': 'timeout'
        }
    except Exception as e:
        logger.error(f"Ollama exception: {e}")
        return {
            'error': str(e),
            'status': 'error'
        }

# ================= ENDPOINTS =================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    ollama_status = check_ollama_status()
    
    return jsonify({
        'status': 'OK' if ollama_status else 'Ollama not reachable',
        'service': 'Story Ollama Backend - VM Version',
        'ollama_url': OLLAMA_URL,
        'model': MODEL_NAME,
        'timeout': f'{OLLAMA_TIMEOUT}s',
        'ollama_status': 'connected' if ollama_status else 'disconnected',
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
    """Test endpoint"""
    return jsonify({
        'message': 'Backend is working! 🎉',
        'version': '2.1 - Ollama VM (Timeout Fixed)',
        'status': 'ok',
        'ollama_reachable': check_ollama_status(),
        'timeout': f'{OLLAMA_TIMEOUT}s',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/stats', methods=['GET', 'OPTIONS'])
def get_stats():
    """Usage statistics"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    client_ip = get_client_ip()
    daily = len(rate_limit_storage[client_ip]['day'])
    remaining = max(0, MAX_REQUESTS_PER_DAY - daily)
    
    return jsonify({
        'requests_today': daily,
        'remaining_today': remaining,
        'max_per_day': MAX_REQUESTS_PER_DAY,
        'status': 'ok'
    }), 200

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Main chat endpoint"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        # Rate limit check
        client_ip = get_client_ip()
        allowed, err = check_rate_limit(client_ip)
        if not allowed:
            return jsonify({
                'error': err,
                'status': 'rate_limit_exceeded'
            }), 429
        
        # Get request data
        data = request.json or {}
        user_message = data.get('message', '').strip()
        story_context = data.get('story_context', '')
        
        if not user_message:
            return jsonify({'error': 'Message required'}), 400
        
        # Check Ollama availability
        if not check_ollama_status():
            return jsonify({
                'error': f'Ollama server not reachable at {OLLAMA_URL}',
                'status': 'error'
            }), 503
        
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
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/explain-word', methods=['POST', 'OPTIONS'])
def explain_word():
    """Explain a word with context"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        # Rate limit check
        client_ip = get_client_ip()
        allowed, err = check_rate_limit(client_ip)
        if not allowed:
            return jsonify({'error': err}), 429
        
        # Get request data
        data = request.json or {}
        word = data.get('word', '').strip()
        story_context = data.get('story_context', '')
        
        if not word:
            return jsonify({'error': 'Word required'}), 400
        
        # Check Ollama
        if not check_ollama_status():
            return jsonify({'error': 'Ollama not reachable'}), 503
        
        logger.info(f"Explaining word: {word}")
        
        # Build prompt for word explanation
        prompt = f"""You are teaching a child about words.

STORY CONTEXT:
{story_context[:600]}

WORD TO EXPLAIN: "{word}"

INSTRUCTIONS:
1. If the word appears in the story, explain it in that context
2. Use 2-3 simple sentences
3. Give an example a child would understand
4. Add a fun emoji

Explanation:"""
        
        try:
            # ✅ TIMEOUT INCREASED HERE TOO
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
                timeout=OLLAMA_TIMEOUT  # ✅ 300 seconds
            )
            
            if response.status_code == 200:
                data_response = response.json()
                explanation = data_response.get('response', '').strip()
                
                if not explanation:
                    explanation = f"The word '{word}' means something special in this story! 📚"
                
                # Clean up
                if explanation.lower().startswith('explanation:'):
                    explanation = explanation[12:].strip()
                
                return jsonify({
                    'word': word,
                    'explanation': explanation,
                    'status': 'success'
                }), 200
            else:
                return jsonify({
                    'error': 'Failed to get explanation',
                    'status': 'error'
                }), 500
        
        except requests.exceptions.Timeout:
            logger.error(f"Word explanation timeout after {OLLAMA_TIMEOUT}s")
            return jsonify({
                'error': 'Request timeout - model is processing slowly',
                'status': 'timeout'
            }), 504
        except Exception as e:
            logger.error(f"Word explanation error: {e}")
            return jsonify({
                'error': str(e),
                'status': 'error'
            }), 500
    
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
    print("\n" + "="*70)
    print("🚀 Story App - Ollama VM Backend")
    print("="*70)
    print(f"📍 Flask:      http://localhost:5002")
    print(f"🦙 Ollama URL: {OLLAMA_URL}")
    print(f"🤖 Model:      {MODEL_NAME}")
    print(f"⏱️  Timeout:    {OLLAMA_TIMEOUT} seconds")
    print(f"🚦 Limits:     {MAX_REQUESTS_PER_MINUTE}/min, {MAX_REQUESTS_PER_DAY}/day")
    print("="*70 + "\n")
    
    # Check Ollama status
    print("🔍 Checking Ollama server...")
    if check_ollama_status():
        print("✅ Ollama server is reachable!\n")
    else:
        print(f"⚠️  Cannot reach Ollama at {OLLAMA_URL}")
        print("   Make sure:")
        print("   1. Ollama VM is running")
        print("   2. Firewall allows port 11434")
        print("   3. OLLAMA_URL is correct\n")
    
    print("="*70)
    print("🚀 Starting Flask server...")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)