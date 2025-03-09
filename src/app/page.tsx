"use client"; // Mark this component as a Client Component

import { useState } from "react";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [isPaid, setIsPaid] = useState<boolean>(false); // Track payment status

  const handleSpotClick = (spot: string) => {
    setSelectedSpot(spot);
  };

  const handlePayment = () => {
    if (!selectedSpot || !driverName || !licensePlate || !dateTime || !duration) {
      alert("Please fill out all fields and select a parking spot.");
      return;
    }
    alert(
      `Proceeding to Payment...\n\nDriver: ${driverName}\nLicense Plate: ${licensePlate}\nSpot: ${selectedSpot}\nDate/Time: ${dateTime}\nDuration: ${duration} hour(s)\nTotal: $${
        duration === "1" ? "5" : duration === "3" ? "10" : "20"
      }`
    );
    setIsPaid(true); // Mark payment as completed
  };

  const handleReservation = () => {
    if (!isPaid) {
      alert("Please complete the payment first.");
      return;
    }
    alert(
      `Reservation Successful!\n\nDriver: ${driverName}\nLicense Plate: ${licensePlate}\nSpot: ${selectedSpot}\nDate/Time: ${dateTime}\nDuration: ${duration} hour(s)`
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full bg-gray-800 py-6 shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-400">
          TMU SMART PARK
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Reserve your parking spot in seconds!
        </p>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mt-8">
        {/* Left Side: Parking Spot Map */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Parking Spot Map
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {["A1", "A2", "A3", "B1", "B2", "B3"].map((spot) => (
              <div
                key={spot}
                className={`p-6 border-2 border-gray-700 rounded-lg text-center cursor-pointer transition-all transform hover:scale-105 ${
                  selectedSpot === spot
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleSpotClick(spot)}
              >
                <span className="text-lg font-semibold">{spot}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Selected Spot:{" "}
            <span className="font-bold text-blue-400">
              {selectedSpot || "None"}
            </span>
          </p>
        </div>

        {/* Right Side: Reservation Form */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Reservation Details
          </h2>
          <div className="space-y-6">
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
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400"
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
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Date/Time */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-300">
                CHOOSE DAY / TIME
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400"
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
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400"
              >
                <option value="1">1 hour</option>
                <option value="3">3 hours</option>
                <option value="24">24 hours</option>
              </select>
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
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Typical Pricing */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">
                TYPICAL PRICING
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">1 hour</span>
                  <span className="text-blue-400 font-bold">$5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">3+ hours</span>
                  <span className="text-blue-400 font-bold">$10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">24 hours</span>
                  <span className="text-blue-400 font-bold">$20</span>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                PRICE: ${duration === "1" ? "5" : duration === "3" ? "10" : "20"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                onClick={handlePayment}
              >
                PAY NOW
              </button>
              <button
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 ${
                  !isPaid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
                onClick={handleReservation}
                disabled={!isPaid} // Disable reservation until payment is completed
              >
                RESERVE NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}