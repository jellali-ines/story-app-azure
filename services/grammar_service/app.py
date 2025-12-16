# ========================== 🚀 HYBRID GRAMMAR CHECKER API - FIXED ==========================
# Fast & Lightweight Version - Port: 7860
# With Better Error Handling

from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import torch
import nltk
from nltk.tokenize import sent_tokenize
from difflib import SequenceMatcher
from html import escape
import requests
import re
import os
import time
from functools import lru_cache
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    logger.info("Downloading NLTK punkt...")
    nltk.download('punkt', quiet=True)

# ========================== INITIALIZE APP ==========================
app = Flask(__name__)

# Autoriser toutes les origines (simple pour dev)
CORS(app, resources={r"/*": {"origins": "*"}})

# ou plus sécurisé : uniquement les frontends connus
# CORS(app, resources={r"/*": {"origins": ["http://localhost:5174", "http://localhost:3000"]}})

# ========================== CONFIGURATION ==========================
LANGUAGETOOL_API = "https://api.languagetool.org/v2/check"
HUGGINGFACE_API = "https://api-inference.huggingface.co/models/vennify/t5-small-grammar-correction"
HF_API_KEY = os.environ.get('HF_API_KEY', '')

# ========================== GLOBAL CACHE ==========================
correction_cache = {}
similarity_cache = {}
MAX_CACHE_SIZE = 1000

# ========================== LOAD LIGHTWEIGHT MODEL ==========================
logger.info("🚀 Loading lightweight semantic model...")
start_time = time.time()

device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"💻 Device: {device.upper()}")

try:
    semantic_model = SentenceTransformer('paraphrase-MiniLM-L3-v2', device=device)
    load_time = time.time() - start_time
    logger.info(f"✅ Model ready in {load_time:.2f} seconds!")
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    semantic_model = None

# ========================== CONSTANTS ==========================
ORIGINAL_STORY = """The Little Birds in the Magical Forest
In a faraway forest full of giant trees and colorful flowers, lived little birds who loved to play and sing. Among them was a small bird named Toto.
Toto loved flying fast, but he didn't always listen to his friends' advice. The big bird said to him: "Toto, take your time and watch the path before you fly so fast!"
But Toto didn't listen and flew very quickly between the trees, until he bumped into a large branch and fell to the ground.
His friends came to help him, and a small duck said: "Look, Toto, speed alone is not enough. You need to be careful too!"
Toto learned an important lesson: to be careful and listen to others' advice. From that day, he flew carefully and enjoyed playing and singing with his friends in the magical forest.
Moral: Speed alone is not enough; caution and listening to advice make life better and safer."""

# ========================== HELPER FUNCTIONS ==========================

def get_cache_key(text):
    """Generate cache key"""
    try:
        return hash(text[:500])  # استخدم أول 500 حرف فقط
    except:
        return hash(str(text))

@lru_cache(maxsize=256)
def semantic_similarity_cached(text1, text2):
    """Calculate semantic similarity with caching"""
    try:
        if semantic_model is None:
            return 0.75  # قيمة افتراضية
        emb = semantic_model.encode([text1, text2], convert_to_tensor=True)
        return float(util.pytorch_cos_sim(emb[0], emb[1]).item())
    except Exception as e:
        logger.warning(f"Similarity calculation error: {e}")
        return 0.75

def semantic_similarity(text1, text2):
    """Public interface for semantic similarity"""
    try:
        return semantic_similarity_cached(text1, text2)
    except:
        return 0.75

