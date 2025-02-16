document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("schedule-form");
    const scheduleList = document.getElementById("schedule-list");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const subject = document.getElementById("subject").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        
        if (subject && date && time) {
            const listItem = document.createElement("li");
            listItem.textContent = `${subject} - ${date} at ${time}`;
            
            scheduleList.appendChild(listItem);
            
            form.reset();
        }
    });
});
