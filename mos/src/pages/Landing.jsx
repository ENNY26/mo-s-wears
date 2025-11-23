// pages/Landing.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Heart, Star, Truck, Shield, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import the shared Navigation component
import SiteNavigation from "../components/Navigation.jsx";
import img1 from '../assets/img1.jpg'
import img2 from '../assets/img2.jpg'
import img3 from '../assets/img3.png'
import img4 from '../assets/img4.png'
import img5 from '../assets/img5.png'
import img6 from '../assets/img6.jpg'
import img7 from '../assets/img7.jpg'
import img8 from '../assets/img8.jpg'
import img9 from '../assets/img9.jpg'
import logo1 from '../assets/logo1.jpg'

export default function Landing() {
  const navigate = useNavigate();

  const heroSlides = [
    {
      image: img1,
      title: "Elevate Your Style",
      subtitle: "Discover our premium collection of fashion essentials",
      buttonText: "Shop Collection"
    },
    {
      image: img2,
      title: "New Arrivals",
      subtitle: "Fresh styles for the modern individual",
      buttonText: "Explore New"
    },
    {
      image: img3,
      title: "Summer Collection",
      subtitle: "Lightweight and comfortable fashion",
    }
  ];

  const exclusiveProducts = [
    {
      image: img5,
      title: "Radiant Bloom Set",
      price: "$49.99",
      originalPrice: "$99.99",
      category: "Two-Piece Set",
      rating: 4.5,
      reviews: "128"
    },
    {
      image: img7,
      title: "Royal Indigo Boubou",
      price: "$39.99",
      originalPrice: "$89.99",
      category: "Dress",
      rating: 4.8,
      reviews: "95"
    },
    {
      image: img6,
      title: "Urban Vibe Set",
      price: "$39.99",
      originalPrice: "$59.99",
      category: "Two-Piece Set",
      rating: 4.3,
      reviews: "76"
    }
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $100"
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% protected checkout"
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      description: "30-day return policy"
    },
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "Handpicked materials"
    }
  ];

  const categories = [
    {
      name: "Two-Piece Sets",
      image: img8,
      items: "10+ Items"
    },
    {
      name: "BouBou and Kaftans",
      image: img9,
      items: "10+ Items"
    },
    {
      name: "Children Collections",
      image: img4,
      items: "30+ Items"
    },
    {
      name: "Sale Items",
      image: img7,
      items: "10+ Items"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Use the shared Navigation component */}
      <SiteNavigation />

      {/* Hero Section - Slideshow */}
      <section className="relative h-screen mt-16 sm:mt-20">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={1200}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.hero-swiper-button-next',
            prevEl: '.hero-swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              return `<span class="${className} !bg-white/70 hover:!bg-white transition-all duration-300"></span>`;
            },
          }}
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                {/* Background Image with Parallax Effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center transform scale-105"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundPosition: 'center 40%'
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

                {/* Content */}
                <div className="relative h-full flex items-center justify-center px-4">
                  <div className="text-center max-w-4xl text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider"
                    >
                      {slide.category || "NEW COLLECTION"}
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg sm:text-xl lg:text-2xl mb-8 font-light tracking-wide text-gray-100 max-w-2xl mx-auto"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      onClick={() => navigate("/homepage")}
                      className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:bg-gray-100 transition-all duration-300 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105"
                    >
                      {slide.buttonText || "Shop Now"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Arrows */}
          <button className="hero-swiper-button-prev hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 items-center justify-center rounded-full z-10 group">
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button className="hero-swiper-button-next hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 items-center justify-center rounded-full z-10 group">
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination !bottom-6 sm:!bottom-10" />
        </Swiper>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-purple-600" />
                <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Shop by Category
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover your perfect style across our curated collections
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer aspect-[3/4]"
                onClick={() => navigate("/homepage")}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-purple-900/70 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-200">{category.items}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-6 sm:mb-8">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 mx-auto" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8">
              At Mo's Clothing, we redefine modern African fashion with bold creativity, cultural pride, and timeless style. Our mission is to craft beautifully designed pieces that celebrate identity, confidence, and heritage — while staying true to ethical craftsmanship and sustainable values.
              We create fashion that empowers you to express your story, your roots, and your style — the modern African way.
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">10K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="w-px h-12 sm:h-16 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">500+</div>
                <div className="text-xs sm:text-sm text-gray-600">Products</div>
              </div>
              <div className="w-px h-12 sm:h-16 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">4.9</div>
                <div className="text-xs sm:text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Exclusive Deals */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-red-50 rounded-full">
              <span className="text-red-600 text-sm font-semibold">LIMITED TIME OFFER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Exclusive Deals
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Curated collections for the modern individual
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {exclusiveProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group/heart">
                  <Heart className="w-5 h-5 text-gray-600 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-all" />
                </button>

                {/* Product Image */}
                <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Sale Badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    SALE
                  </div>

                  {/* Overlay with Quick View */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
                    <button className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 flex items-center gap-2">
                      Quick View
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-purple-600 mb-2 font-semibold uppercase tracking-wider">{product.category}</p>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">{product.title}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{product.price}</span>
                    <span className="text-sm sm:text-base text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <button
              onClick={() => navigate("/homepage")}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:shadow-2xl transition-all duration-300 text-base sm:text-lg font-semibold hover:scale-105"
            >
              View All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 text-purple-300" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Stay in the Loop
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Subscribe to our newsletter and be the first to know about new collections,
              exclusive deals, and special promotions. Plus, get 10% off your first order!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300 text-sm sm:text-base"
              />
              <button className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 hover:bg-gray-100 transition-all duration-300 font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base">
                Subscribe
              </button>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6">
              By subscribing, you agree to our Privacy Policy and Terms of Service
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                    <img src={logo1} alt="Mo's Clothing" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                Premium fashion for the modern individual. Timeless designs that speak to your unique style.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group">
                  <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group">
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group">
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase">Shop</h4>
              <ul className="space-y-3 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Women's Collection</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Men's Collection</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Accessories</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Sale</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm tracking-wider mb-6 font-normal text-purple-200">POLICIES</h4>
              <ul className="space-y-3 text-sm text-purple-300 font-light">
                <li><a href="/refund-policy" className="hover:text-white transition">Refund Policy</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase">Contact</h4>
              <div className="space-y-4 text-sm sm:text-base text-gray-400">
                <div className="flex items-start gap-3 group cursor-pointer">
                  <Phone className="w-5 h-5 mt-0.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">+1 (718) 775-4711</span>
                </div>
                <div className="flex items-start gap-3 group cursor-pointer">
                  <Mail className="w-5 h-5 mt-0.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">mosclothing459@gmail.com</span>
                </div>
                <div className="flex items-start gap-3 group cursor-pointer">
                  <MapPin className="w-5 h-5 mt-0.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">New York, USA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
            <p>© 2025 The Mo's Clothing. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="/refund-policy" className="hover:text-white transition">Refund Policy</a>
              <a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}