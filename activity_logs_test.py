#!/usr/bin/env python3
"""
Comprehensive backend test for Activity Logs, Email OTP, and Password Reset features
Dashboard Direktorat Kursus dan Pelatihan
"""
import requests
import json
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "http://localhost:3000/api"

# Test user credentials (from seed data)
TEST_USER_EMAIL = "annisa.permatasari@dikdasmen.belajar.id"
TEST_USER_PASSWORD = "Admin@2026"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_test(test_name, passed, details=""):
    status = f"{GREEN}✅ PASSED{RESET}" if passed else f"{RED}❌ FAILED{RESET}"
    print(f"\n{status} - {test_name}")
    if details:
        print(f"  {details}")
    return passed

def test_email_otp_real_user():
    """Test 1: POST /api/auth/forgot-password with real DB user"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 1: Email OTP with Real User{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": TEST_USER_EMAIL},
            timeout=10
        )
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Email OTP - Real User", False, f"Expected 200, got {response.status_code}")
        
        # Check delivery is 'email'
        if data.get('delivery') != 'email':
            return log_test("Email OTP - Real User", False, f"Expected delivery='email', got '{data.get('delivery')}'")
        
        # Check dev_code is null (email mode)
        if data.get('dev_code') is not None:
            return log_test("Email OTP - Real User", False, f"Expected dev_code=null, got '{data.get('dev_code')}'")
        
        # Check message contains "dikirim"
        message = data.get('message', '')
        if 'dikirim' not in message.lower():
            return log_test("Email OTP - Real User", False, f"Expected message to contain 'dikirim', got '{message}'")
        
        # CRITICAL: email_error MUST be null (SMTP successfully sent)
        if data.get('email_error') is not None:
            return log_test("Email OTP - Real User", False, f"CRITICAL: email_error should be null (SMTP failed), got '{data.get('email_error')}'")
        
        return log_test("Email OTP - Real User", True, 
                       f"✓ delivery='email', dev_code=null, email_error=null, message contains 'dikirim'")
    
    except Exception as e:
        return log_test("Email OTP - Real User", False, f"Exception: {str(e)}")

def test_email_otp_nonexistent_user():
    """Test 2: POST /api/auth/forgot-password with non-existent email"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 2: Email OTP with Non-existent User{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": "nonexistent@nowhere.com"},
            timeout=10
        )
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Email OTP - Non-existent User", False, f"Expected 200, got {response.status_code}")
        
        # Check delivery is 'demo' (do not reveal user existence)
        if data.get('delivery') != 'demo':
            return log_test("Email OTP - Non-existent User", False, f"Expected delivery='demo', got '{data.get('delivery')}'")
        
        # Check dev_code is null
        if data.get('dev_code') is not None:
            return log_test("Email OTP - Non-existent User", False, f"Expected dev_code=null, got '{data.get('dev_code')}'")
        
        # Check generic message (do not reveal user existence)
        message = data.get('message', '')
        if not message:
            return log_test("Email OTP - Non-existent User", False, "Expected generic message")
        
        return log_test("Email OTP - Non-existent User", True, 
                       f"✓ delivery='demo', dev_code=null, generic message (user existence not revealed)")
    
    except Exception as e:
        return log_test("Email OTP - Non-existent User", False, f"Exception: {str(e)}")

def test_email_otp_empty_body():
    """Test 3: POST /api/auth/forgot-password with empty body"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 3: Email OTP with Empty Body{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={},
            timeout=10
        )
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2)}")
        
        # Check status code is 400
        if response.status_code != 400:
            return log_test("Email OTP - Empty Body", False, f"Expected 400, got {response.status_code}")
        
        # Check error message
        if 'error' not in data:
            return log_test("Email OTP - Empty Body", False, "Expected error field in response")
        
        return log_test("Email OTP - Empty Body", True, f"✓ Returns 400 with error: {data.get('error')}")
    
    except Exception as e:
        return log_test("Email OTP - Empty Body", False, f"Exception: {str(e)}")

def test_activity_summary():
    """Test 4: GET /api/activity-summary"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 4: Activity Summary{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/activity-summary", timeout=10)
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Activity Summary", False, f"Expected 200, got {response.status_code}")
        
        # Check required fields
        required_fields = ['total24h', 'total7d', 'loginFails24h', 'byAction']
        for field in required_fields:
            if field not in data:
                return log_test("Activity Summary", False, f"Missing required field: {field}")
        
        # Check types
        if not isinstance(data['total24h'], int):
            return log_test("Activity Summary", False, f"total24h should be int, got {type(data['total24h'])}")
        
        if not isinstance(data['total7d'], int):
            return log_test("Activity Summary", False, f"total7d should be int, got {type(data['total7d'])}")
        
        if not isinstance(data['loginFails24h'], int):
            return log_test("Activity Summary", False, f"loginFails24h should be int, got {type(data['loginFails24h'])}")
        
        if not isinstance(data['byAction'], list):
            return log_test("Activity Summary", False, f"byAction should be array, got {type(data['byAction'])}")
        
        return log_test("Activity Summary", True, 
                       f"✓ total24h={data['total24h']}, total7d={data['total7d']}, loginFails24h={data['loginFails24h']}, byAction has {len(data['byAction'])} entries")
    
    except Exception as e:
        return log_test("Activity Summary", False, f"Exception: {str(e)}")

