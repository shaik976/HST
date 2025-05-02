# send_email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os
from datetime import datetime
import re

class EmailSender:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SENDER_EMAIL')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        
        if not all([self.sender_email, self.sender_password]):
            raise ValueError("Email credentials not properly configured")

    def _validate_email(self, email):
        if not isinstance(email, str):
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def _format_session_details(self, sessions):
        if not isinstance(sessions, list):
            raise ValueError("Sessions must be a list")

        formatted_sessions = []
        for session in sessions:
            try:
                date = datetime.strptime(session['date'], '%Y-%m-%d').strftime('%B %d, %Y')
                time = session['startTime']
                duration = f"{session['duration']} minutes"
                subject = session['subject']
                description = session.get('description', 'No description provided')
                
                formatted_sessions.append(f"""
                Subject: {subject}
                Date: {date}
                Time: {time}
                Duration: {duration}
                Description: {description}
                {'-' * 50}
                """)
            except (KeyError, ValueError) as e:
                logging.warning(f"Error formatting session: {str(e)}")
                continue

        return '\n'.join(formatted_sessions)

    def send_reminder(self, recipient_email, sessions):
        try:
            if not self._validate_email(recipient_email):
                raise ValueError("Invalid recipient email address")

            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = recipient_email
            msg['Subject'] = "Your Study Schedule Reminder"

            # Format email body
            body = f"""
            Hello,

            Here is your study schedule reminder:

            {self._format_session_details(sessions)}

            Best regards,
            Smart Study Scheduler
            """

            msg.attach(MIMEText(body, 'plain'))

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            logging.info(f"Reminder email sent successfully to {recipient_email}")
            return True
        except smtplib.SMTPException as e:
            logging.error(f"SMTP error while sending email: {str(e)}")
            raise
        except Exception as e:
            logging.error(f"Error sending reminder email: {str(e)}")
            raise

def send_reminder(email, sessions):
    try:
        sender = EmailSender()
        return sender.send_reminder(email, sessions)
    except Exception as e:
        logging.error(f"Failed to send reminder: {str(e)}")
        raise

def send_schedule_email(to_email, user_name, schedule_items):
    from_email = 'your_email@gmail.com'
    password = 'your_app_password'

    schedule_text = "\n".join([f"- {item['subject']} from {item['timeFrom']} to {item['timeTo']}" for item in schedule_items])

    body = f"""Hi {user_name},\n\nHere is your study schedule for today:\n\n{schedule_text}\n\nGood luck with your studies!"""

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = 'Your Study Schedule for Today'
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        print("📧 Email sent to", to_email)
