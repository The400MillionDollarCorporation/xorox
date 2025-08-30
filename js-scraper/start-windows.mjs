#!/usr/bin/env node

/**
 * Windows-specific startup script for ZoroX TikTok Scraper
 * This script uses the Windows-optimized version of the scraper
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting ZoroX TikTok Scraper (Windows Version)...');
console.log('📁 Working directory:', __dirname);

// Check if .env file exists
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating from example...');
  
  const envExamplePath = join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file from example');
    console.log('📝 Please edit .env file with your Supabase credentials');
  } else {
    console.log('❌ No env.example file found');
    console.log('📝 Please create a .env file with your configuration');
  }
}

// Check if Windows directory exists
const windowsDir = join(__dirname, 'windows');
if (!fs.existsSync(windowsDir)) {
  console.error('❌ Windows directory not found!');
  console.error('Please ensure you have the Windows-specific scraper files');
  process.exit(1);
}

// Check if Windows index.mjs exists
const windowsIndexPath = join(windowsDir, 'index.mjs');
if (!fs.existsSync(windowsIndexPath)) {
  console.error('❌ Windows index.mjs not found!');
  console.error('Please ensure you have the Windows-specific scraper files');
  process.exit(1);
}

console.log('✅ Windows scraper files found');
console.log('🔧 Starting Windows-optimized scraper...');

// Start the Windows version of the scraper
const scraperProcess = spawn('node', [windowsIndexPath], {
  stdio: 'inherit',
  cwd: __dirname
});

scraperProcess.on('error', (error) => {
  console.error('❌ Failed to start scraper:', error);
  process.exit(1);
});

scraperProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Scraper completed successfully');
  } else {
    console.log(`❌ Scraper exited with code ${code}`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  scraperProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  scraperProcess.kill('SIGTERM');
});
