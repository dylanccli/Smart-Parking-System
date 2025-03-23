import { db } from "../firebase.js";
import { ref, set, get, update } from "firebase/database";

// Step 1: Initialize all parking spots in the database
export const initializeParkingSpots = async () => {
  const spots = [
    { spotId: "A1", location: "Section A, Row 1", pricePerHour: 5 },
    { spotId: "A2", location: "Section A, Row 2", pricePerHour: 5 },
    { spotId: "A3", location: "Section A, Row 3", pricePerHour: 5 },
    { spotId: "A4", location: "Section A, Row 4", pricePerHour: 5 },
    { spotId: "B1", location: "Section B, Row 1", pricePerHour: 5 },
    { spotId: "B2", location: "Section B, Row 2", pricePerHour: 5 },
    { spotId: "B3", location: "Section B, Row 3", pricePerHour: 5 },
    { spotId: "B4", location: "Section B, Row 4", pricePerHour: 5 },
  ];

  for (let spot of spots) {
    await addParkingSpot(spot.spotId, spot.location, spot.pricePerHour);
  }

  console.log("All parking spots initialized.");
};

// Step 2: Add a parking spot
export const addParkingSpot = async (spotId, location, pricePerHour) => {
  await set(ref(db, `parkingSpots/${spotId}`), {
    occupied: false,
    currentUser: null,
    pricePerHour: pricePerHour,
    location: location,
  }).then(() => {
    console.log(`Parking spot ${spotId} added successfully!`);
  }).catch((error) => {
    console.error("Error adding parking spot:", error);
  });
};

// Step 3: Get reserved spots (that are occupied)
export const getReservedSpots = async () => {
  const snapshot = await get(ref(db, 'parkingSpots'));
  const spots = snapshot.val();

  // Filter out the spots that are occupied
  const reservedSpots = Object.keys(spots).filter(spotId => spots[spotId].occupied);
  
  return reservedSpots;
};

// Step 4: Update parking spot occupancy (to mark a spot as reserved)
export const updateParkingSpot = async (spotId, occupied, userId = null) => {
  await update(ref(db, `parkingSpots/${spotId}`), {
    occupied: occupied,
    currentUser: userId,
  }).then(() => {
    console.log(`Parking spot ${spotId} updated successfully.`);
  }).catch((error) => {
    console.error("Error updating parking spot:", error);
  });
};
