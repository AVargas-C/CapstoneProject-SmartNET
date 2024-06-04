// Your web app's Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

const container = document.getElementById('flex-rows');

function sortByTimestampDesc(entries) {
    return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function applyBooleanStyle(value) {
    return value ? '<span class="boolean-true">Sí</span>' : '<span class="boolean-false">No</span>';
}

function populateFlexbox(data) {
    console.log('Populating grid with data:', data);  // Debugging line

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            console.log('Processing entry:', key, data[key]);  // Debugging line

            const palco = key;
            const tap = data[key].tap;
            const estadoPago = data[key].estado_pago ? '<span class="boolean-true">Pagado</span>' : '<span class="boolean-false">No pagado</span>';
            const estadoServicio = data[key].estado_servicio ? '<span class="boolean-true">Activo</span>' : '<span class="boolean-false">Inactivo</span>';
            const amb = data[key].lecturas_ambientales;
            const elec = data[key].lecturas_electricas;

            const sortedAmbientales = sortByTimestampDesc(Object.values(amb));
            const sortedElectricas = sortByTimestampDesc(Object.values(elec));

            let lecturasAmbientales = '';
            sortedAmbientales.forEach(entry => {
                lecturasAmbientales += `CO2: ${entry.co2} ppm, Temp: ${entry.temperatura}°C, Presencia: ${applyBooleanStyle(entry.presencia)}, <br>Timestamp: ${entry.timestamp}<br><br>`;
            });

            let lecturasElectricas = '';
            sortedElectricas.forEach(entry => {
                lecturasElectricas += `Voltage: ${entry.voltage}V, Corriente: ${entry.corriente}A, <br>Timestamp: ${entry.timestamp}<br><br>`;
            });

            container.innerHTML += `
                <div class="flex-row">
                    <div class="flex-item column-palco">${palco}</div>
                    <div class="flex-item column-tap">/tap: ${tap}</div>
                    <div class="flex-item column-estado-pago">${estadoPago}</div>
                    <div class="flex-item column-estado-servicio">${estadoServicio}</div>
                    <div class="flex-item">${lecturasAmbientales}</div>
                    <div class="flex-item">${lecturasElectricas}</div>
                </div>
            `;
        }
    }
}

get(ref(database)).then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Data from Firebase:', data);  // Debugging line
        populateFlexbox(data);
    } else {
        console.error('No data available');
    }
}).catch((error) => {
    console.error('Error loading the data:', error);
});