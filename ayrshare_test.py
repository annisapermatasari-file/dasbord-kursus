#!/usr/bin/env python3
"""
Ayrshare Integration Backend Test Suite
Tests all Ayrshare endpoints according to the review request specifications
"""

import requests
import json
import sys
import os

# Get base URL from environment or use default
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

print(f"Testing against: {API_BASE}\n")
print("=" * 80)

# Track test results
tests_passed = 0
tests_failed = 0
test_results = []

def test(name, fn):
    """Execute a test and track results"""
    global tests_passed, tests_failed
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)
    try:
        fn()
        tests_passed += 1
        test_results.append(f"✅ {name}")
        print(f"✅ PASSED: {name}")
    except AssertionError as e:
        tests_failed += 1
        test_results.append(f"❌ {name}: {str(e)}")
        print(f"❌ FAILED: {name}")
        print(f"   Error: {str(e)}")
    except Exception as e:
        tests_failed += 1
        test_results.append(f"❌ {name}: {str(e)}")
        print(f"❌ ERROR: {name}")
        print(f"   Exception: {str(e)}")

# Store state across tests
state = {}

# ============================================================================
# TEST 1: GET /api/ayrshare/status (BEFORE any link)
# ============================================================================
def test_1_status_before_link():
    """Test status endpoint before any profile is created"""
    r = requests.get(f"{API_BASE}/ayrshare/status")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert 'configured' in data, "Response missing 'configured' field"
    assert data['configured'] == True, "Expected configured=true (env creds are set)"
    print(f"✓ configured: {data['configured']}")
    
    # hasProfile may be true or false depending on prior state
    if 'hasProfile' in data:
        print(f"✓ hasProfile: {data['hasProfile']} (either value is acceptable at this stage)")
        state['initial_hasProfile'] = data['hasProfile']

test(
    "1. GET /api/ayrshare/status (BEFORE any link)",
    test_1_status_before_link
)

# ============================================================================
# TEST 2: DELETE /api/ayrshare/profile (cleanup)
# ============================================================================
def test_2_delete_profile():
    """Delete any existing profile to test full flow"""
    r = requests.delete(f"{API_BASE}/ayrshare/profile")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert 'ok' in data, "Response missing 'ok' field"
    assert data['ok'] == True, "Expected ok=true"
    print(f"✓ Profile deleted successfully")

test(
    "2. DELETE /api/ayrshare/profile (cleanup)",
    test_2_delete_profile
)

# ============================================================================
# TEST 3: GET /api/ayrshare/status (AFTER delete)
# ============================================================================
def test_3_status_after_delete():
    """Test status endpoint after profile deletion"""
    r = requests.get(f"{API_BASE}/ayrshare/status")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data['configured'] == True, "Expected configured=true"
    assert data['hasProfile'] == False, "Expected hasProfile=false after deletion"
    print(f"✓ configured: {data['configured']}")
    print(f"✓ hasProfile: {data['hasProfile']}")

test(
    "3. GET /api/ayrshare/status (AFTER delete)",
    test_3_status_after_delete
)

# ============================================================================
# TEST 4: POST /api/ayrshare/link (create profile and get JWT URL)
# ============================================================================
def test_4_create_link():
    """Create profile and generate JWT link URL"""
    payload = {"platforms": ["facebook", "instagram", "youtube", "tiktok"]}
    r = requests.post(f"{API_BASE}/ayrshare/link", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:800]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    
    # Check required fields
    assert 'ok' in data, "Response missing 'ok' field"
    assert data['ok'] == True, "Expected ok=true"
    
    assert 'url' in data, "Response missing 'url' field"
    assert 'title' in data, "Response missing 'title' field"
    
    # Validate URL format
    url = data['url']
    assert url.startswith('https://profile.ayrshare.com?jwt='), \
        f"URL must start with 'https://profile.ayrshare.com?jwt=', got: {url[:100]}"
    
    # Check for domain parameter
    assert 'domain=id-7WZsr' in url, \
        f"URL should contain 'domain=id-7WZsr' query parameter, got: {url}"
    
    # Validate title
    title = data['title']
    assert len(title) > 0, "Title should be non-empty"
    assert 'Direktorat' in title or 'Kursus' in title or 'Pelatihan' in title, \
        f"Title should contain expected keywords, got: {title}"
    
    # MUST NOT leak profileKey
    assert 'profileKey' not in data or data['profileKey'] is None, \
        "Response MUST NOT leak profileKey"
    
    print(f"✓ ok: {data['ok']}")
    print(f"✓ url: {url[:80]}...")
    print(f"✓ title: {title}")
    print(f"✓ profileKey not leaked")
    
    # Store for later tests
    state['link_url'] = url
    state['profile_title'] = title

