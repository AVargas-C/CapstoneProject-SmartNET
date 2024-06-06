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
var database = firebase.database();

window.onload = function() {
  var gridContainer = document.querySelector('.grid-container');

  database.ref().once('value').then(function(snapshot) {
      var data = snapshot.val();
      for (var palco in data) {
          var estadoPago = data[palco].estado_pago ? 'Pagado' : 'No Pagado';
          var currentEstado = data[palco].estado_pago;
          var estadoClass = currentEstado ? 'estado-true' : 'estado-false';
          var row = `
              <div class="grid-item">${palco}</div>
              <div class="grid-item">2024-06-06</div>
              <div class="grid-item">Venta</div>
              <div class="grid-item">Descripción de la transacción</div>
              <div class="grid-item">$1000</div>
              <div class="grid-item"><button onclick="uploadComprobante('${palco}')">Subir Comprobante</button></div>
              <div class="grid-item"><span class="${estadoClass}">${estadoPago}</span></div>
              <div class="grid-item"><button onclick="toggleEstado('${palco}', ${currentEstado})">Actualizar</button></div>
          `;
          gridContainer.insertAdjacentHTML('beforeend', row);
      }
  });
};

function uploadComprobante(palco) {
  alert('Uploading comprobante for ' + palco);
}

function toggleEstado(palco, currentEstado) {
  var newEstado = !currentEstado;
  database.ref(palco).update({
      estado_pago: newEstado
  }).then(function() {
      alert('Estado updated for ' + palco + ' to ' + (newEstado ? 'Pagado' : 'No Pagado'));
      location.reload(); // Reload the page to update the displayed state
  });
}
