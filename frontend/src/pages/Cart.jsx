import React, { useState, useEffect } from "react";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [address, setAddress] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // Remove item
  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/${userId}/${productId}`);
      fetchCart();
    } catch (err) { console.error(err); }
  };

  // Update quantity
  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/cart/${userId}/${productId}`,
        { quantity }
      );
      fetchCart();
    } catch (err) { console.error(err); }
  };

  // Clear cart
  const handleClearCart = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/cart/${userId}/clear`);
      fetchCart();
    } catch (err) { console.error(err); }
  };

  // Place COD order
  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert("Please enter your delivery address!");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/order/cod`, {
        userId,
        address
      });
      alert("Order placed successfully!");
      setCheckoutMode(false);
      setAddress("");
      fetchCart(); // Cart cleared automatically after order
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order");
    }
  };

  if (!cart) return <p className="p-6">Loading cart...</p>;
  if (!cart.items || cart.items.length === 0)
    return <p className="p-6">🛒 Your cart is empty</p>;

  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Cart</h2>

      {cart.items.map((item) => (
  <div key={item.product._id} className="flex justify-between items-center border-b py-4">
    {/* Product Image */}
    <img
      src={item.product.images[0]} // first image
      alt={item.product.name}
      className="w-20 h-20 object-cover rounded mr-4"
    />

    <div className="flex-1">
      <h3 className="font-semibold">{item.product.name}</h3>
      <p className="text-gray-600">₹{item.product.price}</p>
      <div className="flex items-center space-x-2 mt-1">
        <button
          onClick={() =>
            handleQuantityChange(item.product._id, item.quantity - 1)
          }
          className="px-2 py-1 bg-gray-300 rounded"
        >-</button>
        <span>{item.quantity}</span>
        <button
          onClick={() =>
            handleQuantityChange(item.product._id, item.quantity + 1)
          }
          className="px-2 py-1 bg-gray-300 rounded"
        >+</button>
      </div>
    </div>

    <button
      onClick={() => handleRemove(item.product._id)}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >Remove</button>
  </div>
))}


      <div className="mt-6 flex justify-between items-center">
        <h3 className="text-xl font-bold">Total: ₹{totalPrice}</h3>
        <div className="space-x-2">
          <button
            onClick={handleClearCart}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >Clear Cart</button>
          <button
            onClick={() => setCheckoutMode(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >Checkout</button>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Enter Delivery Address</h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Your delivery address"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCheckoutMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >Cancel</button>
              <button
                onClick={handlePlaceOrder}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