test(
    "4. POST /api/ayrshare/link (create profile and get JWT URL)",
    test_4_create_link
)

# ============================================================================
# TEST 5: GET /api/ayrshare/status (AFTER link)
# ============================================================================
def test_5_status_after_link():
    """Test status endpoint after profile creation"""
    r = requests.get(f"{API_BASE}/ayrshare/status")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:800]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    
    assert data['hasProfile'] == True, "Expected hasProfile=true after link creation"
    
    assert 'profile' in data, "Response missing 'profile' field"
    profile = data['profile']
    
    assert 'title' in profile, "Profile missing 'title' field"
    assert len(profile['title']) > 0, "Profile title should be non-empty"
    
    assert 'refId' in profile, "Profile missing 'refId' field"
    assert len(profile['refId']) > 0, "Profile refId should be non-empty (Ayrshare-assigned reference id)"
    
    assert 'activeSocialAccounts' in data, "Response missing 'activeSocialAccounts' field"
    assert isinstance(data['activeSocialAccounts'], list), "activeSocialAccounts should be an array"
    
    print(f"✓ hasProfile: {data['hasProfile']}")
    print(f"✓ profile.title: {profile['title']}")
    print(f"✓ profile.refId: {profile['refId']}")
    print(f"✓ activeSocialAccounts: {data['activeSocialAccounts']} (likely empty since no user completed JWT flow)")
    
    # Store refId for idempotent test
    state['profile_refId'] = profile['refId']

test(
    "5. GET /api/ayrshare/status (AFTER link)",
    test_5_status_after_link
)

# ============================================================================
# TEST 6: GET /api/ayrshare/refresh
# ============================================================================
def test_6_refresh():
    """Test refresh endpoint to sync latest user info from Ayrshare"""
    r = requests.get(f"{API_BASE}/ayrshare/refresh")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:800]}")
    
    # Expect 200 with user data OR at minimum 200/502 status
    # Treat non-2xx as failure only if profile is expected to exist
    assert r.status_code in [200, 502], \
        f"Expected 200 or 502, got {r.status_code}"
    
    if r.status_code == 200:
        data = r.json()
        assert 'ok' in data or 'user' in data, \
            "Response should contain 'ok' or 'user' field"
        print(f"✓ Refresh successful: {data}")
    else:
        print(f"✓ Refresh returned 502 (acceptable if Ayrshare API has issues)")

test(
    "6. GET /api/ayrshare/refresh",
    test_6_refresh
)

# ============================================================================
# TEST 7: GET /api/ayrshare/analytics?platforms=facebook,instagram
# ============================================================================
def test_7_analytics():
    """Test analytics endpoint with specific platforms"""
    r = requests.get(f"{API_BASE}/ayrshare/analytics?platforms=facebook,instagram")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:800]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    
    # Endpoint always returns 200 with connected:true
    assert 'connected' in data, "Response missing 'connected' field"
    assert data['connected'] == True, "Expected connected=true"
    
    # Should contain platforms array
    assert 'platforms' in data, "Response missing 'platforms' field"
    
    print(f"✓ connected: {data['connected']}")
    print(f"✓ platforms: {data.get('platforms', [])}")
    
    # Error field may be present per-platform since no accounts linked
    if 'error' in data:
        print(f"✓ error field present (expected since no accounts linked): {data['error']}")

test(
    "7. GET /api/ayrshare/analytics?platforms=facebook,instagram",
    test_7_analytics
)

