// Get the form and the list
const form = document.getElementById('schedule-form');
const scheduleList = document.getElementById('schedule-list');

// Add event listener for form submission
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from reloading the page
    
    // Get the values from the form fields
    const subject = document.getElementById('subject').value;
    const date = document.getElementById('date').value;
    const timeFrom = document.getElementById('timeFrom').value;
    const timeTo = document.getElementById('timeTo').value;
    
    // Create a new list item
    const li = document.createElement('li');
    li.textContent = `${subject} - ${date} | ${timeFrom} to ${timeTo}`;
    
    // Append the list item to the schedule list
    scheduleList.appendChild(li);
    
    // Optionally, clear the form fields after submission
    form.reset();
});
