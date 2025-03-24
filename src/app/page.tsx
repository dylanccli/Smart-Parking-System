"use client"; // Mark this component as a Client Component

import { useState, useEffect } from "react";
import { addDriver, addReservation } from './backend/firebase'; // Adjust the path if needed
import { fetchActiveReservations } from './backend/firebase';
import { subscribeToActiveReservations } from './backend/firebase';
import { deleteExpiredReservations } from './backend/firebase';

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [reservationNumber, setReservationNumber] = useState<string>("");
  const [activeReservations, setActiveReservations] = useState<any[]>([]);
  const [dynamicPricePerHour, setDynamicPricePerHour] = useState<number>(5);
  const [activeSensors, setActiveSensors] = useState<Set<string>>(new Set());
  const [simulatedOccupancy, setSimulatedOccupancy] = useState<number>(0);
  

  // State to track the current page
  const [currentPage, setCurrentPage] = useState<"reservation" | "payment" | "confirmation">("reservation");

  // State to control sliding animations
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  // State to track if the card has been added
  const [isCardAdded, setIsCardAdded] = useState<boolean>(false);

  type Reservation = {
    userId: string;
    spotId: string;
    selectedDate: string;
    duration: number | string;
    pricePaid: number;
  };

  // Calculate occupancy based on active reservations
  const calculateOccupancy = () => {
    const totalSpots = 8; // Total number of parking spots (A1, A2, ..., B4)
    const reservedSpots = activeReservations.length; // Number of reserved spots
    return reservedSpots / totalSpots; // Occupancy ratio
  };

  useEffect(() => {
    const iotInterval = setInterval(() => {
      const spots = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];
      const randomSpot = spots[Math.floor(Math.random() * spots.length)];
      
      setActiveSensors(prev => {
        const newSet = new Set(prev);
        newSet.add(randomSpot);
        return newSet;
      });
  
      setTimeout(() => {
        setActiveSensors(prev => {
          const newSet = new Set(prev);
          newSet.delete(randomSpot);
          return newSet;
        });
      }, 1500);
  
      setSimulatedOccupancy(prev => Math.min(100, Math.max(0, prev + (Math.random() * 2 - 1))));
    }, 3000);
  
    return () => clearInterval(iotInterval);
  }, []);
  

  // Fetch dynamic pricing from the backend
  useEffect(() => {
    const fetchDynamicPricing = async () => {
      if (!dateTime) return;

      const occupancy = calculateOccupancy(); // Calculate occupancy

      try {
        // Send the timestamp and occupancy to the backend
        const response = await fetch(
          `http://localhost:5000/pricing?timestamp=${encodeURIComponent(dateTime)}&occupancy=${occupancy}`
        );
        const data = await response.json();
        setDynamicPricePerHour(data.price); // Update the dynamic price
      } catch (error) {
        console.error("Error fetching dynamic pricing:", error);
      }
    };

    fetchDynamicPricing(); // Call the function to fetch dynamic pricing
  }, [dateTime, activeReservations]); // Re-run when dateTime or activeReservations changes
  const calculateTotalPrice = () => {
    const durationHours = parseFloat(duration);
    return (dynamicPricePerHour * durationHours + 1).toFixed(2);
  };

  // Update Typical Pricing section
  const typicalPricing = [
    { duration: 1, label: "1 hour" },
    //{ duration: 3, label: "3+ hours" },
    { duration: 4.5, label: "24 hours" },
  ];
  
  useEffect(() => {
    
    deleteExpiredReservations();
    
    const unsubscribe = subscribeToActiveReservations((activeRes: Reservation[]) => {
      setActiveReservations(activeRes);      
    });
  
    return () => unsubscribe();
  }, []);
  

  // Function to check if a spot is reserved
  const isSpotReserved = (spot: string) => {
    return activeReservations.some((reservation) => reservation.spotId === spot);
  };

  const handleSpotClick = (spot: string) => {
    if (isSpotReserved(spot)) {
      alert("This spot is currently reserved.");
      return;
    }
    setSelectedSpot(spot);
  };

  const handlePayment = () => {
    if (!selectedSpot || !driverName || !licensePlate || !dateTime || !duration) {
      alert("Please fill out all fields and select a parking spot.");
      return;
    }
    setSlideDirection("left"); // Slide to the left for payment page
    setTimeout(() => setCurrentPage("payment"), 300); // Delay to allow animation
  };

  const handleReservation = async () => {
    if (!isPaid) {
      alert("Please complete the payment first.");
      return;
    }
  
    const reservationNum = `RES-${Math.floor(Math.random() * 1000000)}`;
    setReservationNumber(reservationNum);
    setSlideDirection("left");
  
    // Save driver and reservation data to Firebase
    try {
      // Generate a random user ID for the driver (in a real app, you would likely have a better system for this)
      const userId = `user-${Math.floor(Math.random() * 1000000)}`;
  
      // Add driver to Firebase
      await addDriver(userId, driverName, licensePlate);
  
      // Add reservation to Firebase
      const pricePaid = duration === "1" ? 6 : duration === "3" ? 11 : 21;
      await addReservation(reservationNum, userId, selectedSpot, dateTime, duration, pricePaid);
  
      console.log("Driver and reservation added successfully!");
  
      setTimeout(() => setCurrentPage("confirmation"), 300); // Transition to the confirmation page
    } catch (error) {
      console.error("Error adding reservation or driver:", error);
      alert("Error adding reservation. Please try again.");
    }
  };

  const simulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsPaid(true);
      setIsProcessingPayment(false);
      setIsCardAdded(true); // Mark the card as added
      setSlideDirection("right"); // Slide back to reservation page
      setTimeout(() => setCurrentPage("reservation"), 300); // Delay to allow animation
      alert("Card Added! You can now reserve your spot.");
    }, 2000);
  };

  const handlePrintReservation = () => {
    const confirmationElement = document.getElementById("confirmation");
    if (confirmationElement) {
      // Open the print dialog
      window.print();
    }
  };

  const handleNewBooking = () => {
    setSelectedSpot(null);
    setDriverName("");
    setLicensePlate("");
    setDateTime("");
    setDuration("1");
    //setIsPaid(false);
    // Do not reset isCardAdded here
    setSlideDirection("right"); // Slide back to reservation page
    setTimeout(() => setCurrentPage("reservation"), 300); // Delay to allow animation
    setReservationNumber("");
  };

  // Check if all fields are filled
  const areAllFieldsFilled = () => {
    return (
      selectedSpot &&
      driverName.trim() !== "" &&
      licensePlate.trim() !== "" &&
      dateTime &&
      duration
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full bg-gray-800 py-6 shadow-lg border-b border-gray-700">
        <h1 className="text-4xl font-bold text-center text-blue-400 animate-glow">
          TMU SMART PARK
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Reserve your parking spot in seconds!
        </p>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mt-8 items-start">
        {/* Left Side: Parking Spot Map */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 mt-12 md:mt-40">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Parking Spot Map
          </h2>
          <div className="mb-4 flex items-center justify-between px-2 py-1 bg-gray-900 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
                Available
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                Occupied
              </span>
            </div>
            <div className="text-blue-400">
              <span className="text-yellow-400">IoT</span> Network: {Math.floor(simulatedOccupancy)}% Active
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"].map((spot) => (
              <div
                key={spot}
                className={`p-6 border-2 border-gray-700 rounded-lg text-center cursor-pointer transition-all transform hover:scale-105 ${
                  currentPage !== "confirmation" ? "hover:scale-105" : ""
                  } ${
                    isSpotReserved(spot) || currentPage === "confirmation"
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
                  isSpotReserved(spot)
                    ? "bg-gray-900 cursor-not-allowed"
                    : selectedSpot === spot
                    ? "bg-blue-600 text-white border-blue-400 shadow-glow"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={
                  currentPage !== "confirmation" 
                    ? () => handleSpotClick(spot)
                    : undefined
                }
              >

                {/* IoT Status Indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full 
                  ${isSpotReserved(spot) ? 
                    'bg-red-500' : 
                    'bg-green-400'} 
                  ${activeSensors.has(spot) ? 'sensor-active' : ''}`}
                />

                {/* Occupancy Effect */}
                {!isSpotReserved(spot) && (
                  <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-200 to-transparent"
                      style={{transform: `rotate(${simulatedOccupancy * 3.6}`}} />
                )}

                <span className="text-lg font-semibold relative z-10">{spot}</span>
                
                {/* Data Transmission Animation */}
                {activeSensors.has(spot) && (
                  <div className="absolute -inset-1 border-2 border-blue-400 rounded-lg animate-pulse" />
                )}
              </div>
            ))}
            
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Selected Spot:{" "}
            <span className="font-bold text-blue-400">
              {selectedSpot || "None"}
            </span>
          </p>
          {/* Pricing Disclaimer */}
          <div className="mt-4 pt-3 border-t border-gray-600">
                  <p className="text-sm text-gray-400">
                    Pricing fluctuates based on:
                  </p>
                  <div className="text-xs text-gray-500 space-y-1 mt-2">
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Current parking occupancy</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Peak hours (7-9am, 4-6pm)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Weekend vs weekday rates</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Prices update every 15 minutes based on demand
                  </p>
                </div>
        </div>

        

        {/* Right Side: Reservation Form, Payment Form, or Confirmation Page */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 relative overflow-hidden">
          {/* Reservation Form */}
          {currentPage === "reservation" && (
            <div
              className={`space-y-6 transition-all duration-300 ${
                slideDirection === "left"
                  ? "-translate-x-full opacity-0"
                  : slideDirection === "right"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                Reservation Details
              </h2>
              <div className="space-y-6">
                {/* Driver's Name and License Plate Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver's Name */}
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-300">
                      DRIVER'S NAME
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                  </div>
                  {/* License Plate Number */}
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-300">
                      LICENSE PLATE NUMBER
                    </label>
                    <input
                      type="text"
                      placeholder="Enter license plate number"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Date/Time and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date/Time */}
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-300">
                      CHOOSE DAY / TIME
                    </label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                  </div>
                  {/* Duration */}
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-300">
                      CHOOSE HOW LONG
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="5">5 hours</option>
                      <option value="4.5">24 hours</option>
                      
                    </select>
                  </div>
                </div>

                {/* Selected Spot */}
                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-300">
                    SELECTED SPOT
                  </label>
                  <input
                    type="text"
                    value={selectedSpot || "None"}
                    readOnly
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>

                {/* Typical Pricing */}
                {/* Updated Pricing Displays */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">
                    DYNAMIC PRICING
                  </h3>
                  <div className="space-y-2">
                    {typicalPricing.map(({ duration, label }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-gray-300">{label}</span>
                        <span className="text-blue-400 font-bold">
                          ${(dynamicPricePerHour * duration).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                
             
                {/* Price Display */}
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 shadow-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">Order Total</h3>
                    <div className="space-y-3">
                      {/* Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Price:</span>
                        <span className="text-blue-400 font-bold">
                          ${(dynamicPricePerHour * parseFloat(duration)).toFixed(2)}
                        </span>
                      </div>
                      {/* Online Fee */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Online Reservation Fee:</span>
                        <span className="text-blue-400 font-bold">$1</span>
                      </div>
                      {/* Divider */}
                      <div className="border-t border-gray-600 my-2"></div>
                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="text-2xl text-gray-300 font-bold">Total:</span>
                        <span className="text-2xl text-blue-400 font-bold">
                          ${calculateTotalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md hover:shadow-green-500/50"
                    onClick={handlePayment}
                  >
                    {isCardAdded ? "UPDATE CARD" : "ADD CARD"}
                  </button>
                  <button
                    className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-blue-500/50 ${
                      !areAllFieldsFilled() || !isPaid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                    onClick={handleReservation}
                    disabled={!areAllFieldsFilled() || !isPaid}
                  >
                    RESERVE NOW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {currentPage === "payment" && (
            <div
              className={`space-y-6 transition-all duration-300 ${
                slideDirection === "left"
                  ? "translate-x-0 opacity-100"
                  : slideDirection === "right"
                  ? "translate-x-full opacity-0"
                  : "-translate-x-full opacity-0"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                Payment
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-300">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-300">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-md hover:shadow-gray-500/50"
                    onClick={() => {
                      setSlideDirection("right");
                      setTimeout(() => setCurrentPage("reservation"), 300);
                    }}
                  >
                    Back
                  </button>
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md hover:shadow-green-500/50 flex items-center justify-center"
                    onClick={simulatePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : isCardAdded ? (
                      "Update Card"
                    ) : (
                      "Add Card"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Page */}
          {currentPage === "confirmation" && (
            <div
              id="confirmation"
              className={`space-y-6 transition-all duration-300 ${
                slideDirection === "left"
                  ? "translate-x-0 opacity-100"
                  : slideDirection === "right"
                  ? "translate-x-full opacity-0"
                  : "-translate-x-full opacity-0"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                Reservation Confirmation
              </h2>
              <p className="text-lg text-gray-300">
                Thank you for your reservation! Here are your details:
              </p>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <p className="text-gray-300">
                  <span className="font-bold">Reservation Number:</span>{" "}
                  {reservationNumber}
                </p>
                <p className="text-gray-300">
                  <span className="font-bold">Driver's Name:</span> {driverName}
                </p>
                <p className="text-gray-300">
                  <span className="font-bold">License Plate:</span> {licensePlate}
                </p>
                <p className="text-gray-300">
                  <span className="font-bold">Date/Time:</span> {dateTime}
                </p>
                <p className="text-gray-300">
                  <span className="font-bold">Duration:</span> {duration} hour(s)
                </p>
                <p className="text-gray-300">
                  <span className="font-bold">Spot:</span> {selectedSpot}
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-blue-500/50"
                  onClick={handlePrintReservation}
                >
                  Print Reservation
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md hover:shadow-green-500/50"
                  onClick={handleNewBooking}
                >
                  Make New Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}