def correct_with_languagetool_api(text):
    """تصحيح باستخدام LanguageTool API"""
    cache_key = get_cache_key(text)
    if cache_key in correction_cache:
        logger.info("✅ Cache hit for correction")
        return correction_cache[cache_key]
    
    try:
        logger.info("📡 Calling LanguageTool API...")
        response = requests.post(
            LANGUAGETOOL_API,
            data={'text': text, 'language': 'en-US'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            matches = data.get('matches', [])
            
            corrected = text
            offset = 0
            
            for match in matches:
                if match.get('replacements'):
                    replacement = match['replacements'][0]['value']
                    start = match['offset'] + offset
                    end = start + match['length']
                    
                    corrected = corrected[:start] + replacement + corrected[end:]
                    offset += len(replacement) - match['length']
            
            # Cache result
            if len(correction_cache) < MAX_CACHE_SIZE:
                correction_cache[cache_key] = corrected
            
            logger.info(f"✅ LanguageTool returned: {len(matches)} corrections")
            return corrected
        else:
            logger.warning(f"⚠️ LanguageTool API status: {response.status_code}")
            return text
    
    except requests.exceptions.Timeout:
        logger.warning("⏱️ LanguageTool API timeout")
        return text
    except Exception as e:
        logger.warning(f"⚠️ LanguageTool API error: {e}")
        return text

def simple_rule_based_correction(text):
    """تصحيح بسيط بقواعد (fallback)"""
    corrections = {
        r'\bi\b': 'I',  # i -> I
        r'\bim\b': "I'm",  # im -> I'm
        r'\bdont\b': "don't",  # dont -> don't
        r'\bcant\b': "can't",  # cant -> can't
        r'\bwont\b': "won't",  # wont -> won't
        r'\bis nt\b': "isn't",  # is nt -> isn't
        r'\bdo nt\b': "don't",  # do nt -> don't
    }
    
    corrected = text
    for pattern, replacement in corrections.items():
        corrected = re.sub(pattern, replacement, corrected, flags=re.IGNORECASE)
    
    # تصحيح المسافات قبل النقاط
    corrected = re.sub(r'\s+([.,!?])', r'\1', corrected)
    
    # حرف كبير بعد النقطة
    corrected = re.sub(r'([.!?])\s+([a-z])', lambda m: m.group(1) + ' ' + m.group(2).upper(), corrected)
    
    return corrected

def enhanced_grammar_correction(sentence):
    """تصحيح محسّن مع fallback"""
    try:
        # أولاً: جرب LanguageTool
        corrected = correct_with_languagetool_api(sentence)
        
        # إذا ما تغير، استخدم القواعد البسيطة
        if corrected == sentence:
            corrected = simple_rule_based_correction(sentence)
        
        return corrected
    except Exception as e:
        logger.error(f"Correction error: {e}")
        return sentence

def highlight_differences(original, corrected):
    """Highlight differences between texts"""
    try:
        orig_words = original.strip().split()
        corr_words = corrected.strip().split()
        matcher = SequenceMatcher(None, orig_words, corr_words)
        
        highlighted = []
        changes = []
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            o = " ".join(orig_words[i1:i2])
            c = " ".join(corr_words[j1:j2])
            
            if tag == "equal":
                highlighted.append(escape(o))
            elif tag == "replace":
                highlighted.append(f'<span class="replace">{escape(c)}</span>')
                changes.append({'original': o, 'corrected': c, 'type': 'replacement', 'position': i1})
            elif tag == "insert":
                highlighted.append(f'<span class="insert">{escape(c)}</span>')
                changes.append({'original': '', 'corrected': c, 'type': 'insertion', 'position': i1})
            elif tag == "delete":
                highlighted.append(f'<span class="delete">{escape(o)}</span>')
                changes.append({'original': o, 'corrected': '', 'type': 'deletion', 'position': i1})
        
        return " ".join(highlighted), changes, corrected
    except Exception as e:
        logger.error(f"Highlight error: {e}")
        return original, [], corrected

def simple_extract_entities(text):
    """استخراج بسيط للعناصر"""
    try:
        entities = {
            "characters": [],
            "locations": [],
            "actions": [],
            "key_events": []
        }
        
        # 1. الأسماء (كلمات تبدأ بحرف كبير)
        words = text.split()
        for word in words:
            clean_word = re.sub(r'[^\w\s]', '', word)
            if clean_word and len(clean_word) > 2:
                if clean_word[0].isupper() and clean_word.lower() not in ['the', 'a', 'an', 'in', 'on']:
                    if clean_word not in entities["characters"]:
                        entities["characters"].append(clean_word)
        
        # 2. الأماكن
        location_keywords = ["forest", "house", "school", "city", "village", "castle", "garden", "park", "tree", "trees"]
        for keyword in location_keywords:
            if keyword.lower() in text.lower():
                if keyword not in entities["locations"]:
                    entities["locations"].append(keyword)
        
        # 3. الأفعال
        action_patterns = r'\b\w+(ed|ing)\b|\b(fly|flew|play|played|sing|sang|help|helped|learn|learned|watch|watched|listen|listened|bump|bumped|fall|fell)\w*\b'
        actions = re.findall(action_patterns, text.lower())
        unique_actions = list(set([a if isinstance(a, str) else (a[1] if a[1] else a[0]) for a in actions]))
        entities["actions"] = unique_actions[:10]
        
        # 4. الجمل الرئيسية
        try:
            sentences = sent_tokenize(text)
            entities["key_events"] = [s for s in sentences if len(s.split()) > 8][:5]
        except:
            entities["key_events"] = []
        
        return entities
    except Exception as e:
        logger.error(f"Entity extraction error: {e}")
        return {"characters": [], "locations": [], "actions": [], "key_events": []}

def compare_story_coverage(student_summary, original_story):
    """مقارنة تغطية بسيطة وسريعة"""
    try:
        student_elements = simple_extract_entities(student_summary)
        story_elements = simple_extract_entities(original_story)
        
        coverage_scores = {}
        
        # 1. تغطية الشخصيات
        if story_elements["characters"]:
            student_chars = set(c.lower() for c in student_elements["characters"])
            story_chars = set(c.lower() for c in story_elements["characters"])
            common = student_chars & story_chars
            coverage_scores["characters"] = (len(common) / len(story_chars) * 100) if story_chars else 100
        else:
            coverage_scores["characters"] = 100
        
        # 2. تغطية الأماكن
        if story_elements["locations"]:
            student_locs = set(l.lower() for l in student_elements["locations"])
            story_locs = set(l.lower() for l in story_elements["locations"])
            common = student_locs & story_locs
            coverage_scores["locations"] = (len(common) / len(story_locs) * 100) if story_locs else 100
        else:
            coverage_scores["locations"] = 100
        
        # 3. التشابه في الأحداث
        event_similarity = 70  # قيمة افتراضية
        if story_elements["key_events"] and student_elements["key_events"]:
            similarities = []
            for student_event in student_elements["key_events"][:3]:
                for story_event in story_elements["key_events"][:3]:
                    sim = semantic_similarity(student_event, story_event)
                    similarities.append(sim)
            event_similarity = (sum(similarities) / len(similarities) * 100) if similarities else 70
        
        coverage_scores["key_events"] = event_similarity
        
        overall_coverage = sum(coverage_scores.values()) / len(coverage_scores) if coverage_scores else 70
        
        return {
            "coverage_scores": coverage_scores,
            "overall_coverage": overall_coverage,
            "student_elements": student_elements,
            "story_elements": story_elements
        }
    except Exception as e:
        logger.error(f"Coverage comparison error: {e}")
        return {
            "coverage_scores": {"characters": 70, "locations": 70, "key_events": 70},
            "overall_coverage": 70,
            "student_elements": {},
            "story_elements": {}
        }

def count_errors_simple(text):
    """عد الأخطاء بطريقة بسيطة"""
    try:
        response = requests.post(
            LANGUAGETOOL_API,
            data={'text': text, 'language': 'en-US'},
            timeout=5
        )
        if response.status_code == 200:
            return len(response.json().get('matches', []))
    except:
        pass
    
    # Fallback: count simple patterns
    error_count = 0
    error_count += len(re.findall(r'\bi\b', text))  # lowercase i
    error_count += len(re.findall(r'\s{2,}', text))  # multiple spaces
    error_count += len(re.findall(r'\s+[.,!?]', text))  # space before punctuation
    return error_count

# ========================== API PROCESSING ==========================

def process_grammar_check(text):
    """Process grammar check request"""
    try:
        if not text.strip():
            return {"error": "No text provided"}
        
        logger.info(f"📝 Processing grammar check for {len(text)} chars")
        
        try:
            sentences = sent_tokenize(text)
        except:
            sentences = [text]
        
        corrected_html_list = []
        corrected_plain_list = []
        all_changes = []
        
        for i, sentence in enumerate(sentences, 1):
            if not sentence.strip():
                continue
            
            corrected = enhanced_grammar_correction(sentence)
            html, changes, _ = highlight_differences(sentence, corrected)
            
            corrected_html_list.append(html)
            corrected_plain_list.append(corrected)
            
            if changes:
                all_changes.append({
                    'sentence_num': i,
                    'original': sentence,
                    'corrected': corrected,
                    'changes': changes
                })
        
        final_html = " ".join(corrected_html_list)
        final_plain = " ".join(corrected_plain_list)
        
        similarity = semantic_similarity(text, final_plain)
        
        errors_before = count_errors_simple(text)
        errors_after = count_errors_simple(final_plain)
        
        words = max(len(text.split()), 1)
        grammar_score = max(0, min(100, 100 - (errors_after / words * 100)))
        
        if grammar_score >= 90:
            score_badge = "🌟 Excellent"
        elif grammar_score >= 75:
            score_badge = "⭐ Good"
        elif grammar_score >= 60:
            score_badge = "📝 Fair"
        else:
            score_badge = "💪 Needs Practice"
        
        # ✅ ✅ ✅ أضيفي هذا الكود هنا - إنشاء error_analysis
        error_analysis = {}
        if all_changes:
            # استخراج أمثلة للأخطاء النحوية
            grammar_examples = []
            for change in all_changes[:3]:  # أول 3 جمل فقط
                if change['changes']:
                    for c in change['changes'][:2]:  # أول خطأين في كل جملة
                        grammar_examples.append({
                            "message": f'In sentence {change["sentence_num"]}: "{c["original"]}" → "{c["corrected"]}"',
                            "suggestion": get_error_suggestion(c["type"])
                        })
            
            # عد الأخطاء الإملائية
            spelling_errors = 0
            spelling_examples = []
            for change in all_changes:
                for c in change['changes']:
                    if is_spelling_error(c):
                        spelling_errors += 1
                        if len(spelling_examples) < 2:
                            spelling_examples.append({
                                "message": f'Spelling: "{c["original"]}" → "{c["corrected"]}"',
                                "suggestion": "Check word spelling"
                            })
            
            error_analysis = {
                "grammar": {
                    "count": len(all_changes),
                    "examples": grammar_examples
                },
                "spelling": {
                    "count": spelling_errors,
                    "examples": spelling_examples
                },
                "punctuation": {
                    "count": count_punctuation_errors(all_changes),
                    "examples": get_punctuation_examples(all_changes)
                }
            }
        
        logger.info(f"✅ Grammar check complete: {len(all_changes)} changes")
        
        return {
            "success": True,
            "original_text": text,
            "corrected_html": final_html,
            "corrected_plain": final_plain,
            "changes": all_changes,
            "error_analysis": error_analysis,  # ✅ أضيفي هذا
            "statistics": {
                "grammar_score": round(grammar_score, 1),
                "score_badge": score_badge,
                "semantic_similarity": round(similarity * 100, 1),
                "total_changes": len(all_changes),
                "words": words,
                "errors_before": errors_before,
                "errors_after": errors_after
            },
            "is_perfect": len(all_changes) == 0
        }
    except Exception as e:
        logger.error(f"❌ Error in process_grammar_check: {e}")
        logger.error(traceback.format_exc())
        raise

def process_story_evaluation(student_summary, original_story=None):
    """Process story evaluation"""
    try:
        if not student_summary.strip():
            return {"error": "No summary provided"}
        
        logger.info(f"📚 Processing story evaluation for {len(student_summary)} chars")
        
        if not original_story:
            original_story = ORIGINAL_STORY
        
        # Grammar correction
        try:
            sentences = sent_tokenize(student_summary)
        except:
            sentences = [student_summary]
        
        corrected_sentences = []
        grammar_changes = []
        
        for i, sentence in enumerate(sentences, 1):
            if not sentence.strip():
                continue
            
            corrected = enhanced_grammar_correction(sentence)
            corrected_sentences.append(corrected)
            
            _, changes, _ = highlight_differences(sentence, corrected)
            if changes:
                grammar_changes.append({
                    'sentence_num': i,
                    'original': sentence,
                    'corrected': corrected,
                    'changes': changes
                })
        
        final_corrected = " ".join(corrected_sentences)
        
        # Error counts
        errors_before = count_errors_simple(student_summary)
        errors_after = count_errors_simple(final_corrected)
        
        # Scoring
        words = max(len(student_summary.split()), 1)
        grammar_score = max(0, 100 - (errors_after / words * 100))
        
        # Story analysis
        logger.info("🔍 Analyzing story coverage...")
        coverage_analysis = compare_story_coverage(student_summary, original_story)
        content_coverage = coverage_analysis["overall_coverage"]
        
        # Semantic similarity
        logger.info("📊 Calculating semantic similarity...")
        similarity = semantic_similarity(student_summary, original_story)
        
        # Overall grade
        overall_grade = (
            grammar_score * 0.3 +
            content_coverage * 0.4 +
            similarity * 100 * 0.3
        )
        
        if overall_grade >= 90:
            grade_emoji, grade_text = "🌟", "Excellent"
        elif overall_grade >= 80:
            grade_emoji, grade_text = "⭐", "Very Good"
        elif overall_grade >= 70:
            grade_emoji, grade_text = "👍", "Good"
        elif overall_grade >= 60:
            grade_emoji, grade_text = "📝", "Fair"
        else:
            grade_emoji, grade_text = "💪", "Keep Practicing"
        
        logger.info(f"✅ Story evaluation complete: Grade {overall_grade:.1f}")
        
        return {
            "success": True,
            "original_summary": student_summary,
            "corrected_summary": final_corrected,
            "grammar_changes": grammar_changes,
            "evaluation": {
                "overall_grade": round(overall_grade, 1),
                "grade_emoji": grade_emoji,
                "grade_text": grade_text,
                "grammar_score": round(grammar_score, 1),
                "content_coverage": round(content_coverage, 1),
                "story_similarity": round(similarity * 100, 1),
                "word_count": words,
                "errors_before": errors_before,
                "errors_after": errors_after
            },
            "story_analysis": {
                "student_elements": coverage_analysis["student_elements"],
                "original_elements": coverage_analysis["story_elements"],
                "coverage_by_category": {
                    k: round(v, 1) for k, v in coverage_analysis["coverage_scores"].items()
                }
            },
            "original_story": original_story
        }
    except Exception as e:
        logger.error(f"❌ Error in process_story_evaluation: {e}")
        logger.error(traceback.format_exc())
        raise

# ========================== FLASK ROUTES ==========================

@app.route('/')
def home():
    return jsonify({
        "message": "🚀 Hybrid Grammar Checker API - Fixed",
        "version": "3.0.1",
        "status": "active",
        "features": [
            "LanguageTool API (fast)",
            "Rule-based correction (fallback)",
            "Tiny semantic model (22MB)",
            "Simple entity extraction",
            "Better error handling"
        ],
        "endpoints": {
            "grammar_check": "/api/grammar/check",
            "story_evaluate": "/api/story/evaluate",
            "story_analyze": "/api/story/analyze",
            "story_original": "/api/story/original",
            "health": "/health"
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "hybrid-grammar-service",
        "device": device.upper(),
        "model_loaded": semantic_model is not None,
        "cache_size": len(correction_cache)
    })

@app.route('/api/grammar/check', methods=['POST', 'OPTIONS'])
def grammar_check():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing text parameter"}), 400
        
        result = process_grammar_check(data['text'])
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Error in grammar_check endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Processing failed",
            "message": str(e),
            "success": False
        }), 500

@app.route('/api/story/evaluate', methods=['POST', 'OPTIONS'])
def story_evaluate():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        logger.info("📥 Received story evaluation request")
        data = request.get_json()
        
        if not data:
            logger.error("❌ No JSON data received")
            return jsonify({"error": "No data provided"}), 400
        
        if 'summary' not in data:
            logger.error("❌ Missing summary in request")
            return jsonify({"error": "Missing summary parameter"}), 400
        
        logger.info(f"📝 Summary length: {len(data['summary'])} chars")
        
        original_story = data.get('original_story', None)
        result = process_story_evaluation(data['summary'], original_story)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Error in story_evaluate endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Evaluation failed",
            "message": str(e),
            "success": False
        }), 500

