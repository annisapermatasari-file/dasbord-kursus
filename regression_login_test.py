#!/usr/bin/env python3
"""
Regression Test for Login Endpoint - PREVIEW Environment Only
Tests requested by user to verify login endpoint still works after production issue
"""

import requests
import json
import sys

# Use localhost since we're in the container
BASE_URL = "http://localhost:3000/api"

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_success(msg):
    print(f"✅ SUCCESS: {msg}")

def print_failure(msg):
    print(f"❌ FAILURE: {msg}")

def test_health_endpoint():
    """Test 1: GET /api/health → 200 { status: 'ok' }"""
    print_test("Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print_success("Health endpoint returns { status: 'ok' }")
                return True
            else:
                print_failure(f"Expected {{ status: 'ok' }}, got {data}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_get_users_seeded():
    """Test 2: GET /api/users → 200 with at least 4 seeded users"""
    print_test("Get Users - Verify 4 Seeded Users")
    
    expected_users = [
        "annisa.permatasari@dikdasmen.belajar.id",
        "rina.setiawati@dikdasmen.belajar.id",
        "budi.santosa@dikdasmen.belajar.id",
        "dewi.rahayu@dikdasmen.belajar.id"
    ]
    
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            print(f"Total users in DB: {len(users)}")
            
            user_emails = [u.get('email') for u in users]
            print(f"User emails: {user_emails}")
            
            # Check if all 4 expected users are present
            found_users = []
            missing_users = []
            
            for expected_email in expected_users:
                if expected_email in user_emails:
                    found_users.append(expected_email)
                else:
                    missing_users.append(expected_email)
            
            if len(found_users) >= 4:
                print_success(f"Found all 4 seeded users: {found_users}")
                
                # Verify no password fields in response
                has_password = any('password' in u for u in users)
                if has_password:
                    print_failure("Password field found in user data")
                    return False
                else:
                    print_success("No password fields in user data")
                    return True
            else:
                print_failure(f"Only found {len(found_users)} seeded users. Missing: {missing_users}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_login_correct_credentials():
    """Test 3: POST /api/auth/login with correct credentials → 200 with user object, role=Admin"""
    print_test("Login - Correct Credentials (Annisa - Admin)")
    try:
        login_data = {
            "email": "annisa.permatasari@dikdasmen.belajar.id",
            "password": "Admin@2026"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('user'):
                user = data['user']
                
                # Check no password in response
                if 'password' in user:
                    print_failure("Password field present in login response")
                    return False
                
                # Check role is Admin
                if user.get('role') != 'Admin':
                    print_failure(f"Expected role=Admin, got role={user.get('role')}")
                    return False
                
                # Check email matches
                if user.get('email') != login_data['email']:
                    print_failure(f"Email mismatch: expected {login_data['email']}, got {user.get('email')}")
                    return False
                
                print_success(f"Login successful: {user.get('name')} (role={user.get('role')})")
                print_success("User object returned without password field")
                return True
            else:
                print_failure(f"No user in response: {data}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_login_wrong_password():
    """Test 4: POST /api/auth/login with wrong password → 401 with error message"""
    print_test("Login - Wrong Password")
    try:
        login_data = {
            "email": "annisa.permatasari@dikdasmen.belajar.id",
            "password": "WrongPassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 401:
            data = response.json()
            if data.get('error'):
                error_msg = data['error']
                print_success(f"Correctly returned 401 with error message: '{error_msg}'")
                
                # Verify error message is clear
                if error_msg and len(error_msg) > 0:
                    print_success("Error message is clear and present")
                    return True
                else:
                    print_failure("Error message is empty")
                    return False
            else:
                print_failure("401 returned but no error message")
                return False
        else:
            print_failure(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_impact_stats():
    """Test 5: GET /api/impact-stats → 200 with array of 4 stats items"""
    print_test("Impact Stats Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/impact-stats", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', [])
            
            if not isinstance(stats, list):
                print_failure(f"Expected stats to be an array, got {type(stats)}")
                return False
            
            if len(stats) != 4:
                print_failure(f"Expected 4 stats items, got {len(stats)}")
                return False
            
            # Verify each stat has required fields
            for i, stat in enumerate(stats):
                if not stat.get('v') or not stat.get('l'):
                    print_failure(f"Stat {i+1} missing required fields (v or l): {stat}")
                    return False
            
            print_success(f"Impact stats returned with 4 items:")
            for i, stat in enumerate(stats):
                print(f"  {i+1}. {stat.get('v')} - {stat.get('l')}")
            
            return True
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_mongodb_connection():
    """Bonus Test: Verify MongoDB is accessible by checking user count"""
    print_test("MongoDB Connection Check")
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            print_success(f"MongoDB accessible - {len(users)} users in database")
            return True
        elif response.status_code == 500:
            print_failure("500 error - possible MongoDB connection issue")
            return False
        else:
            print_failure(f"Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("REGRESSION TEST - Login Endpoint Verification (PREVIEW Environment)")
    print(f"Base URL: {BASE_URL}")
    print("Testing against PREVIEW environment (NOT production)")
    print("="*80)
    
    results = {}
    
    # Run all tests in order
    results['1. Health Endpoint'] = test_health_endpoint()
    results['2. Get Users - 4 Seeded Users'] = test_get_users_seeded()
    results['3. Login - Correct Credentials (Admin)'] = test_login_correct_credentials()
    results['4. Login - Wrong Password'] = test_login_wrong_password()
    results['5. Impact Stats'] = test_impact_stats()
    results['6. MongoDB Connection'] = test_mongodb_connection()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*80)
    
    if passed == total:
        print("\n✅ ALL REGRESSION TESTS PASSED")
        print("Login endpoint is working correctly in PREVIEW environment")
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED")
        print("Some issues detected in PREVIEW environment")
    
    print("\nNote: Production issue 'Gagal menghubungi server. Coba lagi.' may be due to:")
    print("  - Network/firewall issues between client and production server")
    print("  - Production environment configuration differences")
    print("  - CORS or SSL certificate issues")
    print("  - Production MongoDB connection issues")
    print("\n" + "="*80)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
