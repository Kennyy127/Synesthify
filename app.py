from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route("/api/spotify-token")
def get_token():
    payload = {
        "clientId": "YOUR_CLIENT_ID",
        "devToken": "YOUR_DEV_TOKEN"
    }
    headers = {
        "Content-Type": "application/json"
    }
    r = requests.post("https://spoken.host/be/developer/api/token/refresh", json=payload, headers=headers)
    return jsonify(r.json())

if __name__ == "__main__":
    app.run(port=5000)

