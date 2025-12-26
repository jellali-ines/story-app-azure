"""
Test script for Backend API
Run this after starting backend.py
"""

import requests
import json

BASE_URL = "http://localhost:5002/api"

def test_endpoint(name, method, endpoint, data=None):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {name}")
    print(f"{'='*60}")
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"📍 URL: {url}")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS")
            print(f"📦 Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ FAILED")
            print(f"📦 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR - Is backend running?")
    except requests.exceptions.Timeout:
        print(f"⏱️ TIMEOUT - Request took too long")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def main():
    print("\n" + "🚀 Backend API Test Suite".center(60, "="))
    print("\n⚠️  Make sure backend.py is running on port 5002\n")
    
    # Test 1: Simple test endpoint
    test_endpoint(
        "Test Endpoint",
        "GET",
        "/test"
    )
    
    # Test 2: Health check
    test_endpoint(
        "Health Check",
        "GET",
        "/health"
    )
    
    # Test 3: Stats endpoint
    test_endpoint(
        "Stats Endpoint",
        "GET",
        "/stats"
    )
    
    # Test 4: Chat endpoint
    test_endpoint(
        "Chat Endpoint",
        "POST",
        "/chat",
        {
            "message": "Hello! Who are you?",
            "story_context": "This is a test story about a brave knight."
        }
    )
    
    # Test 5: Explain word endpoint
    test_endpoint(
        "Explain Word Endpoint",
        "POST",
        "/explain-word",
        {
            "word": "brave",
            "story_context": "The brave knight fought the dragon."
        }
    )
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()