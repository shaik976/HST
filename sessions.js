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
        errorDiv.style.display = 'block';
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

    // Function to determine priority class and label based on days until session
    function getPriorityInfo(sessionDate) {
        const today = new Date();
        const sessionDay = new Date(sessionDate);
        // Zero out time for accurate day diff
        today.setHours(0,0,0,0);
        sessionDay.setHours(0,0,0,0);
        const diffTime = sessionDay - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return { class: 'high', label: 'High Priority' };
        if (diffDays <= 7) return { class: 'medium', label: 'Medium Priority' };
        if (diffDays <= 10) return { class: 'low', label: 'Low Priority' };
        return { class: 'low', label: 'Low Priority' };
    }

    // Function to create session element
    function createSessionElement(session, index) {
        const div = document.createElement('div');
        const priorityInfo = getPriorityInfo(session.date);
        div.className = `session-item ${priorityInfo.class}`;
        
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
        priority.textContent = `Priority: ${priorityInfo.label}`;
        
        // Done button
        const doneButton = document.createElement('button');
        doneButton.className = 'done-button';
        doneButton.textContent = 'Done';
        doneButton.onclick = () => markAsDone(index);
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteSession(index);
        
        sessionInfo.appendChild(subject);
        sessionInfo.appendChild(date);
        sessionInfo.appendChild(time);
        sessionInfo.appendChild(duration);
        sessionInfo.appendChild(description);
        sessionInfo.appendChild(priority);
        sessionInfo.appendChild(doneButton);
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
            
            sessions.forEach((session, index) => {
                const sessionElement = createSessionElement(session, index);
                sessionsList.appendChild(sessionElement);
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

    // Function to prioritize sessions
    async function prioritizeSessions() {
        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/prioritize-tasks', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to prioritize sessions');
            }
            
            // Reload sessions after successful prioritization
            await loadSessions();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to prioritize sessions. Please try again.');
        } finally {
            hideSpinner();
        }
    }

    // Function to mark a session as done
    async function markAsDone(index) {
        // Check if session is in the future
        const response = await fetch('http://127.0.0.1:5000/get-sessions');
        const sessions = await response.json();
        const session = sessions[index];
        const sessionDate = new Date(session.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        sessionDate.setHours(0,0,0,0);
        if (sessionDate > today) {
            showError('The session is in the future and cannot be marked as done yet.');
            return;
        }
        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/mark-session-done', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });
            if (!response.ok) {
                throw new Error('Failed to mark session as done');
            }
            // Reload sessions after successful marking
            await loadSessions();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to mark session as done');
        } finally {
            hideSpinner();
        }
    }

    // Initial load of sessions
    loadSessions();

    // Add event listeners for refresh and prioritize buttons
    document.getElementById('refreshBtn').addEventListener('click', loadSessions);
    document.getElementById('prioritizeBtn').addEventListener('click', prioritizeSessions);
});