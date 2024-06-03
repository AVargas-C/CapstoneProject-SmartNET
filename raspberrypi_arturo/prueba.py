import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import pytz

# Initialize the app with a service account
cred = credentials.Certificate('/home/pi/Desktop/key-reto-estadioazteca-firebase.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-database-url.firebaseio.com/'  # Replace with your Firebase database URL
})

def update_database(palco, corriente, voltaje, co2, presencia):
    # Mexico City timezone
    timezone = pytz.timezone('America/Mexico_City')
    mexico_time = datetime.now(timezone).strftime('%Y-%m-%d %H:%M:%S')

    ref = db.reference(f'/{palco}')  # Path to your palco in the database

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

# Example of updating data for 'palco01'
update_database('palco01', 10.5, 220, 400, 'No')

