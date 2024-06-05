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
    setTimeout(() => {
        fill.style.transform = `rotate(${value / (max_value * 2)}turn)`;
    }, 0);
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

            const lecturasAmbientales = `CO2: ${latestAmbiental.co2} ppm, Temp: ${latestAmbiental.temperatura}°C, Presencia: ${applyBooleanStyle(latestAmbiental.presencia, 'presencia')}, <br>Timestamp: ${latestAmbiental.timestamp}<br><br>`;

            const voltageGaugeId = `gauge-voltage-${key}`;
            const currentGaugeId = `gauge-current-${key}`;

            const voltageGauge = createGauge(voltageGaugeId);
            const currentGauge = createGauge(currentGaugeId);

            container.innerHTML += `
                <div class="grid-item">${palco}</div>
                <div class="grid-item">${tap}</div>
                <div class="grid-item">${estadoPago}</div>
                <div class="grid-item">
                    ${applyBooleanStyle(estadoServicio)}<br>
                    <button onclick="toggleEstadoServicio('${key}', ${estadoServicio})">Conmutar</button>
                </div>
                <div class="grid-item">${lecturasAmbientales}</div>
                <div class="grid-item gauge-container" id="gauge-container-${key}">${voltageGauge.outerHTML}${currentGauge.outerHTML}</div>
            `;

            // Store initial values
            lastValues[voltageGaugeId] = latestElectrica.voltage;
            lastValues[currentGaugeId] = latestElectrica.corriente;

            setTimeout(() => {
                updateGauge(document.getElementById(voltageGaugeId), latestElectrica.voltage, 150, 'V');
                updateGauge(document.getElementById(currentGaugeId), latestElectrica.corriente, 30, 'A');
            }, 0);
        }
    }
}

function updateExistingGauges(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const elec = data[key].lecturas_electricas;

            const latestElectrica = Object.values(elec).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(elec)[0]);

            const voltageGaugeId = `gauge-voltage-${key}`;
            const currentGaugeId = `gauge-current-${key}`;

            const voltageGauge = document.getElementById(voltageGaugeId);
            const currentGauge = document.getElementById(currentGaugeId);

            if (voltageGauge && currentGauge) {
                // Ensure the transition happens from the last value
                const lastVoltage = lastValues[voltageGaugeId] || 0;
                const lastCurrent = lastValues[currentGaugeId] || 0;

                // Set the gauges to the last value before transitioning to the new value
                updateGauge(voltageGauge, lastVoltage, 150, 'V');
                updateGauge(currentGauge, lastCurrent, 30, 'A');

                // Store the new values
                lastValues[voltageGaugeId] = latestElectrica.voltage;
                lastValues[currentGaugeId] = latestElectrica.corriente;

                setTimeout(() => {
                    updateGauge(voltageGauge, latestElectrica.voltage, 150, 'V');
                    updateGauge(currentGauge, latestElectrica.corriente, 30, 'A');
                }, 0);
            }
        }
    }
}

const dataRef = ref(database, '/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log('Data from Firebase:', data);  // Debugging line
        populateGrid(data);
        updateExistingGauges(data);
    } else {
        console.error('No data available');
    }
}, (error) => {
    console.error('Error loading the data:', error);
});

// Make toggleEstadoServicio globally accessible
window.toggleEstadoServicio = toggleEstadoServicio;