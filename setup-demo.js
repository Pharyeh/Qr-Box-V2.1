#!/usr/bin/env node

/**
 * QR Box Demo Setup Script
 * 
 * This script helps you quickly set up the QR Box Demo for development.
 * It will install dependencies and create the necessary environment files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 QR Box Demo Setup\n');

// Check if Node.js version is sufficient
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created server/.env file');
    console.log('⚠️  Please edit server/.env and add your API keys');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
  
  console.log('Installing server dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit server/.env and add your API keys');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:5173 in your browser');
console.log('\n📚 For more information, see README.md'); 