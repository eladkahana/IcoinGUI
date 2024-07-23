// Retrieve selectedTicker, selectedDailyChange, and selectedDividend from localStorage

let token = localStorage.getItem('token');
let serverIP = "192.168.1.23:8080";


const selectedTicker = localStorage.getItem("selectedTicker") || "";
const selectedDailyChange = parseFloat(localStorage.getItem("selectedDailyChange")) || 0;
const selectedDividend = parseFloat(localStorage.getItem("selectedDividend")) || 0;

document.addEventListener("DOMContentLoaded", function() {
    const portfolioData = [];

    function populatePortfolioTable(data) {
        const tbody = document.querySelector("#portfolio-table tbody");
        tbody.innerHTML = "";
        data.forEach(item => {
            const row = `
                <tr>
                    <td>${item.date}</td>
                    <td>$${item.entryAmount}</td>
                    <td>${item.shares}</td>
                    <td>$${item.currentWorth}</td>
                    <td>$${item.dailyProfit.toFixed(2)}</td>
                    <td>${item.generalProfit}%</td>
                    <td>$${item.overallReturn}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    async function fetchDataAndUpdateTable() {
        try {
            const response = await fetch(`http://${serverIP}/holdings/TickerOverview?token=${token}&ticker=${selectedTicker}`);
            const data = await response.json();

            portfolioData.length = 0;
            data.forEach(entry => {
                const date = entry[0];
                const entryAmount = parseFloat(entry[1]).toFixed(2);
                const shares = parseFloat(entry[2]).toFixed(5);
                const currentWorth = parseFloat(entry[3]).toFixed(2);
                const dailyProfit = selectedDailyChange * currentWorth / 100;
                const generalProfit = parseFloat(entry[4]).toFixed(2);
                const overallReturn = parseFloat(entry[5]).toFixed(2);

                portfolioData.push({
                    date,
                    entryAmount,
                    shares,
                    currentWorth,
                    dailyProfit,
                    generalProfit,
                    overallReturn,
                });
            });

            populatePortfolioTable(portfolioData);
            console.log("Data fetched and updated successfully.");
        } catch (error) {
            console.error('Error fetching data:', error);
            const errorElement = document.createElement("p");
            errorElement.textContent = "Error fetching data. Please try again later.";
            document.querySelector("#portfolio-summary").appendChild(errorElement);
        }
    }

    async function fetchDividendData() {
        try {
            const response = await fetch(`http://${serverIP}/dividends/DividendHistory?token=${token}&ticker=${selectedTicker}`);
            const dividendData = await response.json();
            renderDividendChart(dividendData);
        } catch (error) {
            console.error('Error fetching dividend data:', error);
        }
    }

    function renderDividendChart(data) {
        const ctx = document.getElementById('dividend-chart').getContext('2d');
        const labels = data.map(entry => entry[0]);
        const values = data.map(entry => entry[1]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dividend per Quarter ($)',
                    data: values,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        'rgba(75, 192, 192, 0.4)',
                        'rgba(54, 162, 235, 0.4)',
                        'rgba(255, 206, 86, 0.4)',
                        'rgba(75, 192, 192, 0.4)',
                        'rgba(153, 102, 255, 0.4)',
                        'rgba(255, 159, 64, 0.4)',
                        'rgba(255, 99, 132, 0.4)',
                        'rgba(54, 162, 235, 0.4)',
                        'rgba(255, 206, 86, 0.4)',
                        'rgba(75, 192, 192, 0.4)'
                    ],
                    hoverBorderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '$' + context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    fetchDataAndUpdateTable();
    fetchDividendData();

    document.getElementById('header-title').innerText = selectedTicker;

    const dailyChangeCardValue = document.querySelector('#daily-change-card p');
    dailyChangeCardValue.textContent = selectedDailyChange.toFixed(2) + '%';

    const dividendsCardValue = document.querySelector('#dividends-card p');
    dividendsCardValue.textContent = selectedDividend.toFixed(2) + '$';

    const dividendsCard = document.getElementById('dividends-card');
    const dividendChartContainer = document.getElementById('dividend-chart-container');

    dividendsCard.addEventListener('mouseenter', () => {
        dividendsCard.classList.add('expanded');
        dividendChartContainer.style.maxHeight = 'none';
    });
    dividendsCard.addEventListener('mouseleave', () => {
        dividendChartContainer.style.maxHeight = null;
        dividendsCard.classList.remove('expanded');
    });
});

document.addEventListener("DOMContentLoaded", function() {
    function initializeTradingView(symbol) {
        new TradingView.widget({
            "container_id": "basic-area-chart-demo",
            "width": "100%",
            "height": "100%",
            "autosize": true,
            "symbol": symbol,
            "interval": "D",
            "timezone": "exchange",
            "theme": "light",
            "style": "3",
            "hide_top_toolbar": true,
            "save_image": false,
            "locale": "en"
        });
    }

    initializeTradingView(selectedTicker);
});

document.getElementById("back-button").addEventListener("click", function() {
    window.history.back();
});