# ============================================================================
# TEST 8: POST /api/ayrshare/link again (idempotent test)
# ============================================================================
def test_8_link_idempotent():
    """Test that link endpoint is idempotent - reuses existing profile"""
    payload = {"platforms": ["facebook", "instagram", "youtube", "tiktok"]}
    r = requests.post(f"{API_BASE}/ayrshare/link", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:800]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    
    assert data['ok'] == True, "Expected ok=true"
    assert 'url' in data, "Response missing 'url' field"
    
    # JWT is short-lived, always new
    new_url = data['url']
    assert new_url.startswith('https://profile.ayrshare.com?jwt='), \
        f"URL must start with 'https://profile.ayrshare.com?jwt='"
    
    # URL should be different from first call (new JWT)
    if 'link_url' in state:
        assert new_url != state['link_url'], \
            "JWT URL should be different (JWT is short-lived)"
        print(f"✓ New JWT URL generated (different from first call)")
    
    print(f"✓ url: {new_url[:80]}...")
    
    # Now verify profile was NOT re-created by checking refId
    r_status = requests.get(f"{API_BASE}/ayrshare/status")
    assert r_status.status_code == 200, "Status check failed"
    status_data = r_status.json()
    
    current_refId = status_data['profile']['refId']
    assert current_refId == state['profile_refId'], \
        f"Profile should NOT be re-created (refId should match). Expected: {state['profile_refId']}, Got: {current_refId}"
    
    print(f"✓ Profile NOT re-created (refId matches: {current_refId})")

test(
    "8. POST /api/ayrshare/link again (idempotent test)",
    test_8_link_idempotent
)

# ============================================================================
# TEST 9: Regression - GET /api/health
# ============================================================================
def test_9_regression_health():
    """Regression test: health endpoint"""
    r = requests.get(f"{API_BASE}/health")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data['status'] == 'ok', f"Expected status='ok', got {data.get('status')}"
    print(f"✓ Health check passed")

test(
    "9. Regression - GET /api/health",
    test_9_regression_health
)

# ============================================================================
# TEST 10: Regression - GET /api/users
# ============================================================================
def test_10_regression_users():
    """Regression test: users endpoint"""
    r = requests.get(f"{API_BASE}/users")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert 'users' in data, "Response missing 'users' field"
    assert isinstance(data['users'], list), "users should be an array"
    print(f"✓ Users endpoint working, returned {len(data['users'])} users")

test(
    "10. Regression - GET /api/users",
    test_10_regression_users
)

# ============================================================================
# TEST 11: Regression - POST /api/auth/login
# ============================================================================
def test_11_regression_login():
    """Regression test: login endpoint"""
    payload = {
        "email": "annisa.permatasari@dikdasmen.belajar.id",
        "password": "Admin@2026"
    }
    r = requests.post(f"{API_BASE}/auth/login", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert 'user' in data, "Response missing 'user' field"
    
    user = data['user']
    assert 'password' not in user, "User object should NOT contain password field"
    assert user['role'] == 'Admin', f"Expected role='Admin', got {user.get('role')}"
    
    print(f"✓ Login successful for {user['email']}, role={user['role']}")

test(
    "11. Regression - POST /api/auth/login",
    test_11_regression_login
)

# ============================================================================
# TEST 12: Regression - GET /api/impact-stats
# ============================================================================
def test_12_regression_impact_stats():
    """Regression test: impact-stats endpoint"""
    r = requests.get(f"{API_BASE}/impact-stats")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert 'stats' in data, "Response missing 'stats' field"
    assert isinstance(data['stats'], list), "stats should be an array"
    print(f"✓ Impact stats endpoint working, returned {len(data['stats'])} stats")

test(
    "12. Regression - GET /api/impact-stats",
    test_12_regression_impact_stats
)

# ============================================================================
# TEST 13: Regression - GET /api/oauth/meta/start
# ============================================================================
def test_13_regression_oauth_meta():
    """Regression test: Meta OAuth start endpoint"""
    r = requests.get(f"{API_BASE}/oauth/meta/start", allow_redirects=False)
    print(f"Status: {r.status_code}")
    print(f"Location: {r.headers.get('Location', 'N/A')[:200]}")
    
    assert r.status_code == 307, f"Expected 307 redirect, got {r.status_code}"
    location = r.headers.get('Location', '')
    assert 'facebook.com' in location, \
        f"Expected redirect to facebook.com, got: {location[:200]}"
    print(f"✓ Meta OAuth start redirects to facebook.com")

test(
    "13. Regression - GET /api/oauth/meta/start",
    test_13_regression_oauth_meta
)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
for result in test_results:
    print(result)

print("\n" + "=" * 80)
print(f"Total: {tests_passed + tests_failed} tests")
print(f"✅ Passed: {tests_passed}")
print(f"❌ Failed: {tests_failed}")
print("=" * 80)

if tests_failed > 0:
    sys.exit(1)
else:
    print("\n🎉 ALL TESTS PASSED!")
    sys.exit(0)
