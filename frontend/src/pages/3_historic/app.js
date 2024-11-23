// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBL5phOVI-kE8-dQEK6nBReblTT4Z1MTaM",
  authDomain: "smartnet-39d8d.firebaseapp.com",
  databaseURL: "https://smartnet-39d8d-default-rtdb.firebaseio.com",
  projectId: "smartnet-39d8d",
  storageBucket: "smartnet-39d8d.firebasestorage.app",
  messagingSenderId: "1085688887668",
  appId: "1:1085688887668:web:c340b4867d0e5a40049421",
  measurementId: "G-EDBEH41WH6"
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

          var content = `
            <p><strong>Estado de Pago:</strong> ${palco.estado_pago}</p>
            <p><strong>Estado de Servicio:</strong> ${palco.estado_servicio}</p>
            <p><strong>Tap:</strong> ${palco.tap}</p>
            <div class="chart-grid">
              <div class="chart-container" id="chart_presencia_${key}"></div>
              <div class="chart-container" id="chart_co2_${key}"></div>
              <div class="chart-container" id="chart_temperatura_${key}"></div>
              <div class="chart-container" id="chart_voltage_${key}"></div>
              <div class="chart-container" id="chart_corriente_${key}"></div>
            </div>
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

          // Draw the charts for each row
          drawChart(`chart_presencia_${key}`, palco.lecturas_ambientales, 'presencia', 'Presencia Over Time', true);
          drawChart(`chart_co2_${key}`, palco.lecturas_ambientales, 'co2', 'CO2 Over Time');
          drawChart(`chart_temperatura_${key}`, palco.lecturas_ambientales, 'temperatura', 'Temperatura Over Time');
          drawChart(`chart_voltage_${key}`, palco.lecturas_electricas, 'voltage', 'Voltage Over Time');
          drawChart(`chart_corriente_${key}`, palco.lecturas_electricas, 'corriente', 'Corriente Over Time');
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

  function drawChart(containerId, readings, field, title, isBoolean = false) {
    google.charts.setOnLoadCallback(function() {
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Timestamp');
      data.addColumn('number', field);

      var sortedReadings = Object.keys(readings).sort((a, b) => {
        return new Date(readings[b].timestamp) - new Date(readings[a].timestamp);
      });

      sortedReadings.forEach(id => {
        var reading = readings[id];
        var value = isBoolean ? (reading[field] ? 1 : 0.2) : reading[field];
        data.addRow([reading.timestamp, value]);
      });

      var options = {
        title: title,
        hAxis: {title: 'Time', titleTextStyle: {color: '#333'}},
        vAxis: {minValue: 0},
        legend: {position: 'bottom'}
      };

      var chart = new google.visualization.AreaChart(document.getElementById(containerId));
      chart.draw(data, options);
    });
  }
});
