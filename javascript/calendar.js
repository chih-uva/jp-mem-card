let datesWithVocab = []; // Define globally to be accessible in all functions
let monthsByYear = {}; // Track months with vocab entries by year

async function loadCalendarData() {
    const response = await fetch('/vocab-history');
    const vocabHistory = await response.json();

    datesWithVocab = vocabHistory.map(entry => entry.dateAdded); // Set the global variable here

    // Populate monthsByYear object
    datesWithVocab.forEach(date => {
        if (date === "example") {
            if (!monthsByYear["example"]) monthsByYear["example"] = new Set();
        } else {
            const [month, , year] = date.split('-');
            if (!monthsByYear[`20${year}`]) monthsByYear[`20${year}`] = new Set();
            monthsByYear[`20${year}`].add(month);
        }
    });
}

async function initializeCalendar() {
    await loadCalendarData(); // Ensure datesWithVocab is populated

    // Get unique years from monthsByYear object
    const yearsWithVocab = Object.keys(monthsByYear);

    populateYearDropdown(yearsWithVocab);
    updateMonthOptions(); // Initial population based on the first selected year
    displaySelectedMonth(); // Show calendar for the selected month and year
}

function populateYearDropdown(years) {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.innerHTML = '';

    years.sort().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year === "example" ? "example" : year;
        yearSelect.appendChild(option);
    });

    yearSelect.addEventListener('change', () => {
        if (yearSelect.value === "example") {
            window.location.href = "start.html?example=true";
        } else {
            updateMonthOptions();
        }
    });
}

function updateMonthOptions() {
    const selectedYear = document.getElementById('yearSelect').value;
    populateMonthDropdown(selectedYear);
}

function populateMonthDropdown(year) {
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = '';

    if (monthsByYear[year]) {
        [...monthsByYear[year]].sort().forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = new Date(0, month - 1).toLocaleString('default', { month: 'long' });
            monthSelect.appendChild(option);
        });
    }
}

function displaySelectedMonth() {
    const selectedYear = document.getElementById('yearSelect').value.slice(-2); // Get the last two digits for year
    const selectedMonth = String(document.getElementById('monthSelect').value).padStart(2, '0'); // Ensure month is two digits

    const daysInMonth = new Date(`20${selectedYear}`, selectedMonth, 0).getDate();
    const firstDay = new Date(`20${selectedYear}-${selectedMonth}-01`).getDay();

    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = ''; // Clear previous calendar entries

    const monthDays = [];

    // Add placeholders for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        monthDays.push('');
    }

    // Populate the actual days in the month
    for (let day = 1; day <= daysInMonth; day++) {
        monthDays.push(day);
    }

    // Render the calendar in rows of 7 days
    const weeks = Math.ceil(monthDays.length / 7);
    for (let i = 0; i < weeks; i++) {
        const weekRow = document.createElement('div');
        weekRow.classList.add('week-row');

        for (let j = 0; j < 7; j++) {
            const day = monthDays[i * 7 + j];
            const dayButton = document.createElement('button');
            
            if (day) {
                dayButton.classList.add('day');
                dayButton.textContent = day;

                // Check if this day has vocabulary data and is marked as "studied"
                if (datesWithVocab.includes(`${selectedMonth}-${String(day).padStart(2, '0')}-${selectedYear}`)) {
                    dayButton.classList.add('studied');
                    
                    // Add an event listener to redirect with the selected date
                    const formattedDate = `${selectedMonth}-${String(day).padStart(2, '0')}-${selectedYear}`;
                    dayButton.addEventListener('click', () => {
                        window.location.href = `start.html?date=${formattedDate}`;
                    });
                } else {
                    // Mark as "not-studied" if there is no vocabulary data for this day
                    dayButton.classList.add('not-studied');
                    dayButton.addEventListener('click', () => {
                        displayTemporaryMessage("No vocabulary entries for this date.", "error");
                    });
                }
            } else {
                // Add placeholder button for empty days
                dayButton.classList.add('placeholder');
            }

            weekRow.appendChild(dayButton);
        }

        calendarContainer.appendChild(weekRow);
    }
}


document.addEventListener('DOMContentLoaded', initializeCalendar);

// Temporary message display function for dates without entries
function displayTemporaryMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    document.body.appendChild(messageBox);

    setTimeout(() => messageBox.remove(), 500);
}
