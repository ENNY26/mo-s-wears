import React, { useState } from "react";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

const storage = getStorage();

async function uploadFilesAndGetUrls(fileList) {
  const urls = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const path = `products/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        null,
        (err) => {
          console.error("Upload error", err);
          reject(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            urls.push(url);
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }
  return urls;
}

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [sizes, setSizes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = ["Dress", "2-piece", "Children Collection", "Jackets", "Shoes", "Accessories"];
  const tags = ["", "kids", "women", "men", "unisex"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!title || !price) return toast.error("Title and price required");
      const filesArray = Array.from(files || []);
      const imageUrls = filesArray.length ? await uploadFilesAndGetUrls(filesArray) : [];

      const docData = {
        title,
        price: Number(price),
        imageUrls,
        createdAt: serverTimestamp(),
        description,
        category,
        sizes,
        tag,
      };

      await addDoc(collection(db, "products"), docData);
      toast.success("Product added");
      setTitle("");
      setPrice("");
      setFiles([]);
      setDescription("");
      setCategory("");
      setSizes([]);
      setTag("");
    } catch (err) {
      console.error("Add product failed:", err);
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Premium Cotton T-Shirt"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <select
                name="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {tags.map(t => (
                  <option key={t} value={t}>{t === "" ? "Select a tag (optional)" : t}</option>
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                    checked={sizes.includes(size)}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      if (checked) {
                        setSizes(prev => [...prev, value]);
                      } else {
                        setSizes(prev => prev.filter(s => s !== value));
                      }
                    }}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Images * (Max 5)
            </label>

            {/* Image Preview */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(prev => Array.from(prev).filter((_, i) => i !== index));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* File Input */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5 images)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {uploading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}