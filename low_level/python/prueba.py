import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import pytz

# Initialize the app with a service account
cred = credentials.Certificate('../src/assets/DB/key-reto-estadioazteca-firebase.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://reto-estadioazteca-default-rtdb.firebaseio.com/'
})

# Populate tap_mapping with the mappings generated
tap_mapping = {}
for tap_index in range(1, 21):  # 20 taps
    for palco_index in range(1, 5):  # Each tap has 4 palcos
        palco_number = (tap_index - 1) * 4 + palco_index
        tap_mapping[f'palco:{palco_number:02}'] = f'tap:{tap_index:02}'

def update_database(palco, corriente, voltaje, co2, presencia):
    # Get the correct tap for the palco
    tap = tap_mapping.get(palco)
    if not tap:
        print(f"No tap found for {palco}")
        return

    # Mexico City timezone
    timezone = pytz.timezone('America/Mexico_City')
    mexico_time = datetime.now(timezone).strftime('%Y-%m-%d %H:%M:%S')

    # Reference to the correct tap and palco in the database
    ref = db.reference(f'/{tap}/{palco}')

    # Updating electrical readings
    ref.child('lecturas_electricas').set({
        'corriente': corriente,
        'voltaje': voltaje,
        'timestamp': mexico_time
    })

    # Updating environmental readings
    ref.child('lecturas_ambientales').set({
        'co2': co2,
        'presencia': presencia,
        'timestamp': mexico_time
    })

    print(f"Updated data for {palco} under {tap}")

# Example usage
update_database('palco:03', 10.5, 220, 400, 'No')
