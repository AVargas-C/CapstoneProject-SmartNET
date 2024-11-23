// Your web app's Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

var firebaseConfig = {
  apiKey: "AIzaSyBL5phOVI-kE8-dQEK6nBReblTT4Z1MTaM",
  authDomain: "smartnet-39d8d.firebaseapp.com",
  databaseURL: "https://smartnet-39d8d-default-rtdb.firebaseio.com",
  projectId: "smartnet-39d8d",
  storageBucket: "smartnet-39d8d.firebasestorage.app",
  messagingSenderId: "1085688887668",
  appId: "1:1085688887668:web:c340b4867d0e5a40049421",
  measurementId: "G-EDBEH41WH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const container = document.querySelector('.grid-container');

function applyBooleanStyle(value, type) {
    if (type === 'presencia') {
        return value ? '<span class="boolean-true">Sí</span>' : '<span class="boolean-false">No</span>';
    }
    return value ? '<span class="boolean-true">Activo</span>' : '<span class="boolean-false">Inactivo</span>';
}

function toggleEstadoServicio(palcoId, currentState) {
    const newState = !currentState;
    const updates = {};
    updates[`/${palcoId}/estado_servicio`] = newState;
    update(ref(database), updates);
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

            const sortedAmbientales = Object.values(amb).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const sortedElectricas = Object.values(elec).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            let lecturasAmbientales = '';
            sortedAmbientales.forEach(entry => {
                lecturasAmbientales += `CO2: ${entry.co2} ppm, Temp: ${entry.temperatura}°C, Presencia: ${applyBooleanStyle(entry.presencia, 'presencia')}, <br>Timestamp: ${entry.timestamp}<br><br>`;
            });

            let lecturasElectricas = '';
            sortedElectricas.forEach(entry => {
                lecturasElectricas += `Voltage: ${entry.voltage}V, Corriente: ${entry.corriente}A, <br>Timestamp: ${entry.timestamp}<br><br>`;
            });

            container.innerHTML += `
                <div class="grid-item">${palco}</div>
                <div class="grid-item">${tap}</div>
                <div class="grid-item">${estadoPago}</div>
                <div class="grid-item">
                    ${applyBooleanStyle(estadoServicio)}<br>
                    <button onclick="toggleEstadoServicio('${key}', ${estadoServicio})">Conmutar</button>
                </div>
                <div class="grid-item">${lecturasAmbientales}</div>
                <div class="grid-item">${lecturasElectricas}</div>
            `;
        }
    }
}

const dataRef = ref(database, '/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log('Data from Firebase:', data);  // Debugging line
        populateGrid(data);
    } else {
        console.error('No data available');
    }
}, (error) => {
    console.error('Error loading the data:', error);
});

// Make toggleEstadoServicio globally accessible
window.toggleEstadoServicio = toggleEstadoServicio;
