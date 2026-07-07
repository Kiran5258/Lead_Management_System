import connectDB from './config/db.js';
import Lead from './models/Lead.js';

const resetDatabase = async () => {
  console.log('🔄 Connecting to MongoDB to reset collections...');
  try {
    await connectDB();
    
    // Count existing leads
    const count = await Lead.countDocuments();
    console.log(`🔍 Found ${count} existing lead records in the database.`);
    
    if (count === 0) {
      console.log('✅ Database is already empty. No cleanup needed!');
      process.exit(0);
    }
    
    // Delete all leads
    const result = await Lead.deleteMany({});
    console.log(`🗑️ Successfully deleted ${result.deletedCount} lead documents.`);
    console.log('✨ Database reset complete! The next lead you register will start fresh from ID: LD-0001.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDatabase();
