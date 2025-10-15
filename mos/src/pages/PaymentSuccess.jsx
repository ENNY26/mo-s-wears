import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Thank you for your purchase. Your order has been received.
      </p>
      <Link
        to="/"
        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
