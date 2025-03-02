from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime
import os
import json
import uuid
from priority_model import TaskPrioritizer  # Import the prioritizer

app = Flask(__name__)
CORS(app)

# File to store sessions data
SESSIONS_FILE = 'sessions.json'

# Initialize the TaskPrioritizer
prioritizer = TaskPrioritizer()

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
    
    # Add a unique ID and calculate priority
    data['id'] = str(uuid.uuid4())
    data['priority'] = prioritizer.calculate_priority(data)
    sessions.append(data)
    save_sessions(sessions)
    return jsonify({"message": "Session added successfully!", "session": data}), 201

# Get all sessions
@app.route('/get-sessions', methods=['GET'])
def get_sessions():
    sessions = load_sessions()
    return jsonify({"sessions": sessions})

# Delete a session by ID
@app.route('/delete-session/<string:session_id>', methods=['DELETE'])
def delete_session(session_id):
    sessions = load_sessions()
    session_to_delete = next((session for session in sessions if session.get('id') == session_id), None)
    
    if not session_to_delete:
        abort(404, description="Session not found.")
    
    sessions.remove(session_to_delete)
    save_sessions(sessions)
    return jsonify({
        "message": "Session deleted successfully!",
        "deleted_session": session_to_delete
    })

# Get prioritized tasks
@app.route('/prioritize-tasks', methods=['GET'])
def prioritize_tasks():
    sessions = load_sessions()
    prioritized = prioritizer.prioritize_tasks(sessions)
    return jsonify({"prioritized_tasks": prioritized})

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