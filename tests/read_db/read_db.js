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
  function displayData(tap, palco, data) {
    var container = document.getElementById('data');
    var content = `<h2>Tap: ${tap}, Palco: ${palco}</h2>`;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        content += `<p>Timestamp: ${data[key].timestamp}, Current: ${data[key].current}, Voltage: ${data[key].voltage}</p>`;
      }
    }
    container.innerHTML += content;
  }
  
  // Listen for changes in Tap1
  database.ref('Tap1').on('value', (snapshot) => {
    const tap1 = snapshot.val();
    for (const palco in tap1) {
      if (tap1.hasOwnProperty(palco)) {
        displayData('Tap1', palco, tap1[palco].readings);
      }
    }
  });
  
  // Listen for changes in Tap2
  database.ref('Tap2').on('value', (snapshot) => {
    const tap2 = snapshot.val();
    for (const palco in tap2) {
      if (tap2.hasOwnProperty(palco)) {
        displayData('Tap2', palco, tap2[palco].readings);
      }
    }
  });
  
  