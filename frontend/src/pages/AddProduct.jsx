import React, { useState } from "react";
import axios from "axios";
import "../styles/farmerDashboard.css";

const CLOUD_NAME = "dulv9qgah";
const UPLOAD_PRESET = "farmercart";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "", description: "", price: "", quantity: "", farmName: "", location: ""
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1 || files.length > 5) return alert("Upload 1-5 images");
    setImages(files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  const uploadImages = async () => {
    const urls = [];
    for (const img of images) {
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", UPLOAD_PRESET);
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
      urls.push(res.data.secure_url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 1) return setMessage("Upload at least 1 image");
    setLoading(true);
    try {
      const imageUrls = await uploadImages();
      const token = localStorage.getItem("token");
      console.log(token);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/farmer/products`,
        { ...form, images: imageUrls },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Product added successfully!");
      setForm({ name: "", description: "", price: "", quantity: "", farmName: "", location: "" });
      setImages([]); setPreview([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add product.");
    }
    setLoading(false);
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="add-product-form">
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <input name="farmName" placeholder="Farm Name" value={form.farmName} onChange={handleChange} required />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <div className="preview">{preview.map((src, i) => <img key={i} src={src} alt={`preview-${i}`} width="100" />)}</div>

        <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Add Product"}</button>
      </form>
    </div>
  );
};

export default AddProduct;
