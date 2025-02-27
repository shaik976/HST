document.addEventListener('DOMContentLoaded', async function () {
    const sessionsList = document.getElementById('sessions-list');

    // Function to show the loading spinner
    function showSpinner() {
        document.getElementById('loading-spinner').style.display = 'block';
    }

    // Function to hide the loading spinner
    function hideSpinner() {
        document.getElementById('loading-spinner').style.display = 'none';
    }

    async function fetchSessions() {
        showSpinner(); // Show spinner before fetching sessions
        try {
            const response = await fetch('http://127.0.0.1:5000/get-sessions');
            if (!response.ok) throw new Error('Failed to fetch sessions');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { sessions: [] };
        } finally {
            hideSpinner(); // Hide spinner after fetching sessions
        }
    }

    async function deleteSession(index) {
        // Ask for confirmation
        const isConfirmed = confirm('Are you sure you want to delete this session?');
        if (!isConfirmed) return;

        showSpinner(); // Show spinner before deleting session
        try {
            const response = await fetch(`http://127.0.0.1:5000/delete-session/${index}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete session');
            renderSessions(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete session. Please try again.');
        } finally {
            hideSpinner(); // Hide spinner after deleting session
        }
    }

    async function renderSessions() {
        sessionsList.innerHTML = ""; // Clear existing sessions

        const data = await fetchSessions();
        const sessions = data.sessions;

        if (sessions.length === 0) {
            sessionsList.innerHTML = '<li>No scheduled sessions found.</li>';
        } else {
            sessions.forEach((session, index) => {
                const li = document.createElement('li');
                li.textContent = `${session.subject} - ${session.date} | ${session.timeFrom} to ${session.timeTo}`;

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-btn');

                // Delete button functionality
                deleteButton.addEventListener('click', () => deleteSession(index));

                // Append delete button to list item
                li.appendChild(deleteButton);
                sessionsList.appendChild(li);
            });
        }
    }

    renderSessions();
});