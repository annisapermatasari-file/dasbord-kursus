#!/usr/bin/env python3
"""
Test suite for GET /api/ayrshare/history endpoint
Tests daily time-series aggregation for social media analytics
"""

import requests
import json
import sys

BASE_URL = "http://localhost:3000/api"

def test_history_no_params():
    """Test 1: GET /api/ayrshare/history (no params)"""
    print("\n" + "="*80)
    print("Test 1: GET /api/ayrshare/history (no params)")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/ayrshare/history", timeout=10)
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"✗ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        # Check if connected field exists
        if 'connected' not in data:
            print(f"✗ FAILED: Missing 'connected' field in response")
            return False
        
        print(f"✓ connected: {data['connected']}")
        
        # If connected is false, profile not created yet (acceptable)
        if not data['connected']:
            print(f"✓ Profile not created yet (acceptable): {data.get('error', 'No error message')}")
            return True
        
        # If connected is true, check for either success or error response
        if 'error' in data:
            # Error response from Ayrshare (acceptable)
            print(f"✓ Ayrshare returned error (acceptable): {data['error']}")
            if 'detail' in data:
                print(f"  Detail: {json.dumps(data['detail'], indent=2)[:200]}")
            return True
        
        # Success response - check structure
        if 'days' not in data:
            print(f"✗ FAILED: Missing 'days' field in success response")
            return False
        
        if 'series' not in data:
            print(f"✗ FAILED: Missing 'series' field in success response")
            return False
        
        if 'rawCount' not in data:
            print(f"✗ FAILED: Missing 'rawCount' field in success response")
            return False
        
        print(f"✓ days: {data['days']}")
        print(f"✓ rawCount: {data['rawCount']}")
        
        # Check series structure (should be object with platform keys)
        series = data['series']
        if not isinstance(series, dict):
            print(f"✗ FAILED: 'series' should be an object, got {type(series)}")
            return False
        
        expected_platforms = ['instagram', 'facebook', 'youtube', 'tiktok']
        for platform in expected_platforms:
            if platform not in series:
                print(f"✗ FAILED: Missing platform '{platform}' in series")
                return False
            
            if not isinstance(series[platform], list):
                print(f"✗ FAILED: series['{platform}'] should be an array")
                return False
            
            if len(series[platform]) != data['days']:
                print(f"✗ FAILED: series['{platform}'] length {len(series[platform])} != days {data['days']}")
                return False
            
            print(f"✓ series['{platform}']: array of length {len(series[platform])}")
            
            # Check first item structure if array is not empty
            if len(series[platform]) > 0:
                item = series[platform][0]
                required_fields = ['date', 'posts', 'likes', 'comments', 'shares', 'views', 'reach', 'impressions', 'engagement']
                for field in required_fields:
                    if field not in item:
                        print(f"✗ FAILED: Missing field '{field}' in series item")
                        return False
                print(f"  ✓ First item has all required fields: {list(item.keys())}")
        
        print(f"✓ TEST PASSED: All platforms have correct structure")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"✗ FAILED: Request error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"✗ FAILED: Invalid JSON response: {e}")
        return False
    except Exception as e:
        print(f"✗ FAILED: Unexpected error: {e}")
        return False


