from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# In-memory storage for sessions (temporary, replace with database later)
sessions = []

@app.route('/')
def home():
    return render_template('fe.html')

@app.route('/sessions', methods=['GET'])
def get_sessions():
    return jsonify(sessions)

@app.route('/sessions', methods=['POST'])
def add_session():
    data = request.json
    if not all(k in data for k in ("subject", "date", "timeFrom", "timeTo")):
        return jsonify({"error": "Missing data fields"}), 400
    
    sessions.append(data)
    return jsonify({"message": "Session added successfully"}), 201

@app.route('/sessions/<int:index>', methods=['DELETE'])
def delete_session(index):
    if 0 <= index < len(sessions):
        sessions.pop(index)
        return jsonify({"message": "Session deleted successfully"})
    return jsonify({"error": "Invalid session index"}), 400

if __name__ == '__main__':
    app.run(debug=True)