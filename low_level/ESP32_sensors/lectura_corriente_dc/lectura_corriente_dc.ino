#include <Arduino.h>

const int sensorPin = 34;  // Pin al que está conectado el sensor ACS712
const float sensitivity = 0.066; // Sensibilidad del sensor ACS712 30A (66 mV/A)
const int adcResolution = 4095;  // Resolución del ADC de la ESP32
const float Vref = 3.3;  // Voltaje de referencia del ADC
float zeroCurrentVoltage;  // Voltaje del sensor cuando no hay corriente

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);  // Configura la resolución del ADC a 12 bits
  zeroCurrentVoltage = calibrateSensor();
}

void loop() {
  float current = readDCCurrent();
  Serial.print("Corriente DC: ");
  Serial.print(current, 3);  // Muestra la corriente DC con 3 decimales
  Serial.println(" A");
  delay(1000);  // Espera un segundo antes de la próxima lectura
}

float readDCCurrent() {
  int adcValue = analogRead(sensorPin);
  float voltage = (adcValue * Vref) / adcResolution;  // Convierte el valor ADC a voltaje
  float current = (voltage - zeroCurrentVoltage) / sensitivity;  // Calcula la corriente DC ajustada
  return current;
}

float calibrateSensor() {
  const int calibrationSamples = 1000;  // Número de muestras para la calibración
  float sum = 0;
  for (int i = 0; i < calibrationSamples; i++) {
    sum += analogRead(sensorPin);
    delayMicroseconds(1000);
  }
  return (sum / calibrationSamples) * Vref / adcResolution;  // Calcula el voltaje promedio cuando no hay corriente
}

