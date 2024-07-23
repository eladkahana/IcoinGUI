
let token = localStorage.getItem('token');
let serverIP = "192.168.1.23:8080";

document.addEventListener("DOMContentLoaded", function() {
    // Check if portfolio data exists in local storage
    let portfolioDataGeneral = JSON.parse(localStorage.getItem('portfolioData')) || [];
    let HistoryDate = JSON.parse(localStorage.getItem('HistoryData')) || [];


    // Transform the portfolio data into the format expected by the chart rendering functions
    const portfolioData = portfolioDataGeneral.map(item => ({
        label: item.ticker,
        value: parseFloat(item.currentWorth) || 0 // Handle potential NaN issues
    }));

    // Assuming dividends represent the dividends earned from each stock
    const dividendsData = portfolioDataGeneral.map(item => ({
        label: item.ticker,
        value: parseFloat(item.dividends) || 0 // Handle potential NaN issues
    }));

    // Function to get the month and year from a date string
    function getMonthYear(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // Month is zero-based
        const year = date.getFullYear();
        return `${year}-${month}`; // Return year-month format
    }

// Find the first existing month
    const firstMonthYear = getMonthYear(HistoryDate[0].date);
    const currentMonthYear = getMonthYear(new Date().toISOString());

// Generate labels for each month starting one month before the first existing month
    const labels = [];
    const [firstYear, firstMonth] = firstMonthYear.split('-').map(Number);
    const [currentYear, currentMonth] = currentMonthYear.split('-').map(Number);
    for (let year = firstYear; year <= currentYear; year++) {
        const startMonth = year === firstYear ? firstMonth - 1 : 1;
        const endMonth = year === currentYear ? currentMonth : 12;
        for (let month = startMonth; month <= endMonth; month++) {
            if (month === 0) {
                year--;
                month = 12;
            }
            labels.push(`${year}-${month}`);
        }
    }

// Group investments by month
    const investmentsByMonth = HistoryDate.reduce((acc, item) => {
        const monthYear = getMonthYear(item.date);
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(parseFloat(item.initialInvest)); // Parse as float
        return acc;
    }, {});

// Calculate cumulative sum for each month
    let cumulativeSum = 0;
    const portfolioOverTimeData = labels.map(monthYear => {
        const investments = investmentsByMonth[monthYear] || [];
        const sum = investments.reduce((total, investment) => total + investment, 0);
        cumulativeSum += sum;
        return {
            date: monthYear,
            value: parseFloat(cumulativeSum.toFixed(2)) // Fix to 2 decimal places
        };
    });



    function totalChart(){
        // Initialize arrays to store data
        const barData = [];
        const lineData = [];

        // Extract data for bar chart (overallReturn)
        portfolioDataGeneral.forEach(item => {
            barData.push(parseFloat(item.overallReturn) || 0);
        });

        // Extract data for line chart (generalProfit)
        portfolioDataGeneral.forEach(item => {
            lineData.push(parseFloat(item.generalProfit)|| 0);
        });

        // Extract tickers for x-axis labels
        const xLabels = portfolioDataGeneral.map(item => item.ticker);

        // Render combined bar and line chart
        const options = {
            chart: {
                type: 'line', // Use line chart as the base type
                stacked: false // Disable stacking for multi-series
            },
            series: [
                {
                    name: 'Overall Return', // Bar series
                    type: 'bar', // Bar type
                    data: barData // Bar data
                },
                {
                    name: 'General Profit', // Line series
                    type: 'line', // Line type
                    data: lineData // Line data
                }
            ],
            xaxis: {
                categories: xLabels // X-axis categories
            },
            yaxis: [
                {
                    seriesName: 'Overall Return',
                    opposite: true, // Align y-axis to the right for bar series
                },
                {
                    seriesName: 'General Profit',
                }
            ],
            plotOptions: {
                bar: {
                    columnWidth: '50%', // Adjust the width of the bars (50% means half the width of the available space)
                }
            }
        };

        const chart = new ApexCharts(document.querySelector("#total-chart"), options);
        chart.render();
    }





    function ManagementTable() {
        fetch(`http://${serverIP}/managementFee/GetManagmentFee?token=${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const portfolioData = data.map(entry => ({
                    date: entry[0] || 'Date',
                    amount: parseFloat(entry[1]).toFixed(2)
                }));

                const managementFeeData = portfolioData.map((item, index) => ({
                    x: item.date || `Date ${index}`,
                    y: parseFloat(item.amount) || 0
                }));

                renderBarChart(managementFeeData, 'management-fee-by-date');
                localStorage.setItem('management', JSON.stringify(portfolioData));
            })
            .catch(error => {
                console.error('Error fetching or processing data:', error);
                // Handle the error, whether by displaying a message to the user or by other means.
            });
    }




    // Function to render treemap chart
    const treeMapData = portfolioDataGeneral.map(item => ({
        x: item.ticker,
        y: parseFloat(item.currentWorth) || 0,
        z: parseFloat(item.dailyChange) || 0
    }));

    // Function to render treemap chart
    function renderTreeMapChart(data, containerId) {
        // Extract z values from data
        const zValues = data.map(item => item.z);

        // Find the minimum and maximum values of z
        const minZ =  Math.min(...zValues); // Minimum value
        const maxZ =  Math.max(...zValues); // Maximum value

        // Color scale based on z values
        const colorScale = [];

        function getColor(z) {
            let myColor; // Declare myColor variable outside the if-else block
            const position = z > 0 ? z / maxZ : z / minZ; // Simplify calculation and avoid repetitive code

            if (z > 0) {
                myColor = { r: 0, g: Math.abs(position * 100), b: 0 }; // Adjusted green color calculation
            } else {
                myColor = { r: Math.abs(position * 100), g: 0, b: 0 }; // Adjusted red color calculation
            }

            return `RGB(${myColor.r}%, ${myColor.g}%, ${myColor.b}%)`; // Convert to string representation
        }

        data.forEach(item => {
            colorScale.push(getColor(item.z)); // Push the color for each item in data
        });

        // Chart options
        const options = {
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px',
                },
                formatter: function (text, op) {
                    return [text, op.value]
                },
                offsetY: -4
            },
            chart: {
                type: 'treemap'
            },
            series: [{
                data: data
            }],
            plotOptions: {
                treemap: {
                    distributed: true,
                    enableShades: false
                }
            },
            colors: colorScale, // Setting colors for legend, if needed
            title: {
                text: 'TreeMap - Current Worth vs. Daily Change %'
            }
        };

        const chart = new ApexCharts(document.getElementById(containerId), options);
        chart.render();
    }

    // Function to render pie chart
    function renderPieChart(data, containerId) {
        const options = {
            chart: {
                type: 'pie'
            },
            series: data.map(item => item.value),
            labels: data.map(item => item.label),
        };

        const chart = new ApexCharts(document.getElementById(containerId), options);
        chart.render();
    }

    // Function to render bar chart
    function renderBarChart(data, containerId) {
        const options = {
            chart: {
                type: 'bar'
            },
            series: [{
                name: 'Value',
                data: data.map(item => item.y)
            }],
            xaxis: {
                categories: data.map(item => item.x)
            }
        };

        const chart = new ApexCharts(document.getElementById(containerId), options);
        chart.render();
    }


    // Function to render line chart
    function renderLineChart(data, containerId) {
        const options = {
            chart: {
                type: 'line'
            },
            series: [{
                name: 'Value', // Adjusted the series name
                data: data.map(item => item.value) // Use the value property for cumulative sum
            }],
            xaxis: {
                categories: data.map(item => item.date)
            }
        };

        const chart = new ApexCharts(document.getElementById(containerId), options);
        chart.render();
    }

    function fetchDividendsData() {
        fetch(`http://${serverIP}/dividends/AllDividends?token=${token}`)
            .then(response => response.json())
            .then(data => {
                const processedData = data.map(entry => ({
                    quarter: entry[0],
                    amount: parseFloat(entry[1].toFixed(2)),
                    stockCount: entry[2]
                }));

                renderDividendsChart(processedData);
            })
            .catch(error => console.error('Error fetching dividends data:', error));
    }

    // Function to render dividends chart
    function renderDividendsChart(data) {
        const options = {
            chart: {
                height: 350,
                type: 'line',
                stacked: false
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [1]
            },
            series: [
                {
                    name: 'Dividend Amount',
                    type: 'column',
                    data: data.map(item => item.amount)
                },
                {
                    name: 'Number of Companies',
                    type: 'line',
                    data: data.map(item => item.stockCount)
                }
            ],
            xaxis: {
                categories: data.map(item => item.quarter)
            },
            yaxis: [
                {
                    title: {
                        text: 'Dividend Amount'
                    },
                    labels: {
                        formatter: function (value) {
                            return "$" + value.toFixed(2);
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Number of Companies'
                    }
                }
            ],
            tooltip: {
                shared: true,
                intersect: false
            },
            title: {
                text: 'Dividends Over Time',
                align: 'center'
            }
        };

        const chart = new ApexCharts(document.getElementById('dividends-chart'), options);
        chart.render();
    }


    // Render charts
    renderPieChart(portfolioData, 'portfolio-pie-chart');
    renderPieChart(dividendsData, 'dividends-by-stock');
    renderLineChart(portfolioOverTimeData, 'portfolio-over-time');
    renderTreeMapChart(treeMapData, 'heat-map');
    ManagementTable();
    totalChart();
    fetchDividendsData();



    let totalworth = 0;
    let totalinvest = 0;
    let managementData = JSON.parse(localStorage.getItem('management')) || [];

    portfolioDataGeneral.forEach(item => {
        totalworth += parseFloat(item.currentWorth) ;
        totalinvest += parseFloat(item.entryAmount);
    });
    totalSum = totalworth-totalinvest;

    // Update Invested Amount

// Update Invested Amount
    document.querySelector('.info-card:nth-child(1) p').textContent = "$" + totalinvest.toFixed(2);

    let totalDividends = 0;
    portfolioDataGeneral.forEach(item => {
        totalDividends += parseFloat(item.dividends);
    });

// Update Total Dividends
    document.querySelector('.dividends-section .info-card p').textContent = "$" + totalDividends.toFixed(2);

    let totalFee = 0;
    managementData.forEach(item => {
        totalFee += parseFloat(item.amount);
    });

// Update Management Fee Amount
    document.querySelector('.fees-section .info-card p').textContent = "$" + totalFee.toFixed(2);

    const firstInvest = new Date(HistoryDate[0].date); // Assuming HistoryDate is an array of objects with 'date' property
    const today = new Date();

// Calculating the difference in months
    const months = (today.getFullYear() - firstInvest.getFullYear()) * 12 + (today.getMonth() - firstInvest.getMonth());

// Update Months from First Investment
    document.querySelector('.info-card:nth-child(2) p').textContent = months;

    const totalPerformance = ((totalworth / totalinvest) - 1) * 100;

    const averagePerformance = (Math.pow(1 + totalPerformance / 100, 1 / months) - 1) * 100;

// Update Average Performance per Month
    document.querySelector('.info-card:nth-child(3) p').textContent = '%' + averagePerformance.toFixed(2);

// Update Total Revenue
    document.querySelector('.info-card:nth-child(4) p').textContent = "$" + totalSum.toFixed(2);

// Update Total Performance
    document.querySelector('.info-card:nth-child(5) p').textContent = '%' + totalPerformance.toFixed(2);

// Update Portfolio Worth
    document.querySelector('.info-card:nth-child(6) p').textContent = '$' + totalworth.toFixed(2);



// Add event listeners to expand buttons
    const expandBtns = document.querySelectorAll('.expand-btn');
    const modal = document.querySelector('.modal');
    const closeBtn = document.querySelector('.close-btn');

    expandBtns.forEach(btn => {
        btn.addEventListener('click', expandChart);
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function expandChart(event) {
        const chartContainer = event.target.closest('.chart-container');
        const chartId = chartContainer.id;
        console.log(`Expanding chart with ID: ${chartId}`); // Debug log
        const chartTitle = chartContainer.querySelector('h3').textContent;

        const expandedChart = document.getElementById('expanded-chart');
        expandedChart.innerHTML = '<div id="expanded-chart-canvas"></div>';

        renderExpandedChart(chartId, 'expanded-chart-canvas', chartTitle);

        modal.style.display = 'block';
    }

    function renderExpandedChart(originalChartId, targetId, title) {
        const originalChart = ApexCharts.getChartByID(originalChartId);
        if (!originalChart) {
            console.error(`ApexCharts instance not found for the original chart with ID: ${originalChartId}`);
            return;
        }

        const originalOptions = originalChart.opts;

        const expandedOptions = {
            ...originalOptions,
            chart: {
                ...originalOptions.chart,
                height: 400,
                width: '100%'
            },
            title: {
                ...originalOptions.title,
                text: title
            }
        };

        const expandedChart = new ApexCharts(document.getElementById(targetId), expandedOptions);
        expandedChart.render();
    }

// Dark mode toggle
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
    });




});


