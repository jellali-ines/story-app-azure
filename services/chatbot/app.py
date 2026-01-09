from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import time
from collections import defaultdict
import threading
import logging
import os
import re

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
MODEL_NAME = os.getenv("MODEL_NAME", "llama3.1:8b")  # ✅ تحسين: تغيير من mistral لـ llama
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "300"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))
MAX_REQUESTS_PER_DAY = int(os.getenv("MAX_REQUESTS_PER_DAY", "1000"))

# Rate limiting storage
_rate_limit_lock = threading.RLock()
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
CACHE_TTL = 30

def check_ollama_status():
    """Health check with 30-second cache"""
    current_time = time.time()
    
    if current_time - _ollama_cache['timestamp'] < CACHE_TTL:
        return _ollama_cache['status']
    
    try:
        base_url = OLLAMA_URL.replace('/api/generate', '')
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        status = response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama unreachable: {e}")
        status = False
    
    _ollama_cache['status'] = status
    _ollama_cache['timestamp'] = current_time
    
    return status

# ✅ تحسين: دالة جديدة لكشف نوع السؤال
def detect_question_type(user_message):
    """Detect the type of question to provide better formatting"""
    message_lower = user_message.lower().strip()
    
    if any(word in message_lower for word in ['who is', 'who are', 'who was', 'character', 'describe']):
        return 'character'
    elif message_lower.startswith('why'):
        return 'why'
    elif message_lower.startswith('how'):
        if any(word in message_lower for word in ['feel', 'felt', 'feeling', 'react']):
            return 'feeling'
        return 'how'
    elif any(word in message_lower for word in ['compare', 'difference', 'similar', 'same']):
        return 'comparison'
    elif any(word in message_lower for word in ['what happened', 'summary', 'summarize', 'recap']):
        return 'summary'
    elif any(word in message_lower for word in ['moral', 'lesson', 'teach', 'learn']):
        return 'lesson'
    elif 'what if' in message_lower:
        return 'imagination'
    else:
        return 'general'

