document.addEventListener('DOMContentLoaded', async function () {
    const sessionsList = document.getElementById('sessions-list');

    // Fetch sessions from the backend
    async function fetchSessions() {
        try {
            const response = await fetch('http://127.0.0.1:5000/get-sessions');
            if (!response.ok) throw new Error('Failed to fetch sessions');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { sessions: [] }; // Return an empty array if fetching fails
        }
    }

    // Delete a session by ID
    async function deleteSession(sessionId) {
        const isConfirmed = confirm('Are you sure you want to delete this session?');
        if (!isConfirmed) return;

        try {
            const response = await fetch(`http://127.0.0.1:5000/delete-session/${sessionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete session');

            // Refresh the list after successful deletion
            await renderSessions();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete session. Please try again.');
        }
    }

    // Render sessions in the list
    async function renderSessions() {
        sessionsList.innerHTML = ""; // Clear existing sessions

        const data = await fetchSessions();
        const sessions = data.sessions;

        if (sessions.length === 0) {
            sessionsList.innerHTML = '<li>No scheduled sessions found.</li>';
        } else {
            sessions.forEach((session) => {
                const li = document.createElement('li');
                li.textContent = `${session.subject} - ${session.date} | ${session.timeFrom} to ${session.timeTo}`;

                // Add the session ID as a data attribute
                li.setAttribute('data-session-id', session.id);

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => deleteSession(session.id));

                li.appendChild(deleteButton);
                sessionsList.appendChild(li);
            });
        }
    }

    // Initial render
    renderSessions();
});