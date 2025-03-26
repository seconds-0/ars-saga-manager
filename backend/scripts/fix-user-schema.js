const { sequelize } = require('../models');

async function fixUserSchema() {
  try {
    console.log('=== USER SCHEMA FIX SCRIPT ===');
    
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // Get existing columns
    console.log('\nChecking existing columns in Users table...');
    const [existingColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
    `);
    
    console.log('Existing columns:');
    const columnNames = existingColumns.map(col => col.column_name);
    console.log(columnNames);
    
    // Define missing columns and their data types
    const requiredColumns = [
      { name: 'reset_password_token', type: 'VARCHAR(255)', nullable: true },
      { name: 'reset_password_expires', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'failed_login_attempts', type: 'INTEGER', nullable: false, default: 0 },
      { name: 'account_locked_until', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'refresh_token', type: 'VARCHAR(255)', nullable: true },
      { name: 'refresh_token_expires', type: 'TIMESTAMP WITH TIME ZONE', nullable: true }
    ];
    
    // Identify missing columns
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col.name));
    
    if (missingColumns.length === 0) {
      console.log('\nNo missing columns found! Schema appears to be correct.');
    } else {
      console.log(`\nFound ${missingColumns.length} missing columns. Adding them now...`);
      
      // Add each missing column
      for (const column of missingColumns) {
        console.log(`Adding column: ${column.name} (${column.type})`);
        
        let sql = `ALTER TABLE "Users" ADD COLUMN "${column.name}" ${column.type}`;
        
        if (column.nullable === false) {
          sql += ' NOT NULL';
        }
        
        if (column.default !== undefined) {
          sql += ` DEFAULT ${column.default}`;
        }
        
        try {
          await sequelize.query(sql);
          console.log(`✓ Successfully added column ${column.name}`);
        } catch (error) {
          console.error(`✗ Failed to add column ${column.name}:`, error.message);
        }
      }
    }
    
    // Verify schema after fixes
    console.log('\nVerifying Users table schema after fixes...');
    const [columnsAfterFix] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);
    
    console.log('Current schema:');
    console.table(columnsAfterFix);
    
    // Test querying a user to verify model works
    console.log('\nTesting User model query with all columns...');
    try {
      const User = sequelize.models.User;
      const user = await User.findOne();
      
      if (user) {
        console.log('User query successful!');
        console.log('User fields available:');
        console.log('- id:', user.id);
        console.log('- email:', user.email);
        console.log('- resetPasswordToken:', user.resetPasswordToken !== undefined);
        console.log('- resetPasswordExpires:', user.resetPasswordExpires !== undefined);
        console.log('- failedLoginAttempts:', user.failedLoginAttempts !== undefined);
        console.log('- accountLockedUntil:', user.accountLockedUntil !== undefined);
        console.log('- refreshToken:', user.refreshToken !== undefined);
        console.log('- refreshTokenExpires:', user.refreshTokenExpires !== undefined);
      } else {
        console.log('No users found in the database.');
      }
    } catch (error) {
      console.error('Error testing model query:', error.message);
    }
    
    console.log('\n=== SCHEMA FIX COMPLETED ===');
    console.log('You should now restart the server and try logging in again.');
    process.exit(0);
  } catch (error) {
    console.error('\n=== SCHEMA FIX FAILED ===');
    console.error('Error type:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the fix
fixUserSchema(); 