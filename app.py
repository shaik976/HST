from flask import Flask, jsonify, request, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

# Delete a session by index
@app.route('/delete-session/<int:index>', methods=['DELETE'])
def delete_session(index):
    if index < 0 or index >= len(sessions):
        abort(404, description="Session not found.")
    deleted_session = sessions.pop(index)
    return jsonify({"message": "Session deleted successfully!", "deleted_session": deleted_session})

# Update a session by index
@app.route('/update-session/<int:index>', methods=['PUT'])
def update_session(index):
    data = request.json
    if index < 0 or index >= len(sessions):
        abort(404, description="Session not found.")
    if not data or not all(key in data for key in ['subject', 'date', 'timeFrom', 'timeTo']):
        abort(400, description="Invalid data. Ensure 'subject', 'date', 'timeFrom', and 'timeTo' are provided.")
    
    # Update the session
    sessions[index] = data
    return jsonify({"message": "Session updated successfully!", "updated_session": sessions[index]})

if __name__ == '__main__':
    app.run(debug=True)