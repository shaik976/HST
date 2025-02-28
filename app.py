from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime
import os
import json

app = Flask(__name__)
CORS(app)

# File to store sessions data
SESSIONS_FILE = 'sessions.json'

# Load sessions from file or initialize an empty list
def load_sessions():
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, 'r') as file:
            return json.load(file)
    return []

# Save sessions to file
def save_sessions(sessions):
    with open(SESSIONS_FILE, 'w') as file:
        json.dump(sessions, file, indent=4)

# Helper function to validate session data
def validate_session_data(data):
    required_fields = ['subject', 'date', 'timeFrom', 'timeTo']
    if not data or not all(key in data for key in required_fields):
        return False
    try:
        # Validate date and time format
        datetime.strptime(data['date'], '%Y-%m-%d')
        datetime.strptime(data['timeFrom'], '%H:%M')
        datetime.strptime(data['timeTo'], '%H:%M')
        return True
    except ValueError:
        return False

# Root route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Smart Study Scheduler API!"})

# Add a new session
@app.route('/add-session', methods=['POST'])
def add_session():
    data = request.json
    if not validate_session_data(data):
        abort(400, description="Invalid data. Ensure 'subject', 'date', 'timeFrom', and 'timeTo' are provided in the correct format.")
    
    sessions = load_sessions()
    
    # Check for overlapping sessions
    for session in sessions:
        if session['date'] == data['date']:
            if (data['timeFrom'] < session['timeTo'] and data['timeTo'] > session['timeFrom']):
                abort(400, description="Session overlaps with an existing session.")
    
    sessions.append(data)
    save_sessions(sessions)  # Save updated sessions to file
    return jsonify({"message": "Session added successfully!", "sessions": sessions}), 201

# Get all sessions
@app.route('/get-sessions', methods=['GET'])
def get_sessions():
    sessions = load_sessions()
    return jsonify({"sessions": sessions})

# Delete a session by index
@app.route('/delete-session/<int:index>', methods=['DELETE'])
def delete_session(index):
    sessions = load_sessions()
    if index < 0 or index >= len(sessions):
        abort(404, description="Session not found.")
    deleted_session = sessions.pop(index)
    save_sessions(sessions)  # Save updated sessions to file
    return jsonify({"message": "Session deleted successfully!", "deleted_session": deleted_session})

# Update a session by index
@app.route('/update-session/<int:index>', methods=['PUT'])
def update_session(index):
    data = request.json
    sessions = load_sessions()
    if index < 0 or index >= len(sessions):
        abort(404, description="Session not found.")
    if not validate_session_data(data):
        abort(400, description="Invalid data. Ensure 'subject', 'date', 'timeFrom', and 'timeTo' are provided in the correct format.")
    
    # Check for overlapping sessions (excluding the current session being updated)
    for i, session in enumerate(sessions):
        if i != index and session['date'] == data['date']:
            if (data['timeFrom'] < session['timeTo'] and data['timeTo'] > session['timeFrom']):
                abort(400, description="Updated session overlaps with an existing session.")
    
    # Update the session
    sessions[index] = data
    save_sessions(sessions)  # Save updated sessions to file
    return jsonify({"message": "Session updated successfully!", "updated_session": sessions[index]})

# Error handler for 400 Bad Request
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": str(error)}), 400

# Error handler for 404 Not Found
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": str(error)}), 404

if __name__ == '__main__':
    app.run(debug=True)