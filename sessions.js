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
            
            // Calculate priority percentages
            const totalSessions = sessions.length;
            const priorityCounts = {
                high: sessions.filter(s => s.priority === 'high').length,
                medium: sessions.filter(s => s.priority === 'medium').length,
                low: sessions.filter(s => s.priority === 'low').length
            };

            sessions.forEach((session, index) => {
                const sessionElement = document.createElement('div');
                sessionElement.className = `session-item ${session.priority || 'low'}-priority`;

                const priorityPercentage = Math.round((priorityCounts[session.priority || 'low'] / totalSessions) * 100);

                sessionElement.innerHTML = `
                    <div class="session-header">
                        <span class="session-title">${session.subject}</span>
                        <span class="priority-badge ${session.priority || 'low'}">${(session.priority || 'low').toUpperCase()}</span>
                    </div>
                    <div class="session-details">
                        <p>Date: ${session.date}</p>
                        <p>Time: ${session.startTime}</p>
                        <p>Duration: ${session.duration} minutes</p>
                        <p>Description: ${session.description}</p>
                        <div class="priority-bar">
                            <div class="priority-progress ${session.priority || 'low'}" 
                                 style="width: ${priorityPercentage}%"></div>
                        </div>
                        <p class="priority-percentage">${priorityPercentage}% of total sessions</p>
                    </div>
                    <div class="session-actions">
                        <button onclick="markAsDone(${index})" class="done-btn">Done</button>
                        <button onclick="deleteSession(${index})" class="delete-btn">Delete</button>
                    </div>
                `;

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