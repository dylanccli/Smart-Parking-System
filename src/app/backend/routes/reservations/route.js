import { db } from "../../../firebase";  // Import Firebase configuration from the correct path
import { ref, set } from "firebase/database";

// Handle the POST request to create a reservation
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, spotId, selectedDate, duration, pricePaid } = req.body;

    // Generate a unique reservation ID
    const reservationId = `RES-${Math.floor(Math.random() * 1000000)}`;

    try {
      // Save reservation data in Firebase Realtime Database
      await set(ref(db, `reservations/${reservationId}`), {
        userId,
        spotId,
        selectedDate,
        duration,
        pricePaid,
      });

      // Send back the reservation ID to the client
      res.status(200).json({ reservationId });
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
