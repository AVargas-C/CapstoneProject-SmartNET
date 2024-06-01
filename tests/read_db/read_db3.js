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
  container.innerHTML = ''; // Clear previous content
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const lastReading = data[key];
      container.innerHTML += `<h2>Tap: ${tap}, Palco: ${palco}</h2>`;
      container.innerHTML += `<p>Timestamp: ${lastReading.timestamp}, Current: ${lastReading.current}, Voltage: ${lastReading.voltage}</p>`;
    }
  }
}

// Function to set up a listener for the specified tap and palco
function setupListener(tap, palco) {
  database.ref(`${tap}/${palco}/readings`).limitToLast(1).on('value', (snapshot) => {
    const data = snapshot.val();
    displayLastData(tap, palco, data);
  });
}

// Example usage: Call this function with the tap and palco you want to monitor
setupListener('Tap2', 'Palco1');
  