def build_enhanced_prompt(user_message, story_context, question_type):
    """✅ تحسين: Build intelligent prompt based on question type"""
    
    system_context = f"""You are a knowledgeable and friendly storytelling assistant for children.
Your role is to help children understand and enjoy stories.

STORY:
{story_context}

CRITICAL RULES:
✅ Answer ONLY based on the story above
✅ Use simple, engaging words for children (ages 5-12)
✅ Add relevant emojis to make answers fun 😊
✅ Keep answers accurate and truthful
✅ If something is not in the story, say "I don't know that from the story!"
❌ NEVER make up information
❌ NEVER add details not in the story
❌ NEVER use complex vocabulary

"""

    # Build question-specific prompt
    if question_type == 'character':
        prompt = system_context + f"""
Question: {user_message}

Your task: Describe ALL important characters mentioned in the story.

FORMAT YOUR ANSWER LIKE THIS:
📚 **Main Characters:**

1. **[Name]** 👤
   - Role: What they do in the story
   - Actions: What they did
   - Importance: Why they matter

2. **[Name]** 👤
   - Role: What they do
   - Actions: What they did
   - Importance: Why they matter

Include as many characters as important to the story!

ANSWER:"""

    elif question_type == 'why':
        prompt = system_context + f"""
Question: {user_message}

Your task: Explain WHY something happened.

FORMAT YOUR ANSWER LIKE THIS:
🔍 **Why Did This Happen?**

**What happened:** [Brief description]

**Why it happened:** [Main reason]
- Reason 1
- Reason 2 (if applicable)

**Result:** [What changed because of this]

Keep it to 3-4 sentences. Use simple words!

ANSWER:"""

    elif question_type == 'feeling':
        prompt = system_context + f"""
Question: {user_message}

Your task: Explain the feelings of characters in the story.

FORMAT YOUR ANSWER LIKE THIS:
💭 **How Did They Feel?**

**Situation:** [What happened]

**Emotions:** [How characters felt] 😊😢😱😊
- Character 1 felt: [emotion]
- Character 2 felt: [emotion]

**Why:** [Reasons for these feelings]

ANSWER:"""

    elif question_type == 'how':
        prompt = system_context + f"""
Question: {user_message}

Your task: Explain HOW something happened step by step.

FORMAT YOUR ANSWER LIKE THIS:
📋 **Step-by-Step Explanation:**

**Step 1️⃣:** [First thing that happened]

**Step 2️⃣:** [What happened next]

**Step 3️⃣:** [Then what]

**Step 4️⃣:** [Final result] ✅

Use simple words and be clear!

ANSWER:"""

    elif question_type == 'comparison':
        prompt = system_context + f"""
Question: {user_message}

Your task: Compare two things from the story.

FORMAT YOUR ANSWER LIKE THIS:
⚖️ **Comparison:**

**[First Thing]:**
- Characteristic 1
- Characteristic 2

**[Second Thing]:**
- Characteristic 1
- Characteristic 2

**Similarities:** [What's the same]
**Differences:** [What's different]

ANSWER:"""

    elif question_type == 'summary':
        prompt = system_context + f"""
Question: {user_message}

Your task: Summarize the story or a part of it.

FORMAT YOUR ANSWER LIKE THIS:
📖 **Story Summary:**

**Beginning:** [How the story starts]

**Problem:** [What's the challenge]

**Action:** [What characters do]

**Solution:** [How they solve it]

**Ending:** [How it ends] ✅

Keep each point to 1-2 sentences!

ANSWER:"""

    elif question_type == 'lesson':
        prompt = system_context + f"""
Question: {user_message}

Your task: Explain the lesson or moral of the story.

FORMAT YOUR ANSWER LIKE THIS:
💡 **The Lesson:**

**What the story teaches:** [The moral/lesson]

**Why this matters:** [Why is this important for children]

**Real-life example:** [How we can use this lesson in life]

**Key takeaway:** [The most important thing to remember] ✨

ANSWER:"""

    elif question_type == 'imagination':
        prompt = system_context + f"""
Question: {user_message}

Your task: Think about a "what if" scenario based on the story.

FORMAT YOUR ANSWER LIKE THIS:
🤔 **What If?**

**The scenario:** {user_message}

**What would change:** [How things would be different]

**Consequences:** [What would happen as a result]

**Comparison:** [How this is different from the actual story]

Be creative but stay based on the story!

ANSWER:"""

    else:  # general
        prompt = system_context + f"""
Question: {user_message}

Answer clearly in 3-4 sentences. Include relevant emojis.
Make your answer fun and easy to understand for children!

ANSWER:"""

    return prompt

