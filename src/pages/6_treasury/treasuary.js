// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCnfqYtDnf95RXQvsele6IPmZtUpNhpSPQ",
  authDomain: "reto-estadioazteca.firebaseapp.com",
  databaseURL: "https://reto-estadioazteca-default-rtdb.firebaseio.com",
  projectId: "reto-estadioazteca",
  storageBucket: "reto-estadioazteca.appspot.com",
  messagingSenderId: "378312513144",
  appId: "1:378312513144:web:1c80ba54d21c63529c3f8d"
};
firebase.initializeApp(firebaseConfig);

const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

// Existing functionality to handle popup and form transitions
registerLink.addEventListener('click', () => {
  wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
  wrapper.classList.remove('active');
});

if (btnPopup) {
  btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
  });
}

iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// New functionality to handle login form submission and redirection
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to the login form
  const loginForm = document.querySelector(".form-box.login form");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Redirect to the dashboard page
    window.location.href = "./pages/1_dashboard/dashboard.html";
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
        <div class="grid-item">Comprobante</div>
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
