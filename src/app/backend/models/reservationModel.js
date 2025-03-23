import { db } from "../firebase.js";
import { ref, set, get } from "firebase/database";

// Add a reservation
export const addReservation = async (reservationId, userId, spotId, startTime, endTime, pricePaid) => {
  await set(ref(db, `reservations/${reservationId}`), {
    userId: userId,
    spotId: spotId,
    duration: duration,
    pricePaid: pricePaid,
  });
};

// Get reservation by ID
export const getReservation = async (reservationId) => {
  const snapshot = await get(ref(db, `reservations/${reservationId}`));
  return snapshot.val();
};