@app.route('/api/story/original', methods=['GET'])
def get_original_story():
    return jsonify({
        "success": True,
        "story": ORIGINAL_STORY
    })

@app.route('/api/story/analyze', methods=['POST', 'OPTIONS'])
def analyze_story():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data or 'story' not in data:
            return jsonify({"error": "Missing story parameter"}), 400
        
        story_text = data['story']
        elements = simple_extract_entities(story_text)
        
        return jsonify({
            "success": True,
            "story": story_text,
            "elements": elements
        })
    
    except Exception as e:
        logger.error(f"❌ Error in analyze_story: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Analysis failed",
            "message": str(e),
            "success": False
        }), 500

# ✅ أضيفي هذه الدوال المساعدة قبل if __name__ == '__main__':

def get_error_suggestion(error_type):
    """إرجاع نص مساعد حسب نوع الخطأ"""
    suggestions = {
        "replacement": "Consider using the correct word form",
        "insertion": "Missing word added for grammatical correctness", 
        "deletion": "Unnecessary word removed",
        "spelling": "Check spelling and word form"
    }
    return suggestions.get(error_type, "Grammar correction needed")

def is_spelling_error(change):
    """التعرف على الأخطاء الإملائية"""
    original = change.get('original', '').lower()
    corrected = change.get('corrected', '').lower()
    
    # كلمات شائعة بها أخطاء إملائية
    common_spelling_errors = ['dont', 'cant', 'wont', 'its', 'goes', 'run', 'say']
    return any(error_word in original for error_word in common_spelling_errors)

