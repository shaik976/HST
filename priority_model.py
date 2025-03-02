from datetime import datetime

class TaskPrioritizer:
    def __init__(self):
        # Define weights for subjects (modify as needed)
        self.subject_weights = {
            'math': 1.5,      # Higher weight for math
            'science': 1.3,   # Medium weight for science
            'history': 1.1,   # Lower weight for history
            'default': 1.0    # Default weight for other subjects
        }

    def calculate_priority(self, session):
        """
        Calculate the priority score for a session.
        Priority is based on:
        1. Days until the session date (urgency)
        2. Duration of the session (shorter sessions are prioritized)
        3. Subject weight (importance of the subject)
        """
        # Calculate days until the session date
        due_date = datetime.strptime(session['date'], '%Y-%m-%d')
        days_until_due = (due_date - datetime.now()).days
        
        # Calculate duration in hours
        time_from = datetime.strptime(session['timeFrom'], '%H:%M')
        time_to = datetime.strptime(session['timeTo'], '%H:%M')
        duration = (time_to - time_from).seconds / 3600  # Convert seconds to hours
        
        # Get subject weight (default to 1.0 if subject not found)
        subject = session['subject'].lower()
        subject_weight = self.subject_weights.get(subject, self.subject_weights['default'])
        
        # Priority formula (modify weights as needed)
        priority_score = (
            (1 / (days_until_due + 1)) * 0.4 +  # Urgency (higher weight for closer dates)
            (1 / duration) * 0.3 +              # Duration (higher weight for shorter sessions)
            subject_weight * 0.3                # Subject importance (higher weight for important subjects)
        )
        
        return priority_score

    def prioritize_tasks(self, sessions):
        """
        Prioritize a list of sessions based on their priority scores.
        """
        # Calculate priority for each session
        for session in sessions:
            session['priority'] = self.calculate_priority(session)
        
        # Sort sessions by priority (highest first)
        return sorted(sessions, key=lambda x: x['priority'], reverse=True)