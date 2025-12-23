const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12 mt-12 md:mt-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Marketplace</h3>
            <p className="text-sm md:text-base text-gray-400">Your one-stop multi-vendor e-commerce platform.</p>
          </div>
          
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/products" className="hover:text-white">Products</a></li>
              <li><a href="/vendors" className="hover:text-white">Become a Vendor</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
              <li><a href="/shipping" className="hover:text-white">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Legal</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-sm md:text-base text-gray-400">
          <p>&copy; 2024 Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
