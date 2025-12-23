import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Import models
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Order from '../models/Order.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create test users
const createUsers = async () => {
  try {
    // Check if users already exist
    const existingVendor = await User.findOne({ email: 'vendor@test.com' });
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    const existingCustomer = await User.findOne({ email: 'customer@test.com' });

    const users = [];

    // Create vendor user
    if (!existingVendor) {
      const vendorPassword = await bcrypt.hash('password123', 10);
      const vendor = await User.create({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: vendorPassword,
        role: 'vendor',
        isEmailVerified: true,
        phone: '+1234567890',
      });
      users.push(vendor);
      console.log('✅ Vendor user created: vendor@test.com / password123');
    } else {
      users.push(existingVendor);
      console.log('ℹ️  Vendor user already exists');
    }

    // Create admin user
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        phone: '+1234567891',
      });
      users.push(admin);
      console.log('✅ Admin user created: admin@test.com / admin123');
    } else {
      users.push(existingAdmin);
      console.log('ℹ️  Admin user already exists');
    }

    // Create customer user
    if (!existingCustomer) {
      const customerPassword = await bcrypt.hash('customer123', 10);
      const customer = await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: customerPassword,
        role: 'customer',
        isEmailVerified: true,
        phone: '+1234567892',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
      });
      users.push(customer);
      console.log('✅ Customer user created: customer@test.com / customer123');
    } else {
      users.push(existingCustomer);
      console.log('ℹ️  Customer user already exists');
    }

    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    throw error;
  }
};

// Create vendor profile
const createVendorProfile = async (userId) => {
  try {
    const existingVendor = await Vendor.findOne({ user: userId });
    
    if (!existingVendor) {
      const vendor = await Vendor.create({
        user: userId,
        storeName: 'Premium Electronics Store',
        storeDescription: 'Your one-stop shop for high-quality electronics and gadgets. We offer the latest technology at competitive prices.',
        businessName: 'Premium Electronics LLC',
        businessEmail: 'vendor@test.com',
        businessPhone: '+1234567890',
        businessAddress: {
          addressLine1: '456 Commerce Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94102',
        },
        taxId: 'TAX123456',
        approvalStatus: 'approved',
        isActive: true,
      });
      console.log('✅ Vendor profile created');
      return vendor;
    } else {
      console.log('ℹ️  Vendor profile already exists');
      return existingVendor;
    }
  } catch (error) {
    console.error('❌ Error creating vendor profile:', error.message);
    throw error;
  }
};

// Create categories
const createCategories = async () => {
  try {
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      console.log('ℹ️  Categories already exist');
      return existingCategories;
    }

    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden items',
        isActive: true,
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories',
        isActive: true,
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books and literature',
        isActive: true,
      },
    ]);

    console.log(`✅ ${categories.length} categories created`);
    return categories;
  } catch (error) {
    console.error('❌ Error creating categories:', error.message);
    throw error;
  }
};

// Create products
const createProducts = async (vendorId, categories) => {
  try {
    const existingProducts = await Product.find({ vendor: vendorId });
    if (existingProducts.length > 0) {
      console.log('ℹ️  Products already exist for this vendor');
      return existingProducts;
    }

    const electronicsCategory = categories.find(c => c.slug === 'electronics');
    const clothingCategory = categories.find(c => c.slug === 'clothing');

    const products = await Product.insertMany([
      {
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation and long battery life. Perfect for music lovers and professionals.',
        shortDescription: 'Premium wireless headphones with noise cancellation',
        category: electronicsCategory._id,
        vendor: vendorId,
        basePrice: 199.99,
        salePrice: 199.99,
        sku: 'WH-1000-BLK',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
        ],
        specifications: {
          'Battery Life': '30 hours',
          'Connectivity': 'Bluetooth 5.0',
          'Weight': '250g',
          'Color': 'Black',
        },
        tags: ['audio', 'wireless', 'bluetooth', 'headphones'],
        isActive: true,
        featured: true,
      },
      {
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description: 'Advanced smartwatch with fitness tracking, heart rate monitor, and smartphone integration.',
        shortDescription: 'Advanced smartwatch with fitness tracking',
        category: electronicsCategory._id,
        vendor: vendorId,
        basePrice: 399.99,
        salePrice: 299.99,
        discount: 25,
        sku: 'SW-2000-SLV',
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        ],
        specifications: {
          'Display': '1.4" AMOLED',
          'Battery': '7 days',
          'Water Resistance': '5 ATM',
          'Sensors': 'Heart rate, GPS, Gyroscope',
        },
        tags: ['smartwatch', 'fitness', 'wearable'],
        isActive: true,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        slug: 'mechanical-gaming-keyboard',
        description: 'RGB mechanical keyboard with customizable keys and gaming mode.',
        shortDescription: 'RGB mechanical gaming keyboard',
        category: electronicsCategory._id,
        vendor: vendorId,
        basePrice: 129.99,
        salePrice: 129.99,
        sku: 'KB-3000-RGB',
        stock: 0,
        images: [
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
        ],
        specifications: {
          'Switch Type': 'Cherry MX Red',
          'Backlighting': 'RGB',
          'Connection': 'USB-C',
        },
        tags: ['gaming', 'keyboard', 'rgb'],
        isActive: true,
      },
      {
        name: 'Wireless Mouse',
        slug: 'wireless-mouse',
        description: 'Ergonomic wireless mouse with precision tracking.',
        shortDescription: 'Ergonomic wireless mouse',
        category: electronicsCategory._id,
        vendor: vendorId,
        basePrice: 49.99,
        salePrice: 49.99,
        sku: 'MS-4000-BLK',
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        ],
        specifications: {
          'DPI': '3200',
          'Battery': '6 months',
          'Buttons': '5',
        },
        tags: ['mouse', 'wireless', 'ergonomic'],
        isActive: true,
      },
      {
        name: 'Premium Cotton T-Shirt',
        slug: 'premium-cotton-tshirt',
        description: 'Comfortable cotton t-shirt in various sizes and colors.',
        shortDescription: 'Premium quality cotton t-shirt',
        category: clothingCategory._id,
        vendor: vendorId,
        basePrice: 29.99,
        salePrice: 29.99,
        sku: 'TS-5000-BLU-M',
        stock: 200,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        ],
        variants: [
          { size: 'S', color: 'Blue', price: 29.99, stock: 50, sku: 'TS-5000-BLU-S' },
          { size: 'M', color: 'Blue', price: 29.99, stock: 75, sku: 'TS-5000-BLU-M' },
          { size: 'L', color: 'Blue', price: 29.99, stock: 75, sku: 'TS-5000-BLU-L' },
        ],
        specifications: {
          'Material': '100% Cotton',
          'Fit': 'Regular',
          'Care': 'Machine wash cold',
        },
        tags: ['clothing', 'tshirt', 'cotton'],
        isActive: false,
      },
    ]);

    console.log(`✅ ${products.length} products created`);
    return products;
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    throw error;
  }
};

