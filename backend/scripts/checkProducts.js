import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model.js';

dotenv.config();

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Get all products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products:`);
    
    for (const product of products) {
      console.log(`\n- ${product.name}`);
      console.log(`  ID: ${product._id}`);
      console.log(`  Vendor: ${product.vendor}`);
      console.log(`  Category: ${product.category}`);
      console.log(`  Status: ${product.status}`);
      console.log(`  Approved: ${product.isApproved}`);
      console.log(`  Images: ${product.images?.length || 0}`);
    }

    // Try to query like the API does
    console.log('\n\n--- Testing API Query ---');
    const apiProducts = await Product.find({ status: 'active', isApproved: true })
      .select('name status isApproved vendor category')
      .lean();
    
    console.log(`API Query returned ${apiProducts.length} products:`);
    apiProducts.forEach(p => {
      console.log(`- ${p.name}: vendor=${p.vendor}, category=${p.category}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkProducts();
