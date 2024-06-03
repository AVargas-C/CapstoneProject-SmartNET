const admin = require('firebase-admin');

// Initialize the Firebase app
const serviceAccount = require('../src/assets/DB/key-reto-estadioazteca-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://reto-estadioazteca-default-rtdb.firebaseio.com/'
});

console.log("Firebase app initialized successfully.");

// Get a reference to the database
const db = admin.database();

function getTapNumber(palcoNumber) {
  return Math.floor((palcoNumber - 1) / 4) + 1;
}

function getMexicoCityTime() {
  return new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
}

function getRandomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBoolean() {
  return Math.random() >= 0.5;
}

async function updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio) {
  const palcoNumber = parseInt(palco.split(':')[1], 10);
  const tapNumber = getTapNumber(palcoNumber);

  // Update tap, estado_pago, estado_servicio
  await db.ref(`${palco}/tap`).set(tapNumber);
  await db.ref(`${palco}/estado_pago`).set(estado_pago);
  await db.ref(`${palco}/estado_servicio`).set(estado_servicio);

  // Add new readings to lecturas_ambientales
  const ambientalesRef = db.ref(`${palco}/lecturas_ambientales`).push();
  await ambientalesRef.set({
    co2: co2,
    temperatura: temperatura,
    presencia: presencia,
    timestamp: getMexicoCityTime()
  });

  // Add new readings to lecturas_electricas
  const electricasRef = db.ref(`${palco}/lecturas_electricas`).push();
  await electricasRef.set({
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
  estado_pago = ${estado_pago}
  estado_servicio = ${estado_servicio}\n`);
}

async function generateRandomData(numberOfLoops, numberOfPalcos, corrienteMinValue, corrienteMaxValue, voltageMinValue, voltageMaxValue, co2MinValue, co2MaxValue, presenciaValue, temperaturaMinValue, temperaturaMaxValue, estadoPagoValue, estadoServicioValue) {
  for (let j = 0; j < numberOfLoops; j++) {
    for (let i = 1; i <= numberOfPalcos; i++) {
      const palco = `palco:${String(i).padStart(3, '0')}`;
      const corriente = getRandomFloat(corrienteMinValue, corrienteMaxValue);
      const voltage = getRandomFloat(voltageMinValue, voltageMaxValue);
      const co2 = getRandomInt(co2MinValue, co2MaxValue);
      const temperatura = getRandomFloat(temperaturaMinValue, temperaturaMaxValue);
      
      let presencia, estado_pago, estado_servicio;

      if (presenciaValue === '1') {
        presencia = getRandomBoolean();
      } else if (presenciaValue.toLowerCase() === 'true') {
        presencia = true;
      } else if (presenciaValue.toLowerCase() === 'false') {
        presencia = false;
      } else {
        throw new Error("Invalid value for presencia_value. Use '1', 'true', or 'false'.");
      }

      if (estadoPagoValue === '1') {
        estado_pago = getRandomBoolean();
      } else if (estadoPagoValue.toLowerCase() === 'true') {
        estado_pago = true;
      } else if (estadoPagoValue.toLowerCase() === 'false') {
        estado_pago = false;
      } else {
        throw new Error("Invalid value for estado_pago. Use '1', 'true', or 'false'.");
      }

      if (estadoServicioValue === '1') {
        estado_servicio = getRandomBoolean();
      } else if (estadoServicioValue.toLowerCase() === 'true') {
        estado_servicio = true;
      } else if (estadoServicioValue.toLowerCase() === 'false') {
        estado_servicio = false;
      } else {
        throw new Error("Invalid value for estado_servicio. Use '1', 'true', or 'false'.");
      }

      await updateDatabase(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio);
    }
  }
}

// Example usage
generateRandomData(1, 10, 0.0, 10.0, 0.0, 240.0, 0, 100000, '1', 0.0, 50.0, '1', '1')
  .then(() => {
    console.log("Random data generation complete.");
    process.exit(0);  // Exit the process
  })
  .catch(err => {
    console.error(err);
    process.exit(1);  // Exit with an error code
  });