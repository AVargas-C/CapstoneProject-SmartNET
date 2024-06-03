#include <WiFi.h>
#include <FirebaseESP32.h> // Use FirebaseESP8266.h for ESP8266

// Replace with your network credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// Your Firebase project API Key
#define FIREBASE_API_KEY "YOUR_FIREBASE_API_KEY"

// Your Firebase project URL
#define FIREBASE_PROJECT_ID "YOUR_FIREBASE_PROJECT_ID"

// Firebase authentication data
#define USER_EMAIL "YOUR_USER_EMAIL"
#define USER_PASSWORD "YOUR_USER_PASSWORD"

// Firebase Data object
FirebaseData firebaseData;

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected to Wi-Fi, IP address: ");
  Serial.println(WiFi.localIP());

  // Initialize Firebase
  Firebase.begin(FIREBASE_PROJECT_ID, FIREBASE_API_KEY);
  Firebase.reconnectWiFi(true);

  // Sign in to Firebase
  if (Firebase.signUp(&firebaseData, USER_EMAIL, USER_PASSWORD)) {
    Serial.println("Firebase sign-in successful");
  } else {
    Serial.printf("Firebase sign-in failed: %s\n", firebaseData.errorReason().c_str());
    return;
  }

  // Example usage
  updateDatabase("palco:001", 5.0, 220.0, 400, true, 22.5);
}

void loop() {
  // Your loop code here
}

void updateDatabase(const char* palco, float corriente, float voltage, int co2, bool presencia, float temperatura) {
  String path = String(palco) + "/";
  String timestamp = getTime();

  Firebase.setString(firebaseData, path + "corriente", String(corriente));
  Firebase.setString(firebaseData, path + "voltage", String(voltage));
  Firebase.setInt(firebaseData, path + "co2", co2);
  Firebase.setBool(firebaseData, path + "presencia", presencia);
  Firebase.setFloat(firebaseData, path + "temperatura", temperatura);
  Firebase.setString(firebaseData, path + "timestamp", timestamp);

  if (firebaseData.dataType() == "boolean") {
    Serial.println("Data successfully written to Firebase Realtime Database:");
    Serial.printf("palco: %s\n", palco);
    Serial.printf("corriente = %.2f\n", corriente);
    Serial.printf("voltage = %.2f\n", voltage);
    Serial.printf("co2 = %d\n", co2);
    Serial.printf("presencia = %s\n", presencia ? "true" : "false");
    Serial.printf("temperatura = %.2f\n", temperatura);
    Serial.printf("timestamp = %s\n\n", timestamp.c_str());
  } else {
    Serial.printf("Failed to write data: %s\n", firebaseData.errorReason().c_str());
  }
}

String getTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return "";
  }
  char timeStr[20];
  strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStr);
}