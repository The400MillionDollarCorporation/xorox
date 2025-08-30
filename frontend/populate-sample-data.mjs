import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now
const SUPABASE_URL = 'https://srsapzqvwxgrohisrwnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI';

async function populateSampleData() {
  try {
    console.log('🗄️ Populating Database with Sample Data...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client initialized');
    
    // Sample TikTok data
    const sampleTiktoks = [
      {
        id: 'tiktok_001',
        username: 'crypto_hunter',
        url: 'https://www.tiktok.com/@crypto_hunter/video/1234567890',
        thumbnail: 'https://example.com/thumbnail1.jpg',
        created_at: new Date('2024-01-15T10:00:00Z').toISOString(),
        fetched_at: new Date().toISOString(),
        views: 15000,
        comments: 45
      },
      {
        id: 'tiktok_002',
        username: 'memecoin_expert',
        url: 'https://www.tiktok.com/@memecoin_expert/video/1234567891',
        thumbnail: 'https://example.com/thumbnail2.jpg',
        created_at: new Date('2024-01-15T11:00:00Z').toISOString(),
        fetched_at: new Date().toISOString(),
        views: 25000,
        comments: 67
      },
      {
        id: 'tiktok_003',
        username: 'solana_trader',
        url: 'https://www.tiktok.com/@solana_trader/video/1234567892',
        thumbnail: 'https://example.com/thumbnail3.jpg',
        created_at: new Date('2024-01-15T12:00:00Z').toISOString(),
        fetched_at: new Date().toISOString(),
        views: 18000,
        comments: 32
      },
      {
        id: 'tiktok_004',
        username: 'defi_insights',
        url: 'https://www.tiktok.com/@defi_insights/video/1234567893',
        thumbnail: 'https://example.com/thumbnail4.jpg',
        created_at: new Date('2024-01-15T13:00:00Z').toISOString(),
        fetched_at: new Date().toISOString(),
        views: 32000,
        comments: 89
      },
      {
        id: 'tiktok_005',
        username: 'nft_collector',
        url: 'https://www.tiktok.com/@nft_collector/video/1234567894',
        thumbnail: 'https://example.com/thumbnail5.jpg',
        created_at: new Date('2024-01-15T14:00:00Z').toISOString(),
        fetched_at: new Date().toISOString(),
        views: 22000,
        comments: 56
      }
    ];

    // Sample tokens
    const sampleTokens = [
      {
        name: 'Bonk',
        symbol: 'BONK',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        uri: 'https://arweave.net/bonk-metadata',
        created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
        create_tx: 'tx_hash_001',
        views: 1000000,
        mentions: 150
      },
      {
        name: 'Dogwifhat',
        symbol: 'WIF',
        address: 'EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qjm',
        uri: 'https://arweave.net/wif-metadata',
        created_at: new Date('2024-01-02T00:00:00Z').toISOString(),
        create_tx: 'tx_hash_002',
        views: 800000,
        mentions: 120
      },
      {
        name: 'Popcat',
        symbol: 'POPCAT',
        address: 'popcat_address_003',
        uri: 'https://arweave.net/popcat-metadata',
        created_at: new Date('2024-01-03T00:00:00Z').toISOString(),
        create_tx: 'tx_hash_003',
        views: 600000,
        mentions: 90
      }
    ];

    // Sample mentions
    const sampleMentions = [
      {
        tiktok_id: 'tiktok_001',
        token_id: 1,
        count: 5
      },
      {
        tiktok_id: 'tiktok_002',
        token_id: 2,
        count: 3
      },
      {
        tiktok_id: 'tiktok_003',
        token_id: 1,
        count: 2
      },
      {
        tiktok_id: 'tiktok_004',
        token_id: 3,
        count: 4
      },
      {
        tiktok_id: 'tiktok_005',
        token_id: 2,
        count: 1
      }
    ];

    console.log('📝 Inserting sample tokens...');
    for (const token of sampleTokens) {
      const { error } = await supabase
        .from('tokens')
        .insert(token);
      
      if (error) {
        console.log(`⚠️ Error inserting token ${token.symbol}:`, error.message);
      } else {
        console.log(`✅ Token ${token.symbol} inserted successfully`);
      }
    }

    console.log('📱 Inserting sample TikTok videos...');
    for (const tiktok of sampleTiktoks) {
      const { error } = await supabase
        .from('tiktoks')
        .insert(tiktok);
      
      if (error) {
        console.log(`⚠️ Error inserting TikTok ${tiktok.id}:`, error.message);
      } else {
        console.log(`✅ TikTok ${tiktok.id} inserted successfully`);
      }
    }

    console.log('🔗 Inserting sample mentions...');
    for (const mention of sampleMentions) {
      const { error } = await supabase
        .from('mentions')
        .insert(mention);
      
      if (error) {
        console.log(`⚠️ Error inserting mention:`, error.message);
      } else {
        console.log(`✅ Mention inserted successfully`);
      }
    }

    console.log('\n✅ Sample data population completed!');
    console.log('📊 You should now see TikTok data in your frontend');
    
  } catch (error) {
    console.error('❌ Sample data population failed:', error);
    process.exit(1);
  }
}

// Run population
populateSampleData();
