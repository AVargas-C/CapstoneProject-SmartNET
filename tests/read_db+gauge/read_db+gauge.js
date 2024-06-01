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
/*------------------------------------------------------------------------------------------------------------------------------------*/
const gaugeVoltage = document.querySelector("#voltage");
const gaugeCurrent = document.querySelector("#current");

function setGauge(gauge, value, max_value, reading_type) {
  if (value < 0 || value > max_value) {
    return;
  }

  gauge.querySelector(".gauge__fill").style.transform = `rotate(${
    value / (max_value * 2)
  }turn)`;
  gauge.querySelector(".gauge__cover").textContent = `${Math.round(
    value * 1
  )} ${reading_type}`;
}


/*------------------------------------------------------------------------------------------------------------------------------------*/
// Function to display data
function displayLastData(tap, palco, data) {
  var container = document.getElementById('data');
  container.innerHTML = ''; // Clear previous content
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const lastReading = data[key];

      setGauge(gaugeVoltage, 100, 150, "V");
      setGauge(gaugeCurrent, 10, 20, "A");
      /*
      container.innerHTML += `<h2>Tap: ${tap}, Palco: ${palco}</h2>`;
      container.innerHTML += `<p>Timestamp: ${lastReading.timestamp}, Current: ${lastReading.current}, Voltage: ${lastReading.voltage}</p>`;
      */
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