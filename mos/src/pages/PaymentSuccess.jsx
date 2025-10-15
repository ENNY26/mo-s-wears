import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
    <p className="mb-6">Thank you for your order. We’ve received your payment and your order is being processed.</p>
    <Link to="/orders" className="text-indigo-600 underline">View your orders</Link>
  </div>
);

export default PaymentSuccess;