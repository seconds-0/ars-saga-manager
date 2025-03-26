const { sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function testConnection() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Test user creation
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const testUser = await sequelize.models.User.create({
      email: 'test@test.com',
      password: hashedPassword
    });
    console.log('Test user created:', testUser.toJSON());

    // Clean up
    await testUser.destroy();
    console.log('Test user cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testConnection(); 