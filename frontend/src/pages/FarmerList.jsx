import React, { useEffect, useState } from "react";
import axios from "axios";

const FarmersList = ({ onSelectFarmer }) => {
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmers`); // backend should send {name, location, distance, image}
        // sort by distance ascending
        setFarmers(res.data.sort((a, b) => a.distance - b.distance));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarmers();
  }, []);

  return (
    <div className="farmers-list">
      <h2>Nearby Farmers</h2>
      <div className="farmer-cards">
        {farmers.map((f) => (
          <div key={f._id} className="farmer-card" onClick={() => onSelectFarmer(f)}>
            <img src={f.imageUrl || "/default-farmer.jpg"} alt={f.name} />
            <h3>{f.name}</h3>
            <p>{f.location}</p>
            <p>📍 {f.distance} km away</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmersList;
