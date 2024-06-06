// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
  authDomain: "reto-estadioazteca.firebaseapp.com",
  databaseURL: "https://reto-estadioazteca-default-rtdb.firebaseio.com",
  projectId: "reto-estadioazteca",
  storageBucket: "reto-estadioazteca.appspot.com",
  messagingSenderId: "378312513144",
  appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
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
    firebase.database().ref().update(updates);
}

function createGauge(id) {
    const gauge = document.createElement('div');
    gauge.className = 'gauge';
    gauge.id = id;
    
    const gaugeBody = document.createElement('div');
    gaugeBody.className = 'gauge__body';
    
    const gaugeFill = document.createElement('div');
    gaugeFill.className = 'gauge__fill';
    gaugeFill.style.transition = 'transform 2s ease-in-out';
    
    const gaugeCover = document.createElement('div');
    gaugeCover.className = 'gauge__cover';
    
    gaugeBody.appendChild(gaugeFill);
    gaugeBody.appendChild(gaugeCover);
    gauge.appendChild(gaugeBody);

    return gauge;
}

function updateGauge(gauge, value, max_value, reading_type) {
    if (!gauge || value < 0 || value > max_value) {
        return;
    }

    const fill = gauge.querySelector(".gauge__fill");
    fill.style.transition = 'transform 2s ease-in-out';
    requestAnimationFrame(() => {
        fill.style.transform = `rotate(${value / (max_value * 2)}turn)`;
    });
    gauge.querySelector(".gauge__cover").textContent = `${Math.round(value)} ${reading_type}`;

    // Change the background color based on thresholds
    if (gauge.id.includes("voltage")) {
        if (value < 100) {
            fill.style.background = "red";
        } else if (value <= 121) {
            fill.style.background = "yellow";
        } else if (value <= 132) {
            fill.style.background = "green";
        } else if (value <= 140) {
            fill.style.background = "yellow";
        } else {
            fill.style.background = "red";
        }
    } else if (gauge.id.includes("current") && value > 5) {
        fill.style.background = "red";
    } else if (gauge.id.includes("temp")) {
        if (value < 13) {
            fill.style.background = "lightblue";
        } else if (value < 25) {
            fill.style.background = "green";
        } else if (value < 36) {
            fill.style.background = "yellow";
        } else if (value < 40) {
            fill.style.background = "orange";
        } else {
            fill.style.background = "red";
        }
    } else if (gauge.id.includes("co2")) {
        if (value < 1000) {
            fill.style.background = "green";
        } else if (value < 2000) {
            fill.style.background = "yellow";
        } else if (value < 5000) {
            fill.style.background = "orange";
        } else if (value < 10000) {
            fill.style.background = "red";
        } else {
            fill.style.background = "purple";
        }
    } else {
        fill.style.background = "#009578";
    }
}

function roundFloatValue(value) {
    return Math.round(parseFloat(value));
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

            const latestAmbiental = Object.values(amb).reduce((latest, entry) => 
                new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest, Object.values(amb)[0]);
            const latestElectrica = Object.values(elec).reduce((latest, entry) => 
                new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest, Object.values(elec)[0]);

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
                    <button class="toggle-btn" data-palco-id="${key}" data-estado-servicio="${estadoServicio}">Toggle</button>
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
            lastValues[co2GaugeId] = roundFloatValue(latestAmbiental.co2);
            lastValues[tempGaugeId] = roundFloatValue(latestAmbiental.temperatura);
            lastValues[voltageGaugeId] = roundFloatValue(latestElectrica.voltage);
            lastValues[currentGaugeId] = roundFloatValue(latestElectrica.corriente);

            requestAnimationFrame(() => {
                updateGauge(document.getElementById(co2GaugeId), lastValues[co2GaugeId], 55000, 'ppm');
                updateGauge(document.getElementById(tempGaugeId), lastValues[tempGaugeId], 50, '°C');
                updateGauge(document.getElementById(voltageGaugeId), lastValues[voltageGaugeId], 150, 'V');
                updateGauge(document.getElementById(currentGaugeId), lastValues[currentGaugeId], 30, 'A');
            });
        }
    }

    // Add event listeners to the new "Toggle" buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const palcoId = event.currentTarget.getAttribute('data-palco-id');
        const currentState = event.currentTarget.getAttribute('data-estado-servicio') === 'true';
        wrapper.classList.add('active-popup');
        wrapper.setAttribute('data-palco-id', palcoId);
        wrapper.setAttribute('data-current-state', currentState);
      });
    });
}

