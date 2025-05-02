document.addEventListener('DOMContentLoaded', function () {
    const sessionsList = document.getElementById('sessions-list');
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.innerHTML = '<div class="spinner"></div>';
    document.querySelector('.container').appendChild(loadingSpinner);

    // Function to show error messages
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        document.querySelector('.container').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Function to show loading spinner
    function showSpinner() {
        loadingSpinner.style.display = 'block';
    }

    // Function to hide loading spinner
    function hideSpinner() {
        loadingSpinner.style.display = 'none';
    }

    // Function to format date
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Function to format time
    function formatTime(timeString) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Function to determine priority class
    function getPriorityClass(priority) {
        if (priority >= 0.7) return 'high';
        if (priority >= 0.4) return 'medium';
        return 'low';
    }

    // Function to create session element
    function createSessionElement(session, index) {
        const div = document.createElement('div');
        div.className = `session-item ${getPriorityClass(session.priority)}`;
        
        const sessionInfo = document.createElement('div');
        sessionInfo.className = 'session-info';
        
        const subject = document.createElement('h3');
        subject.textContent = session.subject;
        
        const date = document.createElement('p');
        date.textContent = `Date: ${formatDate(session.date)}`;
        
        const time = document.createElement('p');
        const startTime = formatTime(session.startTime);
        const endTime = new Date(`2000-01-01T${session.startTime}`);
        endTime.setMinutes(endTime.getMinutes() + session.duration);
        time.textContent = `Time: ${startTime} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        
        const duration = document.createElement('p');
        duration.textContent = `Duration: ${session.duration} minutes`;
        
        const description = document.createElement('p');
        description.textContent = `Description: ${session.description}`;
        
        const priority = document.createElement('p');
        priority.textContent = `Priority: ${(session.priority * 100).toFixed(0)}%`;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteSession(index));
        
        sessionInfo.appendChild(subject);
        sessionInfo.appendChild(date);
        sessionInfo.appendChild(time);
        sessionInfo.appendChild(duration);
        sessionInfo.appendChild(description);
        sessionInfo.appendChild(priority);
        sessionInfo.appendChild(deleteButton);
        
        div.appendChild(sessionInfo);
        return div;
    }

    // Function to load and display sessions
    async function loadSessions() {
        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/get-sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            
            const sessions = await response.json();
            sessionsList.innerHTML = '';
            
            if (sessions.length === 0) {
                const noSessions = document.createElement('p');
                noSessions.textContent = 'No sessions scheduled yet.';
                noSessions.className = 'no-sessions';
                sessionsList.appendChild(noSessions);
                return;
            }
            
            // Sort sessions by date and time
            const sortedSessions = sessions.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA - dateB;
            });
            
            sortedSessions.forEach((session, index) => {
                sessionsList.appendChild(createSessionElement(session, index));
            });
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to load sessions. Please try again.');
        } finally {
            hideSpinner();
        }
    }

    // Function to delete a session
    async function deleteSession(index) {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }
        
        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/delete-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete session');
            }
            
            // Reload sessions after successful deletion
            await loadSessions();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to delete session. Please try again.');
        } finally {
            hideSpinner();
        }
    }

    // Initial load of sessions
    loadSessions();
});