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
// Function to generate random number between min and max
function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}
  
// Function to generate timestamp
function getCurrentTimestamp() {
return new Date().toISOString();
}


// Función para actualizar los valores en Firebase para cada tap y palco
function updateValues(tap, palco) {
    const values = {
        voltage: getRandomValue(0, 100),
        current: getRandomValue(0, 100),
        timestamp: getCurrentTimestamp()
    };

    push(ref(database, `Tap${tap}/Palco${palco}/readings`), values).then(() => {
        console.log(`Valores actualizados en Tap${tap}/Palco${palco}/readings: `, values);
    }).catch((error) => {
        console.error(`Error actualizando los valores en Tap${tap}/Palco${palco}/readings: `, error);
    });
}

// Actualizar los valores cada 5 segundos para cada tap y palco
const taps = [1, 2, 3, 4];
const palcos = [1, 2, 3, 4];

taps.forEach(tap => {
    palcos.forEach(palco => {
        setInterval(() => updateValues(tap, palco), 5000);
    });
});
