// Your web app's Firebase configuration
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
firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const dbRef = firebase.database().ref();

function getTapNumber(palcoNumber) {
  return Math.floor((palcoNumber - 1) / 4) + 1;
}

function getMexicoCityTime() {
  const tz = "America/Mexico_City";
  const now = new Date();
  return now.toLocaleString("en-US", { timeZone: tz });
}

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

function getBooleanValue(option) {
  if (option === 'aleatorio') {
    return Math.random() >= 0.5;
  }
  return option === 'true';
}

function updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio) {
  const palcoNumber = parseInt(palco);
  const tapNumber = getTapNumber(palcoNumber);

  const palcoKey = `palco:${palco.padStart(3, '0')}`;

  // Update tap, estado_pago, estado_servicio
  dbRef.child(`${palcoKey}/tap`).set(tapNumber);
  dbRef.child(`${palcoKey}/estado_pago`).set(estado_pago);
  dbRef.child(`${palcoKey}/estado_servicio}`).set(estado_servicio);

  // Add new readings to lecturas_ambientales
  const ambientalesRef = dbRef.child(`${palcoKey}/lecturas_ambientales`).push();
  ambientalesRef.set({
    co2: co2,
    temperatura: temperatura,
    presencia: presencia,
    timestamp: getMexicoCityTime()
  });

  // Add new readings to lecturas_electricas
  const electricasRef = dbRef.child(`${palcoKey}/lecturas_electricas`).push();
  electricasRef.set({
    voltage: voltage,
    corriente: corriente,
    timestamp: getMexicoCityTime()
  });

  console.log(`Data successfully written to Firebase Realtime Database:\n
    ${palcoKey}\n
    tap: ${tapNumber}\n
    corriente = ${corriente}\n
    voltage = ${voltage}\n
    co2 = ${co2}\n
    presencia = ${presencia}\n
    temperatura = ${temperatura}\n
    estado_pago = ${estado_pago}\n
    estado_servicio = ${estado_servicio}\n`);
}

function submitData() {
  const palco = document.getElementById('palco').value.trim();
  const corriente = parseFloat(document.getElementById('corriente').value.trim());
  const voltage = parseFloat(document.getElementById('voltage').value.trim());
  const co2 = parseFloat(document.getElementById('co2').value.trim());
  const presencia = getBooleanValue(document.getElementById('presencia').value.trim());
  const temperatura = parseFloat(document.getElementById('temperatura').value.trim());
  const estado_pago = getBooleanValue(document.getElementById('estado_pago').value.trim());
  const estado_servicio = getBooleanValue(document.getElementById('estado_servicio').value.trim());

  if (isNaN(corriente) || isNaN(voltage) || isNaN(co2) || isNaN(temperatura)) {
    alert("Please enter valid numeric values for corriente, voltage, co2, and temperatura.");
    return;
  }

  updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio);
}

function submitRandomData() {
  const numberOfLoops = parseInt(document.getElementById('loops').value);
  const intervalOfTime = parseInt(document.getElementById('interval').value); // Interval in seconds
  const palcoMin = parseInt(document.getElementById('palco_min').value);
  const palcoMax = parseInt(document.getElementById('palco_max').value);
  const corrienteMin = parseFloat(document.getElementById('corriente_min').value);
  const corrienteMax = parseFloat(document.getElementById('corriente_max').value);
  const voltageMin = parseFloat(document.getElementById('voltage_min').value);
  const voltageMax = parseFloat(document.getElementById('voltage_max').value);
  const co2Min = parseFloat(document.getElementById('co2_min').value);
  const co2Max = parseFloat(document.getElementById('co2_max').value);
  const temperaturaMin = parseFloat(document.getElementById('temperatura_min').value);
  const temperaturaMax = parseFloat(document.getElementById('temperatura_max').value);
  const presenciaOption = document.getElementById('presencia2').value;
  const estadoPagoOption = document.getElementById('estado_pago2').value;
  const estadoServicioOption = document.getElementById('estado_servicio2').value;

  function loopIteration(loopCount) {
    for (let i = palcoMin; i <= palcoMax; i++) {
      const corriente = getRandomValue(corrienteMin, corrienteMax);
      const voltage = getRandomValue(voltageMin, voltageMax);
      const co2 = getRandomValue(co2Min, co2Max);
      const temperatura = getRandomValue(temperaturaMin, temperaturaMax);
      const presencia = getBooleanValue(presenciaOption);
      const estado_pago = getBooleanValue(estadoPagoOption);
      const estado_servicio = getBooleanValue(estadoServicioOption);

      updateDatabase(i.toString(), corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio);
    }

    if (loopCount < numberOfLoops - 1) {
      setTimeout(() => loopIteration(loopCount + 1), intervalOfTime * 1000); // Convert seconds to milliseconds for setTimeout
    }
  }

  loopIteration(0);
}