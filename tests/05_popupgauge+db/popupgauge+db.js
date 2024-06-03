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


/*-------------- Fetch Data -----------------*/
document.addEventListener("DOMContentLoaded", function() {
    let popup = createPopup("#popup");

    const buttons = document.querySelectorAll('.open-popup');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior
            const buttonText = event.target.textContent;
            document.querySelector("#popup h2").textContent = buttonText;

            const palcoNumber = event.target.id.replace('palco', ''); // Extract number from id
            fetchDataForPalco(palcoNumber);

            popup(); // Open the popup
        });
    });
});

function fetchDataForPalco(palcoNumber) {
    const palcoNum = parseInt(palcoNumber);
    const tapNumber = Math.ceil(palcoNum / 4).toString().padStart(2, '0');
    const palcoId = (palcoNum % 4 === 0 ? 4 : palcoNum % 4).toString().padStart(2, '0');
    const dbRef = firebase.database().ref(`tap:${tapNumber}/palco:${palcoId}`);

    dbRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateGauges(data);
            updateStatus(data);
        }
    });
}

function updateGauges(data) {
    // Handling electrical readings
    const electricReadings = data.lecturas_electricas;
    if (electricReadings) {
        const electricEntries = Object.entries(electricReadings);
        const lastElectricEntry = electricEntries[electricEntries.length - 1][1]; // Get the last electric entry's data

        setGauge(gaugeVoltage, lastElectricEntry.voltaje, 150, 'V');
        setGauge(gaugeCurrent, lastElectricEntry.corriente, 20, 'A');
    }

    // Handling ambient readings
    const ambientReadings = data.lecturas_ambientales;
    if (ambientReadings) {
        const ambientEntries = Object.entries(ambientReadings);
        const lastAmbientEntry = ambientEntries[ambientEntries.length - 1][1]; // Get the last ambient entry's data

        setGauge(gaugeTemperature, lastAmbientEntry.temperatura, 50, '°C');
        setGauge(gaugeCo2, lastAmbientEntry.co2, 50000, 'ppm');
    }
}

function updateStatus(data) {
    const presenceStatus = data.lecturas_ambientales ? Object.values(data.lecturas_ambientales).pop().presencia : 'No data';
    const paymentStatus = data.estado_pago || 'No data';
    const serviceStatus = data.estado_servicio || 'No data';

    document.querySelector(".flex-container .status").textContent = presenceStatus;
    document.querySelector(".flex-container:nth-of-type(2) .status").textContent = paymentStatus;
    document.querySelector(".flex-container:nth-of-type(3) .status").textContent = serviceStatus;
}

/*--------------   GAUGES ------------*/
const gaugeVoltage = document.querySelector("#voltage");
const gaugeCurrent = document.querySelector("#current");
const gaugeTemperature = document.querySelector("#temperature");
const gaugeCo2 = document.querySelector("#co2");

function setGauge(gauge, value, max_value, reading_type) {
    if (value < 0 || value > max_value) {
        return;
    }

    gauge.querySelector(".gauge__fill").style.transform = `rotate(${value / (max_value * 2)}turn)`;
    updateGaugeColor(gauge, value);

    gauge.querySelector(".gauge__cover").textContent = `${Math.round(value)} ${reading_type}`;
}

function updateGaugeColor(gauge, value) {
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
}

