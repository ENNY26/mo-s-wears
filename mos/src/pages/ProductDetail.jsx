import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageTrackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "products", id, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setComments(arr);
      },
      (err) => {
        console.error("Comments listener error:", err);
        if (err.code === "permission-denied") {
          // fallback: clear comments and show message or fetch maybe public summary
          setComments([]);
        }
      }
    );
    return () => unsub();
  }, [id]);

  const averageRating = comments.length ? (comments.reduce((s,c)=>s+(c.rating||0),0)/comments.length).toFixed(1) : null;

  const handleAddToCart = () => {
    // ensure CartContext addItem receives selectedSize
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrls: product.imageUrls || [],
      quantity: qty || 1,
      selectedSize: selectedSize || "Free",
    });
    toast.success("Added to cart");
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to leave a review.");
    if (!newComment.trim()) return;
    await addDoc(collection(db, "products", id, "comments"), {
      userId: user.uid,
      userName: user.displayName || user.email,
      text: newComment.trim(),
      rating,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
    setRating(5);
  };

  const nextImage = () => {
    if (!product?.imageUrls?.length) return;
    setCurrentImageIndex((i) => (i + 1) % product.imageUrls.length);
  };
  const prevImage = () => {
    if (!product?.imageUrls?.length) return;
    setCurrentImageIndex((i) => (i - 1 + product.imageUrls.length) % product.imageUrls.length);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (dx > threshold) nextImage();
    else if (dx < -threshold) prevImage();
  };

  if (!product) return <div>Loading product...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {/* Swipeable gallery */}
          <div
            className="relative overflow-hidden rounded"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            ref={imageTrackRef}
          >
            <img
              src={product.imageUrls?.[currentImageIndex] || "/placeholder.png"}
              alt={product.title}
              className="w-full h-96 object-cover"
            />

            {/* thumbnails */}
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.imageUrls?.map((u, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-20 h-20 rounded overflow-hidden border ${currentImageIndex === i ? "ring-2 ring-indigo-500" : "border-gray-200"}`}
                >
                  <img src={u} alt={`${product.title}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Prev / Next buttons */}
            {product.imageUrls?.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full">
                  ‹
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full">
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <div className="mt-4">
            <span className="text-xl font-semibold">${product.price}</span>
            {averageRating && <span className="ml-4 text-sm text-yellow-600">⭐ {averageRating} ({comments.length})</span>}
          </div>

          {product.sizes?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Size</h4>

              <div className="flex flex-wrap gap-2">
                {/* existing sizes, if any */}
                {(product?.sizes || []).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1 border rounded ${selectedSize === sz ? "bg-black text-white" : "bg-white"}`}
                  >
                    {sz}
                  </button>
                ))}

                {/* Free size button */}
                <button
                  type="button"
                  onClick={() => setSelectedSize("Free")}
                  className={`px-3 py-1 border rounded ${selectedSize === "Free" ? "bg-black text-white" : "bg-white"}`}
                >
                  Free size
                </button>
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Colors</h4>
              <div className="flex gap-2 mt-2">
                {product.colors.map(c => (
                  <button key={c} onClick={()=>setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full border ${selectedColor===c? "ring-2 ring-offset-1":"border-gray-300"}`}
                    style={{ backgroundColor: c }}>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <input type="number" min="1" value={qty} onChange={e=>setQty(Math.max(1,Number(e.target.value)||1))} className="w-20 p-2 border" />
            <button onClick={handleAddToCart} className="bg-indigo-600 text-white px-4 py-2 rounded">Add to cart</button>
            <Link to="/checkout" className="text-indigo-700 ml-4">Go to checkout</Link>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      <section>
        <h3 className="text-xl font-bold">Reviews</h3>

        <form onSubmit={submitComment} className="mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Rating</label>
            <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="p-1 border">
              {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r} ★</option>)}
            </select>
          </div>

          <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Write your review" className="w-full border p-2 mt-2" rows={4} />

          <div className="mt-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Post review</button>
          </div>
        </form>

        <ul className="mt-6 space-y-4">
          {comments.length === 0 && <li className="text-gray-500">No reviews yet.</li>}
          {comments.map(c => (
            <li key={c.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <div className="font-semibold">{c.userName || "Customer"}</div>
                <div className="text-sm text-yellow-600">{c.rating} ★</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{c.text}</div>
              <div className="text-xs text-gray-400 mt-2">{c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ""}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}