from flask import Flask, jsonify, request, abort
from flask_cors import CORS  # To handle CORS Issues

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for sessions
sessions = []

# Root route
@app.route('/')
def home():
    return "Welcome to the Flask App!"

# Add a new session
@app.route('/add-session', methods=['POST'])
def add_session():
    data = request.json
    if not data or not all(key in data for key in ['subject', 'date', 'timeFrom', 'timeTo']):
        abort(400, description="Invalid data. Ensure 'subject', 'date', 'timeFrom', and 'timeTo' are provided.")
    sessions.append(data)
    return jsonify({"message": "Session added successfully!", "sessions": sessions}), 201

# Get all sessions
@app.route('/get-sessions', methods=['GET'])
def get_sessions():
    return jsonify({"sessions": sessions})

if __name__ == '__main__':
    app.run(debug=True)