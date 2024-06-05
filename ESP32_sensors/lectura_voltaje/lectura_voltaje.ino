#include <ZMPT101B.h>     //include sensor library

#define SENSITIVITY 500.0f  //define the sensitivity

ZMPT101B voltageSensor(27, 60.0);



void setup() {
  Serial.begin(115200); // Iniciar comunicación serial a 115200 baudios
  voltageSensor.setSensitivity(SENSITIVITY);
}

void loop() {
   float voltage = voltageSensor.getRmsVoltage();
  
  
  //Serial.print(" Voltage: ");
  Serial.println(voltage);

   // Esperar medio segundo antes de la siguiente lectura
}


