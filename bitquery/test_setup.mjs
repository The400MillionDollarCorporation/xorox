import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function testSetup() {
  try {
    console.log('🧪 Testing Bitquery Setup...');
    
    // Test directory creation
    const resultsDir = path.join(process.cwd(), 'results', 'prices');
    const memecoinsDir = path.join(process.cwd(), 'results', 'memecoins');
    
    console.log('📁 Creating directories...');
    await fs.mkdir(resultsDir, { recursive: true });
    await fs.mkdir(memecoinsDir, { recursive: true });
    
    console.log('✅ Directories created successfully');
    console.log(`   Prices: ${resultsDir}`);
    console.log(`   Memecoins: ${memecoinsDir}`);
    
    // Test metadata file creation
    const metadataPath = path.join(resultsDir, 'metadata.json');
    const testMetadata = {
      sinceTimestamp: "2024-12-20T03:46:24Z",
      latestFetchTimestamp: "2024-12-20T03:46:24Z",
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(testMetadata, null, 2));
    console.log('✅ Test metadata file created');
    
    // Test reading metadata
    const readMetadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    console.log('✅ Metadata file read successfully:', readMetadata);
    
    // Clean up test file
    await fs.unlink(metadataPath);
    console.log('✅ Test cleanup completed');
    
    console.log('\n🎉 All tests passed! Bitquery setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSetup();
