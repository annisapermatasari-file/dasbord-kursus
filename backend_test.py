#!/usr/bin/env python3
"""
Backend API Tests for Dashboard Media Sosial Direktorat Kursus dan Pelatihan
Tests user management, authentication, and OAuth callback error handling
"""

import requests
import json
import sys
from urllib.parse import quote

# Base URL from environment
BASE_URL = "https://dashboard-kursos.preview.emergentagent.com/api"

# Test data
TEST_USER = {
    "name": "Siti Nurhaliza",
    "email": "siti.nurhaliza@dikdasmen.belajar.id",
    "password": "Test@2026",
    "role": "Analyst",
    "jabatan": "Analis Data Junior"
}

PRESET_USERS = [
    "annisa.permatasari@dikdasmen.belajar.id",
    "rina.setiawati@dikdasmen.belajar.id",
    "budi.santosa@dikdasmen.belajar.id",
    "dewi.rahayu@dikdasmen.belajar.id"
]

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_success(msg):
    print(f"✅ SUCCESS: {msg}")

def print_failure(msg):
    print(f"❌ FAILURE: {msg}")

def test_create_user():
    """Test 1: POST /api/users to create Siti Nurhaliza"""
    print_test("Create User - Siti Nurhaliza")
    try:
        response = requests.post(f"{BASE_URL}/users", json=TEST_USER, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data.get('user'):
                user = data['user']
                if user.get('name') == TEST_USER['name'] and user.get('email') == TEST_USER['email']:
                    if 'password' not in user:
                        print_success("User created successfully without password in response")
                        return True
                    else:
                        print_failure("Password field present in response")
                        return False
                else:
                    print_failure(f"User data mismatch: {user}")
                    return False
            else:
                print_failure(f"Invalid response structure: {data}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_get_users():
    """Test 2: GET /api/users - verify user appears without password"""
    print_test("Get Users - Verify Siti Nurhaliza exists without password")
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            print(f"Total users in DB: {len(users)}")
            
            # Find our test user
            test_user = None
            for user in users:
                if user.get('email') == TEST_USER['email']:
                    test_user = user
                    break
            
            if test_user:
                print(f"Found user: {test_user}")
                if 'password' in test_user:
                    print_failure("Password field present in user data")
                    return False
                else:
                    print_success("User found without password field")
                    return True
            else:
                print_failure(f"Test user not found in list. Users: {[u.get('email') for u in users]}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_login_correct():
    """Test 3: POST /api/auth/login with correct credentials"""
    print_test("Login - Correct Credentials")
    try:
        login_data = {
            "email": TEST_USER['email'],
            "password": TEST_USER['password']
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('user'):
                user = data['user']
                if 'password' not in user:
                    print_success("Login successful, user returned without password")
                    return True
                else:
                    print_failure("Password field present in login response")
                    return False
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
    """Test 4: POST /api/auth/login with wrong password - expect 401"""
    print_test("Login - Wrong Password")
    try:
        login_data = {
            "email": TEST_USER['email'],
            "password": "WrongPassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 401:
            data = response.json()
            if data.get('error'):
                print_success(f"Correctly returned 401 with error: {data['error']}")
                return True
            else:
                print_failure("401 returned but no error message")
                return False
        else:
            print_failure(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_login_nonexistent_email():
    """Test 5: POST /api/auth/login with non-existent email - expect 401"""
    print_test("Login - Non-existent Email")
    try:
        login_data = {
            "email": "nonexistent.user@dikdasmen.belajar.id",
            "password": "SomePassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 401:
            data = response.json()
            if data.get('error'):
                print_success(f"Correctly returned 401 with error: {data['error']}")
                return True
            else:
                print_failure("401 returned but no error message")
                return False
        else:
            print_failure(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_upsert_user():
    """Test 6: POST /api/users with same email but different name - expect upsert"""
    print_test("Upsert User - Same Email, Different Name")
    try:
        updated_user = {
            "name": "Siti Nurhaliza Updated",
            "email": TEST_USER['email'],
            "password": TEST_USER['password'],
            "role": TEST_USER['role'],
            "jabatan": "Senior Analis Data"
        }
        response = requests.post(f"{BASE_URL}/users", json=updated_user, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            # Now verify the name was updated
            get_response = requests.get(f"{BASE_URL}/users", timeout=10)
            if get_response.status_code == 200:
                users = get_response.json().get('users', [])
                test_user = None
                for user in users:
                    if user.get('email') == TEST_USER['email']:
                        test_user = user
                        break
                
                if test_user and test_user.get('name') == "Siti Nurhaliza Updated":
                    print_success("User name successfully updated via upsert")
                    return True
                else:
                    print_failure(f"Name not updated. Found: {test_user}")
                    return False
            else:
                print_failure("Failed to verify upsert with GET")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_validation_missing_fields():
    """Test 7a: Validation - Missing required fields"""
    print_test("Validation - Missing Required Fields")
    
    test_cases = [
        ({"email": "test@test.com", "password": "pass123", "role": "Admin"}, "name"),
        ({"name": "Test", "password": "pass123", "role": "Admin"}, "email"),
        ({"name": "Test", "email": "test@test.com", "role": "Admin"}, "password"),
        ({"name": "Test", "email": "test@test.com", "password": "pass123"}, "role"),
    ]
    
    all_passed = True
    for payload, missing_field in test_cases:
        try:
            response = requests.post(f"{BASE_URL}/users", json=payload, timeout=10)
            print(f"\nMissing {missing_field}: Status {response.status_code}")
            if response.status_code == 400:
                data = response.json()
                if data.get('error'):
                    print_success(f"Correctly returned 400 for missing {missing_field}: {data['error']}")
                else:
                    print_failure(f"400 returned but no error message for missing {missing_field}")
                    all_passed = False
            else:
                print_failure(f"Expected 400 for missing {missing_field}, got {response.status_code}")
                all_passed = False
        except Exception as e:
            print_failure(f"Exception for missing {missing_field}: {str(e)}")
            all_passed = False
    
    return all_passed

def test_validation_invalid_email():
    """Test 7b: Validation - Invalid email format"""
    print_test("Validation - Invalid Email Format")
    try:
        invalid_user = {
            "name": "Test User",
            "email": "notanemail",
            "password": "pass123",
            "role": "Admin"
        }
        response = requests.post(f"{BASE_URL}/users", json=invalid_user, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 400:
            data = response.json()
            if data.get('error'):
                print_success(f"Correctly returned 400 for invalid email: {data['error']}")
                return True
            else:
                print_failure("400 returned but no error message")
                return False
        else:
            print_failure(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_validation_short_password():
    """Test 7c: Validation - Password shorter than 6 chars"""
    print_test("Validation - Password Too Short")
    try:
        invalid_user = {
            "name": "Test User",
            "email": "test@test.com",
            "password": "12345",
            "role": "Admin"
        }
        response = requests.post(f"{BASE_URL}/users", json=invalid_user, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 400:
            data = response.json()
            if data.get('error'):
                print_success(f"Correctly returned 400 for short password: {data['error']}")
                return True
            else:
                print_failure("400 returned but no error message")
                return False
        else:
            print_failure(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_validation_invalid_role():
    """Test 7d: Validation - Invalid role"""
    print_test("Validation - Invalid Role")
    try:
        invalid_user = {
            "name": "Test User",
            "email": "test@test.com",
            "password": "pass123",
            "role": "InvalidRole"
        }
        response = requests.post(f"{BASE_URL}/users", json=invalid_user, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 400:
            data = response.json()
            if data.get('error'):
                print_success(f"Correctly returned 400 for invalid role: {data['error']}")
                return True
            else:
                print_failure("400 returned but no error message")
                return False
        else:
            print_failure(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_delete_user():
    """Test 8: DELETE /api/users/:email"""
    print_test("Delete User")
    try:
        encoded_email = quote(TEST_USER['email'])
        response = requests.delete(f"{BASE_URL}/users/{encoded_email}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                # Verify user is removed
                get_response = requests.get(f"{BASE_URL}/users", timeout=10)
                if get_response.status_code == 200:
                    users = get_response.json().get('users', [])
                    test_user = None
                    for user in users:
                        if user.get('email') == TEST_USER['email']:
                            test_user = user
                            break
                    
                    if test_user is None:
                        print_success("User successfully deleted and not in list")
                        return True
                    else:
                        print_failure("User still appears in list after deletion")
                        return False
                else:
                    print_failure("Failed to verify deletion with GET")
                    return False
            else:
                print_failure(f"Delete response missing 'ok': {data}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_preset_users_not_in_db():
    """Test 9: Verify preset users are NOT in database"""
    print_test("Preset Users NOT in Database")
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            user_emails = [u.get('email') for u in users]
            print(f"Users in DB: {user_emails}")
            
            found_preset = []
            for preset_email in PRESET_USERS:
                if preset_email in user_emails:
                    found_preset.append(preset_email)
            
            if found_preset:
                print_failure(f"Preset users found in DB (should be frontend-only): {found_preset}")
                return False
            else:
                print_success("No preset users in database (correct - they are frontend-only)")
                return True
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def test_oauth_callback_error():
    """Test 10: OAuth callback error message with redirect URI hint"""
    print_test("OAuth Callback Error Message")
    try:
        url = f"{BASE_URL}/oauth/meta/callback?error=URL+blocked&error_description=redirect+URI+not+whitelisted"
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                html_content = response.text
                print(f"Response length: {len(html_content)} chars")
                
                # Check for redirect URI hint
                if '/api/oauth/meta/callback' in html_content:
                    print_success("Redirect URI '/api/oauth/meta/callback' found in response")
                    
                    # Check for Indonesian error message
                    if 'Redirect URI belum didaftarkan' in html_content:
                        print_success("Indonesian error message found")
                        return True
                    else:
                        print_failure("Indonesian error message 'Redirect URI belum didaftarkan' not found")
                        print(f"HTML snippet: {html_content[:1000]}")
                        return False
                else:
                    print_failure("Redirect URI hint not found in HTML")
                    print(f"HTML snippet: {html_content[:1000]}")
                    return False
            else:
                print_failure(f"Expected text/html, got {content_type}")
                return False
        else:
            print_failure(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("BACKEND API TESTS - Dashboard Media Sosial Direktorat Kursus dan Pelatihan")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = {}
    
    # Run all tests in order
    results['1. Create User'] = test_create_user()
    results['2. Get Users'] = test_get_users()
    results['3. Login Correct'] = test_login_correct()
    results['4. Login Wrong Password'] = test_login_wrong_password()
    results['5. Login Non-existent Email'] = test_login_nonexistent_email()
    results['6. Upsert User'] = test_upsert_user()
    results['7a. Validation Missing Fields'] = test_validation_missing_fields()
    results['7b. Validation Invalid Email'] = test_validation_invalid_email()
    results['7c. Validation Short Password'] = test_validation_short_password()
    results['7d. Validation Invalid Role'] = test_validation_invalid_role()
    results['8. Delete User'] = test_delete_user()
    results['9. Preset Users Not in DB'] = test_preset_users_not_in_db()
    results['10. OAuth Callback Error'] = test_oauth_callback_error()
    
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
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
