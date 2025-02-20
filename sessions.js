document.addEventListener('DOMContentLoaded', function () {
    const sessionsList = document.getElementById('sessions-list');

    // Get sessions from local storage
    let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

    function updateSessions() {
        localStorage.setItem('sessions', JSON.stringify(sessions));
        renderSessions();
    }

    function renderSessions() {
        sessionsList.innerHTML = ""; // Clear existing sessions

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
                deleteButton.addEventListener('click', function () {
                    sessions.splice(index, 1); // Remove session
                    updateSessions(); // Save & refresh
                });

                // Append delete button to list item
                li.appendChild(deleteButton);
                sessionsList.appendChild(li);
            });
        }
    }

    renderSessions();
});
//End