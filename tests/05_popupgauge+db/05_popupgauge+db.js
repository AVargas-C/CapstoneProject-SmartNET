// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
authDomain: "reto-estadioazteca.firebaseapp.com",
projectId: "reto-estadioazteca",
storageBucket: "reto-estadioazteca.appspot.com",
messagingSenderId: "378312513144",
appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/*-------------- POPUP -----------------*/
function createPopup(id) {
let popupNode = document.querySelector(id);

let overlay = popupNode.querySelector(".overlay");
let closeBtn = popupNode.querySelector(".close-btn");

function openPopup() {
    popupNode.classList.add("active");
    overlay.classList.add("active");
}
function closePopup() {
    popupNode.classList.remove("active");
    overlay.classList.remove("active");
}
overlay.addEventListener("click", closePopup);
closeBtn.addEventListener("click", closePopup);
return openPopup;
}

let popup = createPopup ("#popup");

document.querySelectorAll(".open-popup").forEach(function(element) {
element.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default link behavior
    const buttonText = event.target.textContent;

    //CHATGPT
    const palcoNumber = event.target.id;
    //

    document.querySelector("#popup h2").textContent = buttonText;
    
    //CHATGPT
    fetchData(palcoNumber);
    //

    popup(); // Open the popup
});
});

/*--------------   GAUGES CSS ------------*/
const gaugeVoltage = document.querySelector("#voltage");
const gaugeCurrent = document.querySelector("#current");
const gaugeTemperature = document.querySelector("#temperature");
const gaugeCo2 = document.querySelector("#co2");

function setGauge(gauge, value, max_value, reading_type) {
if (value < 0 || value > max_value) {
    return;
}

gauge.querySelector(".gauge__fill").style.transform = `rotate(${
    value / (max_value * 2)
}turn)`;

// Change the background color based on thresholds
if (gauge.id === "voltage") {
    if (value < 100) {
        gauge.querySelector(".gauge__fill").style.background = "red";
    } else if (value <= 121) {
        gauge.querySelector(".gauge__fill").style.background = "yellow";
    } else if (value <= 132) {
        gauge.querySelector(".gauge__fill").style.background = "green";
    } else if (value <= 140) {
        gauge.querySelector(".gauge__fill").style.background = "yellow";
    } else {
        gauge.querySelector(".gauge__fill").style.background = "red";
    }
} else if (gauge.id === "current" && value > 15) {
    gauge.querySelector(".gauge__fill").style.background = "red";
} else if (gauge.id === "temperature") {
    if (value < 13) {
        gauge.querySelector(".gauge__fill").style.background = "lightblue";
    } else if (value < 25) {
        gauge.querySelector(".gauge__fill").style.background = "green";
    } else if (value < 36) {
        gauge.querySelector(".gauge__fill").style.background = "yellow";
    } else if (value < 40) {
        gauge.querySelector(".gauge__fill").style.background = "orange";
    } else {
        gauge.querySelector(".gauge__fill").style.background = "red";
    }
} else if (gauge.id === "co2") {
    if (value < 1000) {
        gauge.querySelector(".gauge__fill").style.background = "green";
    } else if (value < 2000) {
        gauge.querySelector(".gauge__fill").style.background = "yellow";
    } else if (value < 5000) {
        gauge.querySelector(".gauge__fill").style.background = "orange";
    } else if (value < 50000) {
        gauge.querySelector(".gauge__fill").style.background = "red";
    } else {
        gauge.querySelector(".gauge__fill").style.background = "purple";
    }
} else {
    gauge.querySelector(".gauge__fill").style.background = "#009578";
}

gauge.querySelector(".gauge__cover").textContent = `${Math.round(
    value * 1
)} ${reading_type}`;
}




function fetchData(palcoNumber) {
const palco = palcoNumber.replace('palco', 'palco:0');
database.ref(`tap:01/${palco}`).once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data) {
    const latestAmbiental = Object.values(data.lecturas_ambientales).pop();
    const latestElectrical = Object.values(data.lecturas_electricas).pop();
    
    setGauge(gaugeCo2, latestAmbiental.co2, 60000, "PPM");
    setGauge(gaugeTemperature, latestAmbiental.temperatura, 50, "°C");
    setGauge(gaugeVoltage, latestElectrical.voltaje, 150, "V");
    setGauge(gaugeCurrent, latestElectrical.corriente, 20, "A");
    }
});
}


// Add this to your existing code where you open the popup
document.querySelectorAll(".open-popup").forEach(function(element) {
    element.addEventListener("click", function(event) {
      event.preventDefault();
      const buttonText = event.target.textContent;
      const palcoNumber = event.target.id;
      document.querySelector("#popup h2").textContent = buttonText;
      const palco = palcoNumber.replace('palco', 'palco:0');
      fetchData(palco);
      popup(); // Open the popup
    });
});

// Initialize listeners for each palco
function initializeListeners() {
    fetchData('palco:01');
    fetchData('palco:02');
    fetchData('palco:03');
    fetchData('palco:04');
  }
  
  initializeListeners();