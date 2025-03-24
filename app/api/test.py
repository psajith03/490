import time
import random
import string
import requests
import hashlib
import hmac
import base64
from urllib.parse import quote, urlencode

CLIENT_ID = "b5da2fe6be5b4f878ff0c131bf44ab79"
CLIENT_SECRET = "9e50d74766254bb89f9210a2b672da3f"
BASE_URL = "https://platform.fatsecret.com/rest/food/autocomplete/v2"
TOKEN_URL = "https://oauth.fatsecret.com/connect/token"

def generate_nonce(length=32):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_timestamp():
    return str(int(time.time()))

def url_encode(value):
    return quote(str(value), safe="~")

def create_signature_base_string(http_method, base_url, params):
    sorted_params = sorted(params.items())
    normalized_params = urlencode(sorted_params, quote_via=quote)
    signature_base_string = f"{http_method.upper()}&{url_encode(base_url)}&{url_encode(normalized_params)}"
    return signature_base_string

def calculate_oauth_signature(base_string, consumer_secret):
    signing_key = f"{url_encode(consumer_secret)}&"
    return base64.b64encode(hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()).decode()

def get_oauth_token():
    oauth_nonce = generate_nonce()
    oauth_timestamp = generate_timestamp()
    
    params = {
        "oauth_consumer_key": CLIENT_ID,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": oauth_timestamp,
        "oauth_nonce": oauth_nonce,
        "oauth_version": "1.0",
    }
    
    base_string = create_signature_base_string("POST", TOKEN_URL, params)
    oauth_signature = calculate_oauth_signature(base_string, CLIENT_SECRET)
    params["oauth_signature"] = oauth_signature
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    response = requests.post(TOKEN_URL, data=params, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error obtaining token: {response.status_code}")
        print(response.text)
        return None

def autocomplete_food(expression, max_results=5):
    token_response = get_oauth_token()
    if not token_response:
        return "Error: Unable to authenticate."
    
    oauth_token = token_response.get("access_token")
    oauth_token_secret = token_response.get("access_token_secret")
    
    oauth_nonce = generate_nonce()
    oauth_timestamp = generate_timestamp()
    
    params = {
        "method": "foods.autocomplete.v2",
        "expression": expression,
        "max_results": max_results,
        "format": "json",
        "oauth_consumer_key": CLIENT_ID,
        "oauth_token": oauth_token,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": oauth_timestamp,
        "oauth_nonce": oauth_nonce,
        "oauth_version": "1.0",
    }
    
    
    base_string = create_signature_base_string("GET", BASE_URL, params)
    oauth_signature = calculate_oauth_signature(base_string, CLIENT_SECRET)
    params["oauth_signature"] = oauth_signature
    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        suggestions = response.json().get("suggestions", {}).get("suggestion", [])
        return suggestions if suggestions else ["No suggestions found."]
    else:
        return f"Error: {response.status_code} - {response.json()}"

if __name__ == "__main__":
    user_input = input("Enter food name: ")
    results = autocomplete_food(user_input)
    
    print("\nTop suggestions:")
    for idx, suggestion in enumerate(results, 1):
        print(f"{idx}. {suggestion}")
