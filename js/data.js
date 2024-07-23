let token = localStorage.getItem('token');
let serverIP = "192.168.1.23:8080";

document.addEventListener("DOMContentLoaded", function() {
    const portfolioData = [];

    function populatePortfolioTable(data) {
        const tbody = document.querySelector("#portfolio-table tbody");
        tbody.innerHTML = "";

        // Extract all values from "Daily Change" and "General Change" columns
        const dailyChangeValues = [];
        const generalChangeValues = [];

        data.forEach(item => {
            dailyChangeValues.push(parseFloat(item.dailyChange));
            generalChangeValues.push(parseFloat(item.generalProfit));
        });

        // Calculate min and max values for "Daily Change" and "General Change" columns
        const minMaxValues = {
            dailyChange: [Math.min(...dailyChangeValues), Math.max(...dailyChangeValues)],
            generalChange: [Math.min(...generalChangeValues), Math.max(...generalChangeValues)]
        };

        // Populate the table rows and apply colors
        data.forEach(item => {
            const row = `
            <tr>
                <td style="font-weight: bold; font-size: 18px">${item.ticker}</td>
                <td>$${item.entryAmount}</td>
                <td>${item.shares}</td>
                <td>$${item.currentWorth}</td>
                <td class="daily-change">${applyColor(item.dailyChange, minMaxValues.dailyChange)}</td>
                <td class="daily-profit">$${item.dailyProfit}</td>
                <td class="general-change">${applyColor(item.generalProfit, minMaxValues.generalChange)}</td>
                <td class="general-gain">$${item.overallReturn}</td>
                <td>$${item.dividends}</td>
            </tr>
        `;
            tbody.innerHTML += row;
        });
    }

    function applyColor(value, [minValue, maxValue]) {
        let r, g;
        if (value > 0) {
            r = 0;
            g = Math.round(255 * (value / maxValue));
        } else {
            r = Math.round(255 * (value / minValue));
            g = 0;
        }
        const color = `rgb(${r}, ${g}, 0)`; // Determine color based on value
        return `<span style="color: ${color}; font-weight: bold;">${value}%</span>`;
    }


    function populateCards(data) {
        const tbody = document.querySelector("#timeline .timeline"); // Corrected querySelector
        tbody.innerHTML = "";
        data.forEach(item => {
            let cardClass = item.performance >= 0 ? 'positive' : 'negative';
            let arrowIcon = item.performance >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            const row = `
            <div class="event">
                <div class="card ${cardClass}">
                    <div class="icon"><i class="${arrowIcon}"></i></div>
                    <div class="content">
                        <div class="date">${item.date}</div> 
                        <div class="ticker">${item.ticker}</div>
                        <div class="shares">${item.shares.toFixed(5)}</div>
                        <div class="yield">${item.performance.toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;
            tbody.innerHTML += row;
        });
    }


    function fetchDataAndUpdateTable() {
        fetch(`http://${serverIP}/holdings/GetGroupedHoldings?token=${token}`)
            .then(response => response.json())
            .then(data => {
                portfolioData.length = 0; // Clear the array before updating
                data.forEach(entry => {
                    const ticker = entry[0];
                    const entryAmount = parseFloat(entry[1]).toFixed(2);
                    const shares = parseFloat(entry[2]).toFixed(5);
                    const currentWorth = parseFloat(entry[3]).toFixed(2);
                    const dailyChange = parseFloat(entry[4]).toFixed(2);
                    const dailyProfit = parseFloat(entry[5]).toFixed(2);
                    const generalProfit = parseFloat(entry[6]).toFixed(2);
                    const overallReturn = parseFloat(entry[7]).toFixed(2);
                    const dividends = parseFloat(entry[8]).toFixed(2);

                    portfolioData.push({
                        ticker,
                        entryAmount,
                        shares,
                        currentWorth,
                        dailyProfit,
                        dailyChange,
                        generalProfit,
                        overallReturn,
                        dividends
                    });
                });

                localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

                populatePortfolioTable(portfolioData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }


    function fetchDataAndUpdateCards() {
        fetch(`http://${serverIP}/holdings/GetHistory?token=${token}`)
            .then(response => response.json())
            .then(data => {
                portfolioData.length = 0; // Clear the array before updating
                data.forEach(entry => {
                    const ticker = entry[0];
                    const shares = parseFloat(entry[1]);
                    const date = entry[3];
                    const performance = parseFloat(entry[2]);
                    const initialInvest = parseFloat(entry[4]);


                    portfolioData.push({
                        ticker,
                        shares,
                        date,
                        performance,
                        initialInvest
                    });
                });

                localStorage.setItem('HistoryData', JSON.stringify(portfolioData));

                populateCards(portfolioData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Fetch data on page load
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchDataAndUpdate() {
        try {
            await fetchDataAndUpdateTable();
            await sleep(12000); // Sleep for 12 seconds
            await fetchDataAndUpdateCards();
            updateDailyChangeValues(portfolioData); // Update total daily change values
            console.log("Both functions executed successfully.");
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

// Update total daily change values
    function updateDailyChangeValues(data) {
        const totalPercentageChange = calculateTotalDailyChange(data);
        const totalDollarChange = data.reduce((acc, curr) => acc + parseFloat(curr.dailyProfit), 0).toFixed(2);

        document.getElementById('percentage-change').textContent = `${totalPercentageChange}%`;
        document.getElementById('dollar-change').textContent = `$${totalDollarChange}`;

    }

    fetchDataAndUpdate();


    document.querySelector("#portfolio-table tbody").addEventListener("dblclick", function(event) {
        const row = event.target.closest("tr");
        if (row) {
            const ticker = row.querySelector("td:first-child").textContent; // Get the ticker from the first cell
            const dailyChange = row.querySelector("td:nth-child(5)").textContent.replace(/%|\$/g, ''); // Get the daily change from the fifth cell and remove % and $
            const dividend = row.querySelector("td:nth-child(9)").textContent.replace(/%|\$/g, ''); // Get the dividend from the ninth cell and remove % and $
            // Store the selected ticker, daily change, and dividend in localStorage
            localStorage.setItem("selectedTicker", ticker);
            localStorage.setItem("selectedDailyChange", dailyChange);
            localStorage.setItem("selectedDividend", dividend);
            // Optionally, you can redirect to another page after storing the values
            window.location.href = "../html/ticker.html";
        }
    });

});



// JavaScript to toggle the display of pop-up forms

// Get references to the pop-up form elements
const stockPopup = document.getElementById('stock-popup');
const dividendPopup = document.getElementById('dividend-popup');
const feePopup = document.getElementById('fee-popup');
const SplitPopup = document.getElementById('split-popup');

// Get references to the buttons that open the pop-up forms
const buyStockBtn = document.getElementById('buy-stock');
const addDividendBtn = document.getElementById('add-dividend');
const feeManagementBtn = document.getElementById('fee-management');
const splitStockBtn = document.getElementById('split-stock');

// Event listeners to open the pop-up forms
buyStockBtn.addEventListener('click', () => {
    stockPopup.style.display = 'block';
    resetForm('stock-form');
    document.getElementById('stock-date').valueAsDate = new Date();
});

addDividendBtn.addEventListener('click', () => {
    dividendPopup.style.display = 'block';
    resetForm('dividend-form');
    document.getElementById('dividend-date').valueAsDate = new Date();
});

feeManagementBtn.addEventListener('click', () => {
    feePopup.style.display = 'block';
    resetForm('fee-form');
    document.getElementById('fee-date').valueAsDate = new Date();
});

splitStockBtn.addEventListener('click', () => {
    // Show split/unsplit pop-up

    SplitPopup.style.display = 'block';
    // Reset split form
    resetForm('split-form');
});

// Event listeners to close the pop-up forms when clicking outside the form
window.addEventListener('click', (e) => {
    if (e.target === stockPopup) {
        stockPopup.style.display = 'none';
    }
    if (e.target === dividendPopup) {
        dividendPopup.style.display = 'none';
    }
    if (e.target === feePopup) {
        feePopup.style.display = 'none';
    }

    if (e.target === SplitPopup) {
        SplitPopup.style.display = 'none';
    }
});

// Event listeners for form submission
document.getElementById('stock-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(); // Create a new FormData object

    // Add form fields to the FormData object
    formData.append('ticker', document.getElementById('stock-ticker').value);
    formData.append('amountOfShares', parseFloat(document.getElementById('stock-amount').value));
    formData.append('investAmount', parseFloat(document.getElementById('stock-price').value));
    formData.append('date', document.getElementById('stock-date').value);
    formData.append('token', token); // Assuming UserID is always 1

    // Send PUT request using fetch API
    fetch(`http://${serverIP}/holdings/addHolding`, {
        method: 'PUT',
        body: formData, // Use FormData as the body
    })
        .then(response => {
            if (response.ok) {
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log(data); // Handle response data
            // Show visual confirmation
            showConfirmationMessage();
            // Close the pop-up window if needed
            stockPopup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


document.getElementById('dividend-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(); // Create a new FormData object

    // Add form fields to the FormData object
    formData.append('ticker', document.getElementById('dividend-ticker').value);
    formData.append('amount', parseFloat(document.getElementById('dividend-amount').value));
    formData.append('date', document.getElementById('dividend-date').value);
    formData.append('token', token); // Assuming UserID is always 1

    // Send PUT request using fetch API
    fetch(`http://${serverIP}/dividends/AddDividend`, {
        method: 'PUT',
        body: formData, // Use FormData as the body
    })
        .then(response => {
            if (response.ok) {
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log(data); // Handle response data
            // Show visual confirmation
            showConfirmationMessage();
            // Close the pop-up window if needed
            dividendPopup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


document.getElementById('fee-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(); // Create a new FormData object

    // Add form fields to the FormData object
    formData.append('amount', parseFloat(document.getElementById('fee-amount').value));
    formData.append('date', document.getElementById('fee-date').value);
    formData.append('token', token); // Assuming UserID is always 1

    // Send PUT request using fetch API
    fetch(`http://${serverIP}/managementFee/AddManagmentFee`, {
        method: 'PUT',
        body: formData, // Use FormData as the body
    })
        .then(response => {
            if (response.ok) {
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log(data); // Handle response data
            // Show visual confirmation
            showConfirmationMessage();
            // Close the pop-up window if needed
            feePopup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Event listener for split/unsplit form submission
document.getElementById('split-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(); // Create a new FormData object

    // Add form fields to the FormData object
    formData.append('ticker', document.getElementById('split-ticker').value);
    formData.append('before', parseFloat(document.getElementById('split-before').value));
    formData.append('after', parseFloat(document.getElementById('split-after').value));
    formData.append('token', token); // Assuming UserID is always 1

    // Send PUT request using fetch API
    fetch(`http://${serverIP}/holdings/SplitUnsplit`, {
        method: 'PUT',
        body: formData, // Use FormData as the body
    })
        .then(response => {
            if (response.ok) {
                // Show visual confirmation
                showConfirmationMessage("Stock split/unsplit successfully.");
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            // Close the pop-up window
            document.getElementById('split-popup').style.display = 'none';
        });
});
function showConfirmationMessage(message) {
    const modal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.textContent = message;
    modal.style.display = 'block';

    // Close the modal when clicking on the close button or outside the modal
    const closeButton = document.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}
function resetForm(formId) {
    document.getElementById(formId).reset();
}

// Add event listener to the split/unsplit button






// Calculate total daily change
function calculateTotalDailyChange(data) {
    const totalDailyProfit = data.reduce((acc, curr) => acc + parseFloat(curr.dailyProfit), 0);
    const currentWorth = data.reduce((acc, curr) => acc + parseFloat(curr.currentWorth), 0);
    const totalDailyChange = (totalDailyProfit / (currentWorth - totalDailyProfit)) * 100;
    return totalDailyChange.toFixed(2); // Limit to 2 decimal places
}




