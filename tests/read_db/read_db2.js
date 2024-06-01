// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
    authDomain: "reto-estadioazteca.firebaseapp.com",
    projectId: "reto-estadioazteca",
    storageBucket: "reto-estadioazteca.appspot.com",
    messagingSenderId: "378312513144",
    appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
  };
  
 // Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the database
var database = firebase.database();

// Function to display data
function displayLastData(tap, palco, data) {
  var container = document.getElementById('data');
  var content = `<h2>Tap: ${tap}, Palco: ${palco}</h2>`;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const lastReading = data[key];
      content += `<p>Timestamp: ${lastReading.timestamp}, Current: ${lastReading.current}, Voltage: ${lastReading.voltage}</p>`;
    }
  }
  container.innerHTML += content;
}

// Function to setup listeners for each Palco
function setupListeners(tap) {
  ['Palco1', 'Palco2', 'Palco3', 'Palco4'].forEach(palco => {
    database.ref(`${tap}/${palco}/readings`).limitToLast(1).on('value', (snapshot) => {
      const data = snapshot.val();
      displayLastData(tap, palco, data);
    });
  });
}

// Listen for changes in Tap1
setupListeners('Tap1');

// Listen for changes in Tap2
setupListeners('Tap2');
  