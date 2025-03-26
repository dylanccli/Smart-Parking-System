import time
import random
import firebase_admin
from firebase_admin import credentials, db

# Configuring realtime database
cred = credentials.Certificate("smartparkingsystem.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smartparkingsystem-8612f-default-rtdb.firebaseio.com/'
})

# Database references
parking_spots_ref = db.reference('parkingSpots')
reservations_ref = db.reference('reservations')

# All parking spot IDs
PARKING_SPOTS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4']

def get_reserved_spots():
    """Fetch all currently reserved spotIDs from Firebase"""
    try:   
        # Get all spotIds from all reservations
        data = reservations_ref.get()
        return [
            reservation.get("spotId") 
            for reservation in data.values() 
            if isinstance(reservation, dict) and "spotId" in reservation
        ]
    except (AttributeError, TypeError):
        return []

def update_parking_occupancy():
    """Update parking spots occupancy status"""
    try:
        # Get currently reserved spots
        reserved_spots = get_reserved_spots()
        print(f"Reserved spots: {reserved_spots}")
        
        # Process each parking spot
        for spot_id in PARKING_SPOTS:
            # Get current spot data
            spot_data = parking_spots_ref.child(spot_id).get() or {}
            
            # Update logic
            if spot_id in reserved_spots:
                # Mark reserved spots as occupied
                update_data = {'occupied': True}
            else:
                # Randomly set occupancy for non-reserved spots
                update_data = {'occupied': random.choice([True, False])}
            
            # Update only the 'occupied' field
            parking_spots_ref.child(spot_id).update(update_data)
        
        print(f"Updated occupancy status for parking spots at {time.strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"Error updating parking spots: {e}")

def main():
    while True:
        print("1. Create a manual reservation. (For testing purposes)")
        print("2. Manually occupy a spot. (For testing purposes)")
        print("3. Simulate regular sensor function. This option will continue to loop the simulation")
        
        choice = input("Enter your choice (1-3): ")
        
        if choice == "1":
            manual_reservation_id = input("Enter reservation ID: ")
            manual_duration = input("Enter duration: ")
            manual_price = input("Enter price paid: ")
            manual_date = "2025-03-28T02:51"
            manual_spot_id = input("Enter spot ID: ")
            manual_user_id = "user-debugging"
            reservations_ref.update({
                manual_reservation_id: {
                    "duration": manual_duration,
                    "pricePaid": manual_price,
                    "selectedDate": manual_date,
                    "spotId": manual_spot_id,
                    "userId": manual_user_id
                }
            })
        elif choice == "2":
            manual_spot_id = input("Enter spot ID: ")
            parking_spots_ref.child(manual_spot_id).update({'occupied': True})
            print(f'Manually occupied spot: {manual_spot_id}')
        elif choice == "3":
            while True:
                update_parking_occupancy()
                time.sleep(10)  # Wait 10 seconds between updates
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
