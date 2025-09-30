// admin/EditProduct.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    sizes: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ["T-Shirts", "Shirts", "Pants", "Jackets", "Shoes", "Accessories"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = docSnap.data();
          setForm({
            title: productData.title || "",
            description: productData.description || "",
            price: productData.price || "",
            category: productData.category || "",
            sizes: productData.sizes || [],
          });
          setExistingImages(productData.imageUrls || []);
        } else {
          toast.error("Product not found");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setForm(prev => ({ ...prev, sizes: [...prev.sizes, value] }));
    } else {
      setForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== value) }));
    }
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 5) {
      toast.error("Maximum 5 images allowed in total");
      return;
    }
    setNewImages(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async () => {
    const uploadPromises = newImages.map(async (image) => {
      const imgRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(imgRef, image);
      return await getDownloadURL(imgRef);
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setUploading(true);

    try {
      let allImageUrls = [...existingImages];
      
      // Upload new images if any
      if (newImages.length > 0) {
        const newImageUrls = await uploadNewImages();
        allImageUrls = [...allImageUrls, ...newImageUrls];
      }

      // Update product in Firestore
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        ...form,
        price: parseFloat(form.price),
        imageUrls: allImageUrls,
        sizes: form.sizes,
        updatedAt: new Date(),
      });

      toast.success("Product updated successfully!");
      navigate("/admin");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              ← Back to Admin
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Premium Cotton T-Shirt"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description..."
                rows="4"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Sizes *
              </label>
              <div className="flex flex-wrap gap-4">
                {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                  <label key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={size}
                      checked={form.sizes.includes(size)}
                      onChange={handleSizeChange}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Images ({existingImages.length}/5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add New Images ({existingImages.length + newImages.length}/5 total)
              </label>
              
              {/* New Image Preview */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Input */}
              {(existingImages.length + newImages.length) < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {uploading ? "Updating Product..." : "Update Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;