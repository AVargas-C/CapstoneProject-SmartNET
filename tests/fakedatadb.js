const { initializeApp, deleteApp } = require('firebase/app');
const { getDatabase, ref, set, push, child } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
    authDomain: "reto-estadioazteca.firebaseapp.com",
    projectId: "reto-estadioazteca",
    storageBucket: "reto-estadioazteca.appspot.com",
    messagingSenderId: "378312513144",
    appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function getTapNumber(palcoNumber) {
    return Math.floor((palcoNumber - 1) / 4) + 1;
}

function getMexicoCityTime() {
    return new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' });
}

function updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estadoPago, estadoServicio) {
    const palcoNumber = parseInt(palco.split(':')[1]);
    const tapNumber = getTapNumber(palcoNumber);

    // Update tap, estado_pago, estado_servicio
    set(ref(database, `${palco}/tap`), tapNumber);
    set(ref(database, `${palco}/estado_pago`), estadoPago);
    set(ref(database, `${palco}/estado_servicio`), estadoServicio);

    // Add new readings to lecturas_ambientales
    const ambientalesRef = push(child(ref(database), `${palco}/lecturas_ambientales`));
    set(ambientalesRef, {
        co2: co2,
        temperatura: temperatura,
        presencia: presencia,
        timestamp: getMexicoCityTime()
    });

    // Add new readings to lecturas_electricas
    const electricasRef = push(child(ref(database), `${palco}/lecturas_electricas`));
    set(electricasRef, {
        voltage: voltage,
        corriente: corriente,
        timestamp: getMexicoCityTime()
    });

    console.log(`Data successfully written to Firebase Realtime Database:
    palco: ${palco}
    tap = ${tapNumber}
    corriente = ${corriente}
    voltage = ${voltage}
    co2 = ${co2}
    presencia = ${presencia}
    temperatura = ${temperatura}
    estado_pago = ${estadoPago}
    estado_servicio = ${estadoServicio}
    `);
}

async function generateRandomData(numberOfLoops, numberOfPalcos, corrienteMinValue, corrienteMaxValue, voltageMinValue, voltageMaxValue, co2MinValue, co2MaxValue, presenciaValue, temperaturaMinValue, temperaturaMaxValue, estadoPagoValue, estadoServicioValue) {
    for (let i = 0; i < numberOfLoops; i++) {
        for (let j = 1; j <= numberOfPalcos; j++) {
            const palco = `palco:${String(j).padStart(3, '0')}`;
            const corriente = Math.random() * (corrienteMaxValue - corrienteMinValue) + corrienteMinValue;
            const voltage = Math.random() * (voltageMaxValue - voltageMinValue) + voltageMinValue;
            const co2 = Math.floor(Math.random() * (co2MaxValue - co2MinValue + 1) + co2MinValue);
            const temperatura = Math.random() * (temperaturaMaxValue - temperaturaMinValue) + temperaturaMinValue;
            const presencia = Math.random() < 0.5;
            const estadoPago = Math.random() < 0.5;
            const estadoServicio = Math.random() < 0.5;

            updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estadoPago, estadoServicio);
        }
    }
    console.log('Random data generation complete.');
    // Add a short delay before closing the app to ensure all writes are completed
    setTimeout(async () => {
        await deleteApp(app); // Properly close the Firebase app
        console.log('Firebase app closed.');
    }, 5000);
}

// Usage example:
generateRandomData(1, 10, 0.0, 10.0, 0.0, 150.0, 0, 55000, '1', 0.0, 50.0, '1', '1');
