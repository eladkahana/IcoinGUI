
var chartInstance;
function calculateDCA() {
    // Clear previous chart instance
    if (chartInstance) {
        chartInstance.destroy();
    }

    var initialAmount = parseFloat(document.getElementById("initialAmount").value);
    var percentageChange = parseFloat(document.getElementById("percentageChange").value) / 100;
    var numPeriods = parseInt(document.getElementById("numPeriods").value);
    var additionalInvestment = parseFloat(document.getElementById("additionalInvestment").value);

    var chartContainer = document.querySelector(".chart-container");
    var chart = document.getElementById("dcaChart");

    document.getElementById("dcaDataTable").style.display = "block";

    // Clear previous table data
    document.getElementById("dcaDataTable").innerHTML = "";

    // Decrease the canvas size
    chart.width = 400; // Adjust the width as needed
    chart.height = 200; // Adjust the height as needed

    var cumulativeAmount = initialAmount;
    var labels = [];
    var data = [];
    var tableData = "<table><tr><th>Period</th><th>Cumulative Amount</th></tr>";

    for (var i = 1; i <= numPeriods; i++) {
        cumulativeAmount += cumulativeAmount * percentageChange + additionalInvestment;
        labels.push("Period " + i);
        data.push(cumulativeAmount.toFixed(2));
        tableData += "<tr><td>Period " + i + "</td><td>$" + cumulativeAmount.toFixed(2) + "</td></tr>";
    }

    var ctx = chart.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Amount',
                data: data,
                backgroundColor: 'rgba(23, 162, 184, 0.2)',
                borderColor: 'rgba(23, 162, 184, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    document.getElementById("dcaDataTable").innerHTML = tableData + "</table>";
}




function queryDCA(type) {
    var queryAmount = parseFloat(document.getElementById("queryAmount").value);
    var doubleXTimes = parseInt(document.getElementById("doubleXTimes").value);

    var initialAmount = parseFloat(document.getElementById("initialAmount").value);
    var percentageChange = parseFloat(document.getElementById("percentageChange").value) / 100;
    var additionalInvestment = parseFloat(document.getElementById("additionalInvestment").value);

    if (type === "amount") {
        var periods = 0;
        var cumulativeAmount = initialAmount;

        while (cumulativeAmount < queryAmount) {
            cumulativeAmount += cumulativeAmount * percentageChange + additionalInvestment;
            periods++;
        }

        var queryResult = document.getElementById("queryResultAmount");
        queryResult.innerHTML = "To reach $" + queryAmount.toFixed(2) + ", it will take " + periods + " time periods.";
    } else if (type === "doubles") {

        var periods = 0;
        var cumulativeAmount = initialAmount;
        queryAmount = cumulativeAmount * doubleXTimes;

        while (cumulativeAmount < queryAmount) {
            cumulativeAmount += cumulativeAmount * percentageChange + additionalInvestment;
            periods++;
        }
        var queryResult = document.getElementById("queryResultDoubles");
        queryResult.innerHTML = "To double " + doubleXTimes + " times from the initial investment, it will take " + periods + " time periods.";
    }
}

function calculateCompoundInterest() {
    var initialAmountCI = parseFloat(document.getElementById("initialAmountCI").value);
    var percentageChangeCI = parseFloat(document.getElementById("percentageChangeCI").value) / 100;
    var percentageChangeCIStep2 = parseFloat(document.getElementById("percentageChangeCIStep2").value) / 100;

    var finalAmount = initialAmountCI * (1 + percentageChangeCI) * (1 + percentageChangeCIStep2);

    var output = "<p>Final Amount after compound interest: $" + finalAmount.toFixed(2) + "</p>";

    document.getElementById("outputCI").innerHTML = output;
}