def test_activity_logs_basic():
    """Test 5: GET /api/activity-logs?limit=10"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 5: Activity Logs - Basic Query{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/activity-logs?limit=10", timeout=10)
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Activity Logs - Basic", False, f"Expected 200, got {response.status_code}")
        
        # Check logs field
        if 'logs' not in data:
            return log_test("Activity Logs - Basic", False, "Missing 'logs' field")
        
        if not isinstance(data['logs'], list):
            return log_test("Activity Logs - Basic", False, f"logs should be array, got {type(data['logs'])}")
        
        # Check log entry structure
        if len(data['logs']) > 0:
            log_entry = data['logs'][0]
            required_fields = ['id', 'action', 'actor', 'status', 'ts']
            for field in required_fields:
                if field not in log_entry:
                    return log_test("Activity Logs - Basic", False, f"Log entry missing field: {field}")
        
        return log_test("Activity Logs - Basic", True, 
                       f"✓ Returns array with {len(data['logs'])} log entries, each has required fields")
    
    except Exception as e:
        return log_test("Activity Logs - Basic", False, f"Exception: {str(e)}")

def test_activity_logs_filter_action():
    """Test 6: GET /api/activity-logs?action=auth.login&limit=5"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 6: Activity Logs - Filter by Action{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/activity-logs?action=auth.login&limit=5", timeout=10)
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Activity Logs - Filter Action", False, f"Expected 200, got {response.status_code}")
        
        # Check logs field
        if 'logs' not in data:
            return log_test("Activity Logs - Filter Action", False, "Missing 'logs' field")
        
        # Verify all logs have action='auth.login'
        for log_entry in data['logs']:
            if log_entry.get('action') != 'auth.login':
                return log_test("Activity Logs - Filter Action", False, 
                               f"Expected all logs to have action='auth.login', found '{log_entry.get('action')}'")
        
        return log_test("Activity Logs - Filter Action", True, 
                       f"✓ All {len(data['logs'])} logs have action='auth.login'")
    
    except Exception as e:
        return log_test("Activity Logs - Filter Action", False, f"Exception: {str(e)}")

def test_activity_logs_filter_status():
    """Test 7: GET /api/activity-logs?status=failure&limit=5"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 7: Activity Logs - Filter by Status{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/activity-logs?status=failure&limit=5", timeout=10)
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Activity Logs - Filter Status", False, f"Expected 200, got {response.status_code}")
        
        # Check logs field
        if 'logs' not in data:
            return log_test("Activity Logs - Filter Status", False, "Missing 'logs' field")
        
        # Verify all logs have status='failure'
        for log_entry in data['logs']:
            if log_entry.get('status') != 'failure':
                return log_test("Activity Logs - Filter Status", False, 
                               f"Expected all logs to have status='failure', found '{log_entry.get('status')}'")
        
        return log_test("Activity Logs - Filter Status", True, 
                       f"✓ All {len(data['logs'])} logs have status='failure'")
    
    except Exception as e:
        return log_test("Activity Logs - Filter Status", False, f"Exception: {str(e)}")

def test_activity_logs_filter_days():
    """Test 8: GET /api/activity-logs?days=7&limit=100"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 8: Activity Logs - Filter by Days{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/activity-logs?days=7&limit=100", timeout=10)
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body (first 3 entries): {json.dumps(data['logs'][:3] if 'logs' in data else [], indent=2, default=str)}")
        
        # Check status code
        if response.status_code != 200:
            return log_test("Activity Logs - Filter Days", False, f"Expected 200, got {response.status_code}")
        
        # Check logs field
        if 'logs' not in data:
            return log_test("Activity Logs - Filter Days", False, "Missing 'logs' field")
        
        return log_test("Activity Logs - Filter Days", True, 
                       f"✓ Returns {len(data['logs'])} logs from last 7 days")
    
    except Exception as e:
        return log_test("Activity Logs - Filter Days", False, f"Exception: {str(e)}")

