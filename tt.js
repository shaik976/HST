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

    // Save timetable data to local storage
    function saveTimetable() {
        inputs.forEach((input) => {
            const key = input.parentElement.parentElement.rowIndex + "-" + input.parentElement.cellIndex;
            localStorage.setItem(key, input.value);
        });
        alert("Timetable saved successfully!");
    }

    // Attach event listener to the save button
    saveButton.addEventListener("click", saveTimetable);

    // Load saved data when the page loads
    loadTimetable();
});