let serverIP = "192.168.1.23:8080";


document.addEventListener("DOMContentLoaded", function() {
    const stockBody = document.getElementById("stockBody");
    const tipBox = document.getElementById("tip");
    const refreshButton = document.getElementById("refreshButton");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const chartsContainer = document.getElementById("chartsContainer");

    // Function to sort table by column index
    function sortTable(colIndex) {
        const rows = Array.from(stockBody.querySelectorAll("tr"));
        const sortedRows = rows.slice(1).sort((a, b) => {
            const aValue = a.children[colIndex].textContent.trim();
            const bValue = b.children[colIndex].textContent.trim();
            return aValue.localeCompare(bValue);
        });
        stockBody.innerHTML = "";
        stockBody.appendChild(rows[0]);
        sortedRows.forEach(row => stockBody.appendChild(row));
    }

    if (stockBody && tipBox && refreshButton && searchButton && searchInput) {
        // Add event listener to search button
        searchButton.addEventListener("click", function() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const rows = Array.from(stockBody.querySelectorAll("tr"));
            let found = false;
            rows.forEach(row => {
                const ticker = row.children[0].textContent.trim().toLowerCase();
                if (ticker.includes(searchTerm)) {
                    row.style.display = "table-row";
                    found = true;
                    // Display chart for the searched stock
                    createTradingViewWidget("chart1", ticker.toUpperCase());
                    document.getElementById("chart2").style.display = 'none';
                } else {
                    row.style.display = "none";
                }
            });

            // Hide or show the chart based on the search result
            if (found) {
                chartsContainer.style.display = 'flex';
            } else {
                chartsContainer.style.display = 'none';
            }
        });
    }

    if (stockBody && tipBox && refreshButton) {
        // Load saved data from cookies if available
        let savedData = localStorage.getItem('stockData');
        let parsedData;
        if (savedData) {
            try {
                parsedData = JSON.parse(savedData);
            } catch (error) {
                console.error("Error parsing saved data:", error);
                parsedData = [];
            }
            displayData(parsedData);
            createCharts(parsedData); // Create charts using data from cookies
        } else {
            // Display message if no saved data found
            tipBox.textContent = "No saved data found. Click 'Refresh Data' to fetch from the API.";
        }

        // Add event listener to refresh button
        refreshButton.addEventListener("click", function() {
            fetchData();
        });

        // Function to fetch data from API
        function fetchData() {
            const token = localStorage.getItem('token');
            const apiUrl = `http://${serverIP}/holdings/getSMA?token=${token}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    // Transform data into the expected format
                    data.sort((a, b) => (a[2] / a[1] - b[2] / b[1])).reverse();
                    const transformedData = data.map(stock => ({ name: stock[0], gapPercentage: ((stock[1] / stock[2]) - 1) * 100 }));

                    // Clear existing table content
                    stockBody.innerHTML = "";

                    // Save data to local storage
                    localStorage.setItem('stockData', JSON.stringify(transformedData));

                    // Display data
                    displayData(transformedData);

                    // Create charts using newly fetched data
                    createCharts(transformedData);
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    tipBox.textContent = "Error fetching data. Please try again later.";
                });
        }

        // Function to display data in the table
        function displayData(data) {
            stockBody.innerHTML = ""; // Clear existing table content

            data.forEach((stock, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${stock.name}</td>
                    <td>${stock.gapPercentage.toFixed(2)}%</td>
                `;
                stockBody.appendChild(row);
            });
        }

        // Function to create charts
        function createCharts(data) {
            const symbols = [];
            data.slice(0, 2).forEach(stock => {
                symbols.push(stock.name);
            });

            symbols.forEach((symbol, index) => {
                createTradingViewWidget(`chart${index + 1}`, symbol);
            });
        }

        // Function to generate TradingView chart for a given symbol and chart ID
        function createTradingViewWidget(containerId, symbol) {
            new TradingView.widget({
                "container_id": containerId,
                "autosize": true,
                "symbol": symbol,
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "hide_side_toolbar": false,
                "allow_symbol_change": true,
                "details": true,
                "hotlist": true,
                "calendar": true,
                "studies": [
                    "MASimple@tv-basicstudies"
                ]
            });
        }
    }
});
