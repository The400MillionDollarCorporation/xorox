#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPriceLookupErrors() {
  try {
    console.log('🔧 Fixing price lookup errors...');

    // 1. Add index for token_uri in prices table
    console.log('📊 Adding index for token_uri in prices table...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_prices_token_uri ON prices(token_uri);'
    });

    if (indexError) {
      console.log('⚠️ Index creation result:', indexError);
      // Try alternative approach
      console.log('🔄 Trying alternative index creation...');
      const { error: altIndexError } = await supabase
        .from('prices')
        .select('token_uri')
        .limit(1);
      
      if (altIndexError) {
        console.log('⚠️ Alternative approach result:', altIndexError);
      }
    } else {
      console.log('✅ Index created successfully');
    }

    // 2. Check for orphaned price records
    console.log('🔍 Checking for orphaned price records...');
    const { data: orphanedPrices, error: orphanedError } = await supabase
      .from('prices')
      .select('id, token_uri, token_id')
      .is('token_id', null)
      .not('token_uri', 'is', null);

    if (orphanedError) {
      console.error('❌ Error checking orphaned prices:', orphanedError);
    } else if (orphanedPrices && orphanedPrices.length > 0) {
      console.log(`⚠️ Found ${orphanedPrices.length} orphaned price records`);
      
      // Try to link them to tokens
      for (const price of orphanedPrices) {
        if (price.token_uri) {
          const { data: token, error: tokenError } = await supabase
            .from('tokens')
            .select('id')
            .eq('uri', price.token_uri)
            .single();

          if (token && !tokenError) {
            console.log(`🔗 Linking price ${price.id} to token ${token.id}`);
            const { error: updateError } = await supabase
              .from('prices')
              .update({ token_id: token.id })
              .eq('id', price.id);

            if (updateError) {
              console.error(`❌ Error linking price ${price.id}:`, updateError);
            }
          } else {
            console.log(`⚠️ No token found for URI: ${price.token_uri}`);
          }
        }
      }
    } else {
      console.log('✅ No orphaned price records found');
    }

    // 3. Verify data integrity
    console.log('🔍 Verifying data integrity...');
    const { data: priceCount, error: countError } = await supabase
      .from('prices')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting prices:', countError);
    } else {
      console.log(`📊 Total price records: ${priceCount}`);
    }

    // 4. Check token count
    const { data: tokenCount, error: tokenCountError } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true });

    if (tokenCountError) {
      console.error('❌ Error counting tokens:', tokenCountError);
    } else {
      console.log(`🪙 Total token records: ${tokenCount}`);
    }

    console.log('✅ Price lookup error fixes completed!');

  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
}

// Run the fix
fixPriceLookupErrors().then(() => {
  console.log('🏁 Fix process completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
