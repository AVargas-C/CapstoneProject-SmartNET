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

$(document).ready(function() {
  var dbRef = database.ref('/'); // Adjust the path as needed
  dbRef.once('value').then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      var accordion = $('#accordion1');

      // Sort the palcos by their keys
      var sortedPalcos = Object.keys(data).sort().reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {});

      for (var key in sortedPalcos) {
        if (sortedPalcos.hasOwnProperty(key)) {
          var palco = sortedPalcos[key];
          var header = key.replace(':', ' ');
          
          // Sort the readings by timestamp in descending order
          var sortedAmbientalReadings = Object.keys(palco.lecturas_ambientales).sort((a, b) => {
            return new Date(palco.lecturas_ambientales[b].timestamp) - new Date(palco.lecturas_ambientales[a].timestamp);
          });

          var sortedElectricalReadings = Object.keys(palco.lecturas_electricas).sort((a, b) => {
            return new Date(palco.lecturas_electricas[b].timestamp) - new Date(palco.lecturas_electricas[a].timestamp);
          });

          var ambientalContent = sortedAmbientalReadings.map(id => {
            var la = palco.lecturas_ambientales[id];
            return `<li>CO2: ${la.co2}, Presencia: ${la.presencia}, Temperatura: ${la.temperatura}, Timestamp: ${la.timestamp}</li>`;
          }).join('');

          var electricalContent = sortedElectricalReadings.map(id => {
            var le = palco.lecturas_electricas[id];
            return `<li>Corriente: ${le.corriente}, Voltage: ${le.voltage}, Timestamp: ${le.timestamp}</li>`;
          }).join('');

          var content = `
            <p><strong>Estado de Pago:</strong> ${palco.estado_pago}</p>
            <p><strong>Estado de Servicio:</strong> ${palco.estado_servicio}</p>
            <p><strong>Lecturas Ambientales:</strong></p>
            <ul>${ambientalContent}</ul>
            <p><strong>Lecturas Eléctricas:</strong></p>
            <ul>${electricalContent}</ul>
            <p><strong>Tap:</strong> ${palco.tap}</p>
          `;

          accordion.append(`
            <li class="a11yAccordionItem">
              <div class="a11yAccordionItemHeader">
                ${header}
              </div>
              <div class="a11yAccordionHideArea">
                ${content}
              </div>
            </li>
          `);
        }
      }

      var myAccordion = new A11yAccordion({
        parentSelector: '#accordion1',
        overallSearch: true,
        searchActionType: 'collapse'
      });

      // Search functionality
      $('#searchInput').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.a11yAccordionItem').each(function() {
          var headerText = $(this).find('.a11yAccordionItemHeader').text().toLowerCase();
          if (headerText.indexOf(searchTerm) === -1) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      });

    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
});
