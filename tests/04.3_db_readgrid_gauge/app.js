import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
    authDomain: "reto-estadioazteca.firebaseapp.com",
    projectId: "reto-estadioazteca",
    storageBucket: "reto-estadioazteca.appspot.com",
    messagingSenderId: "378312513144",
    appId: "1:378312513144:web:1c80ba54d21c63529c3f8d",
    databaseURL: "https://reto-estadioazteca-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const container = document.querySelector('.grid-container');

// Store the last values of the gauges
const lastValues = {};

function applyBooleanStyle(value, type) {
    if (type === 'presencia') {
        return value ? '<span class="boolean-true">Sí</span>' : '<span class="boolean-false">No</span>';
    }
    return value ? '<span class="boolean-true">Activo</span>' : '<span class="boolean-false">Inactivo';
}

function toggleEstadoServicio(palcoId, currentState) {
    const newState = !currentState;
    const updates = {};
    updates[`/${palcoId}/estado_servicio`] = newState;
    update(ref(database), updates);
}

function createGauge(id) {
    const gauge = document.createElement('div');
    gauge.className = 'gauge';
    gauge.id = id;
    
    const gaugeBody = document.createElement('div');
    gaugeBody.className = 'gauge__body';
    
    const gaugeFill = document.createElement('div');
    gaugeFill.className = 'gauge__fill';
    gaugeFill.style.transition = 'transform 2s ease-in-out'; // Smooth animation
    
    const gaugeCover = document.createElement('div');
    gaugeCover.className = 'gauge__cover';
    
    gaugeBody.appendChild(gaugeFill);
    gaugeBody.appendChild(gaugeCover);
    gauge.appendChild(gaugeBody);

    return gauge;
}

function updateGauge(gauge, value, max_value, reading_type) {
    if (value < 0 || value > max_value) {
        return;
    }

    const fill = gauge.querySelector(".gauge__fill");
    fill.style.transition = 'transform 2s ease-in-out'; // Ensure transition is applied
    requestAnimationFrame(() => {
        fill.style.transform = `rotate(${value / (max_value * 2)}turn)`;
    });
    gauge.querySelector(".gauge__cover").textContent = `${Math.round(value)} ${reading_type}`;
}

function populateGrid(data) {
    container.innerHTML = `
        <div class="grid-header">Palco</div>
        <div class="grid-header">Tap</div>
        <div class="grid-header">Estado de Pago</div>
        <div class="grid-header">Estado de Servicio</div>
        <div class="grid-header">Lecturas Ambientales</div>
        <div class="grid-header">Lecturas Eléctricas</div>
    `;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const palco = `Palco: ${key.split(':')[1].trim()}`;
            const tap = `Tap: ${data[key].tap}`;
            const estadoPago = data[key].estado_pago ? '<span class="boolean-true">Pagado</span>' : '<span class="boolean-false">No pagado</span>';
            const estadoServicio = data[key].estado_servicio;

            const amb = data[key].lecturas_ambientales;
            const elec = data[key].lecturas_electricas;

            const latestAmbiental = Object.values(amb).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(amb)[0]);

            const latestElectrica = Object.values(elec).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(elec)[0]);

            const co2GaugeId = `gauge-co2-${key}`;
            const tempGaugeId = `gauge-temp-${key}`;
            const voltageGaugeId = `gauge-voltage-${key}`;
            const currentGaugeId = `gauge-current-${key}`;

            const co2Gauge = createGauge(co2GaugeId);
            const tempGauge = createGauge(tempGaugeId);
            const voltageGauge = createGauge(voltageGaugeId);
            const currentGauge = createGauge(currentGaugeId);

            container.innerHTML += `
                <div class="grid-item palco" id="palco-${key}">${palco}</div>
                <div class="grid-item tap" id="tap-${key}">${tap}</div>
                <div class="grid-item estadoPago" id="estadoPago-${key}">${estadoPago}</div>
                <div class="grid-item estadoServicio" id="estadoServicio-${key}">
                    ${applyBooleanStyle(estadoServicio)}<br>
                    <button onclick="toggleEstadoServicio('${key}', ${estadoServicio})">Toggle</button>
                </div>
                <div class="grid-item gauge-container" id="gauge-container-amb-${key}">
                    ${co2Gauge.outerHTML}
                    ${tempGauge.outerHTML}
                </div>
                <div class="grid-item gauge-container" id="gauge-container-elec-${key}">
                    ${voltageGauge.outerHTML}
                    ${currentGauge.outerHTML}
                </div>
            `;

            // Store initial values and update gauges
            lastValues[co2GaugeId] = latestAmbiental.co2;
            lastValues[tempGaugeId] = latestAmbiental.temperatura;
            lastValues[voltageGaugeId] = latestElectrica.voltage;
            lastValues[currentGaugeId] = latestElectrica.corriente;

            requestAnimationFrame(() => {
                updateGauge(document.getElementById(co2GaugeId), latestAmbiental.co2, 55000, 'ppm');
                updateGauge(document.getElementById(tempGaugeId), latestAmbiental.temperatura, 50, '°C');
                updateGauge(document.getElementById(voltageGaugeId), latestElectrica.voltage, 150, 'V');
                updateGauge(document.getElementById(currentGaugeId), latestElectrica.corriente, 30, 'A');
            });
        }
    }
}


