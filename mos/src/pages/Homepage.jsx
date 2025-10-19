import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export default function Homepage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12); // how many products shown while scrolling
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = [];
        snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        setProducts(items);
        setLoading(false);
      },
      async (err) => {
        console.error("Realtime products listener error:", err);
        setErrorMsg("Realtime read failed. Trying a one-time fetch...");

        try {
          const snap = await getDocs(q);
          const items = [];
          snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
          setProducts(items);
        } catch (getErr) {
          console.error("One-time products fetch failed:", getErr);
          if (getErr.code === "permission-denied") {
            setErrorMsg(
              "Permission denied. Adjust Firestore rules to allow reads on products."
            );
          } else {
            setErrorMsg("Failed to load products. See console for details.");
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsub();
  }, []);

  const handleAddToCart = (product) => {
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrls: product.imageUrls || []
      });
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Could not add to cart");
    }
  };

  const handleLoadMore = () => setVisibleCount((c) => c + 12);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {errorMsg && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          {errorMsg}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No products available right now.
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, visibleCount).map((product) => (
              <div key={product.id} className="border rounded overflow-hidden relative">
                {/* clickable area: image + title */}
                <Link to={`/product/${product.id}`} className="block p-3 hover:bg-gray-50">
                  <ProductCard product={product} compact />
                </Link>

                {/* inline controls for quick add while scrolling */}
                <div className="p-3 flex items-center justify-between border-t bg-white">
                  <div className="text-sm font-medium">${product.price}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                    >
                      Add to cart
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-xs text-gray-600 underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < products.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}