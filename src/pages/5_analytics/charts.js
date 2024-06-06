google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawCharts);

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

async function drawCharts() {
  try {
    const snapshot = await database.ref('/').once('value');
    const data = snapshot.val();

    // Initialize counts
    let estadoPagoTrue = 0;
    let estadoPagoFalse = 0;
    let estadoServicioTrue = 0;
    let estadoServicioFalse = 0;
    let presenciaTrue = 0;
    let presenciaFalse = 0;
    let voltageData = [];
    let corrienteData = [];
    let temperaturaData = [];
    let co2Data = [];
    let candlestickDataCorriente = [['Palco', 'Low', 'Open', 'Close', 'High']];
    let candlestickDataVoltage = [['Palco', 'Low', 'Open', 'Close', 'High']];
    let candlestickDataTemperatura = [['Palco', 'Low', 'Open', 'Close', 'High']];
    let candlestickDataCO2 = [['Palco', 'Low', 'Open', 'Close', 'High']];
    let totalCorriente = 0;
    let countCorriente = 0;
    let totalVoltage = 0;
    let countVoltage = 0;
    let totalTemperatura = 0;
    let countTemperatura = 0;
    let totalCO2 = 0;
    let countCO2 = 0;

    for (const palco in data) {
      if (data[palco].estado_pago) {
        estadoPagoTrue++;
      } else {
        estadoPagoFalse++;
      }

      if (data[palco].estado_servicio) {
        estadoServicioTrue++;
      } else {
        estadoServicioFalse++;
      }

      if (data[palco].lecturas_ambientales) {
        let totalTemperaturaPalco = 0;
        let totalCO2Palco = 0;
        let countTemperaturaPalco = 0;
        let countCO2Palco = 0;
        let temperaturaValues = [];
        let co2Values = [];

        for (const lectura in data[palco].lecturas_ambientales) {
          if (data[palco].lecturas_ambientales[lectura].presencia) {
            presenciaTrue++;
          } else {
            presenciaFalse++;
          }

          totalTemperaturaPalco += data[palco].lecturas_ambientales[lectura].temperatura;
          totalCO2Palco += data[palco].lecturas_ambientales[lectura].co2;
          temperaturaValues.push(data[palco].lecturas_ambientales[lectura].temperatura);
          co2Values.push(data[palco].lecturas_ambientales[lectura].co2);
          countTemperaturaPalco++;
          countCO2Palco++;
        }

        const avgTemperatura = totalTemperaturaPalco / countTemperaturaPalco;
        const avgCO2 = totalCO2Palco / countCO2Palco;
        temperaturaData.push([palco, avgTemperatura]);
        co2Data.push([palco, avgCO2]);
        totalTemperatura += totalTemperaturaPalco;
        countTemperatura += countTemperaturaPalco;
        totalCO2 += totalCO2Palco;
        countCO2 += countCO2Palco;

        if (temperaturaValues.length > 0) {
          temperaturaValues.sort((a, b) => a - b);
          const low = temperaturaValues[0];
          const high = temperaturaValues[temperaturaValues.length - 1];
          const open = temperaturaValues[Math.floor(temperaturaValues.length / 4)];
          const close = temperaturaValues[Math.floor((temperaturaValues.length * 3) / 4)];
          candlestickDataTemperatura.push([palco, low, open, close, high]);
        }

        if (co2Values.length > 0) {
          co2Values.sort((a, b) => a - b);
          const low = co2Values[0];
          const high = co2Values[co2Values.length - 1];
          const open = co2Values[Math.floor(co2Values.length / 4)];
          const close = co2Values[Math.floor((co2Values.length * 3) / 4)];
          candlestickDataCO2.push([palco, low, open, close, high]);
        }
      }

      if (data[palco].lecturas_electricas) {
        let totalVoltagePalco = 0;
        let countVoltagePalco = 0;
        let totalCorrientePalco = 0;
        let countCorrientePalco = 0;
        let corrienteValues = [];
        let voltageValues = [];

        for (const lectura in data[palco].lecturas_electricas) {
          totalVoltagePalco += data[palco].lecturas_electricas[lectura].voltage;
          totalCorrientePalco += data[palco].lecturas_electricas[lectura].corriente;
          corrienteValues.push(data[palco].lecturas_electricas[lectura].corriente);
          voltageValues.push(data[palco].lecturas_electricas[lectura].voltage);
          countVoltagePalco++;
          countCorrientePalco++;
        }

        const avgVoltage = totalVoltagePalco / countVoltagePalco;
        const avgCorriente = totalCorrientePalco / countCorrientePalco;
        voltageData.push([palco, avgVoltage]);
        corrienteData.push([palco, avgCorriente]);
        totalCorriente += totalCorrientePalco;
        countCorriente += countCorrientePalco;
        totalVoltage += totalVoltagePalco;
        countVoltage += countVoltagePalco;

        if (corrienteValues.length > 0) {
          corrienteValues.sort((a, b) => a - b);
          const low = corrienteValues[0];
          const high = corrienteValues[corrienteValues.length - 1];
          const open = corrienteValues[Math.floor(corrienteValues.length / 4)];
          const close = corrienteValues[Math.floor((corrienteValues.length * 3) / 4)];
          candlestickDataCorriente.push([palco, low, open, close, high]);
        }

        if (voltageValues.length > 0) {
          voltageValues.sort((a, b) => a - b);
          const low = voltageValues[0];
          const high = voltageValues[voltageValues.length - 1];
          const open = voltageValues[Math.floor(voltageValues.length / 4)];
          const close = voltageValues[Math.floor((voltageValues.length * 3) / 4)];
          candlestickDataVoltage.push([palco, low, open, close, high]);
        }
      }
    }

    const overallAvgCorriente = totalCorriente / countCorriente;
    const overallAvgVoltage = totalVoltage / countVoltage;
    const overallAvgTemperatura = totalTemperatura / countTemperatura;
    const overallAvgCO2 = totalCO2 / countCO2;

    // Data for estado_pago chart
    var chartDataPago = google.visualization.arrayToDataTable([
      ['Estado Pago', 'Count'],
      ['Pagado', estadoPagoTrue],
      ['No Pagado', estadoPagoFalse]
    ]);

    var optionsPago = {
      title: 'Estado de Pago de los Palcos',
      pieHole: 0.4,
    };

    var chartPago = new google.visualization.PieChart(document.getElementById('donutchart-pago'));
    chartPago.draw(chartDataPago, optionsPago);

    // Data for estado_servicio chart
    var chartDataServicio = google.visualization.arrayToDataTable([
      ['Estado Servicio', 'Count'],
      ['En Servicio', estadoServicioTrue],
      ['Fuera de Servicio', estadoServicioFalse]
    ]);

    var optionsServicio = {
      title: 'Estado de Servicio de los Palcos',
      pieHole: 0.4,
    };

    var chartServicio = new google.visualization.PieChart(document.getElementById('donutchart-servicio'));
    chartServicio.draw(chartDataServicio, optionsServicio);

    // Data for presencia chart
    var chartDataPresencia = google.visualization.arrayToDataTable([
      ['Presencia', 'Count'],
      ['Presente', presenciaTrue],
      ['Ausente', presenciaFalse]
    ]);

    var optionsPresencia = {
      title: 'Presencia en los Palcos',
      pieHole: 0.4,
    };

    var chartPresencia = new google.visualization.PieChart(document.getElementById('donutchart-presencia'));
    chartPresencia.draw(chartDataPresencia, optionsPresencia);

    // Data for corriente donut chart
    var chartDataCorrienteDonut = new google.visualization.DataTable();
    chartDataCorrienteDonut.addColumn('string', 'Palco');
    chartDataCorrienteDonut.addColumn('number', 'Average Corriente');
    corrienteData.forEach(item => chartDataCorrienteDonut.addRow([item[0], item[1]]));

    var optionsCorrienteDonut = {
      title: 'Average Corriente of Each Palco',
      pieHole: 0.4,
    };

    var chartCorrienteDonut = new google.visualization.PieChart(document.getElementById('donutchart-corriente'));
    chartCorrienteDonut.draw(chartDataCorrienteDonut, optionsCorrienteDonut);

    // Data for corriente candlestick chart
    var chartDataCandlestickCorriente = google.visualization.arrayToDataTable(candlestickDataCorriente);

    var optionsCandlestickCorriente = {
      legend: 'none',
      title: 'Candlestick Chart of Corriente'
    };

    var chartCandlestickCorriente = new google.visualization.CandlestickChart(document.getElementById('candlestickchart_corriente'));
    chartCandlestickCorriente.draw(chartDataCandlestickCorriente, optionsCandlestickCorriente);

    // Data for voltage candlestick chart
    var chartDataCandlestickVoltage = google.visualization.arrayToDataTable(candlestickDataVoltage);

    var optionsCandlestickVoltage = {
      legend: 'none',
      title: 'Candlestick Chart of Voltage'
    };

    var chartCandlestickVoltage = new google.visualization.CandlestickChart(document.getElementById('candlestickchart_voltage'));
    chartCandlestickVoltage.draw(chartDataCandlestickVoltage, optionsCandlestickVoltage);

    // Data for temperatura candlestick chart
    var chartDataCandlestickTemperatura = google.visualization.arrayToDataTable(candlestickDataTemperatura);

    var optionsCandlestickTemperatura = {
      legend: 'none',
      title: 'Candlestick Chart of Temperatura'
    };

    var chartCandlestickTemperatura = new google.visualization.CandlestickChart(document.getElementById('candlestickchart_temperatura'));
    chartCandlestickTemperatura.draw(chartDataCandlestickTemperatura, optionsCandlestickTemperatura);

    // Data for co2 candlestick chart
    var chartDataCandlestickCO2 = google.visualization.arrayToDataTable(candlestickDataCO2);

    var optionsCandlestickCO2 = {
      legend: 'none',
      title: 'Candlestick Chart of CO2'
    };

    var chartCandlestickCO2 = new google.visualization.CandlestickChart(document.getElementById('candlestickchart_co2'));
    chartCandlestickCO2.draw(chartDataCandlestickCO2, optionsCandlestickCO2);

    // Data for corriente combo chart
    var chartDataComboCorriente = new google.visualization.DataTable();
    chartDataComboCorriente.addColumn('string', 'Palco');
    chartDataComboCorriente.addColumn('number', 'Average Corriente');
    chartDataComboCorriente.addColumn('number', 'Overall Average Corriente');
    corrienteData.forEach(item => chartDataComboCorriente.addRow([item[0], item[1], overallAvgCorriente]));

    var optionsComboCorriente = {
      title: 'Average Corriente of Each Palco and Overall Average',
      vAxis: {title: 'Corriente'},
      hAxis: {title: 'Palco'},
      seriesType: 'bars',
      series: {1: {type: 'line'}}
    };

    var chartComboCorriente = new google.visualization.ComboChart(document.getElementById('combochart_corriente'));
    chartComboCorriente.draw(chartDataComboCorriente, optionsComboCorriente);

    // Data for voltage combo chart
    var chartDataComboVoltage = new google.visualization.DataTable();
    chartDataComboVoltage.addColumn('string', 'Palco');
    chartDataComboVoltage.addColumn('number', 'Average Voltage');
    chartDataComboVoltage.addColumn('number', 'Overall Average Voltage');
    voltageData.forEach(item => chartDataComboVoltage.addRow([item[0], item[1], overallAvgVoltage]));

    var optionsComboVoltage = {
      title: 'Average Voltage of Each Palco and Overall Average',
      vAxis: {title: 'Voltage'},
      hAxis: {title: 'Palco'},
      seriesType: 'bars',
      series: {1: {type: 'line'}}
    };

    var chartComboVoltage = new google.visualization.ComboChart(document.getElementById('combochart_voltage'));
    chartComboVoltage.draw(chartDataComboVoltage, optionsComboVoltage);

    // Data for temperatura combo chart
    var chartDataComboTemperatura = new google.visualization.DataTable();
    chartDataComboTemperatura.addColumn('string', 'Palco');
    chartDataComboTemperatura.addColumn('number', 'Average Temperatura');
    chartDataComboTemperatura.addColumn('number', 'Overall Average Temperatura');
    temperaturaData.forEach(item => chartDataComboTemperatura.addRow([item[0], item[1], overallAvgTemperatura]));

    var optionsComboTemperatura = {
      title: 'Average Temperatura of Each Palco and Overall Average',
      vAxis: {title: 'Temperatura'},
      hAxis: {title: 'Palco'},
      seriesType: 'bars',
      series: {1: {type: 'line'}}
    };

    var chartComboTemperatura = new google.visualization.ComboChart(document.getElementById('combochart_temperatura'));
    chartComboTemperatura.draw(chartDataComboTemperatura, optionsComboTemperatura);

    // Data for CO2 combo chart
    var chartDataComboCO2 = new google.visualization.DataTable();
    chartDataComboCO2.addColumn('string', 'Palco');
    chartDataComboCO2.addColumn('number', 'Average CO2');
    chartDataComboCO2.addColumn('number', 'Overall Average CO2');
    co2Data.forEach(item => chartDataComboCO2.addRow([item[0], item[1], overallAvgCO2]));

    var optionsComboCO2 = {
      title: 'Average CO2 of Each Palco and Overall Average',
      vAxis: {title: 'CO2'},
      hAxis: {title: 'Palco'},
      seriesType: 'bars',
      series: {1: {type: 'line'}}
    };

    var chartComboCO2 = new google.visualization.ComboChart(document.getElementById('combochart_co2'));
    chartComboCO2.draw(chartDataComboCO2, optionsComboCO2);

  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
  }
}