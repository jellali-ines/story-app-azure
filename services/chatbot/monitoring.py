# 🤖 Chatbot Monitoring Setup

## ⏱️ 10 دقائق فقط!

---

## 1️⃣ ثبّت المكتبة

```bash
cd services/chatbot

pip install applicationinsights
```

---

## 2️⃣ أنشئ `monitoring.py`

في المجلد `services/chatbot/`، أنشئ ملف جديد:

```bash
touch monitoring.py
```

---

## 3️⃣ انسخ هذا الكود في `monitoring.py`:

```python
from applicationinsights import TelemetryClient
import os

# تهيئة الـ client
if os.getenv('APPINSIGHTS_CONNECTION_STRING'):
    telemetry_client = TelemetryClient(
        os.getenv('APPINSIGHTS_CONNECTION_STRING')
    )
    print('✅ Application Insights initialized')
else:
    telemetry_client = None
    print('⚠️ Application Insights not configured')

class MonitoringService:
    """مراقبة خدمة Chatbot"""
    
    @staticmethod
    def track_inference(model, prompt_tokens, response_tokens, duration, success=True):
        """تتبع استدعاء الـ AI"""
        if not telemetry_client:
            return
        
        telemetry_client.track_metric(
            'model_inference_duration_ms',
            duration,
            properties={
                'model': model,
                'prompt_tokens': str(prompt_tokens),
                'response_tokens': str(response_tokens),
                'success': str(success)
            }
        )
    
    @staticmethod
    def track_request(endpoint, status_code, duration, method='POST'):
        """تتبع الطلبات HTTP"""
        if not telemetry_client:
            return
        
        telemetry_client.track_metric(
            'flask_request_duration_ms',
            duration,
            properties={
                'endpoint': endpoint,
                'method': method,
                'status_code': str(status_code)
            }
        )
    
    @staticmethod
    def track_error(error_type, message, context=None):
        """تتبع الأخطاء"""
        if not telemetry_client:
            return
        
        properties = {
            'error_type': error_type,
            'message': message
        }
        
        if context:
            properties.update(context)
        
        telemetry_client.track_exception(
            exception=Exception(f"{error_type}: {message}"),
            properties=properties
        )
    
    @staticmethod
    def track_event(event_name, properties=None):
        """تتبع الأحداث"""
        if not telemetry_client:
            return
        
        telemetry_client.track_event(
            event_name,
            properties=properties or {}
        )
    
    @staticmethod
    def flush():
        """حفظ البيانات"""
        if telemetry_client:
            telemetry_client.flush()

# تصدير الـ service
monitoring = MonitoringService()
```

---

## 4️⃣ عدّل `app.py` أو الملف الرئيسي

### في الأول من الملف أضف:

```python
from monitoring import monitoring
from flask import Flask, request, jsonify
import time
```

---

### أضف Middleware لتتبع الطلبات:

بعد `app = Flask(__name__)` أضف:

```python
@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(request, 'start_time'):
        duration = (time.time() - request.start_time) * 1000
        monitoring.track_request(
            endpoint=request.path,
            status_code=response.status_code,
            duration=duration,
            method=request.method
        )
    return response
```

---

### أضف Health Check:

```python
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'chatbot',
        'timestamp': time.time()
    }), 200
```

---

### عدّل endpoint الـ Chat:

**من هذا:**
```python
@app.route('/api/chat', methods=['POST'])
def chat():
    start_time = time.time()
    
    try:
        data = request.json
        prompt = data.get('prompt')
        
        response = generate_response(prompt)
        
        return jsonify({'response': response}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

**إلى هذا:**
```python
@app.route('/api/chat', methods=['POST'])
def chat():
    inference_start = time.time()
    
    try:
        data = request.json
        prompt = data.get('prompt')
        model = data.get('model', 'llama3.1:8b')
        
        # تتبع الحدث
        monitoring.track_event('chat_request', {
            'model': model,
            'prompt_length': len(prompt)
        })
        
        # توليد الرد
        response = generate_response(prompt)
        
        # حساب الـ tokens (تقريبي)
        prompt_tokens = len(prompt.split())
        response_tokens = len(response.split())
        
        # تتبع الاستدعاء
        duration = (time.time() - inference_start) * 1000
        monitoring.track_inference(
            model=model,
            prompt_tokens=prompt_tokens,
            response_tokens=response_tokens,
            duration=duration,
            success=True
        )
        
        # تتبع النجاح
        monitoring.track_event('chat_completed', {
            'model': model,
            'response_length': len(response)
        })
        
        return jsonify({
            'response': response,
            'tokens_used': prompt_tokens + response_tokens
        }), 200
    
    except Exception as e:
        # تتبع الخطأ
        monitoring.track_error(
            'ChatError',
            str(e),
            {
                'endpoint': '/api/chat',
                'method': 'POST'
            }
        )
        
        return jsonify({'error': str(e)}), 500
```

---

### أضف Graceful Shutdown:

في آخر الملف:

```python
import signal

def shutdown_handler(signum, frame):
    print('Shutting down gracefully...')
    monitoring.track_event('chatbot_shutdown')
    monitoring.flush()
    exit(0)

signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)

if __name__ == '__main__':
    monitoring.track_event('chatbot_started', {
        'port': 5002,
        'environment': 'production'
    })
    
    app.run(host='0.0.0.0', port=5002, debug=False)
```

---

## 5️⃣ تحقق من `requirements.txt`

تأكد من وجود:

```
applicationinsights>=2.9.0
flask>=4.0.0
python-dotenv>=0.19.0
# ... باقي المكتبات
```

---

## 6️⃣ Push و Deploy

```bash
cd services/chatbot

git add monitoring.py
git add app.py  # (أو الملف الرئيسي)
git add requirements.txt

git commit -m "add monitoring to chatbot service"
git push origin main
```

---

## 7️⃣ انتظر 2-3 دقائق لـ GitHub Actions

---

## 8️⃣ اختبر الـ Health:

```bash
# احصل على URL الـ chatbot
az containerapp show \
  --name chatbot \
  --resource-group rg-storytelling5 \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# اختبر
curl https://[URL]/api/health
```

يجب ترى:
```json
{"status":"healthy","service":"chatbot","timestamp":...}
```

---

## 9️⃣ شوف البيانات في Azure Portal:

1. **Application Insights** → **appinsights-story**
2. **Live Metrics** → شوف chatbot requests تظهر
3. **Analytics** → اكتب الـ queries

---

## 🎯 ملخص البيانات اللي تُجمّع:

✅ وقت استجابة الـ Chatbot  
✅ عدد الـ tokens (كلمات)  
✅ الأخطاء والاستثناءات  
✅ نماذج الـ AI المستخدمة  
✅ أحداث النجاح والفشل  

---

## ✅ انتهى!

الآن **كل الـ services مراقبة:**
- ✅ Backend (Node.js)
- ✅ Chatbot (Python)
- ✅ Application Insights (Hub)

🎉