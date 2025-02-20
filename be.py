from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///study_scheduler.db'
db = SQLAlchemy(app)

# Database Model for Sessions
class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

# Initialize Database
with app.app_context():
    db.create_all()

# Create Session
@app.route('/sessions', methods=['POST'])
def create_session():
    data = request.json
    new_session = Session(
        title=data['title'],
        description=data.get('description', ''),
        start_time=datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S'),
        end_time=datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M:%S')
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"message": "Session created successfully!"}), 201

# Get All Sessions
@app.route('/sessions', methods=['GET'])
def get_sessions():
    sessions = Session.query.all()
    return jsonify([{ "id": s.id, "title": s.title, "description": s.description, "start_time": s.start_time, "end_time": s.end_time } for s in sessions])

# Get Sessions within Time Range
@app.route('/sessions/filter', methods=['GET'])
def filter_sessions():
    start_time = request.args.get('from')
    end_time = request.args.get('to')
    
    start_dt = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S') if start_time else None
    end_dt = datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S') if end_time else None
    
    query = Session.query
    if start_dt:
        query = query.filter(Session.start_time >= start_dt)
    if end_dt:
        query = query.filter(Session.end_time <= end_dt)
    
    sessions = query.all()
    return jsonify([{ "id": s.id, "title": s.title, "description": s.description, "start_time": s.start_time, "end_time": s.end_time } for s in sessions])

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
