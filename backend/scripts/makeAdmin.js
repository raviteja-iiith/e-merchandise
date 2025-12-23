import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const user = await User.findOne({ email: 'ravitejakusumanchi1310@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found with email: ravitejakusumanchi1310@gmail.com');
      console.log('Please register first or check the email address.');
    } else {
      user.role = 'admin';
      user.name = 'ravi';
      user.isEmailVerified = true;
      await user.save();
      console.log('✅ User updated successfully!');
      console.log('👤 Name:', user.name);
      console.log('📧 Email:', user.email);
      console.log('🔑 Role:', user.role);
      console.log('\nYou can now login as admin with your credentials.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

makeAdmin();
