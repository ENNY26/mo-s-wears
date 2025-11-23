// pages/Landing.jsx - Updated (Remove the duplicate nav)
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
      category: "Two-Piece Set ",
    },
    {
      image: img7,
      title: "Royal Indigo Boubou",
      price: "$39.99",
      originalPrice: "$89.99",
      category: "Dress",
    },
    {
      image: img6,
      title: "Urban Vibe Set",
      price: "$39.99",
      originalPrice: "$59.99",
      category: "Two-Piece Set",
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
        {/* ... rest of your Landing page content EXACTLY as you have it ... */}
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={1200}
          autoplay={{
            delay: 100,
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
                      {slide.buttonText}
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

      {/* ... Keep ALL your existing sections exactly as they are ... */}
      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        {/* ... your existing features content ... */}
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        {/* ... your existing categories content ... */}
      </section>

      {/* Mission Statement */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* ... your existing mission content ... */}
      </section>

      {/* Exclusive Deals */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        {/* ... your existing exclusive deals content ... */}
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
        {/* ... your existing newsletter content ... */}
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        {/* ... your existing footer content ... */}
      </footer>
    </div>
  );
}