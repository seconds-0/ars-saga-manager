const { sequelize } = require('../models');

async function diagnoseDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // 1. Check Users table structure
    console.log('\n--- USERS TABLE STRUCTURE ---');
    const [usersColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);
    console.table(usersColumns);
    
    // 2. Specifically check refresh token columns
    console.log('\n--- REFRESH TOKEN COLUMNS ---');
    const [refreshTokenColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND column_name IN ('refresh_token', 'refresh_token_expires')
    `);
    console.table(refreshTokenColumns);
    
    // 3. Try to find a user to verify data
    console.log('\n--- SAMPLE USER DATA ---');
    const User = sequelize.models.User;
    const user = await User.findOne();
    if (user) {
      console.log('Found user:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Has password:', !!user.password);
      
      // Check if refresh token fields are accessible
      console.log('- refreshToken exists in model:', 'refreshToken' in user);
      console.log('- refreshTokenExpires exists in model:', 'refreshTokenExpires' in user);
      
      // Raw query to check actual database values
      const [rawUser] = await sequelize.query(`
        SELECT refresh_token, refresh_token_expires 
        FROM "Users" 
        WHERE id = ${user.id}
      `);
      console.log('Raw database values for refresh token:');
      console.table(rawUser);
    } else {
      console.log('No users found in database');
    }
    
    // 4. Test direct update of refresh token
    if (user) {
      console.log('\n--- TESTING REFRESH TOKEN UPDATE ---');
      try {
        const testToken = 'test-refresh-token-' + Date.now();
        const testExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        
        console.log('Attempting to update with:');
        console.log('- refreshToken:', testToken);
        console.log('- refreshTokenExpires:', testExpires);
        
        await user.update({
          refreshToken: testToken,
          refreshTokenExpires: testExpires
        });
        
        console.log('Update successful!');
        
        // Verify update with raw query
        const [updatedUser] = await sequelize.query(`
          SELECT refresh_token, refresh_token_expires 
          FROM "Users" 
          WHERE id = ${user.id}
        `);
        console.log('Updated raw database values:');
        console.table(updatedUser);
      } catch (error) {
        console.error('Failed to update refresh token:');
        console.error('- Error type:', error.name);
        console.error('- Message:', error.message);
        console.error('- Parent error:', error.parent?.message);
        console.error('- Stack:', error.stack);
      }
    }
    
    // 5. Check Sequelize model definition
    console.log('\n--- USER MODEL DEFINITION ---');
    const userModel = sequelize.models.User;
    console.log('Model options:');
    console.log('- tableName:', userModel.getTableName());
    console.log('- underscored:', userModel.options.underscored);
    
    console.log('\nModel attributes:');
    const attributes = userModel.rawAttributes;
    for (const [name, attribute] of Object.entries(attributes)) {
      console.log(`- ${name}:`);
      console.log(`  - type: ${attribute.type.key}`);
      console.log(`  - field: ${attribute.field || name}`);
      if (name === 'refreshToken' || name === 'refreshTokenExpires') {
        console.log(`  - IMPORTANT: This attribute should map to snake_case in DB`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Diagnostic script failed:');
    console.error('- Error type:', error.name);
    console.error('- Message:', error.message);
    console.error('- Stack:', error.stack);
    process.exit(1);
  }
}

// Run the diagnostic
console.log('=== DATABASE DIAGNOSIS TOOL ===');
diagnoseDatabase(); 