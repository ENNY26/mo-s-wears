import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-lilac-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-light tracking-wider mb-4 bg-gradient-to-r from-purple-600 to-lilac-500 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-purple-600 font-light">Last updated: November 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">1. Return Eligibility</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              We want you to be completely satisfied with your purchase. If you are not happy with your order, we offer a hassle-free return process within 30 days of purchase. Items must be:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>Unused and in original condition</li>
              <li>Still have all original tags attached</li>
              <li>In original packaging if possible</li>
              <li>Not damaged or altered</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">2. Non-Returnable Items</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              The following items cannot be returned or refunded:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>Clearance or final sale items (marked as such)</li>
              <li>Items purchased more than 30 days ago</li>
              <li>Worn, damaged, or altered items</li>
              <li>Items without tags or original packaging</li>
              <li>Custom or personalized orders</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">3. How to Return an Item</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              To initiate a return, please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>Contact our customer service team at mosclothing459@gmail.com with your order number</li>
              <li>Provide details about the item you wish to return</li>
              <li>Receive return shipping instructions and a prepaid return label</li>
              <li>Pack the item securely and ship it to us using the provided label</li>
              <li>Once received and inspected, your refund will be processed</li>
            </ol>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">4. Refund Processing</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              Refunds will be processed as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>Refunds are processed within 5-7 business days after item inspection</li>
              <li>The refund will be credited to your original payment method</li>
              <li>Original shipping costs are non-refundable</li>
              <li>Return shipping is free for defective items; customer pays for other returns</li>
              <li>If items are damaged due to our error, return shipping is free</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">5. Exchanges</h2>
            <p className="text-gray-700 leading-relaxed font-light">
              We offer free exchanges for items within 30 days. If you'd like to exchange an item for a different size or color, please contact our customer service team and we'll arrange the exchange at no additional cost.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">6. Defective Items</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              If you receive a defective or damaged item, please contact us immediately with photos of the damage. We will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>Provide a full refund or replacement at no cost</li>
              <li>Arrange free return shipping</li>
              <li>Ship the replacement immediately</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">7. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              If you have any questions about our refund policy, please contact us:
            </p>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 font-medium">Email: mosclothing459@gmail.com</p>
              <p className="text-purple-800 font-medium">Phone: 718-775-4711</p>
              <p className="text-purple-800 font-medium">Hours: Monday-Friday, 9AM-6PM EST</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}