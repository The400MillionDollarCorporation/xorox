import { TwitterIntegration } from './twitter_integration.mjs';
import { MemecoinPatternAnalyzer } from './pattern_analysis.mjs';
import dotenv from 'dotenv';

dotenv.config();

class ZoroXSystemManager {
  constructor() {
    this.twitter = null;
    this.analyzer = null;
    this.isRunning = false;
  }

  /**
   * Initialize all systems
   */
  async initialize() {
    try {
      console.log('🚀 Initializing ZoroX System Manager...');
      
      // Check environment variables
      this.checkEnvironment();
      
      // Initialize Twitter integration
      if (this.hasTwitterCredentials()) {
        console.log('🐦 Initializing Twitter integration...');
        this.twitter = new TwitterIntegration();
        await this.twitter.testConnection();
        console.log('✅ Twitter integration ready');
      } else {
        console.log('⚠️ Twitter credentials not found - skipping Twitter integration');
      }
      
      // Initialize pattern analyzer
      console.log('🧠 Initializing pattern analyzer...');
      this.analyzer = new MemecoinPatternAnalyzer();
      console.log('✅ Pattern analyzer ready');
      
      console.log('🎉 All systems initialized successfully!');
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check required environment variables
   */
  checkEnvironment() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log('✅ Environment variables verified');
  }

  /**
   * Check if Twitter credentials are available
   */
  hasTwitterCredentials() {
    const twitterVars = [
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET',
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_SECRET'
    ];
    
    return twitterVars.every(varName => process.env[varName]);
  }

  /**
   * Start all systems
   */
  async start() {
    try {
      if (this.isRunning) {
        console.log('⚠️ Systems already running');
        return;
      }
      
      console.log('🚀 Starting all ZoroX systems...');
      
      // Start Twitter monitoring if available
      if (this.twitter) {
        this.twitter.start();
        console.log('✅ Twitter monitoring started');
      }
      
      // Run initial pattern analysis
      console.log('📊 Running initial pattern analysis...');
      await this.analyzer.runComprehensiveAnalysis();
      console.log('✅ Initial analysis completed');
      
      this.isRunning = true;
      
      console.log('\n🎉 All systems are now running!');
      console.log('\n📋 System Status:');
      console.log(`   🧠 Pattern Analysis: ✅ Running`);
      console.log(`   🐦 Twitter Integration: ${this.twitter ? '✅ Running' : '❌ Not configured'}`);
      console.log(`   🗄️ Database: ✅ Connected`);
      
      console.log('\n📊 To monitor performance:');
      if (this.twitter) {
        console.log('   - Check Twitter alerts: npm run twitter-test');
      }
      console.log('   - Check analysis results: npm run test-db');
      console.log('   - View real-time data: Check Supabase dashboard');
      
      console.log('\n⏹️ To stop all systems, press Ctrl+C');
      
    } catch (error) {
      console.error('❌ Failed to start systems:', error);
      throw error;
    }
  }

  /**
   * Stop all systems
   */
  async stop() {
    try {
      console.log('\n🛑 Stopping all systems...');
      
      if (this.twitter) {
        this.twitter.stop();
        console.log('✅ Twitter monitoring stopped');
      }
      
      this.isRunning = false;
      console.log('✅ All systems stopped');
      
    } catch (error) {
      console.error('❌ Error stopping systems:', error);
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      twitter: this.twitter ? 'Running' : 'Not configured',
      analyzer: this.analyzer ? 'Ready' : 'Not initialized',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run periodic analysis
   */
  async runPeriodicAnalysis() {
    try {
      if (!this.isRunning) return;
      
      console.log('\n📊 Running periodic pattern analysis...');
      await this.analyzer.runComprehensiveAnalysis();
      console.log('✅ Periodic analysis completed');
      
    } catch (error) {
      console.error('❌ Periodic analysis failed:', error);
    }
  }
}

// Main execution
async function main() {
  const manager = new ZoroXSystemManager();
  
  try {
    // Initialize systems
    await manager.initialize();
    
    // Start all systems
    await manager.start();
    
    // Set up periodic analysis (every 2 hours)
    const analysisInterval = setInterval(() => {
      manager.runPeriodicAnalysis();
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received shutdown signal...');
      clearInterval(analysisInterval);
      await manager.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received termination signal...');
      clearInterval(analysisInterval);
      await manager.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ System startup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ZoroXSystemManager };
