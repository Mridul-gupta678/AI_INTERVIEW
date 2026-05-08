import bcrypt from 'bcryptjs';

/**
 * Script to generate a bcrypt hash for your admin password
 * 
 * Usage:
 * 1. Set your desired password below
 * 2. Run: npx ts-node scripts/generate-admin-password.ts
 * 3. Copy the hash and add to your .env.local file as ADMIN_PASSWORD_HASH
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this to your desired password

async function generateHash() {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    
    console.log('\n='.repeat(50));
    console.log('ADMIN PASSWORD HASH GENERATED');
    console.log('='.repeat(50));
    console.log(`\nPassword: ${ADMIN_PASSWORD}`);
    console.log(`Hash: ${hash}`);
    console.log('\nAdd this to your .env.local file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('\n' + '='.repeat(50) + '\n');
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generateHash();
