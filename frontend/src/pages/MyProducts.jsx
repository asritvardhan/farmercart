import React, { useEffect, useState } from "react";
import axios from "axios";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [replyForms, setReplyForms] = useState({}); // for farmer replies

  const farmer = JSON.parse(localStorage.getItem("user"));
  const farmerId = farmer?._id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmer/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [farmerId]);

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
    });
  };

  const handleSave = async (productId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/farmer/products/${productId}`,
        editForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Product updated!");
      setEditingProductId(null);

      // refresh list
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmer/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product");
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyForms({ ...replyForms, [reviewId]: value });
  };

  const handleReplySubmit = async (productId, reviewId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/farmer/products/${productId}/reviews/${reviewId}/reply`,
        { reply: replyForms[reviewId] },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Reply added!");

      // refresh products
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmer/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(res.data);
      setReplyForms({});
    } catch (err) {
      console.error("Error replying to review:", err);
      alert("❌ Failed to reply");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Products</h2>

      {products.map((product) => (
        <div key={product._id} className="border rounded-lg p-4 mb-6">
          {/* ✅ Edit mode */}
          {editingProductId === product._id ? (
            <>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                className="border p-2 mb-2 w-full"
              />
              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleChange}
                className="border p-2 mb-2 w-full"
              />
              <input
                type="number"
                name="quantity"
                value={editForm.quantity}
                onChange={handleChange}
                className="border p-2 mb-2 w-full"
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleChange}
                className="border p-2 mb-2 w-full"
              />
              <button
                onClick={() => handleSave(product._id)}
                className="bg-green-600 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProductId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {product.images?.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-40 h-40 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p>₹{product.price} | {product.quantity} available</p>
              <p>{product.description}</p>
              <button
                onClick={() => handleEditClick(product)}
                className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
              >
                Edit
              </button>
            </>
          )}

          {/* ✅ Reviews Section */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Reviews</h4>
            {product.reviews?.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review._id} className="border-t pt-2 mt-2">
                  <p><strong>User:</strong> {review.user?.name || "Anonymous"}</p>
                  <p><strong>Rating:</strong> ⭐ {review.rating}</p>
                  <p><strong>Comment:</strong> {review.comment}</p>
                  {review.farmerReply && (
                    <p className="text-green-700"><strong>Farmer Reply:</strong> {review.farmerReply}</p>
                  )}

                  {/* ✅ Reply box */}
                  {!review.farmerReply && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyForms[review._id] || ""}
                        onChange={(e) => handleReplyChange(review._id, e.target.value)}
                        className="border p-2 w-full mb-2"
                      />
                      <button
                        onClick={() => handleReplySubmit(product._id, review._id)}
                        className="bg-green-600 text-white px-4 py-1 rounded"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyProducts;