function updateExistingGauges(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const elec = data[key].lecturas_electricas;
            const amb = data[key].lecturas_ambientales;

            const latestElectrica = Object.values(elec).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(elec)[0]);

            const latestAmbiental = Object.values(amb).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(amb)[0]);

            const voltageGaugeId = `gauge-voltage-${key}`;
            const currentGaugeId = `gauge-current-${key}`;
            const co2GaugeId = `gauge-co2-${key}`;
            const tempGaugeId = `gauge-temp-${key}`;

            const voltageGauge = document.getElementById(voltageGaugeId);
            const currentGauge = document.getElementById(currentGaugeId);
            const co2Gauge = document.getElementById(co2GaugeId);
            const tempGauge = document.getElementById(tempGaugeId);

            if (voltageGauge && currentGauge) {
                const lastVoltage = lastValues[voltageGaugeId] || 0;
                const lastCurrent = lastValues[currentGaugeId] || 0;

                lastValues[voltageGaugeId] = latestElectrica.voltage;
                lastValues[currentGaugeId] = latestElectrica.corriente;

                requestAnimationFrame(() => {
                    updateGauge(voltageGauge, lastVoltage, 150, 'V');
                    updateGauge(currentGauge, lastCurrent, 30, 'A');
                });

                requestAnimationFrame(() => {
                    updateGauge(voltageGauge, latestElectrica.voltage, 150, 'V');
                    updateGauge(currentGauge, latestElectrica.corriente, 30, 'A');
                });
            }

            if (co2Gauge && tempGauge) {
                const lastCo2 = lastValues[co2GaugeId] || 0;
                const lastTemp = lastValues[tempGaugeId] || 0;

                lastValues[co2GaugeId] = latestAmbiental.co2;
                lastValues[tempGaugeId] = latestAmbiental.temperatura;

                requestAnimationFrame(() => {
                    updateGauge(co2Gauge, lastCo2, 55000, 'ppm');
                    updateGauge(tempGauge, lastTemp, 50, '°C');
                });

                requestAnimationFrame(() => {
                    updateGauge(co2Gauge, latestAmbiental.co2, 55000, 'ppm');
                    updateGauge(tempGauge, latestAmbiental.temperatura, 50, '°C');
                });
            }

            const palco = `Palco: ${key.split(':')[1].trim()}`;
            const tap = `Tap: ${data[key].tap}`;
            const estadoPago = data[key].estado_pago ? '<span class="boolean-true">Pagado</span>' : '<span class="boolean-false">No pagado</span>';
            const estadoServicio = data[key].estado_servicio;

            const lecturasAmbientales = `CO2: ${latestAmbiental.co2} ppm, Temp: ${latestAmbiental.temperatura}°C, Presencia: ${applyBooleanStyle(latestAmbiental.presencia, 'presencia')}, <br>Timestamp: ${latestAmbiental.timestamp}<br><br>`;

            document.getElementById(`palco-${key}`).innerHTML = palco;
            document.getElementById(`tap-${key}`).innerHTML = tap;
            document.getElementById(`estadoPago-${key}`).innerHTML = estadoPago;
            document.getElementById(`estadoServicio-${key}`).innerHTML = `
                ${applyBooleanStyle(estadoServicio)}<br>
                <button onclick="toggleEstadoServicio('${key}', ${estadoServicio})">Conmutar</button>
            `;
            document.getElementById(`lecturasAmbientales-${key}`).innerHTML = lecturasAmbientales;
        }
    }
}


const dataRef = ref(database, '/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log('Data from Firebase:', data);  // Debugging line
        if (Object.keys(lastValues).length === 0) {
            populateGrid(data);
        } else {
            updateExistingGauges(data);
        }
    } else {
        console.error('No data available');
    }
}, (error) => {
    console.error('Error loading the data:', error);
});

// Make toggleEstadoServicio globally accessible
window.toggleEstadoServicio = toggleEstadoServicio;