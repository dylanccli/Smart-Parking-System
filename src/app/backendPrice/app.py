from flask import Flask, jsonify, request
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Function to get the day of the week from a timestamp
def get_day_of_week(timestamp: str):
    date_obj = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M")
    return date_obj.strftime("%A")

# Route to get dynamic pricing
@app.route('/pricing', methods=['GET'])
def get_pricing():
    base_price = 5  # Base price per hour
    occupancy = 0.5  # Simulated occupancy (replace with real data later)
    timestamp = request.args.get('timestamp', datetime.now().strftime("%Y-%m-%dT%H:%M"))  # Get timestamp from query params
    is_peak_hour = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M").hour in range(8, 18)  # Peak hours: 8 AM to 6 PM
    day_of_week = get_day_of_week(timestamp)  # Get day of the week
    price = calculate_price(base_price, occupancy, is_peak_hour, day_of_week)
    return jsonify({"price": price, "day_of_week": day_of_week})

# Function to calculate dynamic pricing
def calculate_price(base_price, occupancy, is_peak_hour, day_of_week):
    price = base_price
    if is_peak_hour:
        price *= 1.2  # 20% increase during peak hours
    if occupancy > 0.8:
        price *= 1.1  # 10% increase for high demand
    elif occupancy < 0.3:
        price *= 0.9  # 10% decrease for low demand
    # Adjust price for weekends
    if day_of_week in ["Saturday", "Sunday"]:
        price *= 1.5  # 50% increase on weekends
    return round(price, 2)

# Function to simulate price adjustments throughout the week
def simulate_weekly_pricing():
    base_price = 5
    occupancy = 0.5
    timestamps = [
        "2025-03-24T10:16",  # Monday
        "2025-03-25T10:16",  # Tuesday
        "2025-03-26T10:16",  # Wednesday
        "2025-03-27T10:16",  # Thursday
        "2025-03-28T10:16",  # Friday
        "2025-03-29T10:16",  # Saturday
        "2025-03-30T10:16",  # Sunday
    ]
    for timestamp in timestamps:
        is_peak_hour = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M").hour in range(8, 18)
        day_of_week = get_day_of_week(timestamp)
        price = calculate_price(base_price, occupancy, is_peak_hour, day_of_week)
        print(f"Timestamp: {timestamp}, Day: {day_of_week}, Price: {price}")

if __name__ == '__main__':
    # Simulate weekly pricing
    simulate_weekly_pricing()
    # Run the Flask app
    app.run(debug=True)