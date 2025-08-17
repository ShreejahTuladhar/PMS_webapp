const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log(' Testing MongoDB Atlas connection...');
    console.log(` Connection URI: ${process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@')}`);
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log(` Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`⚡ Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('  Check your username and password in the connection string');
    } else if (error.message.includes('bad auth')) {
      console.log('  Make sure your database user has proper permissions');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('  Check your cluster URL and network connectivity');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('  Add your IP address to MongoDB Atlas network access whitelist');
    }
    
    process.exit(1);
  }
};

testConnection();