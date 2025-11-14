import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
            Privacy Policy
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
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed font-light">
              The Mo's Clothing ("we", "us", "our", or "Company") operates the themosclothing.com website (the "Site"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Site and the choices you have associated with that data.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">2. Information Collection and Use</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <div className="space-y-3 ml-4">
              <div>
                <h3 className="font-semibold text-purple-700 mb-2">Personal Data:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 font-light">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Cookies and Usage Data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">3. Use of Data</h2>
            <p className="text-gray-700 leading-relaxed font-light mb-4">
             The Mo's Clothing uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 font-light ml-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

    

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">5. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed font-light">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">6. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed font-light">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 font-medium">Email: mosclothing459@gmail.com</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}