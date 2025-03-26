'use strict';

const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');

// Run specific migrations for the arts feature
async function runArtsMigration() {
  console.log('Running Arts-specific migrations and seeders');

  console.log('1. Running the arts table migration...');
  exec('npx sequelize-cli db:migrate --name 20250326230102-create-reference-arts.js', 
    { cwd: path.resolve(__dirname) },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running migration: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Migration stderr: ${stderr}`);
        return;
      }
      console.log(`Migration stdout: ${stdout}`);
      
      console.log('2. Running the arts seeder...');
      exec('npx sequelize-cli db:seed --seed 20250326230205-seed-reference-arts.js',
        { cwd: path.resolve(__dirname) },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error running seeder: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Seeder stderr: ${stderr}`);
            return;
          }
          console.log(`Seeder stdout: ${stdout}`);
          console.log('Arts migration and seeding completed successfully!');
        }
      );
    }
  );
}

runArtsMigration();