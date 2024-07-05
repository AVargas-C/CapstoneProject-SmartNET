import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvyLLnQcJrlYXYNjzAb12n-td6JqiXL6o",
  authDomain: "reto-estadio-azteca-d70b5.firebaseapp.com",
  projectId: "reto-estadio-azteca-d70b5",
  storageBucket: "reto-estadio-azteca-d70b5.appspot.com",
  messagingSenderId: "1071358264660",
  appId: "1:1071358264660:web:098b8c895147391c20f4c1",
  measurementId: "G-KNNQW231CZ"
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

            const latestAmbiental = Object.values(amb).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(amb)[0]);

            const latestElectrica = Object.values(elec).reduce((latest, entry) => {
                return new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest;
            }, Object.values(elec)[0]);

            const lecturasAmbientales = `CO2: ${latestAmbiental.co2} ppm, Temp: ${latestAmbiental.temperatura}°C, Presencia: ${applyBooleanStyle(latestAmbiental.presencia, 'presencia')}, <br>Timestamp: ${latestAmbiental.timestamp}<br><br>`;
            const lecturasElectricas = `Voltage: ${latestElectrica.voltage}V, Corriente: ${latestElectrica.corriente}A, <br>Timestamp: ${latestElectrica.timestamp}<br><br>`;

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
