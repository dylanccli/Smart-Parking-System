import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { remove } from "firebase/database";
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

// Add Driver
export function addDriver(userId, name, licensePlate) {
  return set(ref(db, `users/${userId}`), {
    name: name,
    licensePlate: licensePlate,
  })
    .then(() => {
      console.log(`Driver ${name} added successfully!`);
    })
    .catch((error) => {
      console.error("Error adding driver:", error);
    });
}

// Add Reservation
export function addReservation(reservationId, userId, spotId, selectedDate, duration, pricePaid) {
  return set(ref(db, `reservations/${reservationId}`), {
    userId: userId,
    spotId: spotId,
    selectedDate: selectedDate,
    duration: duration,
    pricePaid: pricePaid,
  })
    .then(() => {
      console.log(`Reservation ${reservationId} added successfully!`);
    })
    .catch((error) => {
      console.error("Error adding reservation:", error);
    });
}

// Fetch active reservations (one-time fetch)
export async function fetchActiveReservations() {
  const reservationsRef = ref(db, 'reservations');
  try {
    const snapshot = await get(reservationsRef);
    const reservations = snapshot.val();
    const activeReservations = [];
    const currentTime = new Date().getTime();

    for (const reservationId in reservations) {
      const reservation = reservations[reservationId];
      const reservationEndTime = new Date(reservation.selectedDate).getTime() + reservation.duration * 60 * 60 * 1000;

      if (reservationEndTime > currentTime) {
        activeReservations.push(reservation);
      }
    }

    return activeReservations;
  } catch (error) {
    console.error("Error fetching active reservations:", error);
    return [];
  }
}

// Real-time listener for active reservations
export function subscribeToActiveReservations(callback) {
  const reservationsRef = ref(db, 'reservations');

  const unsubscribe = onValue(reservationsRef, (snapshot) => {
    const data = snapshot.val();
    const activeReservations = [];
    const currentTime = new Date().getTime();

    for (const reservationId in data) {
      const reservation = data[reservationId];
      const reservationEndTime = new Date(reservation.selectedDate).getTime() + reservation.duration * 60 * 60 * 1000;

      if (reservationEndTime > currentTime) {
        activeReservations.push(reservation);
      }
    }

    callback(activeReservations); // Send filtered data to your UI
  });

  return unsubscribe; // You can call this in cleanup to remove the listener
}

export function deleteExpiredReservations() {
  const reservationsRef = ref(db, "reservations");

  onValue(reservationsRef, (snapshot) => {
    const data = snapshot.val();
    const now = new Date().getTime();

    for (const reservationId in data) {
      const reservation = data[reservationId];
      const endTime =
        new Date(reservation.selectedDate).getTime() +
        Number(reservation.duration) * 60 * 60 * 1000;

      if (endTime <= now) {
        remove(ref(db, `reservations/${reservationId}`));
        console.log(`Deleted expired reservation ${reservationId}`);
      }
    }
  });
}