// Create orders
const createOrders = async (customerId, vendorId, products) => {
  try {
    const existingOrders = await Order.find({ user: customerId });
    if (existingOrders.length > 0) {
      console.log('ℹ️  Orders already exist for this customer');
      return existingOrders;
    }

    const timestamp = Date.now();
    const orders = await Order.insertMany([
      {
        orderId: 'ORD-' + timestamp + '-1',
        user: customerId,
        items: [
          {
            product: products[0]._id,
            vendor: vendorId,
            name: products[0].name,
            price: 199.99,
            quantity: 1,
            image: products[0].images[0],
          },
          {
            product: products[3]._id,
            vendor: vendorId,
            name: products[3].name,
            price: 49.99,
            quantity: 2,
            image: products[3].images[0],
          },
        ],
        itemsTotal: 299.97,
        tax: 23.99,
        shippingCost: 10.00,
        totalAmount: 333.96,
        shippingAddress: {
          name: 'Test Customer',
          phone: '+1234567892',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        orderStatus: 'delivered',
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        orderId: 'ORD-' + (timestamp + 1) + '-2',
        user: customerId,
        items: [
          {
            product: products[1]._id,
            vendor: vendorId,
            name: products[1].name,
            price: 299.99,
            quantity: 1,
            image: products[1].images[0],
          },
        ],
        itemsTotal: 299.99,
        tax: 24.00,
        shippingCost: 10.00,
        totalAmount: 333.99,
        shippingAddress: {
          name: 'Test Customer',
          phone: '+1234567892',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        orderStatus: 'shipped',
      },
      {
        orderId: 'ORD-' + (timestamp + 2) + '-3',
        user: customerId,
        items: [
          {
            product: products[0]._id,
            vendor: vendorId,
            name: products[0].name,
            price: 199.99,
            quantity: 2,
            image: products[0].images[0],
          },
        ],
        itemsTotal: 399.98,
        tax: 32.00,
        shippingCost: 15.00,
        totalAmount: 446.98,
        shippingAddress: {
          name: 'Test Customer',
          phone: '+1234567892',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paidAt: new Date(),
        orderStatus: 'processing',
      },
      {
        orderId: 'ORD-' + (timestamp + 3) + '-4',
        user: customerId,
        items: [
          {
            product: products[3]._id,
            vendor: vendorId,
            name: products[3].name,
            price: 49.99,
            quantity: 1,
            image: products[3].images[0],
          },
        ],
        itemsTotal: 49.99,
        tax: 4.00,
        shippingCost: 5.00,
        totalAmount: 58.99,
        shippingAddress: {
          name: 'Test Customer',
          phone: '+1234567892',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
        paymentMethod: 'card',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      },
    ]);

    console.log(`✅ ${orders.length} orders created`);
    return orders;
  } catch (error) {
    console.error('❌ Error creating orders:', error.message);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Create users
    const users = await createUsers();
    const vendorUser = users.find(u => u.role === 'vendor');
    const customerUser = users.find(u => u.role === 'customer');

    // Create vendor profile
    const vendor = await createVendorProfile(vendorUser._id);

    // Create categories
    const categories = await createCategories();

    // Create products
    const products = await createProducts(vendor._id, categories);

    // Create orders
    const orders = await createOrders(customerUser._id, vendor._id, products);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Test Accounts:');
    console.log('   Vendor: vendor@test.com / password123');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Customer: customer@test.com / customer123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
