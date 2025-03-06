// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton");
    const inputs = document.querySelectorAll("input[type='text']");

    // Load saved timetable data from local storage
    function loadTimetable() {
        inputs.forEach((input) => {
            const key = input.parentElement.parentElement.rowIndex + "-" + input.parentElement.cellIndex;
            const savedValue = localStorage.getItem(key);
            if (savedValue) {
                input.value = savedValue;
            }
        });
    }

    // Save timetable data to local storage and send to backend
    async function saveTimetable() {
        const timetableData = [];
        inputs.forEach((input) => {
            const key = input.parentElement.parentElement.rowIndex + "-" + input.parentElement.cellIndex;
            const value = input.value.trim();
            if (value) {
                localStorage.setItem(key, value);

                // Extract day, time, and subject
                const day = input.parentElement.parentElement.cells[0].textContent;
                const time = input.parentElement.cells[0].textContent;
                const subject = value;

                timetableData.push({ day, time, subject });
            }
        });

        // Send timetable data to the backend
        try {
            const response = await fetch('http://127.0.0.1:5000/add-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timetable: timetableData }),
            });

            if (!response.ok) throw new Error('Failed to save timetable to backend');
            alert("Timetable saved successfully and sessions added!");
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to save timetable to backend. Please try again.");
        }
    }

    // Attach event listener to the save button
    saveButton.addEventListener("click", saveTimetable);

    // Load saved data when the page loads
    loadTimetable();
});