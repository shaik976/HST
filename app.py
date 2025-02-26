from flask import Flask, jsonify, request, abort
from flask_cors import CORS  # To handle CORS issues

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for sessions
sessions = []

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
    return jsonify({"sessions": sessions}), 200

# Delete a session by index
@app.route('/delete-session/<int:index>', methods=['DELETE'])
def delete_session(index):
    if index < 0 or index >= len(sessions):
        abort(404, description="Session not found.")

    deleted_session = sessions.pop(index)
    return jsonify({"message": "Session deleted successfully!", "deleted_session": deleted_session}), 200

# Error handler
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": str(error)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": str(error)}), 404

if __name__ == '__main__':
    app.run(debug=True)