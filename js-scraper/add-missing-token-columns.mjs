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

async function addMissingTokenColumns() {
  try {
    console.log('🔧 Adding missing columns to tokens table...');

    // Check if columns already exist
    console.log('🔍 Checking existing columns...');
    const { data: columns, error: columnsError } = await supabase
      .from('tokens')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    console.log('✅ Tokens table accessible');

    // Add missing columns using SQL
    console.log('📊 Adding missing columns...');
    
    // Try to add decimals column
    try {
      const { error: decimalsError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE tokens ADD COLUMN IF NOT EXISTS decimals INTEGER DEFAULT 9;'
      });

      if (decimalsError) {
        console.log('⚠️ Decimals column result:', decimalsError);
        // Try alternative approach
        console.log('🔄 Trying alternative approach for decimals...');
        const { error: altDecimalsError } = await supabase
          .from('tokens')
          .select('decimals')
          .limit(1);
        
        if (altDecimalsError && altDecimalsError.code === '42703') {
          console.log('📝 Decimals column does not exist, will need manual addition');
        } else if (altDecimalsError) {
          console.log('⚠️ Alternative decimals check result:', altDecimalsError);
        } else {
          console.log('✅ Decimals column already exists');
        }
      } else {
        console.log('✅ Decimals column added successfully');
      }
    } catch (error) {
      console.log('⚠️ Error adding decimals column:', error);
    }

    // Try to add address column if it doesn't exist
    try {
      const { error: addressError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE tokens ADD COLUMN IF NOT EXISTS address TEXT;'
      });

      if (addressError) {
        console.log('⚠️ Address column result:', addressError);
        // Try alternative approach
        console.log('🔄 Trying alternative approach for address...');
        const { error: altAddressError } = await supabase
          .from('tokens')
          .select('address')
          .limit(1);
        
        if (altAddressError && altAddressError.code === '42703') {
          console.log('📝 Address column does not exist, will need manual addition');
        } else if (altAddressError) {
          console.log('⚠️ Alternative address check result:', altAddressError);
        } else {
          console.log('✅ Address column already exists');
        }
      } else {
        console.log('✅ Address column added successfully');
      }
    } catch (error) {
      console.log('⚠️ Error adding address column:', error);
    }

    // Verify the table structure
    console.log('🔍 Verifying table structure...');
    const { data: sampleToken, error: sampleError } = await supabase
      .from('tokens')
      .select('id, name, symbol, address, decimals, market_cap, total_supply, last_updated')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error verifying table structure:', sampleError);
    } else {
      console.log('✅ Table structure verified');
      if (sampleToken && sampleToken.length > 0) {
        console.log('📊 Sample token data:', sampleToken[0]);
      }
    }

    // Check total count
    const { data: tokenCount, error: countError } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting tokens:', countError);
    } else {
      console.log(`🪙 Total token records: ${tokenCount}`);
    }

    console.log('✅ Missing token columns migration completed!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

// Run the migration
addMissingTokenColumns().then(() => {
  console.log('🏁 Migration process completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
