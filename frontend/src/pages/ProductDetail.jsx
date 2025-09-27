// ProductDetail.js - Updated with Reviews
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import axios from "axios";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const userRole = user?.role;

  useEffect(() => { 
    fetchProduct(); 
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/products/${productId}`
      );
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
    }
  };

  const addToCart = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/add`, {
        userId,
        productId: product._id,
        quantity: selectedQty,
      });
      alert("Product added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add product to cart!");
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  // Submit Review
  const submitReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please login to submit a review");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/products/${productId}/reviews`, {
        userId,
        rating,
        comment
      });
      
      alert("Review submitted successfully!");
      setComment("");
      setRating(5);
      setShowReviewForm(false);
      fetchProduct(); // Refresh product data to show new review
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review");
    }
  };

  const qtyOptions = [0.5, 1, 1.5, 2, 3, 4, 5];

  if (!product) return <p className="p-6">Loading product details...</p>;

  // Calculate average rating
  const averageRating = product.reviews.length > 0 
    ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
          )}
        </div>

        {/* Product Details */}
        <div>
          <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
          <p className="text-2xl text-green-600 font-semibold mb-2">₹{product.price}/kg</p>
          <p className="mb-4 text-gray-700">{product.description}</p>
          
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Available: {product.quantity} kg
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Sold by: <span className="font-semibold">{product.farmName}</span> ({product.location})
          </p>

          {/* Quantity selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Quantity (kg):
            </label>
            <select
              value={selectedQty}
              onChange={(e) => setSelectedQty(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
            >
              {qtyOptions.map((q) => (
                <option key={q} value={q} disabled={q > product.quantity}>
                  {q} kg {q > product.quantity ? '(Out of stock)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={addToCart} 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Add to Cart
            </button>
            <button 
              onClick={buyNow} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">Customer Reviews</h3>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold mr-2">{averageRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-xl">
                    {star <= averageRating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">({product.reviews.length} reviews)</span>
            </div>
          </div>
          
          {userId && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating:
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your experience with this product..."
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            product.reviews.map((review) => (
              <div key={review._id} className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="flex text-yellow-400 mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= review.rating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold">{review.rating}/5</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Farmer Reply */}
                {review.farmerReply && (
                  <div className="ml-6 mt-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-blue-700">Farm Response:</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.farmerReplyDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.farmerReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;