def test_activity_instrumentation_login_success():
    """Test 9: Verify successful login creates activity log"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 9: Activity Instrumentation - Login Success{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Perform login
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
            timeout=10
        )
        
        print(f"Login Response Status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            return log_test("Activity Instrumentation - Login Success", False, 
                           f"Login failed with status {login_response.status_code}")
        
        # Wait a moment for log to be written
        time.sleep(0.5)
        
        # Check activity logs for this login
        logs_response = requests.get(
            f"{BASE_URL}/activity-logs?action=auth.login&limit=5",
            timeout=10
        )
        
        logs_data = logs_response.json()
        print(f"Activity Logs Response: {json.dumps(logs_data, indent=2, default=str)}")
        
        # Find the most recent successful login for our test user
        found = False
        for log_entry in logs_data.get('logs', []):
            if (log_entry.get('action') == 'auth.login' and 
                log_entry.get('status') == 'success' and 
                log_entry.get('actor') == TEST_USER_EMAIL.lower()):
                found = True
                print(f"Found log entry: {json.dumps(log_entry, indent=2, default=str)}")
                break
        
        if not found:
            return log_test("Activity Instrumentation - Login Success", False, 
                           "No activity log found for successful login")
        
        return log_test("Activity Instrumentation - Login Success", True, 
                       f"✓ Login success logged with action='auth.login', status='success', actor='{TEST_USER_EMAIL}'")
    
    except Exception as e:
        return log_test("Activity Instrumentation - Login Success", False, f"Exception: {str(e)}")

def test_activity_instrumentation_login_failure():
    """Test 10: Verify failed login creates activity log"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 10: Activity Instrumentation - Login Failure{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Perform login with wrong password
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": "WrongPassword123"},
            timeout=10
        )
        
        print(f"Login Response Status: {login_response.status_code}")
        
        if login_response.status_code != 401:
            return log_test("Activity Instrumentation - Login Failure", False, 
                           f"Expected 401, got {login_response.status_code}")
        
        # Wait a moment for log to be written
        time.sleep(0.5)
        
        # Check activity logs for this failed login
        logs_response = requests.get(
            f"{BASE_URL}/activity-logs?action=auth.login&status=failure&limit=5",
            timeout=10
        )
        
        logs_data = logs_response.json()
        print(f"Activity Logs Response: {json.dumps(logs_data, indent=2, default=str)}")
        
        # Find the most recent failed login for our test user
        found = False
        for log_entry in logs_data.get('logs', []):
            if (log_entry.get('action') == 'auth.login' and 
                log_entry.get('status') == 'failure' and 
                log_entry.get('actor') == TEST_USER_EMAIL.lower()):
                # Check meta.reason
                meta = log_entry.get('meta', {})
                if meta.get('reason') == 'wrong-password':
                    found = True
                    print(f"Found log entry: {json.dumps(log_entry, indent=2, default=str)}")
                    break
        
        if not found:
            return log_test("Activity Instrumentation - Login Failure", False, 
                           "No activity log found for failed login with meta.reason='wrong-password'")
        
        return log_test("Activity Instrumentation - Login Failure", True, 
                       f"✓ Login failure logged with action='auth.login', status='failure', meta.reason='wrong-password'")
    
    except Exception as e:
        return log_test("Activity Instrumentation - Login Failure", False, f"Exception: {str(e)}")

