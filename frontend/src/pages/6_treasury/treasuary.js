// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCvyLLnQcJrlYXYNjzAb12n-td6JqiXL6o",
  authDomain: "reto-estadio-azteca-d70b5.firebaseapp.com",
  projectId: "reto-estadio-azteca-d70b5",
  storageBucket: "reto-estadio-azteca-d70b5.appspot.com",
  messagingSenderId: "1071358264660",
  appId: "1:1071358264660:web:098b8c895147391c20f4c1",
  measurementId: "G-KNNQW231CZ"
};
firebase.initializeApp(firebaseConfig);

const wrapper = document.querySelector('.wrapper');
const iconClose = document.querySelector('.icon-close');

// Handle popup close button
iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// Handle login form submission and toggle estado_pago
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".form-box.login form");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the current estado_pago value
    const databaseRef = firebase.database().ref();
    databaseRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        const currentEstadoPago = data.estado_pago;

        // Toggle the estado_pago value
        databaseRef.child(key).update({
          estado_pago: !currentEstadoPago
        });
      });

      // Close the popup and refresh the page after toggling
      wrapper.classList.remove('active-popup');
      window.location.reload();
    });
  });

  // Populate the grid with data from Firebase
  const gridContainer = document.getElementById('grid-container');
  const databaseRef = firebase.database().ref();

  databaseRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      const key = childSnapshot.key;
      const data = childSnapshot.val();
      const estadoPago = data.estado_pago ? 'Pagado' : 'Pendiente';
      const estadoPagoClass = data.estado_pago ? 'estado-true' : 'estado-false';

      gridContainer.innerHTML += `
        <div class="grid-item">${key}</div>
        <div class="grid-item">01/01/2024</div>
        <div class="grid-item">Transacción</div>
        <div class="grid-item">Descripción</div>
        <div class="grid-item">$1000</div>
        <div class="grid-item"><button class="comprobante-btn">Comprobante</button></div>
        <div class="grid-item ${estadoPagoClass}">${estadoPago}</div>
        <div class="grid-item"><button class="actualizar-btn">Actualizar</button></div>
      `;
    });

    // Add event listeners to the new "Actualizar" buttons
    document.querySelectorAll('.actualizar-btn').forEach(button => {
      button.addEventListener('click', () => {
        wrapper.classList.add('active-popup');
      });
    });
  });
});