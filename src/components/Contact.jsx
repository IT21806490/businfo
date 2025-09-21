import React from "react";
import { Bus, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Contact Section */}
      <main className="flex-1 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl sm:max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-6 sm:mb-8 text-center">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {/* Left - Contact Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md shadow px-6 py-3 hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>

            {/* Right - Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail className="text-blue-600" size={22} />
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-gray-600">support@businfo.click</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-blue-600" size={22} />
                <div>
                  <p className="font-semibold text-gray-800">Phone</p>
                  <p className="text-gray-600">+94 71 123 4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="text-blue-600" size={22} />
                <div>
                  <p className="font-semibold text-gray-800">Address</p>
                  <p className="text-gray-600">
                    No. 123, Main Street, Colombo, Sri Lanka
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="mt-4 sm:mt-6">
                <iframe
                  title="BusInfo Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63312.24144024771!2d79.821185!3d6.921442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2595b8d2bdb77%3A0xceb21e8cf45a9fc3!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="rounded-lg shadow"
                ></iframe>
              </div>

              {/* Request / Complaint Email */}
              <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-sm text-center">
                <p className="text-blue-800 font-semibold mb-2">
                  Send Your Request or Complaint
                </p>
                <a
                  href="mailto:support@businfo.click?subject=Request%20or%20Complaint"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
