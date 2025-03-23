import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update } from "firebase/database";
import dotenv from "dotenv";
dotenv.config();

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY, 
  authDomain: process.env.NEXT_PUBLIC_AUTHDOM, 
  databaseURL: process.env.NEXT_PUBLIC_DBURL, 
  projectId: process.env.NEXT_PUBLIC_PJID, 
  storageBucket: process.env.NEXT_PUBLIC_STOREBUCKET, 
  messagingSenderId: process.env.NEXT_PUBLIC_MSENDID, 
  appId: process.env.NEXT_PUBLIC_APPID, 
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Add Driver to the database
function addDriver(userId, name, licensePlate) {
  return set(ref(db, `users/${userId}`), {
    name: name,
    licensePlate: licensePlate,
  }).then(() => {
    console.log(`Driver ${name} added successfully!`);
  }).catch((error) => {
    console.error("Error adding driver:", error);
  });
}

// Add a reservation to the database (only with selected date and duration)
function addReservation(reservationId, userId, spotId, selectedDate, duration, pricePaid) {
  return set(ref(db, `reservations/${reservationId}`), {
    userId: userId,
    spotId: spotId,
    selectedDate: selectedDate,
    duration: duration,
    pricePaid: pricePaid,
  }).then(() => {
    console.log(`Reservation ${reservationId} added successfully!`);
  }).catch((error) => {
    console.error("Error adding reservation:", error);
  });
}

// Add a parking spot with the updated location format
function addParkingSpot(spotId, location, pricePerHour) {
  return set(ref(db, `parkingSpots/${spotId}`), {
    occupied: false,
    currentUser: null,
    pricePerHour: pricePerHour,
    location: location,
  }).then(() => {
    console.log(`Parking spot ${spotId} added successfully!`);
  }).catch((error) => {
    console.error("Error adding parking spot:", error);
  });
}

// Test Data - Add drivers (Justin and Alice)
const userId1 = "user456";
const name1 = "Justin";
const licensePlate1 = "abc123";
addDriver(userId1, name1, licensePlate1);

const userId2 = "user789";
const name2 = "Alice";
const licensePlate2 = "xyz987";
addDriver(userId2, name2, licensePlate2);

// Test Data - Add parking spots (A1, A2) with updated location format
const spotId1 = "A1";
const location1 = "Row A, Spot 1"; // Updated location format
const pricePerHour1 = 5; // Base price per hour
addParkingSpot(spotId1, location1, pricePerHour1);

const spotId2 = "A2";
const location2 = "Row A, Spot 2"; // Updated location format
const pricePerHour2 = 5; // Base price per hour
addParkingSpot(spotId2, location2, pricePerHour2);

// Test Data - Add reservations for spots A1 and A2 (with selected date and duration only)
const reservationId1 = "RES-980245";
const selectedDate1 = "2025-03-21T10:34:00Z"; // ISO string format
const duration1 = 1; // Duration in hours
const pricePaid1 = 5; // Base price (no dynamic pricing)
addReservation(reservationId1, userId1, spotId1, selectedDate1, duration1, pricePaid1);

const reservationId2 = "RES-980246";
const selectedDate2 = "2025-03-21T12:45:00Z"; // ISO string format
const duration2 = 1; // Duration in hours
const pricePaid2 = 5; // Base price (no dynamic pricing)
addReservation(reservationId2, userId2, spotId2, selectedDate2, duration2, pricePaid2);
