from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import re
from priority_model import PriorityModel
import email_utils
import logging
from functools import wraps
import time
import threading
import schedule

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Rate limiting decorator
def rate_limit(max_requests=100, time_window=60):
    def decorator(f):
        requests = []
        @wraps(f)
        def wrapper(*args, **kwargs):
            now = time.time()
            requests[:] = [req for req in requests if now - req < time_window]
            if len(requests) >= max_requests:
                return jsonify({'error': 'Rate limit exceeded'}), 429
            requests.append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Input sanitization
def sanitize_input(data):
    if isinstance(data, str):
        # Remove potentially harmful characters
        return re.sub(r'[<>]', '', data)
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

# Error handling decorator
def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'An internal error occurred'}), 500
    return wrapper

# File operations with proper error handling
def safe_file_operation(operation, filename, *args, **kwargs):
    try:
        if operation == 'read':
            with open(filename, 'r') as f:
                return json.load(f)
        elif operation == 'write':
            with open(filename, 'w') as f:
                json.dump(args[0], f, indent=4)
    except Exception as e:
        logger.error(f"File operation error on {filename}: {str(e)}")
        raise

@app.route('/')
def serve_frontend():
    return send_from_directory('.', 'fe.html')

@app.route('/add-timetable', methods=['POST'])
@handle_errors
@rate_limit()
def add_timetable():
    try:
        data = request.get_json()
        if not data or 'timetable' not in data:
            return jsonify({'error': 'No timetable data provided'}), 400

        # Sanitize input
        timetable_data = sanitize_input(data['timetable'])

        # Save timetable data
        safe_file_operation('write', 'timetable.json', timetable_data)
        
        return jsonify({'message': 'Timetable saved successfully'}), 201
    except Exception as e:
        logger.error(f"Error saving timetable: {str(e)}")
        return jsonify({'error': 'Failed to save timetable'}), 500

@app.route('/get-sessions')
@handle_errors
@rate_limit()
def get_sessions():
    try:
        sessions = safe_file_operation('read', 'sessions.json')
        model = PriorityModel()
        prioritized_sessions = model.prioritize_sessions(sessions)
        return jsonify(prioritized_sessions)
    except Exception as e:
        logger.error(f"Error getting sessions: {str(e)}")
        return jsonify({'error': 'Failed to retrieve sessions'}), 500

@app.route('/add-session', methods=['POST'])
@handle_errors
@rate_limit()
def add_session():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['subject', 'date', 'startTime', 'duration', 'description']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Sanitize input
        data = sanitize_input(data)

        # Validate date and time format
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
            datetime.strptime(data['startTime'], '%H:%M')
        except ValueError as e:
            logger.error(f"Date/time validation error: {str(e)}")
            return jsonify({'error': 'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time'}), 400

        # Validate duration
        try:
            duration = int(data['duration'])
            if duration <= 0:
                return jsonify({'error': 'Duration must be positive'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid duration'}), 400

        sessions = safe_file_operation('read', 'sessions.json')
        sessions.append(data)
        safe_file_operation('write', 'sessions.json', sessions)
        
        return jsonify({'message': 'Session added successfully'}), 201
    except Exception as e:
        logger.error(f"Error adding session: {str(e)}")
        return jsonify({'error': 'Failed to add session'}), 500

@app.route('/delete-session', methods=['POST'])
@handle_errors
@rate_limit()
def delete_session():
    try:
        data = request.get_json()
        if not data or 'index' not in data:
            return jsonify({'error': 'No index provided'}), 400

        sessions = safe_file_operation('read', 'sessions.json')
        index = int(data['index'])
        
        if 0 <= index < len(sessions):
            sessions.pop(index)
            safe_file_operation('write', 'sessions.json', sessions)
            return jsonify({'message': 'Session deleted successfully'})
        else:
            return jsonify({'error': 'Invalid index'}), 400
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        return jsonify({'error': 'Failed to delete session'}), 500

@app.route('/prioritize-tasks')
@handle_errors
@rate_limit()
def prioritize_tasks():
    try:
        sessions = safe_file_operation('read', 'sessions.json')
        model = PriorityModel()
        prioritized_sessions = model.prioritize_sessions(sessions)
        return jsonify(prioritized_sessions)
    except Exception as e:
        logger.error(f"Error prioritizing tasks: {str(e)}")
        return jsonify({'error': 'Failed to prioritize tasks'}), 500

@app.route('/send-reminder', methods=['POST'])
@handle_errors
@rate_limit()
def send_reminder():
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'error': 'No email provided'}), 400

        email = sanitize_input(data['email'])
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400

        sessions = safe_file_operation('read', 'sessions.json')
        email_utils.send_reminder(email, sessions)
        return jsonify({'message': 'Reminder sent successfully'})
    except Exception as e:
        logger.error(f"Error sending reminder: {str(e)}")
        return jsonify({'error': 'Failed to send reminder'}), 500

@app.route('/get-timetable')
@handle_errors
@rate_limit()
def get_timetable():
    try:
        timetable = safe_file_operation('read', 'timetable.json')
        return jsonify(timetable)
    except Exception as e:
        logger.error(f"Error getting timetable: {str(e)}")
        return jsonify({'error': 'Failed to retrieve timetable'}), 500

def check_upcoming_sessions():
    try:
        # Read sessions from file
        sessions = safe_file_operation('read', 'sessions.json')
        current_time = datetime.now()
        
        for session in sessions:
            # Parse session date and time
            session_date = datetime.strptime(session['date'], '%Y-%m-%d')
            session_time = datetime.strptime(session['startTime'], '%H:%M').time()
            session_datetime = datetime.combine(session_date, session_time)
            
            # Calculate time difference
            time_diff = session_datetime - current_time
            
            # If session is within the next hour and hasn't been notified yet
            if timedelta(hours=0) < time_diff <= timedelta(hours=1):
                # Check if notification was already sent
                if not session.get('notification_sent', False):
                    try:
                        # Send email notification
                        email_sender = email_utils.EmailSender()
                        email_sender.send_reminder(
                            'shaiksiddiq830@gmail.com',  # Set recipient email
                            [session]
                        )
                        
                        # Mark session as notified
                        session['notification_sent'] = True
                        safe_file_operation('write', 'sessions.json', sessions)
                        
                        logger.info(f"Sent notification for session: {session['subject']}")
                    except Exception as e:
                        logger.error(f"Failed to send notification for session {session['subject']}: {str(e)}")
    except Exception as e:
        logger.error(f"Error checking upcoming sessions: {str(e)}")

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

# Start the scheduler in a background thread
schedule.every(1).minutes.do(check_upcoming_sessions)
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.daemon = True
scheduler_thread.start()

if __name__ == '__main__':
    app.run(debug=True)