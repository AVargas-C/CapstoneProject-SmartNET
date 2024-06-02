const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
    authDomain: "reto-estadioazteca.firebaseapp.com",
    projectId: "reto-estadioazteca",
    storageBucket: "reto-estadioazteca.appspot.com",
    messagingSenderId: "378312513144",
    appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
  };
  

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/*---------------------------------------------------------------------------------------------*/
// Función para generar un número aleatorio entre min y max
function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para generar una marca de tiempo
function getCurrentTimestamp() {
    return new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' });
}

// Actualizar los valores cada 5 segundos para cada tap y palco
const taps = Array.from({ length: 20 }, (_, i) => `${String(i + 1).padStart(2, '0')}`);
const palcosPerTap = 4;

taps.forEach((tap, index) => {
    const startPalco = index * palcosPerTap + 1;
    const endPalco = startPalco + palcosPerTap;

    for (let palcoNum = startPalco; palcoNum < endPalco; palcoNum++) {
        const palco = String(palcoNum).padStart(2, '0');

        setInterval(() => {
            const values = {
                voltage: getRandomValue(100, 150),
                current: getRandomValue(0, 20),
                timestamp: getCurrentTimestamp(),
                estado_servicio: Math.random() < 0.5 ? "activo" : "inactivo",
                estado_pago: Math.random() < 0.5 ? "pagado" : "no pagado",
                lecturas_ambientales: {
                    co2: Math.floor(Math.random() * 100001), // Valor aleatorio entre 0 y 100,000
                    temperatura: getRandomValue(0, 50), // Valor aleatorio entre 0 y 50
                    presencia: Math.random() < 0.5 ? "detectada" : "no detectada" // Aleatoriamente detectada o no detectada
                }
            };

            const readingsRef = ref(database, `tap:${tap}/palco:${palco}/lecturas_electricas`);
            push(readingsRef, {
                voltage: values.voltage,
                corriente: values.current,
                timestamp: values.timestamp
            }).then(() => {
                console.log(`Valores actualizados en Tap${tap}/Palco${palco}/lecturas_electricas: `, values);
            }).catch((error) => {
                console.error(`Error actualizando los valores en Tap${tap}/Palco${palco}/lecturas_electricas: `, error);
            });

            const serviceStatusRef = ref(database, `tap:${tap}/palco:${palco}/estado_servicio`);
            set(serviceStatusRef, values.estado_servicio).then(() => {
                console.log(`Estado de servicio actualizado en Tap${tap}/Palco${palco}/estado_servicio: `, values.estado_servicio);
            }).catch((error) => {
                console.error(`Error actualizando el estado de servicio en Tap${tap}/Palco${palco}/estado_servicio: `, error);
            });

            const paymentStatusRef = ref(database, `tap:${tap}/palco:${palco}/estado_pago`);
            set(paymentStatusRef, values.estado_pago).then(() => {
                console.log(`Estado de pago actualizado en Tap${tap}/Palco${palco}/estado_pago: `, values.estado_pago);
            }).catch((error) => {
                console.error(`Error actualizando el estado de pago en Tap${tap}/Palco${palco}/estado_pago: `, error);
            });

            const environmentalReadingsRef = ref(database, `tap:${tap}/palco:${palco}/lecturas_ambientales`);
            push(environmentalReadingsRef, {
                co2: values.lecturas_ambientales.co2,
                temperatura: values.lecturas_ambientales.temperatura,
                presencia: values.lecturas_ambientales.presencia,
                timestamp: values.timestamp
            }).then(() => {
                console.log(`Valores de lecturas ambientales actualizados en Tap${tap}/Palco${palco}/lecturas_ambientales: `, values.lecturas_ambientales);
            }).catch((error) => {
                console.error(`Error actualizando los valores de lecturas ambientales en Tap${tap}/Palco${palco}/lecturas_ambientales: `, error);
            });
        }, 5000);
    }
});