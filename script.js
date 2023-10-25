// Fetch the JSON file.
const url = 'dump1090-fa/3.json';
fetch(url)
  .then(response => response.json())
  .then(data => {
    // Check if the data variable is an array.
    if (!Array.isArray(data)) {
      // Convert the data variable to an array.
      data = Array.from(data);
    }

    // Calculate the wind speed and wind direction for each row of data.
    const windData = calculateWindSpeedAndDirection(data);

    // Log the windData variable to the console.
    console.log(windData);

    // Parse the data for the Chart.js library.
    const parsedData = Chart.parseData(windData)|| [];

    // Update the chart datasets.
    chart.data.labels = parsedData.labels;
    chart.data.datasets[0].data = parsedData.datasets[0].data;
    chart.data.datasets[1].data = parsedData.datasets[1].data;

    // Update the chart.
    chart.update();
  });

// Calculate the wind speed and wind direction for each row of data.
function calculateWindSpeedAndDirection(data) {
  data.forEach(row => {
    row.ws = Math.sqrt(Math.pow(row.tas - row.gs, 2) + 4 * row.tas * row.gs * Math.pow(Math.sin((row.hdg - row.trk) / 2), 2));
    row.wd = row.trk + Math.atan2(row.tas * Math.sin(row.hdg - row.trk), row.tas * Math.cos(row.hdg - row.trk) - row.gs);

    // Fix the wind direction if it is negative or greater than 360 degrees.
    if (row.wd < 0) {
      row.wd += 2 * Math.PI;
    }
    if (row.wd > 2 * Math.PI) {
      row.wd -= 2 * Math.PI;
    }

    // Convert the wind direction from radians to degrees.
    row.wd = (180 / Math.PI) * row.wd;

    // Calculate the oat and tat.
    row.oat = Math.pow((row.tas / 661.47 / row.mach), 2) * 288.15 - 273.15;
    row.tat = -273.15 + (row.oat + 273.15) * (1 + 0.2 * row.mach * row.mach);
  });

  // Filter out rows with invalid data.
  data = data.filter(row => row.mach > 0.4 && row.oat > -65 && row.ws < 30);

  return data;
}

// Create a new chart.
const chart = new Chart('chart', {
  type: 'scatter',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperature',
      data: [],
      backgroundColor: 'red'
    }, {
      label: 'Wind Speed',
      data: [],
      backgroundColor: 'blue'
    }]
  },
  options: {
    title: 'Vertical Atmospheric Structure',
    xAxis: {
      label: 'Temperature (°C)'
    },
    yAxis: {
      label: 'Altitude (km)'
    }
  }
});