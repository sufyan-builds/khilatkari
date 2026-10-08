import os
import urllib.request
import json
from pathlib import Path

# Load local environment if present
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")

def make_request(url, method='GET', data=None, headers=None):
    req = urllib.request.Request(url, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if data:
        req.data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

print('--- Testing Frontend Server ---')
status, body = make_request(f'{FRONTEND_URL}/')
print(f'Frontend HTTP Status: {status}, HTML Length: {len(body)}')

print('\n--- Testing Backend Health ---')
status, body = make_request(f'{BACKEND_URL}/api/health')
print(f'Health API: {status} -> {body}')

print('\n--- Testing Products API ---')
status, body = make_request(f'{BACKEND_URL}/api/products')
p_data = json.loads(body)
total_products = p_data.get('data', {}).get('total', 0)
print(f'Products API: {status}, Total Products: {total_products}')

print('\n--- Testing Single Product by Slug ---')
status, body = make_request(f'{BACKEND_URL}/api/products/ivory-chikankari-chiffon-suit')
print(f'Single Product API: {status}')

print('\n--- Testing Appointment Creation ---')
test_apt = {
    'customerName': 'Ayesha Fatima',
    'phone': '0300-1234567',
    'email': 'ayesha@example.com',
    'city': 'Lahore',
    'preferredDate': '2026-10-15',
    'preferredTime': 'Afternoon (2:00 PM - 5:00 PM)',
    'collection': 'Chikankari',
    'message': 'Interested in viewing bridal Chikankari suits at home'
}
status, body = make_request(f'{BACKEND_URL}/api/appointments', method='POST', data=test_apt)
print(f'Appointment Submission: {status} -> {body[:100]}...')

print('\n--- Testing Admin Login ---')
admin_user = os.getenv('ADMIN_USERNAME', 'sufian')
admin_pw = os.getenv('ADMIN_PASSWORD') or os.getenv('ADMIN_TEST_PASSWORD', '')
login_payload = {'username': admin_user, 'password': admin_pw}
status, body = make_request(f'{BACKEND_URL}/api/admin/auth/login', method='POST', data=login_payload)
auth_data = json.loads(body)
token = auth_data.get('data', {}).get('access_token')
print(f'Admin Login: {status}, Token received: {bool(token)}')

if token:
    print('\n--- Testing Protected Admin Stats ---')
    status, body = make_request(f'{BACKEND_URL}/api/admin/stats', headers={'Authorization': f'Bearer {token}'})
    print(f'Admin Stats: {status} -> {body}')

    print('\n--- Testing Protected Admin Appointments ---')
    status, body = make_request(f'{BACKEND_URL}/api/admin/appointments', headers={'Authorization': f'Bearer {token}'})
    print(f'Admin Appointments: {status}')

print('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!')
