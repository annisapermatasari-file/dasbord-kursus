#!/usr/bin/env python3
"""
Weekly Digest Email Endpoints Testing Suite
Tests all 8 scenarios from the review request
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/api"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_1_get_status_initial():
    """Test 1: GET /api/digest/weekly/status - Initial state with defaults"""
    log("=" * 80)
    log("TEST 1: GET /api/digest/weekly/status (initial state)")
    try:
        r = requests.get(f"{BASE_URL}/digest/weekly/status", timeout=10)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        log(f"Response: {json.dumps(data, indent=2)}")
        
        # Check required fields
        required_fields = ['enabled', 'hour_wib', 'recipients_mode', 'custom_recipients', 
                          'last_sent_at', 'last_sent_recipients', 'last_sent_success', 'last_sent_total']
        for field in required_fields:
            if field not in data:
                log(f"❌ FAILED: Missing field '{field}'")
                return False
        
        # Check default values
        if data['enabled'] != True:
            log(f"❌ FAILED: Expected enabled=true, got {data['enabled']}")
            return False
        
        if data['hour_wib'] != 8:
            log(f"❌ FAILED: Expected hour_wib=8, got {data['hour_wib']}")
            return False
        
        if data['recipients_mode'] != 'admins':
            log(f"❌ FAILED: Expected recipients_mode='admins', got {data['recipients_mode']}")
            return False
        
        log("✅ PASSED: All required fields present with correct default values")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_2_preview_default():
    """Test 2: POST /api/digest/weekly/preview with empty body"""
    log("=" * 80)
    log("TEST 2: POST /api/digest/weekly/preview with body {}")
    try:
        r = requests.post(f"{BASE_URL}/digest/weekly/preview", json={}, timeout=15)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        log(f"Response keys: {list(data.keys())}")
        
        # Check required fields
        if not data.get('ok'):
            log(f"❌ FAILED: Expected ok=true, got {data.get('ok')}")
            return False
        
        if not data.get('preview'):
            log(f"❌ FAILED: Expected preview=true, got {data.get('preview')}")
            return False
        
        # Check subject
        subject = data.get('subject', '')
        if not subject.startswith('📊 Ringkasan Mingguan Media Sosial'):
            log(f"❌ FAILED: Subject should start with '📊 Ringkasan Mingguan Media Sosial', got: {subject}")
            return False
        log(f"✅ Subject: {subject}")
        
        # Check html length
        html = data.get('html', '')
        if len(html) < 5000:
            log(f"❌ FAILED: HTML should be > 5000 chars, got {len(html)} chars")
            return False
        log(f"✅ HTML length: {len(html)} chars")
        
        # Check recipients is array
        recipients = data.get('recipients', [])
        if not isinstance(recipients, list):
            log(f"❌ FAILED: recipients should be array, got {type(recipients)}")
            return False
        log(f"✅ Recipients (Admin emails): {recipients}")
        
        # Check data.platforms
        platforms = data.get('data', {}).get('platforms', [])
        if len(platforms) != 4:
            log(f"❌ FAILED: Expected 4 platforms, got {len(platforms)}")
            return False
        
        platform_keys = [p.get('key') for p in platforms]
        expected_platforms = ['instagram', 'facebook', 'youtube', 'tiktok']
        if platform_keys != expected_platforms:
            log(f"❌ FAILED: Expected platforms {expected_platforms}, got {platform_keys}")
            return False
        log(f"✅ Platforms: {platform_keys}")
        
        # Check data.activity
        activity = data.get('data', {}).get('activity', {})
        required_activity_fields = ['total7d', 'publishSuccess', 'loginFails', 'topActions']
        for field in required_activity_fields:
            if field not in activity:
                log(f"❌ FAILED: Missing activity field '{field}'")
                return False
        log(f"✅ Activity: total7d={activity['total7d']}, publishSuccess={activity['publishSuccess']}, loginFails={activity['loginFails']}, topActions count={len(activity['topActions'])}")
        
        # Verify NO email sent (preview mode)
        log("✅ Preview mode - NO email sent (as expected)")
        
        log("✅ PASSED: All preview checks passed")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_3_preview_custom_recipients():
    """Test 3: POST /api/digest/weekly/preview with custom recipients"""
    log("=" * 80)
    log("TEST 3: POST /api/digest/weekly/preview with custom recipients")
    try:
        custom_recipients = ["custom@test.com"]
        r = requests.post(f"{BASE_URL}/digest/weekly/preview", json={"recipients": custom_recipients}, timeout=15)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        
        # Check recipients match
        recipients = data.get('recipients', [])
        if recipients != custom_recipients:
            log(f"❌ FAILED: Expected recipients {custom_recipients}, got {recipients}")
            return False
        log(f"✅ Recipients: {recipients}")
        
        # Verify NO email sent (preview mode)
        log("✅ Preview mode - NO email sent (as expected)")
        
        log("✅ PASSED: Custom recipients preview working")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_4_send_real_email():
    """Test 4: POST /api/digest/weekly/send with real email"""
    log("=" * 80)
    log("TEST 4: POST /api/digest/weekly/send with real email")
    try:
        test_email = "ditbinsuslat@gmail.com"
        r = requests.post(f"{BASE_URL}/digest/weekly/send", json={"recipients": [test_email]}, timeout=20)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            log(f"Response: {r.text}")
            return False
        
        data = r.json()
        log(f"Response: {json.dumps(data, indent=2)}")
        
        # Check ok=true
        if not data.get('ok'):
            log(f"❌ FAILED: Expected ok=true, got {data.get('ok')}")
            log(f"Error: {data.get('error')}")
            return False
        
        # Check sent_at
        if not data.get('sent_at'):
            log(f"❌ FAILED: Missing sent_at field")
            return False
        log(f"✅ Sent at: {data['sent_at']}")
        
        # Check recipients
        recipients = data.get('recipients', [])
        if recipients != [test_email]:
            log(f"❌ FAILED: Expected recipients [{test_email}], got {recipients}")
            return False
        log(f"✅ Recipients: {recipients}")
        
        # Check results
        results = data.get('results', [])
        if len(results) != 1:
            log(f"❌ FAILED: Expected 1 result, got {len(results)}")
            return False
        
        result = results[0]
        if result.get('to') != test_email:
            log(f"❌ FAILED: Expected result.to={test_email}, got {result.get('to')}")
            return False
        
        if not result.get('ok'):
            log(f"❌ FAILED: Email send failed: {result.get('error')}")
            return False
        log(f"✅ Email sent successfully to {result['to']}")
        
        # Check subject
        subject = data.get('subject', '')
        if not subject:
            log(f"❌ FAILED: Missing subject field")
            return False
        log(f"✅ Subject: {subject}")
        
        log("✅ PASSED: Real email sent successfully via SMTP")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_5_verify_last_sent():
    """Test 5: Verify GET /api/digest/weekly/status shows last_sent_at updated"""
    log("=" * 80)
    log("TEST 5: Verify last_sent_at updated in status")
    try:
        r = requests.get(f"{BASE_URL}/digest/weekly/status", timeout=10)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        
        # Check last_sent_at is not null
        if not data.get('last_sent_at'):
            log(f"❌ FAILED: last_sent_at should be updated after send, got {data.get('last_sent_at')}")
            return False
        log(f"✅ last_sent_at: {data['last_sent_at']}")
        
        # Check last_sent_recipients contains test email
        last_recipients = data.get('last_sent_recipients', [])
        if 'ditbinsuslat@gmail.com' not in last_recipients:
            log(f"❌ FAILED: last_sent_recipients should contain ditbinsuslat@gmail.com, got {last_recipients}")
            return False
        log(f"✅ last_sent_recipients: {last_recipients}")
        
        # Check last_sent_success
        if data.get('last_sent_success') != 1:
            log(f"❌ FAILED: Expected last_sent_success=1, got {data.get('last_sent_success')}")
            return False
        log(f"✅ last_sent_success: {data['last_sent_success']}")
        
        # Check last_sent_total
        if data.get('last_sent_total') != 1:
            log(f"❌ FAILED: Expected last_sent_total=1, got {data.get('last_sent_total')}")
            return False
        log(f"✅ last_sent_total: {data['last_sent_total']}")
        
        log("✅ PASSED: Status correctly updated after send")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_6_settings_update_with_validation():
    """Test 6: POST /api/digest/weekly/settings with invalid emails filtered"""
    log("=" * 80)
    log("TEST 6: POST /api/digest/weekly/settings with email validation")
    try:
        settings = {
            "enabled": False,
            "hour_wib": 9,
            "recipients_mode": "custom",
            "custom_recipients": ["test1@example.com", "test2@example.com", "bad-not-email", ""]
        }
        r = requests.post(f"{BASE_URL}/digest/weekly/settings", json=settings, timeout=10)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            log(f"Response: {r.text}")
            return False
        
        data = r.json()
        log(f"Response: {json.dumps(data, indent=2)}")
        
        # Check ok=true
        if not data.get('ok'):
            log(f"❌ FAILED: Expected ok=true, got {data.get('ok')}")
            return False
        
        state = data.get('state', {})
        
        # Check enabled=false
        if state.get('enabled') != False:
            log(f"❌ FAILED: Expected enabled=false, got {state.get('enabled')}")
            return False
        log(f"✅ enabled: {state['enabled']}")
        
        # Check hour_wib=9
        if state.get('hour_wib') != 9:
            log(f"❌ FAILED: Expected hour_wib=9, got {state.get('hour_wib')}")
            return False
        log(f"✅ hour_wib: {state['hour_wib']}")
        
        # Check recipients_mode=custom
        if state.get('recipients_mode') != 'custom':
            log(f"❌ FAILED: Expected recipients_mode='custom', got {state.get('recipients_mode')}")
            return False
        log(f"✅ recipients_mode: {state['recipients_mode']}")
        
        # Check custom_recipients - invalid emails should be filtered out
        custom_recipients = state.get('custom_recipients', [])
        expected_recipients = ["test1@example.com", "test2@example.com"]
        if custom_recipients != expected_recipients:
            log(f"❌ FAILED: Expected custom_recipients {expected_recipients}, got {custom_recipients}")
            log(f"Invalid emails should be filtered out (no @ or empty)")
            return False
        log(f"✅ custom_recipients: {custom_recipients} (invalid emails filtered)")
        
        log("✅ PASSED: Settings updated with email validation working")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_7_settings_restore_defaults():
    """Test 7: POST /api/digest/weekly/settings to restore defaults"""
    log("=" * 80)
    log("TEST 7: POST /api/digest/weekly/settings - restore defaults")
    try:
        settings = {
            "enabled": True,
            "hour_wib": 8,
            "recipients_mode": "admins",
            "custom_recipients": []
        }
        r = requests.post(f"{BASE_URL}/digest/weekly/settings", json=settings, timeout=10)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        state = data.get('state', {})
        
        # Verify defaults restored
        if state.get('enabled') != True:
            log(f"❌ FAILED: Expected enabled=true, got {state.get('enabled')}")
            return False
        
        if state.get('hour_wib') != 8:
            log(f"❌ FAILED: Expected hour_wib=8, got {state.get('hour_wib')}")
            return False
        
        if state.get('recipients_mode') != 'admins':
            log(f"❌ FAILED: Expected recipients_mode='admins', got {state.get('recipients_mode')}")
            return False
        
        if state.get('custom_recipients') != []:
            log(f"❌ FAILED: Expected custom_recipients=[], got {state.get('custom_recipients')}")
            return False
        
        log(f"✅ Settings restored to defaults: enabled=true, hour_wib=8, recipients_mode='admins', custom_recipients=[]")
        log("✅ PASSED: Default settings restored")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_8_activity_logs_verification():
    """Test 8: Verify activity logs contain digest entries"""
    log("=" * 80)
    log("TEST 8: Activity log verification")
    try:
        r = requests.get(f"{BASE_URL}/activity-logs?limit=20", timeout=10)
        log(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            log(f"❌ FAILED: Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        logs = data.get('logs', [])
        
        # Find digest.weekly.send entries
        send_logs = [l for l in logs if l.get('action') == 'digest.weekly.send']
        if not send_logs:
            log(f"❌ FAILED: No 'digest.weekly.send' entries found in activity logs")
            return False
        
        # Check for success status
        success_logs = [l for l in send_logs if l.get('status') == 'success']
        if not success_logs:
            log(f"❌ FAILED: No successful 'digest.weekly.send' entries found")
            return False
        log(f"✅ Found {len(success_logs)} successful digest.weekly.send entries")
        
        # Find digest.settings.update entries
        settings_logs = [l for l in logs if l.get('action') == 'digest.settings.update']
        if not settings_logs:
            log(f"❌ FAILED: No 'digest.settings.update' entries found in activity logs")
            return False
        
        # Check for success status
        settings_success = [l for l in settings_logs if l.get('status') == 'success']
        if not settings_success:
            log(f"❌ FAILED: No successful 'digest.settings.update' entries found")
            return False
        log(f"✅ Found {len(settings_success)} successful digest.settings.update entries")
        
        log("✅ PASSED: Activity logs correctly recorded digest actions")
        return True
    except Exception as e:
        log(f"❌ FAILED: Exception - {str(e)}")
        return False

def test_9_regression_checks():
    """Test 9: Regression checks - existing endpoints still work"""
    log("=" * 80)
    log("TEST 9: Regression checks")
    
    tests = [
        ("GET /api/health", f"{BASE_URL}/health", "GET"),
        ("GET /api/ayrshare/status", f"{BASE_URL}/ayrshare/status", "GET"),
        ("POST /api/auth/login", f"{BASE_URL}/auth/login", "POST", {"email": "annisa.permatasari@dikdasmen.belajar.id", "password": "Admin@2026"}),
        ("GET /api/activity-summary", f"{BASE_URL}/activity-summary", "GET"),
    ]
    
    all_passed = True
    for test_name, url, method, *args in tests:
        try:
            body = args[0] if args else None
            if method == "GET":
                r = requests.get(url, timeout=10)
            else:
                r = requests.post(url, json=body, timeout=10)
            
            if r.status_code == 200:
                log(f"✅ {test_name} → 200")
            else:
                log(f"❌ {test_name} → {r.status_code}")
                all_passed = False
        except Exception as e:
            log(f"❌ {test_name} → Exception: {str(e)}")
            all_passed = False
    
    if all_passed:
        log("✅ PASSED: All regression checks passed")
    else:
        log("❌ FAILED: Some regression checks failed")
    
    return all_passed

def main():
    log("=" * 80)
    log("WEEKLY DIGEST EMAIL ENDPOINTS TESTING SUITE")
    log("=" * 80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Test 1: GET status (initial)", test_1_get_status_initial()))
    results.append(("Test 2: Preview default", test_2_preview_default()))
    results.append(("Test 3: Preview custom recipients", test_3_preview_custom_recipients()))
    results.append(("Test 4: Send real email", test_4_send_real_email()))
    results.append(("Test 5: Verify last_sent updated", test_5_verify_last_sent()))
    results.append(("Test 6: Settings with validation", test_6_settings_update_with_validation()))
    results.append(("Test 7: Restore defaults", test_7_settings_restore_defaults()))
    results.append(("Test 8: Activity logs", test_8_activity_logs_verification()))
    results.append(("Test 9: Regression checks", test_9_regression_checks()))
    
    # Summary
    log("=" * 80)
    log("TEST SUMMARY")
    log("=" * 80)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        log(f"{status}: {name}")
    
    log("=" * 80)
    log(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    log("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
