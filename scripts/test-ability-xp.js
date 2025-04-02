/**
 * Test script for ability XP and score calculations
 *
 * This script calculates ability scores for different XP values
 * and XP values for different scores, to verify the calculations are correct.
 */

const calculateXPForLevel = (level) => {
  if (level <= 0) return 0;
  
  let xp = 0;
  let increment = 5;
  
  for (let i = 1; i <= level; i++) {
    xp += increment;
    increment += 5;
  }
  
  return xp;
};

const calculateLevelFromXP = (xp) => {
  if (xp < 5) return 0;
  
  let totalXP = 0;
  let level = 0;
  let increment = 5;
  
  while (totalXP < xp) {
    totalXP += increment;
    // If we can afford this level, increment the level
    if (totalXP <= xp) {
      level++;
      increment += 5;
    }
  }
  
  return level;
};

// Test score to XP calculations
console.log('==== Score to XP Calculations ====');
for (let score = 0; score <= 10; score++) {
  const xp = calculateXPForLevel(score);
  console.log(`Score ${score} requires ${xp} XP`);
}

console.log('\n==== XP to Score Calculations ====');
const testXPValues = [0, 5, 10, 15, 30, 45, 65, 90, 120, 155, 200, 250, 300];
for (const xp of testXPValues) {
  const score = calculateLevelFromXP(xp);
  console.log(`${xp} XP gives a score of ${score}`);
}

// Verify that the calculations are consistent both ways
console.log('\n==== Verification (should match) ====');
for (let score = 0; score <= 10; score++) {
  const xp = calculateXPForLevel(score);
  const calculatedScore = calculateLevelFromXP(xp);
  console.log(`Score ${score} -> ${xp} XP -> Score ${calculatedScore} ${score === calculatedScore ? '✓' : '✗'}`);
}

// Show XP costs for each level
console.log('\n==== XP Cost Per Level ====');
for (let score = 0; score < 10; score++) {
  const xpCurrent = calculateXPForLevel(score);
  const xpNext = calculateXPForLevel(score + 1);
  const cost = xpNext - xpCurrent;
  console.log(`Level ${score} to ${score + 1}: ${cost} XP (total: ${xpNext} XP)`);
}