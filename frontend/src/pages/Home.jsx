import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrendingUp, FiUsers } from 'react-icons/fi';
import api from '../utils/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch featured products
    api.get('/products/featured')
      .then(res => setFeaturedProducts(res.data.data.products))
      .catch(err => console.error(err));

    // Fetch categories
    api.get('/categories')
      .then(res => setCategories(res.data.data.categories))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 md:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Welcome to Our Marketplace</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8">Discover amazing products from verified vendors</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/products" className="bg-white text-primary-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 text-center">
                Shop Now
              </Link>
              <Link to="/register" className="border-2 border-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 text-center">
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <FiShoppingBag className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-sm md:text-base text-gray-600">Thousands of products from multiple vendors</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <FiTrendingUp className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-sm md:text-base text-gray-600">Competitive prices and great deals</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <FiUsers className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Verified Vendors</h3>
              <p className="text-sm md:text-base text-gray-600">All vendors are verified and trusted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="card hover:shadow-lg transition-shadow text-center"
              >
                <img src={category.image || '/placeholder.jpg'} alt={category.name} className="w-full h-24 md:h-32 object-cover rounded-lg mb-2 md:mb-3" />
                <h3 className="text-sm md:text-base font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">₹{product.salePrice || product.basePrice}</span>
                  {product.salePrice && (
                    <span className="text-sm text-gray-500 line-through">₹{product.basePrice}</span>
                  )}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 ml-1">{product.averageRating.toFixed(1)} ({product.totalReviews})</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
