import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model.js';

dotenv.config();

const approveAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Update all products to be approved and active
    const result = await Product.updateMany(
      {},
      {
        $set: {
          isApproved: true,
          status: 'active'
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log('All products are now approved and active!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

approveAllProducts();
