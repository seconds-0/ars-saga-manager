const { sequelize } = require('../models');
const crypto = require('crypto');

async function testRefreshToken() {
  try {
    console.log('=== REFRESH TOKEN TEST SCRIPT ===');
    
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // 1. Find a user
    console.log('\nAttempting to find a user...');
    const User = sequelize.models.User;
    let user = await User.findOne();
    
    if (!user) {
      console.log('No users found in database. Creating a test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      
      user = await User.create({
        email: 'test@example.com',
        password: hashedPassword
      });
      
      console.log('Created test user:', {
        id: user.id,
        email: user.email
      });
    } else {
      console.log('Found existing user:', {
        id: user.id,
        email: user.email,
        hasPassword: !!user.password
      });
    }
    
    // 2. Check if user object has refresh token properties
    console.log('\nChecking user object properties:');
    console.log('- User model name:', user.constructor.name);
    console.log('- refreshToken field exists:', 'refreshToken' in user);
    console.log('- refreshTokenExpires field exists:', 'refreshTokenExpires' in user);
    
    // 3. Check database structure directly
    console.log('\nChecking database structure for refresh token columns:');
    const [refreshTokenColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND column_name IN ('refresh_token', 'refresh_token_expires')
    `);
    
    if (refreshTokenColumns.length === 0) {
      console.error('ERROR: Refresh token columns do not exist in the database!');
      console.log('This suggests the migration was not applied correctly.');
      process.exit(1);
    }
    
    console.log(`Found ${refreshTokenColumns.length} refresh token columns:`);
    refreshTokenColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // 4. Raw query to see current values
    console.log('\nCurrent refresh token values in database:');
    const [rawUser] = await sequelize.query(`
      SELECT id, email, refresh_token, refresh_token_expires 
      FROM "Users" 
      WHERE id = ${user.id}
    `);
    console.log(rawUser[0]);
    
    // 5. Test the model update method
    console.log('\nTesting Model.update() for refresh token:');
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    
    console.log('New refresh token:', refreshToken.substring(0, 10) + '...');
    console.log('Expires at:', refreshTokenExpires);
    
    try {
      console.log('Attempting to update via Sequelize model...');
      await user.update({
        refreshToken,
        refreshTokenExpires
      });
      console.log('Model update successful!');
    } catch (error) {
      console.error('Model update failed:');
      console.error('- Error type:', error.name);
      console.error('- Message:', error.message);
      if (error.parent) {
        console.error('- Parent error:', error.parent.message);
      }
      console.error('- Stack:', error.stack);
      
      // 6. If model update fails, try direct SQL
      console.log('\nTrying direct SQL update instead:');
      try {
        await sequelize.query(`
          UPDATE "Users" SET 
          refresh_token = :token,
          refresh_token_expires = :expires
          WHERE id = :id
        `, {
          replacements: {
            token: refreshToken,
            expires: refreshTokenExpires,
            id: user.id
          },
          type: sequelize.QueryTypes.UPDATE
        });
        console.log('Direct SQL update successful!');
      } catch (sqlError) {
        console.error('Direct SQL update also failed:');
        console.error('- Error type:', sqlError.name);
        console.error('- Message:', sqlError.message);
        if (sqlError.parent) {
          console.error('- Parent error:', sqlError.parent.message);
        }
        process.exit(1);
      }
    }
    
    // 7. Verify the update with raw query
    console.log('\nVerifying refresh token update:');
    const [updatedRawUser] = await sequelize.query(`
      SELECT id, email, refresh_token, refresh_token_expires 
      FROM "Users" 
      WHERE id = ${user.id}
    `);
    console.log(updatedRawUser[0]);
    
    // 8. Retrieve via model to check mapping
    console.log('\nRetrieving refreshed user via Sequelize model:');
    const refreshedUser = await User.findByPk(user.id);
    console.log('Model attributes:');
    console.log('- id:', refreshedUser.id);
    console.log('- email:', refreshedUser.email);
    console.log('- refreshToken exists:', !!refreshedUser.refreshToken);
    console.log('- refreshTokenExpires exists:', !!refreshedUser.refreshTokenExpires);
    if (refreshedUser.refreshToken) {
      console.log('- refreshToken value:', refreshedUser.refreshToken.substring(0, 10) + '...');
    }
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error type:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testRefreshToken(); 