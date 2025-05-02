from datetime import datetime
import logging
import os

class PriorityModel:
    def __init__(self):
        self.model_file = 'priority_model.pkl'
        self.priority_ranges = {
            'high': 2,      # 0-2 days
            'medium': 7,    # 2-7 days
            'low': float('inf')  # >7 days
        }

    def _validate_session(self, session):
        required_fields = ['date', 'startTime', 'duration']
        if not all(field in session for field in required_fields):
            raise ValueError("Missing required fields in session")

        try:
            # Validate date
            datetime.strptime(session['date'], '%Y-%m-%d')
            
            # Validate time
            datetime.strptime(session['startTime'], '%H:%M')
            
            # Validate duration
            duration = int(session['duration'])
            if duration <= 0:
                raise ValueError("Duration must be positive")
        except ValueError as e:
            raise ValueError(f"Invalid session data: {str(e)}")

    def _calculate_days_until(self, date_str):
        try:
            session_date = datetime.strptime(date_str, '%Y-%m-%d')
            today = datetime.now()
            days_until = (session_date - today).days
            return max(0, days_until)  # Ensure non-negative
        except ValueError:
            raise ValueError("Invalid date format")

    def calculate_priority(self, session):
        try:
            self._validate_session(session)
            days_until = self._calculate_days_until(session['date'])
            
            # Calculate priority: 100% for today, decreasing by 10% each day
            # Ensure priority stays between 0.1 and 1.0
            priority = max(0.1, 1.0 - (days_until * 0.1))
            
            return priority
                
        except Exception as e:
            logging.error(f"Error calculating priority: {str(e)}")
            return 0.5  # Default priority in case of error

    def prioritize_sessions(self, sessions):
        try:
            if not isinstance(sessions, list):
                raise ValueError("Sessions must be a list")

            # Calculate priorities for all sessions
            for session in sessions:
                session['priority'] = self.calculate_priority(session)

            # Sort sessions by priority (highest first)
            return sorted(sessions, key=lambda x: x['priority'], reverse=True)
        except Exception as e:
            logging.error(f"Error prioritizing sessions: {str(e)}")
            return sessions  # Return unsorted sessions in case of error

    def get_priority_text(self, priority):
        if priority >= 0.9:
            return "High"
        elif priority >= 0.4:
            return "Medium"
        else:
            return "Low"