function updateExistingGauges(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const elec = data[key].lecturas_electricas;
            const amb = data[key].lecturas_ambientales;

            const latestElectrica = Object.values(elec).reduce((latest, entry) => 
                new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest, Object.values(elec)[0]);

            const latestAmbiental = Object.values(amb).reduce((latest, entry) => 
                new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest, Object.values(amb)[0]);

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

                lastValues[voltageGaugeId] = roundFloatValue(latestElectrica.voltage);
                lastValues[currentGaugeId] = roundFloatValue(latestElectrica.corriente);

                requestAnimationFrame(() => {
                    updateGauge(voltageGauge, lastVoltage, 150, 'V');
                    updateGauge(currentGauge, lastCurrent, 30, 'A');
                });

                requestAnimationFrame(() => {
                    updateGauge(voltageGauge, lastValues[voltageGaugeId], 150, 'V');
                    updateGauge(currentGauge, lastValues[currentGaugeId], 30, 'A');
                });
            }

            if (co2Gauge && tempGauge) {
                const lastCo2 = lastValues[co2GaugeId] || 0;
                const lastTemp = lastValues[tempGaugeId] || 0;

                lastValues[co2GaugeId] = roundFloatValue(latestAmbiental.co2);
                lastValues[tempGaugeId] = roundFloatValue(latestAmbiental.temperatura);

                requestAnimationFrame(() => {
                    updateGauge(co2Gauge, lastCo2, 55000, 'ppm');
                    updateGauge(tempGauge, lastTemp, 50, '°C');
                });

                requestAnimationFrame(() => {
                    updateGauge(co2Gauge, lastValues[co2GaugeId], 55000, 'ppm');
                    updateGauge(tempGauge, lastValues[tempGaugeId], 50, '°C');
                });
            }

            const palco = `Palco: ${key.split(':')[1].trim()}`;
            const tap = `Tap: ${data[key].tap}`;
            const estadoPago = data[key].estado_pago ? '<span class="boolean-true">Pagado</span>' : '<span class="boolean-false">No pagado</span>';
            const estadoServicio = data[key].estado_servicio;

            const lecturasAmbientales = `CO2: ${latestAmbiental.co2} ppm, Temp: ${latestAmbiental.temperatura}°C, Presencia: ${applyBooleanStyle(latestAmbiental.presencia, 'presencia')}, <br>Timestamp: ${latestAmbiental.timestamp}<br><br>`;

            const palcoElement = document.getElementById(`palco-${key}`);
            const tapElement = document.getElementById(`tap-${key}`);
            const estadoPagoElement = document.getElementById(`estadoPago-${key}`);
            const estadoServicioElement = document.getElementById(`estadoServicio-${key}`);
            const lecturasAmbientalesElement = document.getElementById(`lecturasAmbientales-${key}`);

            if (palcoElement) palcoElement.innerHTML = palco;
            if (tapElement) tapElement.innerHTML = tap;
            if (estadoPagoElement) estadoPagoElement.innerHTML = estadoPago;
            if (estadoServicioElement) estadoServicioElement.innerHTML = `
                ${applyBooleanStyle(estadoServicio)}<br>
                <button class="toggle-btn" data-palco-id="${key}" data-estado-servicio="${estadoServicio}">Conmutar</button>
            `;
            if (lecturasAmbientalesElement) lecturasAmbientalesElement.innerHTML = lecturasAmbientales;
        }
    }

    // Add event listeners to the new "Toggle" buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const palcoId = event.currentTarget.getAttribute('data-palco-id');
        const currentState = event.currentTarget.getAttribute('data-estado-servicio') === 'true';
        wrapper.classList.add('active-popup');
        wrapper.setAttribute('data-palco-id', palcoId);
        wrapper.setAttribute('data-current-state', currentState);
      });
    });
}

const dataRef = firebase.database().ref('/');
dataRef.on('value', (snapshot) => {
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

// Handle popup close button
const wrapper = document.querySelector('.wrapper');
const iconClose = document.querySelector('.icon-close');
iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// Handle login form submission and toggle estado_servicio
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".form-box.login form");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the current estado_servicio value
    const palcoId = wrapper.getAttribute('data-palco-id');
    const currentState = wrapper.getAttribute('data-current-state') === 'true';
    toggleEstadoServicio(palcoId, currentState);

    // Close the popup and refresh the page after toggling
    wrapper.classList.remove('active-popup');
    window.location.reload();
  });
});

// Make toggleEstadoServicio globally accessible
window.toggleEstadoServicio = toggleEstadoServicio;