def count_punctuation_errors(all_changes):
    """عد أخطاء الترقيم"""
    punctuation_count = 0
    for change in all_changes:
        for c in change['changes']:
            original = c.get('original', '')
            corrected = c.get('corrected', '')
            # إذا كان التصحيح يتعلق بالترقيم
            if any(punc in corrected for punc in ["'", '"', ",", ".", "!", "?"]):
                if any(punc in original for punc in ["'", '"', ",", ".", "!", "?"]):
                    punctuation_count += 1
    return punctuation_count

def get_punctuation_examples(all_changes):
    """إرجاع أمثلة لأخطاء الترقيم"""
    examples = []
    for change in all_changes:
        for c in change['changes']:
            original = c.get('original', '')
            corrected = c.get('corrected', '')
            if any(punc in corrected for punc in ["'", '"']) and not any(punc in original for punc in ["'", '"']):
                if len(examples) < 2:
                    examples.append({
                        "message": f'Punctuation: "{original}" → "{corrected}"',
                        "suggestion": "Add missing punctuation"
                    })
    return examples

# ========================== ERROR HANDLERS ==========================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 Error: {error}")
    return jsonify({"error": "Internal server error"}), 500

# ========================== RUN APPLICATION ==========================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    
    logger.info("\n" + "="*70)
    logger.info("🚀 STARTING HYBRID GRAMMAR SERVICE - FIXED VERSION")
    logger.info("="*70)
    logger.info(f"📍 Port: {port}")
    logger.info(f"💡 Features: API-based + Rule-based + Tiny Model")
    logger.info(f"⚡ Model Size: 22MB")
    logger.info(f"🔧 Error Handling: Enhanced")
    logger.info("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)