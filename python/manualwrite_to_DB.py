import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import pytz

# Initialize the Firebase app
cred = credentials.Certificate('../src/components/DB/key-reto-estadioazteca-firebase.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://reto-estadioazteca-default-rtdb.firebaseio.com/'
})

print("Firebase app initialized successfully.")

# Get a reference to the database
ref = db.reference()

def get_tap_number(palco_number):
    return (palco_number - 1) // 4 + 1

def get_mexico_city_time():
    tz = pytz.timezone('America/Mexico_City')
    return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')

def update_database(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio):
    palco_number = int(palco.split(':')[1])
    tap_number = get_tap_number(palco_number)
    
    # Update tap, estado_pago, estado_servicio
    ref.child(f'{palco}/tap').set(tap_number)
    ref.child(f'{palco}/estado_pago').set(estado_pago)
    ref.child(f'{palco}/estado_servicio').set(estado_servicio)
    
    # Add new readings to lecturas_ambientales
    ambientales_ref = ref.child(f'{palco}/lecturas_ambientales').push()
    ambientales_ref.set({
        'co2': co2,
        'temperatura': temperatura,
        'presencia': presencia,
        'timestamp': get_mexico_city_time()
    })

    # Add new readings to lecturas_electricas
    electricas_ref = ref.child(f'{palco}/lecturas_electricas').push()
    electricas_ref.set({
        'voltage': voltage,
        'corriente': corriente,
        'timestamp': get_mexico_city_time()
    })

    print(f"Data successfully written to Firebase Realtime Database:\n"
          f"{palco}\n"
          f"tap: {tap_number}\n"
          f"corriente = {corriente}\n"
          f"voltage = {voltage}\n"
          f"co2 = {co2}\n"
          f"presencia = {presencia}\n"
          f"temperatura = {temperatura}\n"
          f"estado_pago = {estado_pago}\n"
          f"estado_servicio = {estado_servicio}\n")

#------------- CODE USAGE --------------
update_database(
    'palco:001', 
    corriente=5, 
    voltage=50.0, 
    co2=400, 
    presencia=True, 
    temperatura=22.5, 
    estado_pago=True, 
    estado_servicio=False)