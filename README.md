Multi-Vendor E-Commerce Marketplace

This is a full-featured e-commerce platform built with MongoDB, Express, React, and Node.js. It supports multiple vendors, allowing them to sell their products independently while administrators manage the overall platform.


What This Platform Does

Authentication and User Management

The platform uses JWT tokens with refresh token support for secure authentication. Users can register with email verification, reset passwords when needed, and even login through Google or GitHub accounts. There are three user roles: customers who buy products, vendors who sell them, and administrators who oversee everything.

Vendor Features

Vendors can apply to sell on the platform through an approval workflow. Once approved, they get their own dashboard showing sales analytics, revenue tracking, and order management. Each vendor can customize their store with banners, logos, and descriptions. They manage their product inventory, handle orders, and receive ratings from customers.

Product Management

Vendors can create products with multiple images and variants like different sizes, colors, or materials. The system handles dynamic pricing based on variants and tracks stock levels with low-stock alerts. Products are organized into categories and can have tags and attributes. There's even support for bulk uploads via CSV files, and the platform tracks which products users recently viewed.

Shopping Experience

Customers can search products using full-text search and filter by price range, ratings, categories, and brands. The search includes autocomplete suggestions and multiple sorting options. Shopping carts are saved to the database and sync across devices in real-time. Customers can apply discount codes, manage wishlists, and move items between their cart and wishlist.

Checkout and Orders

The checkout process is broken into multiple steps for clarity. Customers can save multiple shipping addresses and choose between Stripe payments or cash on delivery. Orders automatically deduct from inventory, and customers can track their order status in real-time through WebSocket updates. The system handles cancellations with refund processing and supports return or exchange requests.

Reviews and Ratings

Customers can leave star ratings and written reviews for products they've purchased. They can upload images with their reviews and vote on whether other reviews were helpful. The system shows a verified purchase badge for legitimate reviews, and vendors can respond to customer feedback.

Admin Dashboard

Administrators see comprehensive analytics about the entire platform. They manage user accounts, approve or reject vendor applications, moderate product listings, monitor all orders, and create coupon codes for promotions.

Real-Time Features

The platform uses Socket.IO for live notifications, real-time stock updates, and chat support. This keeps everyone informed instantly about important events.

Additional Features

The system sends email notifications for important events, implements a coupon system for discounts, includes a loyalty points program to reward repeat customers, and supports time-limited flash sales.


Technology Stack

Backend Technologies

The server runs on Node.js with Express.js handling the web framework duties. MongoDB stores all data with Mongoose as the object modeling tool. JWT handles authentication while Socket.IO enables real-time communication. Stripe processes payments, Nodemailer sends emails, Multer manages file uploads, and Passport handles OAuth authentication with Google and GitHub.

Frontend Technologies

The interface is built with React and uses Vite as the build tool. Redux Toolkit manages application state while React Router handles navigation. Axios makes HTTP requests to the backend. Tailwind CSS provides the styling framework, React Icons supplies the icon library, React Hot Toast shows notifications, and Framer Motion adds smooth animations.


Getting Started

Prerequisites

You need Node.js version 18 or higher and MongoDB version 6 or higher installed on your system. You can use either npm or yarn as your package manager.

Setting Up the Backend

Navigate to the backend directory and install dependencies with npm install. Create a .env file by copying the .env.example file. You'll need to fill in several environment variables.

For MongoDB, provide your connection string. Generate strong random strings for JWT_SECRET and JWT_REFRESH_SECRET. Configure email settings with your Gmail address and app password. Set up OAuth credentials from Google and GitHub developer consoles. Add your Stripe API keys. Set the frontend URL to http://localhost:5173.

Create the necessary upload directories for avatars, vendor files, products, reviews, categories, and CSV imports. Start the server with npm run dev. The backend will run on http://localhost:5000.

Setting Up the Frontend

Navigate to the frontend directory and install dependencies. Create a .env file with your backend API URL at http://localhost:5000/api, the Socket URL at http://localhost:5000, and your Stripe publishable key. Start the development server with npm run dev. The frontend will run on http://localhost:5173.


Using the Platform

Creating an Admin User

You can create an admin user directly in MongoDB by inserting a document into the users collection with the admin role. Make sure to hash the password first before inserting it.

Understanding User Roles

Customers can browse products, make purchases, and leave reviews. Vendors manage their stores, add products, and handle orders. Administrators have full access to manage users, approve vendors, moderate products, and oversee all orders.

API Endpoints

The authentication endpoints handle user registration, login, email verification, password reset, token refresh, and fetching current user information.

Product endpoints let you get all products, view individual products, and allow vendors to create, update, or delete their products.

Cart endpoints manage getting the cart, adding items, updating quantities, and removing items.

Order endpoints handle creating orders, viewing user orders, getting order details, and canceling orders.

Vendor endpoints manage registration, profile viewing, analytics, and order management.

Admin endpoints provide dashboard statistics, vendor management, approval workflows, and order monitoring.


Project Structure

Frontend Organization

The frontend source code is organized into components for reusable UI elements like Navbar, Footer, and Sidebar. Layouts contain MainLayout and DashboardLayout components. Pages include Home, Products, and separate directories for auth, vendor, and admin pages. The store directory contains Redux configuration and slices. Utils holds utility functions including API configuration. App.jsx serves as the main entry point.

Backend Organization

The backend has config files for database, email, and socket setup. Controllers handle the business logic for routes. Middleware contains custom middleware functions. Models define Mongoose schemas. Routes map URL paths to controllers. Utils has utility functions. Uploads stores user-submitted files. Server.js is the application entry point.


Security Measures

The platform implements several security features. Passwords are hashed using bcrypt before storage. JWT tokens authenticate users and authorize access. Helmet adds HTTP security headers. Rate limiting prevents API abuse. All inputs are validated and sanitized. MongoDB injection attacks are prevented through proper query construction. XSS protection is enabled. CORS is configured to only allow authorized origins.


Deployment Options

Backend Deployment

For Heroku, create a new app and push your code to the Heroku remote. For DigitalOcean or AWS, use PM2 for process management to keep your server running and automatically restart it if it crashes.

Frontend Deployment

For Vercel, build your project and deploy using the Vercel CLI. For Netlify, build your project and deploy the dist directory using the Netlify CLI.


Testing

Run backend tests by navigating to the backend directory and running npm test. Do the same for frontend tests in the frontend directory.


Future Enhancements

There are several features planned for future implementation. Converting the app to a Progressive Web App would allow offline functionality. Building a React Native mobile app would extend the platform to iOS and Android. AI-powered product recommendations could improve the shopping experience. Advanced analytics with interactive charts would provide better insights. Multi-language and multi-currency support would make the platform accessible globally. Social media integration would help with marketing. Better SEO optimization would improve search engine rankings. A product comparison feature would help customers make informed decisions. Abandoned cart recovery emails could help convert more sales.


Contributing

Contributions are welcome. Feel free to submit pull requests with improvements or bug fixes.


License

This project is available under the MIT License, meaning you're free to use, modify, and distribute it as you see fit.


Contact

For questions or support, reach out to support@marketplace.com.
# e-merchandise
