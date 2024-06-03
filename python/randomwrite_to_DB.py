import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import pytz
import random

# Initialize the Firebase app
cred = credentials.Certificate('../src/assets/DB/key-reto-estadioazteca-firebase.json')
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
          f"palco: {palco}\n"
          f"tap = {tap_number}\n"
          f"corriente = {corriente}\n"
          f"voltage = {voltage}\n"
          f"co2 = {co2}\n"
          f"presencia = {presencia}\n"
          f"temperatura = {temperatura}\n"
          f"estado_pago = {estado_pago}\n"
          f"estado_servicio = {estado_servicio}\n")

def generate_random_data(number_of_loops, number_of_palcos, corriente_min_value, corriente_max_value, voltage_min_value, voltage_max_value, co2_min_value, co2_max_value, presencia_value, temperatura_min_value, temperatura_max_value, estado_pago_value, estado_servicio_value):
    for _ in range(number_of_loops):
        for i in range(1, number_of_palcos + 1):
            palco = f'palco:{i:03d}'
            corriente = round(random.uniform(corriente_min_value, corriente_max_value), 2)
            voltage = round(random.uniform(voltage_min_value, voltage_max_value), 2)
            co2 = random.randint(co2_min_value, co2_max_value)
            temperatura = round(random.uniform(temperatura_min_value, temperatura_max_value), 2)
            
            if presencia_value == '1':
                presencia = random.choice([True, False])
            elif isinstance(presencia_value, str) and presencia_value.lower() == 'true':
                presencia = True
            elif isinstance(presencia_value, str) and presencia_value.lower() == 'false':
                presencia = False
            else:
                raise ValueError("Invalid value for presencia_value. Use '1', 'true', or 'false'.")

            if estado_pago_value == '1':
                estado_pago = random.choice([True, False])
            elif isinstance(estado_pago_value, str) and estado_pago_value.lower() == 'true':
                estado_pago = True
            elif isinstance(estado_pago_value, str) and estado_pago_value.lower() == 'false':
                estado_pago = False
            else:
                raise ValueError("Invalid value for estado_pago. Use '1', 'true', or 'false'.")

            if estado_servicio_value == '1':
                estado_servicio = random.choice([True, False])
            elif isinstance(estado_servicio_value, str) and estado_servicio_value.lower() == 'true':
                estado_servicio = True
            elif isinstance(estado_servicio_value, str) and estado_servicio_value.lower() == 'false':
                estado_servicio = False
            else:
                raise ValueError("Invalid value for estado_servicio. Use '1', 'true', or 'false'.")

            update_database(palco, corriente, voltage, co2, presencia, temperatura, estado_pago, estado_servicio)
    
    print("Random data generation complete.")

# Example usage
generate_random_data(
    number_of_loops=1, 
    number_of_palcos=10, 
    corriente_min_value=0.0,
    corriente_max_value=10.0, 
    voltage_min_value=0.0,
    voltage_max_value=240.0, 
    co2_min_value=0,
    co2_max_value=100000, 
    presencia_value='1', 
    temperatura_min_value=0.0,
    temperatura_max_value=50.0, 
    estado_pago_value='1', 
    estado_servicio_value='1')