def call_ollama(user_message, story_context):
    """✅ تحسين: Call Ollama API with enhanced prompts"""
    
    question_type = detect_question_type(user_message)
    
    monitoring.track_event('chat_request', {
        'message_length': len(user_message),
        'model': MODEL_NAME,
        'question_type': question_type  # ✅ تحسين: track question type
    })
    
    try:
        start_time = time.time()
        prompt = build_enhanced_prompt(user_message, story_context, question_type)
        
        # ✅ تحسين: Adjust parameters based on question complexity
        is_complex = question_type in ['comparison', 'summary', 'lesson', 'imagination']
        
        temperature = 0.6 if is_complex else 0.5
        max_tokens = 500 if is_complex else 350
        
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
                reply = "Sorry, I couldn't answer that! Try asking differently! 😊"
            
            # ✅ تحسين: Better cleanup
            reply = re.sub(r'(^|[\n])(answer|explanation|response):\s*', '\\1', reply, flags=re.IGNORECASE)
            
            monitoring.track_inference(
                model=MODEL_NAME,
                prompt_tokens=len(user_message.split()),
                response_tokens=len(reply.split()),
                duration=response_time * 1000,
                success=True,
                question_type=question_type  # ✅ تحسين: track type
            )
            
            return {
                'reply': reply,
                'response_time': response_time,
                'status': 'success',
                'question_type': question_type  # ✅ تحسين: return type
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

# ✅ تحسين: دالة محسنة لشرح الكلمات
def build_word_explanation_prompt(word, story_context):
    """✅ تحسين: Enhanced word explanation prompt"""
    
    prompt = f"""You are a patient and friendly teacher helping children learn new words.

STORY CONTEXT: {story_context[:400] if story_context else "No context provided"}

WORD TO EXPLAIN: "{word}"

EXPLAIN THIS WORD FOLLOWING THIS FORMAT EXACTLY:

📖 **Definition:**
[Simple 1-sentence definition that a 6-year-old can understand]

📝 **In the Story:**
[If the word appears in the story, explain how it's used]
[If not in the story, say "This word doesn't appear in the story"]

💡 **Fun Example:**
[Give a simple, relatable example a child would understand]
[Use emojis to make it fun!] 😊

⭐ **Similar Words:**
[Give 1-2 similar or related words]

IMPORTANT RULES:
- Use ONLY simple words
- Add fun emojis
- Make it engaging and short
- Perfect for children aged 5-12

EXPLANATION:"""
    
    return prompt

def call_ollama_word_explanation(word, story_context):
    """✅ تحسين: Enhanced word explanation call"""
    
    monitoring.track_event('word_explanation_requested', {
        'word': word,
        'has_context': bool(story_context)
    })
    
    try:
        prompt = build_word_explanation_prompt(word, story_context)
        
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.6,
                    "num_predict": 250,
                    "top_p": 0.9
                }
            },
            timeout=OLLAMA_TIMEOUT
        )
        
        if response.status_code == 200:
            explanation = response.json().get('response', '').strip()
            
            if not explanation:
                explanation = f"The word '{word}' means something special! 📚 Try asking in the story context!"
            
            # Cleanup
            explanation = re.sub(r'(^|[\n])(explanation|response):\s*', '\\1', explanation, flags=re.IGNORECASE)
            
            return {
                'explanation': explanation,
                'status': 'success'
            }
        else:
            return {'error': 'Failed to explain word', 'status': 'error'}
    
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout', 'status': 'timeout'}
    except Exception as e:
        return {'error': str(e), 'status': 'error'}

# ================= ENDPOINTS =================

@app.route('/api/health', methods=['GET'])
def health():
    ollama_status = check_ollama_status()
    
    return jsonify({
        'status': 'OK' if ollama_status else 'Degraded',
        'service': 'Story Ollama Backend v4.0',  # ✅ تحسين: version update
        'ollama_url': OLLAMA_URL,
        'model': MODEL_NAME,
        'timeout': f'{OLLAMA_TIMEOUT}s',
        'ollama_connected': ollama_status,
        'features': [
            '🧠 Smart question type detection',
            '📊 Context-aware responses',
            '👥 Character analysis',
            '❓ Why/How explanations',
            '⚖️ Comparison support',
            '💡 Moral/Lesson extraction',
            '🤔 What-if scenarios',
            '📖 Enhanced word explanations',
            '🎨 Formatted responses for kids'
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Backend is working! 🎉',
        'version': '4.0 - Enhanced',
        'ollama_connected': check_ollama_status(),
        'model': MODEL_NAME,
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
        'max_per_day': MAX_REQUESTS_PER_DAY,
        'model': MODEL_NAME
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
            'question_type': result.get('question_type'),  # ✅ تحسين: return type
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
        
        result = call_ollama_word_explanation(word, story_context)
        
        if result.get('status') == 'success':
            return jsonify({
                'word': word,
                'explanation': result['explanation'],
                'status': 'success'
            }), 200
        else:
            return jsonify(result), 500
    
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
    logger.info(f"🚀 Starting Story Backend v4.0 - Enhanced")
    logger.info(f"📡 Ollama: {OLLAMA_URL}")
    logger.info(f"🧠 Model: {MODEL_NAME}")
    logger.info(f"⏱️ Timeout: {OLLAMA_TIMEOUT}s")
    logger.info(f"👨‍👧‍👦 For: Kids Learning Platform")
    
    monitoring.track_event('backend_started', {
        'model': MODEL_NAME,
        'timeout': OLLAMA_TIMEOUT,
        'version': '4.0'
    })
    
    if check_ollama_status():
        logger.info("✅ Ollama connected!")
    else:
        logger.warning(f"⚠️ Ollama unreachable at {OLLAMA_URL}")
    
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)