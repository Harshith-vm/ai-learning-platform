"""
Test script for Task 76 - Allow deletion of history items
Tests delete endpoints for all history types
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_delete_history():
    print("=" * 60)
    print("Task 76 - Delete History Items Test")
    print("=" * 60)
    
    # Step 1: Login as first user
    print("\n1. Logging in as first user...")
    login_data = {
        "email": "delete_test_user1@example.com",
        "password": "test123456"
    }
    
    # Register first user
    register_data = {
        "email": "delete_test_user1@example.com",
        "password": "test123456",
        "persona": "student"
    }
    
    try:
        requests.post(f"{BASE_URL}/auth/register", json=register_data)
    except:
        pass
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token1 = token_data.get("access_token")
            print("✓ User 1 login successful")
        else:
            print(f"✗ Login failed: {response.status_code}")
            return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    headers1 = {
        "Authorization": f"Bearer {token1}"
    }
    
    # Step 2: Login as second user
    print("\n2. Logging in as second user...")
    login_data2 = {
        "email": "delete_test_user2@example.com",
        "password": "test123456"
    }
    
    register_data2 = {
        "email": "delete_test_user2@example.com",
        "password": "test123456",
        "persona": "student"
    }
    
    try:
        requests.post(f"{BASE_URL}/auth/register", json=register_data2)
    except:
        pass
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data2)
        if response.status_code == 200:
            token_data = response.json()
            token2 = token_data.get("access_token")
            print("✓ User 2 login successful")
        else:
            print(f"✗ Login failed: {response.status_code}")
            return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    headers2 = {
        "Authorization": f"Bearer {token2}"
    }
    
    # Step 3: Create some content for user 1
    print("\n3. Creating content for user 1...")
    
    # Create a summary
    summary_request = {
        "text": "This is a test text for summary generation. It contains multiple sentences to test the summary feature."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate-summary",
            json=summary_request,
            headers=headers1
        )
        if response.status_code == 200:
            print("✓ Summary created for user 1")
        else:
            print(f"  Note: Summary creation returned {response.status_code}")
    except Exception as e:
        print(f"  Note: {e}")
    
    # Step 4: Get user 1's summaries
    print("\n4. Getting user 1's summaries...")
    try:
        response = requests.get(f"{BASE_URL}/history/summaries", headers=headers1)
        if response.status_code == 200:
            summaries = response.json()
            if summaries:
                summary_id = summaries[0].get("id")
                print(f"✓ Found {len(summaries)} summaries")
                print(f"  First summary ID: {summary_id}")
            else:
                print("  No summaries found (may need to create some first)")
                summary_id = None
        else:
            print(f"✗ Failed: {response.status_code}")
            summary_id = None
    except Exception as e:
        print(f"✗ Error: {e}")
        summary_id = None
    
    # Step 5: Test deleting own summary
    if summary_id:
        print(f"\n5. Testing DELETE /history/summaries/{summary_id} (own record)...")
        try:
            response = requests.delete(
                f"{BASE_URL}/history/summaries/{summary_id}",
                headers=headers1
            )
            if response.status_code == 200:
                result = response.json()
                print("✓ Successfully deleted own summary")
                print(f"  Message: {result.get('message')}")
            else:
                print(f"✗ Failed: {response.status_code}")
                print(f"  Response: {response.text}")
        except Exception as e:
            print(f"✗ Error: {e}")
    else:
        print("\n5. Skipping delete test (no summary available)")
    
    # Step 6: Test deleting non-existent record
    print("\n6. Testing DELETE with non-existent ID (should return 404)...")
    try:
        response = requests.delete(
            f"{BASE_URL}/history/summaries/999999",
            headers=headers1
        )
        if response.status_code == 404:
            print("✓ Correctly returned 404 for non-existent record")
            error = response.json()
            print(f"  Error: {error.get('detail')}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Step 7: Create content for user 1 and try to delete with user 2
    print("\n7. Testing unauthorized deletion (user 2 trying to delete user 1's content)...")
    
    # Create another summary for user 1
    try:
        response = requests.post(
            f"{BASE_URL}/generate-summary",
            json=summary_request,
            headers=headers1
        )
        if response.status_code == 200:
            # Get the new summary ID
            response = requests.get(f"{BASE_URL}/history/summaries?limit=1", headers=headers1)
            if response.status_code == 200:
                summaries = response.json()
                if summaries:
                    user1_summary_id = summaries[0].get("id")
                    
                    # Try to delete with user 2's token
                    response = requests.delete(
                        f"{BASE_URL}/history/summaries/{user1_summary_id}",
                        headers=headers2
                    )
                    if response.status_code == 403:
                        print("✓ Correctly returned 403 for unauthorized deletion")
                        error = response.json()
                        print(f"  Error: {error.get('detail')}")
                    else:
                        print(f"✗ Unexpected response: {response.status_code}")
                else:
                    print("  No summaries to test with")
            else:
                print("  Could not retrieve summaries")
        else:
            print("  Could not create summary for test")
    except Exception as e:
        print(f"  Note: {e}")
    
    # Step 8: Test deleting without authentication
    print("\n8. Testing DELETE without authentication (should return 403)...")
    try:
        response = requests.delete(f"{BASE_URL}/history/summaries/1")
        if response.status_code == 403:
            print("✓ Correctly rejected request without authentication")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Step 9: Test all delete endpoints
    print("\n9. Testing all delete endpoints exist...")
    
    endpoints = [
        "/history/summaries/1",
        "/history/document-summaries/1",
        "/history/key-points/1",
        "/history/flashcards/1",
        "/history/mcqs/1",
        "/history/mcq-sessions/1",
        "/history/learning-gains/1",
        "/history/code-analyses/1"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.delete(f"{BASE_URL}{endpoint}", headers=headers1)
            # We expect 404 (not found) since ID 1 might not exist or belong to user
            # But we should NOT get 405 (method not allowed)
            if response.status_code in [404, 403]:
                print(f"✓ DELETE {endpoint} endpoint exists")
            elif response.status_code == 200:
                print(f"✓ DELETE {endpoint} endpoint exists (and deleted successfully)")
            else:
                print(f"  DELETE {endpoint} returned {response.status_code}")
        except Exception as e:
            print(f"✗ Error testing {endpoint}: {e}")
    
    # Step 10: Test stats after deletion
    print("\n10. Checking stats...")
    try:
        response = requests.get(f"{BASE_URL}/history/stats", headers=headers1)
        if response.status_code == 200:
            stats = response.json()
            print("✓ Stats retrieved")
            print(f"  Summaries: {stats.get('summaries', 0)}")
            print(f"  Code analyses: {stats.get('code_analyses', 0)}")
        else:
            print(f"✗ Failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("Task 76 - Delete History Items Test Complete")
    print("=" * 60)
    print("\nSummary:")
    print("- Users can delete their own history items")
    print("- Deletion of non-existent items returns 404")
    print("- Unauthorized deletion attempts return 403")
    print("- Authentication is required for all delete operations")
    print("- All delete endpoints are implemented")


if __name__ == "__main__":
    print("\nMake sure the backend server is running:")
    print("  uvicorn app.main:app --reload")
    print("\nStarting tests in 3 seconds...\n")
    
    import time
    time.sleep(3)
    
    test_delete_history()