def test_history_with_platform(platform, days):
    """Test history endpoint with specific platform and days"""
    print("\n" + "="*80)
    print(f"Test: GET /api/ayrshare/history?platform={platform}&days={days}")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/ayrshare/history?platform={platform}&days={days}", timeout=10)
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"✗ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        # Check if connected field exists
        if 'connected' not in data:
            print(f"✗ FAILED: Missing 'connected' field in response")
            return False
        
        print(f"✓ connected: {data['connected']}")
        
        # If connected is false, profile not created yet (acceptable)
        if not data['connected']:
            print(f"✓ Profile not created yet (acceptable): {data.get('error', 'No error message')}")
            return True
        
        # If connected is true, check for either success or error response
        if 'error' in data:
            # Error response from Ayrshare (acceptable)
            print(f"✓ Ayrshare returned error (acceptable): {data['error']}")
            if 'detail' in data:
                print(f"  Detail: {json.dumps(data['detail'], indent=2)[:200]}")
            return True
        
        # Success response - check structure
        if 'platform' not in data:
            print(f"✗ FAILED: Missing 'platform' field in success response")
            return False
        
        if data['platform'] != platform:
            print(f"✗ FAILED: Expected platform '{platform}', got '{data['platform']}'")
            return False
        
        if 'days' not in data:
            print(f"✗ FAILED: Missing 'days' field in success response")
            return False
        
        if data['days'] != days:
            print(f"✗ FAILED: Expected days {days}, got {data['days']}")
            return False
        
        if 'series' not in data:
            print(f"✗ FAILED: Missing 'series' field in success response")
            return False
        
        if 'rawCount' not in data:
            print(f"✗ FAILED: Missing 'rawCount' field in success response")
            return False
        
        print(f"✓ platform: {data['platform']}")
        print(f"✓ days: {data['days']}")
        print(f"✓ rawCount: {data['rawCount']}")
        
        # Check series structure (should be array for single platform)
        series = data['series']
        if not isinstance(series, list):
            print(f"✗ FAILED: 'series' should be an array for single platform, got {type(series)}")
            return False
        
        if len(series) != days:
            print(f"✗ FAILED: series length {len(series)} != days {days}")
            return False
        
        print(f"✓ series: array of length {len(series)}")
        
        # Check first item structure if array is not empty
        if len(series) > 0:
            item = series[0]
            required_fields = ['date', 'posts', 'likes', 'comments', 'shares', 'views', 'reach', 'impressions', 'engagement']
            for field in required_fields:
                if field not in item:
                    print(f"✗ FAILED: Missing field '{field}' in series item")
                    return False
            print(f"  ✓ First item has all required fields: {list(item.keys())}")
            print(f"  ✓ Sample data: date={item['date']}, posts={item['posts']}, likes={item['likes']}")
        
        print(f"✓ TEST PASSED: Platform-specific query returned correct structure")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"✗ FAILED: Request error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"✗ FAILED: Invalid JSON response: {e}")
        return False
    except Exception as e:
        print(f"✗ FAILED: Unexpected error: {e}")
        return False


def test_regression_endpoints():
    """Test 6: Regression - existing endpoints still work"""
    print("\n" + "="*80)
    print("Test 6: Regression - Existing endpoints still work")
    print("="*80)
    
    tests = [
        ("GET /api/health", f"{BASE_URL}/health", "GET", None),
        ("GET /api/ayrshare/status", f"{BASE_URL}/ayrshare/status", "GET", None),
        ("GET /api/ayrshare/analytics?platforms=instagram", f"{BASE_URL}/ayrshare/analytics?platforms=instagram", "GET", None),
        ("GET /api/activity-logs?limit=5", f"{BASE_URL}/activity-logs?limit=5", "GET", None),
        ("GET /api/activity-summary", f"{BASE_URL}/activity-summary", "GET", None),
        ("POST /api/auth/forgot-password", f"{BASE_URL}/auth/forgot-password", "POST", {"email": "annisa.permatasari@dikdasmen.belajar.id"}),
    ]
    
    all_passed = True
    
    for test_name, url, method, body in tests:
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            else:
                response = requests.post(url, json=body, timeout=10)
            
            if response.status_code == 200:
                print(f"✓ {test_name} → 200")
                
                # Additional checks for specific endpoints
                if "health" in url:
                    data = response.json()
                    if data.get('status') == 'ok':
                        print(f"  ✓ Health check OK")
                
                if "ayrshare/status" in url:
                    data = response.json()
                    if 'hasProfile' in data:
                        print(f"  ✓ hasProfile={data['hasProfile']}")
                
                if "forgot-password" in url:
                    data = response.json()
                    if 'delivery' in data:
                        print(f"  ✓ delivery={data['delivery']}")
            else:
                print(f"✗ {test_name} → {response.status_code} (expected 200)")
                all_passed = False
                
        except Exception as e:
            print(f"✗ {test_name} → Error: {e}")
            all_passed = False
    
    return all_passed


def main():
    print("\n" + "="*80)
    print("AYRSHARE HISTORY ENDPOINT TEST SUITE")
    print("Testing GET /api/ayrshare/history with daily time-series aggregation")
    print("="*80)
    
    results = []
    
    # Test 1: No params (default 30 days, all platforms)
    results.append(("Test 1: No params", test_history_no_params()))
    
    # Test 2: Instagram, 30 days
    results.append(("Test 2: Instagram 30 days", test_history_with_platform("instagram", 30)))
    
    # Test 3: Facebook, 7 days
    results.append(("Test 3: Facebook 7 days", test_history_with_platform("facebook", 7)))
    
    # Test 4: YouTube, 14 days
    results.append(("Test 4: YouTube 14 days", test_history_with_platform("youtube", 14)))
    
    # Test 5: TikTok, 90 days
    results.append(("Test 5: TikTok 90 days", test_history_with_platform("tiktok", 90)))
    
    # Test 6: Regression
    results.append(("Test 6: Regression", test_regression_endpoints()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n✗ {total - passed} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
