import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, Truck, Shield, ArrowRight, Play, ChevronLeft, ChevronRight, Search, Heart, User, Menu } from "lucide-react";


// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/parallax';


import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img4 from "../assets/img4.png";

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroProducts = [
    {
      image: img1,
      //title: "Summer Elegance Collection",
      //subtitle: "Discover timeless pieces",
     // price: "$299",
    },
    {
      image: img2,
     // title: "Urban Sophistication",
      //subtitle: "Redefine your style",
      //price: "$189",
    },
    {
      image: img4,
     // title: "Classic Minimalism",
     // subtitle: "Less is more",
      //price: "$249",
    }
  ];

  const categories = [
    {
      name: "Women's Collection",
      image: img2,
      count: "245 items"
    },
    {
      name: "Kids' Collection",
      image: img4,
      count: "189 items"
    },
    
    {
      name: "New Arrivals",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea4c8284?w=500&h=600&fit=crop",
      count: "52 items"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen  overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-lilac-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo Section - Replace with your actual logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-lilac-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <h1 className="text-2xl font-light tracking-wider bg-gradient-to-r from-purple-600 to-lilac-500 bg-clip-text text-transparent">
                  Mo's Wears
                </h1>
              </div>
              <div className="hidden md:flex gap-6 text-sm">
                <a href="#" className="text-purple-700 hover:text-purple-500 transition font-medium">Women</a>
                <a href="#" className="text-purple-700 hover:text-purple-500 transition font-medium">Men</a>
                <a href="#" className="text-purple-700 hover:text-purple-500 transition font-medium">Accessories</a>
                <a href="#" className="text-purple-700 hover:text-purple-500 transition font-medium">Sale</a>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 cursor-pointer text-purple-600 hover:text-purple-400 transition" />
              <Heart className="w-5 h-5 cursor-pointer text-purple-600 hover:text-purple-400 transition" />
              <User className="w-5 h-5 cursor-pointer text-purple-600 hover:text-purple-400 transition" />
              <ShoppingBag className="w-5 h-5 cursor-pointer text-purple-600 hover:text-purple-400 transition" />
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-lilac-400 text-white hover:from-purple-600 hover:to-lilac-500 transition-all transform hover:scale-105 text-sm font-medium"
              >
                Sign In
              </button>
              <Menu className="w-5 h-5 cursor-pointer text-purple-600 md:hidden" />
            </div>
          </div>
        </div>
      </nav>

      {/* Sophisticated Swiper Hero Section */}
      <section className="relative h-screen mt-16">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination, Parallax]}
          effect="fade"
          speed={1000}
          parallax={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              return `<span class="${className} transition-all duration-300"></span>`;
            },
          }}
          className="h-full"
        >
          {heroProducts.map((product, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full flex items-center justify-center">
                {/* Background with overlay */}
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.image})`, backgroundPosition: 'center' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-purple-500/30 to-lilac-400/40" />
                  </div>
                </div>

                {/* Image container - fully visible */}
                <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-3/4 md:h-4/5 lg:h-5/6 w-auto object-contain max-w-2xl"
                  />
                </div>

                {/* Content overlay on top */}
                <div className="relative h-full flex flex-col items-center justify-center text-white z-10 px-6">
                  <div className="text-center max-w-4xl">
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-4xl md:text-6xl lg:text-7xl font-light mb-4 tracking-wide text-white drop-shadow-lg"
                    >
                      {product.title}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg md:text-2xl mb-6 font-light tracking-wider text-purple-100 drop-shadow-md"
                    >
                      {product.subtitle}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="text-2xl md:text-3xl mb-8 font-light text-lilac-200 drop-shadow-md"
                    >
                      {product.price}
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      onClick={() => navigate("/homepage")}
                      className="bg-white text-purple-600 px-10 py-3 hover:bg-purple-50 transition-all duration-300 tracking-wider text-sm font-medium transform hover:scale-105 rounded-lg border-2 border-white hover:border-purple-200 shadow-lg"
                    >
                      SHOP NOW
                    </motion.button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Arrows */}
          <button className="swiper-button-prev absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-500/20 backdrop-blur-sm hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center rounded-full z-20 border border-purple-300/30">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button className="swiper-button-next absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-500/20 backdrop-blur-sm hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center rounded-full z-20 border border-purple-300/30">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination !bottom-8" />
        </Swiper>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-light tracking-wider mb-4 bg-gradient-to-r from-purple-600 to-lilac-500 bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-purple-600 font-light">Curated collections for every style</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden cursor-pointer aspect-[3/4] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-500/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-light mb-2 tracking-wide">{category.name}</h3>
                <p className="text-sm text-purple-200">{category.count}</p>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-300/50 rounded-xl transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-lilac-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-light text-center mb-16 tracking-wider bg-gradient-to-r from-purple-600 to-lilac-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose Mo's Wears?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Fresh drops every week with the latest trends",
                color: "from-yellow-400 to-purple-400"
              },
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders over $100. Fast delivery nationwide",
                color: "from-green-400 to-lilac-400"
              },
              {
                icon: Shield,
                title: "Premium Quality",
                desc: "100% authentic, carefully curated collections",
                color: "from-blue-400 to-purple-400"
              },
              {
                icon: ShoppingBag,
                title: "Easy Returns",
                desc: "30-day money-back guarantee, no questions asked",
                color: "from-pink-400 to-lilac-400"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl border border-purple-200 bg-white hover:shadow-lg transition-all duration-300 hover:border-purple-300 text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-purple-800">{feature.title}</h3>
                <p className="text-purple-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 to-lilac-400/10 border border-purple-300 rounded-2xl p-12 backdrop-blur-lg"
          >
            <h2 className="text-4xl font-light tracking-wider mb-4 bg-gradient-to-r from-purple-600 to-lilac-500 bg-clip-text text-transparent">
              Ready to Upgrade Your Style?
            </h2>
            <p className="text-purple-600 mb-8 text-lg max-w-2xl mx-auto font-light">
              Join thousands of satisfied customers who've transformed their wardrobe with Mo's Wears.
            </p>
            <motion.button
              onClick={() => navigate("/homepage")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-lilac-400 text-white px-10 py-4 rounded-lg font-medium transition-all hover:from-purple-600 hover:to-lilac-500 border-2 border-transparent hover:border-purple-300"
            >
              Start Shopping
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              {/* Footer Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-lilac-300 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <h3 className="text-2xl font-light tracking-wider text-white">Mo's Wears</h3>
              </div>
              <p className="text-purple-200 text-sm font-light leading-relaxed">
                Premium fashion for the modern individual. Timeless designs that speak to your unique style.
              </p>
            </div>

            <div>
              <h4 className="text-sm tracking-wider mb-6 font-normal text-purple-200">SHOP</h4>
              <ul className="space-y-3 text-sm text-purple-300 font-light">
                <li><a href="#" className="hover:text-white transition">Women's Collection</a></li>
                <li><a href="#" className="hover:text-white transition">Men's Collection</a></li>
                <li><a href="#" className="hover:text-white transition">Accessories</a></li>
                <li><a href="#" className="hover:text-white transition">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition">Sale</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm tracking-wider mb-6 font-normal text-purple-200">CUSTOMER SERVICE</h4>
              <ul className="space-y-3 text-sm text-purple-300 font-light">
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Shipping Information</a></li>
                <li><a href="#" className="hover:text-white transition">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-white transition">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition">Track Order</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm tracking-wider mb-6 font-normal text-purple-200">POLICIES</h4>
              <ul className="space-y-3 text-sm text-purple-300 font-light">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-600 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-purple-300">
            <p className="font-light">© 2025 Mo's Wears. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Pinterest</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}