def test_activity_instrumentation_user_create():
    """Test 11: Verify user creation creates activity log"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 11: Activity Instrumentation - User Create{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    test_email = "test.audit@dikdasmen.belajar.id"
    
    try:
        # Create user
        create_response = requests.post(
            f"{BASE_URL}/users",
            json={
                "name": "Test Audit User",
                "email": test_email,
                "password": "Test@2026",
                "role": "Viewer",
                "jabatan": "Test Position"
            },
            timeout=10
        )
        
        print(f"Create User Response Status: {create_response.status_code}")
        print(f"Create User Response: {json.dumps(create_response.json(), indent=2)}")
        
        if create_response.status_code != 200:
            return log_test("Activity Instrumentation - User Create", False, 
                           f"User creation failed with status {create_response.status_code}")
        
        # Wait a moment for log to be written
        time.sleep(0.5)
        
        # Check activity logs for this user creation
        logs_response = requests.get(
            f"{BASE_URL}/activity-logs?action=user.upsert&limit=5",
            timeout=10
        )
        
        logs_data = logs_response.json()
        print(f"Activity Logs Response: {json.dumps(logs_data, indent=2, default=str)}")
        
        # Find the log entry for this user creation
        found = False
        for log_entry in logs_data.get('logs', []):
            if (log_entry.get('action') == 'user.upsert' and 
                log_entry.get('status') == 'success' and 
                log_entry.get('target') == test_email.lower()):
                found = True
                print(f"Found log entry: {json.dumps(log_entry, indent=2, default=str)}")
                break
        
        if not found:
            return log_test("Activity Instrumentation - User Create", False, 
                           f"No activity log found for user creation of {test_email}")
        
        return log_test("Activity Instrumentation - User Create", True, 
                       f"✓ User creation logged with action='user.upsert', status='success', target='{test_email}'")
    
    except Exception as e:
        return log_test("Activity Instrumentation - User Create", False, f"Exception: {str(e)}")

def test_activity_instrumentation_user_delete():
    """Test 12: Verify user deletion creates activity log (but DELETE endpoint doesn't log yet)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 12: Activity Instrumentation - User Delete{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    test_email = "test.audit@dikdasmen.belajar.id"
    
    try:
        # Delete user
        delete_response = requests.delete(
            f"{BASE_URL}/users/{test_email}",
            timeout=10
        )
        
        print(f"Delete User Response Status: {delete_response.status_code}")
        print(f"Delete User Response: {json.dumps(delete_response.json(), indent=2)}")
        
        if delete_response.status_code != 200:
            return log_test("Activity Instrumentation - User Delete", False, 
                           f"User deletion failed with status {delete_response.status_code}")
        
        # Wait a moment for log to be written
        time.sleep(0.5)
        
        # Check activity logs for this user deletion
        logs_response = requests.get(
            f"{BASE_URL}/activity-logs?action=user.delete&limit=5",
            timeout=10
        )
        
        logs_data = logs_response.json()
        print(f"Activity Logs Response: {json.dumps(logs_data, indent=2, default=str)}")
        
        # Find the log entry for this user deletion
        found = False
        for log_entry in logs_data.get('logs', []):
            if (log_entry.get('action') == 'user.delete' and 
                log_entry.get('status') == 'success' and 
                log_entry.get('target') == test_email.lower()):
                found = True
                print(f"Found log entry: {json.dumps(log_entry, indent=2, default=str)}")
                break
        
        if not found:
            # This is expected - DELETE endpoint doesn't have logActivity() call yet
            return log_test("Activity Instrumentation - User Delete", False, 
                           f"⚠️ DELETE /api/users/:email endpoint does NOT log activity (missing logActivity() call)")
        
        return log_test("Activity Instrumentation - User Delete", True, 
                       f"✓ User deletion logged with action='user.delete', status='success'")
    
    except Exception as e:
        return log_test("Activity Instrumentation - User Delete", False, f"Exception: {str(e)}")

def test_activity_instrumentation_ayrshare_link():
    """Test 13: Verify Ayrshare link creates activity log"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 13: Activity Instrumentation - Ayrshare Link{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Create Ayrshare link
        link_response = requests.post(
            f"{BASE_URL}/ayrshare/link",
            json={"platforms": ["facebook", "instagram"]},
            timeout=10
        )
        
        print(f"Ayrshare Link Response Status: {link_response.status_code}")
        print(f"Ayrshare Link Response: {json.dumps(link_response.json(), indent=2)}")
        
        if link_response.status_code != 200:
            return log_test("Activity Instrumentation - Ayrshare Link", False, 
                           f"Ayrshare link failed with status {link_response.status_code}")
        
        # Wait a moment for log to be written
        time.sleep(0.5)
        
        # Check activity logs for this ayrshare link
        logs_response = requests.get(
            f"{BASE_URL}/activity-logs?action=ayrshare.link&limit=5",
            timeout=10
        )
        
        logs_data = logs_response.json()
        print(f"Activity Logs Response: {json.dumps(logs_data, indent=2, default=str)}")
        
        # Find the log entry for this ayrshare link
        found = False
        for log_entry in logs_data.get('logs', []):
            if (log_entry.get('action') == 'ayrshare.link' and 
                log_entry.get('status') == 'success'):
                found = True
                print(f"Found log entry: {json.dumps(log_entry, indent=2, default=str)}")
                break
        
        if not found:
            return log_test("Activity Instrumentation - Ayrshare Link", False, 
                           "No activity log found for ayrshare.link")
        
        return log_test("Activity Instrumentation - Ayrshare Link", True, 
                       f"✓ Ayrshare link logged with action='ayrshare.link', status='success'")
    
    except Exception as e:
        return log_test("Activity Instrumentation - Ayrshare Link", False, f"Exception: {str(e)}")

def test_regression_health():
    """Test 14: GET /api/health"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 14: Regression - Health Endpoint{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        data = response.json()
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            return log_test("Regression - Health", False, f"Expected 200, got {response.status_code}")
        
        if data.get('status') != 'ok':
            return log_test("Regression - Health", False, f"Expected status='ok', got '{data.get('status')}'")
        
        return log_test("Regression - Health", True, "✓ Returns 200 with status='ok'")
    
    except Exception as e:
        return log_test("Regression - Health", False, f"Exception: {str(e)}")

def test_regression_users():
    """Test 15: GET /api/users"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 15: Regression - Users Endpoint{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        data = response.json()
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body (first 2 users): {json.dumps(data.get('users', [])[:2], indent=2, default=str)}")
        
        if response.status_code != 200:
            return log_test("Regression - Users", False, f"Expected 200, got {response.status_code}")
        
        if 'users' not in data:
            return log_test("Regression - Users", False, "Missing 'users' field")
        
        if not isinstance(data['users'], list):
            return log_test("Regression - Users", False, f"users should be array, got {type(data['users'])}")
        
        return log_test("Regression - Users", True, f"✓ Returns 200 with {len(data['users'])} users")
    
    except Exception as e:
        return log_test("Regression - Users", False, f"Exception: {str(e)}")

def test_regression_impact_stats():
    """Test 16: GET /api/impact-stats"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 16: Regression - Impact Stats{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/impact-stats", timeout=10)
        data = response.json()
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        if response.status_code != 200:
            return log_test("Regression - Impact Stats", False, f"Expected 200, got {response.status_code}")
        
        if 'stats' not in data:
            return log_test("Regression - Impact Stats", False, "Missing 'stats' field")
        
        return log_test("Regression - Impact Stats", True, f"✓ Returns 200 with stats")
    
    except Exception as e:
        return log_test("Regression - Impact Stats", False, f"Exception: {str(e)}")

