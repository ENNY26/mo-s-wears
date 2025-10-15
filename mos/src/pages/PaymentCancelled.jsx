import { Link } from "react-router-dom";

export default function PaymentCancelled() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center p-6">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Cancelled</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your payment was cancelled. You can try again or modify your order.
      </p>
      <Link
        to="/checkout"
        className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition"
      >
        Return to Checkout
      </Link>
    </div>
  );
}
