import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "../components/ProductCard";

export default function KidsProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Show products tagged as 'kids' OR category matches 'Children Collection'
        const kids = items.filter(p => (p.tag && p.tag === 'kids') || (p.category && p.category === 'Children Collection'));
        setProducts(kids);
      } catch (err) {
        console.error("Failed to load kids products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-8">Loading kids products...</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Kids Collection</h1>

        {products.length === 0 ? (
          <p className="text-gray-600">No items found in the kids collection.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
