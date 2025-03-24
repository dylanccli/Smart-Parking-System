from flask import Flask, jsonify, request
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Route to get dynamic pricing
@app.route('/pricing', methods=['GET'])
def get_pricing():
    try:
        # Get and validate timestamp from frontend
        timestamp = request.args.get('timestamp')
        if not timestamp:
            return jsonify({"error": "Timestamp parameter is required"}), 400

        # Get occupancy from frontend (default to 0.5 if not provided)
        occupancy = float(request.args.get('occupancy', 0.5))

        # Parse timestamp with validation
        try:
            # Handle both with and without seconds
            if len(timestamp) == 16:  # Format: YYYY-MM-DDTHH:MM
                dt_obj = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M")
            else:  # Format with seconds: YYYY-MM-DDTHH:MM:SS
                dt_obj = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S")
        except ValueError as e:
            return jsonify({"error": f"Invalid timestamp format: {str(e)}"}), 400

        # Calculate pricing factors
        base_price = 5  # Base price per hour
        
        is_peak_hour = dt_obj.hour in range(8, 18)  # 8 AM to 6 PM
        day_of_week = dt_obj.strftime("%A")
        
        # Calculate final price
        price = calculate_price(
            base_price=base_price,
            occupancy=occupancy,  # Use occupancy from frontend
            is_peak_hour=is_peak_hour,
            day_of_week=day_of_week
        )

        return jsonify({
            "price": price,
            "day_of_week": day_of_week,
            "is_peak_hour": is_peak_hour,
            "timestamp": dt_obj.isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Updated price calculation function
def calculate_price(base_price, occupancy, is_peak_hour, day_of_week):
    multipliers = {
        'peak_hour': 1.2,
        'high_demand': 1.1,
        'low_demand': 0.9,
        'weekend': 1.5
    }
    
    price = base_price
    
    # Apply peak hour multiplier
    if is_peak_hour:
        price *= multipliers['peak_hour']
    
    # Apply demand-based pricing
    if occupancy > 0.8:
        price *= multipliers['high_demand']
    elif occupancy < 0.3:
        price *= multipliers['low_demand']
    
    # Apply weekend pricing
    if day_of_week in ["Saturday", "Sunday"]:
        price *= multipliers['weekend']
    
    return round(price, 2)

if __name__ == '__main__':
    app.run(debug=True)