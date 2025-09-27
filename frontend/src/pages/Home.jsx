import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = ({ searchQuery, filterCategory }) => {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);

  // Fetch farmers from backend
  const fetchFarmers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/farmers`);
      if (!response.ok) {
        throw new Error("Failed to fetch farmers");
      }
      const data = await response.json();
      setFarmers(data);
    } catch (error) {
      console.error("Error fetching farmers:", error);
    }
  };

  // Call fetchFarmers on mount
  useEffect(() => {
    fetchFarmers();
  }, []);

  // Filter farmers whenever searchQuery, filterCategory, or farmers change
  useEffect(() => {
    let filtered = [...farmers];

    // ✅ Search by farmer name
    if (searchQuery) {
      filtered = filtered.filter((farmer) =>
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ✅ Filter by category (optional: based on products the farmer sells)
    if (filterCategory) {
      filtered = filtered.filter((farmer) =>
        farmer.categories?.includes(filterCategory)
      );
    }

    setFilteredFarmers(filtered);
  }, [searchQuery, filterCategory, farmers]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Choose a Farmer</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredFarmers.length > 0 ? (
          filteredFarmers.map((farmer) => (
            <div
              key={farmer._id}
              className="farmer-card border p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{farmer.name}</h3>
              <p className="text-gray-600">{farmer.location}</p>
              <Link
                to={`/farmer/${farmer._id}`}
                className="text-green-600 font-semibold mt-2 inline-block"
              >
                View Products →
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No farmers match your search</p>
        )}
      </div>
    </div>
  );
};

export default Home;
