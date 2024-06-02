// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
    authDomain: "reto-estadioazteca.firebaseapp.com",
    projectId: "reto-estadioazteca",
    storageBucket: "reto-estadioazteca.appspot.com",
    messagingSenderId: "378312513144",
    appId: "1:378312513144:web:1c80ba54d21c63529c3f8d",
    databaseURL: "https://reto-estadioazteca-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the database
var database = firebase.database();

// Function to fetch and display data
function fetchData(data) {
    var tbody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear existing rows

    for (var tap in data) {
        for (var palco in data[tap]) {
            var lastAmbiental = getLastReading(data[tap][palco]['lecturas_ambientales']);
            var lastElectrica = getLastReading(data[tap][palco]['lecturas_electricas']);

            var row = tbody.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            cell1.innerHTML = tap;
            cell2.innerHTML = palco;

            // Wrap text in spans and apply styles
            cell3.innerHTML = `<span class="${data[tap][palco]['estado_pago'] === "no pagado" ? 'no-pagado' : data[tap][palco]['estado_pago'] === "pagado" ? 'pagado' : ''}">${data[tap][palco]['estado_pago']}</span>`;
            cell4.innerHTML = `<span class="${data[tap][palco]['estado_servicio'] === "inactivo" ? 'inactivo' : data[tap][palco]['estado_servicio'] === "activo" ? 'activo' : ''}">${data[tap][palco]['estado_servicio']}</span>`;

            cell5.innerHTML = formatAmbientalReading(lastAmbiental);
            cell6.innerHTML = formatElectricaReading(lastElectrica);
        }
    }
}



// Function to get the last reading from a set of readings
function getLastReading(readings) {
    if (!readings) return null;
    var lastKey = Object.keys(readings).sort().pop();
    return readings[lastKey];
}

// Function to format the environmental reading for display with gauges
function formatAmbientalReading(reading) {
    if (!reading) return '';
    const co2Color = getCO2Color(reading.co2);
    const temperatureColor = getTemperatureColor(reading.temperatura);

    const ambientalHtml = `
    <div style="display: flex; justify-content: space-between; width: 100%; border: none; padding: 0; margin: 0;">
        <div class="gauge" style="padding: 0; margin: 0;">
            <div style="text-align: center; color: white; font-size: 20px; margin-bottom: 0;">CO2</div>
            <div class="gauge__body">
                <div class="gauge__fill" style="background: ${co2Color}; transform: rotate(${Math.round(reading.co2) / (100000* 2)}turn)"></div>
                <div class="gauge__cover">${Math.round(reading.co2)} ppm</div>
            </div>
        </div>
        <div class="gauge" style="padding: 0; margin: 0;">
            <div style="text-align: center; color: white; font-size: 20px; margin-bottom: 0;">Temperature</div>
            <div class="gauge__body">
                <div class="gauge__fill" style="background: ${temperatureColor}; transform: rotate(${Math.round(reading.temperatura) / (50* 2)}turn)"></div>
                <div class="gauge__cover">${Math.round(reading.temperatura)} °C</div>
            </div>
        </div>
    </div>
    <div style="margin-top: 10px; text-align: center;">
        Presencia: <span class="${reading.presencia === 'detectada' ? 'detectada' : 'no-detectada'}">${reading.presencia}</span>
    </div>
    `;
    return ambientalHtml;
}


function getCO2Color(co2) {
    if (co2 < 1000) return "green";
    else if (co2 < 2000) return "yellow";
    else if (co2 < 5000) return "orange";
    else if (co2 < 50000) return "red";
    else return "purple"; // Extreme case
}

function getTemperatureColor(temperature) {
    if (temperature < 13) return "lightblue";
    else if (temperature < 25) return "green";
    else if (temperature < 36) return "yellow";
    else if (temperature < 40) return "orange";
    else return "red"; // High temperature
}




// Function to format the electrical reading for display with compact gauges
function formatElectricaReading(reading) {
    if (!reading) return '';
    const voltageColor = getVoltageColor(reading.voltaje);
    const currentColor = getCurrentColor(reading.corriente);

    const gaugeHtml = `
    <div style="display: flex; justify-content: space-between; width: 100%; border: none; padding: 0; margin: 0;">
        <div class="gauge" id="voltage">
            <div style="text-align: center; color: white; font-size: 20px; margin-bottom: 0;">Voltage</div>
            <div class="gauge__body">
                <div class="gauge__fill" style="background: ${voltageColor}; transform: rotate(${Math.round(reading.voltaje) / (150* 2)}turn)"></div>
                <div class="gauge__cover">${Math.round(reading.voltaje)} V</div>
            </div>
        </div>

        <div class="gauge" id="current">
            <div style="text-align: center; color: white; font-size: 20px; margin-bottom: 0;">Current</div>
            <div class="gauge__body">
                <div class="gauge__fill" style="background: ${currentColor}; transform: rotate(${Math.round(reading.corriente) / (20* 2)}turn)"></div>
                <div class="gauge__cover">${Math.round(reading.corriente)} A</div>
            </div>
        </div>
    </div>
    `;
    return gaugeHtml;
}

function getVoltageColor(voltage) {
    if (voltage < 100) return "red";
    else if (voltage <= 121) return "yellow";
    else if (voltage <= 132) return "green";
    else if (voltage <= 140) return "yellow";
    else return "red";
}

function getCurrentColor(current) {
    return current > 15 ? "red" : "#009578";  // Assume green is the safe color
}





// Listen for changes in the database
database.ref().on('value', function(snapshot) {
    var data = snapshot.val();
    console.log('Data updated:', data);  // Debugging log
    fetchData(data);
});

// Call fetchData on page load
window.onload = function() {
    database.ref().once('value', function(snapshot) {
        var data = snapshot.val();
        fetchData(data);
    });
}








const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});