#include <Arduino.h>

const int sensorPin = 34;  // Pin al que está conectado el sensor ACS712
const float sensitivity = 0.066; // Sensibilidad del sensor ACS712 30A (66 mV/A)
const int adcResolution = 4095;  // Resolución del ADC de la ESP32
const float Vref = 3.3;  // Voltaje de referencia del ADC
float zeroCurrentVoltage;  // Voltaje del sensor cuando no hay corriente

const int numSamples = 1000;  // Número de muestras para calcular el RMS
float buffer[numSamples];  // Buffer para almacenar las muestras

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);  // Configura la resolución del ADC a 12 bits
  zeroCurrentVoltage = calibrateSensor();
}

void loop() {
  sampleACCurrent();  // Muestrea la corriente AC y almacena en el buffer
  float currentRMS = calculateRMS();  // Calcula el RMS de las muestras en el buffer
  Serial.print("Corriente RMS: ");
  Serial.print(currentRMS, 3);  // Muestra el valor RMS con 3 decimales
  Serial.println(" A");
  delay(1000);  // Espera un segundo antes de la próxima lectura
}

void sampleACCurrent() {
  for (int i = 0; i < numSamples; i++) {
    int adcValue = analogRead(sensorPin);
    float voltage = (adcValue * Vref) / adcResolution;  // Convierte el valor ADC a voltaje
    buffer[i] = (voltage - zeroCurrentVoltage) / sensitivity;  // Almacena la corriente instantánea en el buffer
    delayMicroseconds(16);  // Retardo para muestrear a 60 kHz (aproximadamente 16.6 microsegundos entre muestras)
  }
}

float calculateRMS() {
  float sum = 0;
  for (int i = 0; i < numSamples; i++) {
    sum += sq(buffer[i]);  // Suma los cuadrados de las corrientes en el buffer
  }
  return sqrt(sum / numSamples);  // Calcula el valor RMS
}

float calibrateSensor() {
  const int calibrationSamples = 1000;  // Número de muestras para la calibración
  float sum = 0;
  for (int i = 0; i < calibrationSamples; i++) {
    sum += analogRead(sensorPin);
    delayMicroseconds(16);
  }
  return (sum / calibrationSamples) * Vref / adcResolution;  // Calcula el voltaje promedio cuando no hay corriente
}



