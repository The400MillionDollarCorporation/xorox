import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('🗄️ Setting up Pattern Analysis Database Schema...');
    
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error('❌ Missing Supabase environment variables!');
      console.log('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
      process.exit(1);
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    console.log('✅ Supabase client initialized');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
    const schemaContent = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded');
    
    // Split schema into individual statements
    const statements = schemaContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.trim().length === 0) {
          continue;
        }
        
        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for table creation
          if (statement.toLowerCase().includes('create table')) {
            console.log(`⚠️ Table creation statement ${i + 1} may need manual execution`);
            console.log(`   Statement: ${statement.substring(0, 100)}...`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
        }
        
        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Database Setup Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Database schema setup completed successfully!');
      console.log('You can now run pattern analysis with: npm run analyze');
    } else {
      console.log('\n⚠️ Some statements failed. You may need to manually execute them in Supabase SQL editor.');
      console.log('Check the error messages above for details.');
    }
    
    // Test if tables exist
    console.log('\n🔍 Testing table existence...');
    const tables = ['pattern_analysis_results', 'pattern_correlations', 'trending_keywords'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Table exists and accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