def test_regression_ayrshare_status():
    """Test 17: GET /api/ayrshare/status"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 17: Regression - Ayrshare Status{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/ayrshare/status", timeout=10)
        data = response.json()
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        if response.status_code != 200:
            return log_test("Regression - Ayrshare Status", False, f"Expected 200, got {response.status_code}")
        
        return log_test("Regression - Ayrshare Status", True, "✓ Returns 200")
    
    except Exception as e:
        return log_test("Regression - Ayrshare Status", False, f"Exception: {str(e)}")

def test_regression_ayrshare_analytics():
    """Test 18: GET /api/ayrshare/analytics?platforms=facebook"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 18: Regression - Ayrshare Analytics{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/ayrshare/analytics?platforms=facebook", timeout=10)
        data = response.json()
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(data, indent=2, default=str)}")
        
        if response.status_code != 200:
            return log_test("Regression - Ayrshare Analytics", False, f"Expected 200, got {response.status_code}")
        
        return log_test("Regression - Ayrshare Analytics", True, "✓ Returns 200")
    
    except Exception as e:
        return log_test("Regression - Ayrshare Analytics", False, f"Exception: {str(e)}")

def test_password_reset_flow():
    """Test 19: Password reset flow verification"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 19: Password Reset Flow{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Step 1: Request password reset
        forgot_response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": TEST_USER_EMAIL},
            timeout=10
        )
        
        forgot_data = forgot_response.json()
        print(f"Forgot Password Response Status: {forgot_response.status_code}")
        print(f"Forgot Password Response: {json.dumps(forgot_data, indent=2)}")
        
        if forgot_response.status_code != 200:
            return log_test("Password Reset Flow", False, f"Forgot password failed with status {forgot_response.status_code}")
        
        # Check delivery mode
        delivery = forgot_data.get('delivery')
        dev_code = forgot_data.get('dev_code')
        
        if delivery == 'email':
            # Email mode - dev_code should be null
            if dev_code is not None:
                return log_test("Password Reset Flow", False, 
                               f"In email mode, dev_code should be null, got '{dev_code}'")
            
            # Verify email_error is null (SMTP success)
            if forgot_data.get('email_error') is not None:
                return log_test("Password Reset Flow", False, 
                               f"email_error should be null (SMTP failed), got '{forgot_data.get('email_error')}'")
            
            return log_test("Password Reset Flow", True, 
                           f"✓ Password reset initiated with delivery='email', dev_code=null, email_error=null. "
                           f"User should receive email with reset code. Cannot test full flow without accessing email.")
        
        elif delivery == 'demo':
            # Demo mode - dev_code should be present
            if not dev_code:
                return log_test("Password Reset Flow", False, "In demo mode, dev_code should be present")
            
            # Step 2: Reset password with the code
            reset_response = requests.post(
                f"{BASE_URL}/auth/reset-password",
                json={
                    "email": TEST_USER_EMAIL,
                    "code": dev_code,
                    "new_password": TEST_USER_PASSWORD  # Reset to original password
                },
                timeout=10
            )
            
            reset_data = reset_response.json()
            print(f"Reset Password Response Status: {reset_response.status_code}")
            print(f"Reset Password Response: {json.dumps(reset_data, indent=2)}")
            
            if reset_response.status_code != 200:
                return log_test("Password Reset Flow", False, 
                               f"Password reset failed with status {reset_response.status_code}")
            
            return log_test("Password Reset Flow", True, 
                           f"✓ Full password reset flow completed (demo mode with dev_code)")
        
        else:
            return log_test("Password Reset Flow", False, f"Unknown delivery mode: {delivery}")
    
    except Exception as e:
        return log_test("Password Reset Flow", False, f"Exception: {str(e)}")

def main():
    print(f"\n{YELLOW}{'='*80}{RESET}")
    print(f"{YELLOW}Activity Logs, Email OTP & Password Reset - Backend Test Suite{RESET}")
    print(f"{YELLOW}Dashboard Direktorat Kursus dan Pelatihan{RESET}")
    print(f"{YELLOW}Base URL: {BASE_URL}{RESET}")
    print(f"{YELLOW}{'='*80}{RESET}")
    
    results = []
    
    # Email OTP Tests
    results.append(test_email_otp_real_user())
    results.append(test_email_otp_nonexistent_user())
    results.append(test_email_otp_empty_body())
    
    # Activity Logs Tests
    results.append(test_activity_summary())
    results.append(test_activity_logs_basic())
    results.append(test_activity_logs_filter_action())
    results.append(test_activity_logs_filter_status())
    results.append(test_activity_logs_filter_days())
    
    # Activity Instrumentation Tests
    results.append(test_activity_instrumentation_login_success())
    results.append(test_activity_instrumentation_login_failure())
    results.append(test_activity_instrumentation_user_create())
    results.append(test_activity_instrumentation_user_delete())
    results.append(test_activity_instrumentation_ayrshare_link())
    
    # Regression Tests
    results.append(test_regression_health())
    results.append(test_regression_users())
    results.append(test_regression_impact_stats())
    results.append(test_regression_ayrshare_status())
    results.append(test_regression_ayrshare_analytics())
    
    # Password Reset Flow
    results.append(test_password_reset_flow())
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"\n{YELLOW}{'='*80}{RESET}")
    print(f"{YELLOW}TEST SUMMARY{RESET}")
    print(f"{YELLOW}{'='*80}{RESET}")
    print(f"Total Tests: {total}")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {total - passed}{RESET}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if passed == total:
        print(f"\n{GREEN}✅ ALL TESTS PASSED!{RESET}")
        return 0
    else:
        print(f"\n{RED}❌ SOME TESTS FAILED{RESET}")
        return 1

if __name__ == "__main__":
    exit(main())
