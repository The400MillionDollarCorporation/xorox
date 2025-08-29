import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

class TelegramChannelScraper {
  constructor() {
    // Validate required environment variables
    this.validateEnv();

    // Initialize Telegram Bot
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

    // Initialize Supabase Client
    this.supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_ANON_KEY
    );

    // Media storage directory
    this.mediaDir = path.join(process.cwd(), 'telegram_media');
    this.ensureMediaDirectory();

    // Keywords for channel discovery
    this.keywords = [
      'memecoin', 'pumpfun', 'solana', 'crypto', 
      'meme', 'bags', 'bonk',
      '#memecoin', '#pumpfun', '#solana', '#crypto', 
      '#meme', '#bags', '#bonk'
    ];

    // Channels to scrape
    this.channels = [];
  }

  validateEnv() {
    const requiredEnvVars = [
      'TELEGRAM_BOT_TOKEN', 
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY'
    ];

    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }

  ensureMediaDirectory() {
    if (!fs.existsSync(this.mediaDir)) {
      fs.mkdirSync(this.mediaDir, { recursive: true });
    }
  }

  async initializeDatabase() {
    try {
      // Check if telegram_messages table exists
      const { data: messagesData, error: messagesError } = await this.supabase
        .from('telegram_messages')
        .select('id')
        .limit(1);

      if (messagesError && messagesError.code === 'PGRST116') {
        console.log('⚠️ telegram_messages table does not exist. Please run the SQL schema first.');
      }

      // Check if telegram_channels table exists
      const { data: channelsData, error: channelsError } = await this.supabase
        .from('telegram_channels')
        .select('id')
        .limit(1);

      if (channelsError && channelsError.code === 'PGRST116') {
        console.log('⚠️ telegram_channels table does not exist. Please run the SQL schema first.');
      }

      console.log('✅ Telegram database initialization completed');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async addChannel(channelConfig) {
    try {
      // First, check if the channel already exists
      const { data: existingChannel, error: fetchError } = await this.supabase
        .from('telegram_channels')
        .select('*')
        .eq('username', channelConfig.username)
        .single();

      if (existingChannel) {
        console.log(`Channel @${channelConfig.username} already exists. Skipping.`);
        return existingChannel;
      }

      // If channel doesn't exist, insert it
      const { data, error } = await this.supabase
        .from('telegram_channels')
        .insert({
          username: channelConfig.username,
          display_name: channelConfig.display_name,
          enabled: channelConfig.enabled ?? true,
          last_message_id: channelConfig.last_message_id ?? 0,
          scrape_media: channelConfig.scrape_media ?? false,
          scrape_interval_minutes: channelConfig.scrape_interval_minutes ?? 15
        })
        .select()
        .single();

      if (error) {
        if (error.code !== '23505') {
          throw error;
        }
        console.log(`Channel @${channelConfig.username} already exists.`);
        return null;
      }

      console.log(`✅ Added channel: ${channelConfig.display_name}`);
      return data;
    } catch (error) {
      console.error(`Error adding channel ${channelConfig.username}:`, error);
      return null;
    }
  }

  async loadChannels() {
    try {
      const { data, error } = await this.supabase
        .from('telegram_channels')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;

      this.channels = data || [];
      console.log(`📋 Loaded ${this.channels.length} channels from database`);
      return this.channels;
    } catch (error) {
      console.error('Error loading channels:', error);
      return [];
    }
  }

  /**
   * Scrape messages from a specific channel with full details
   * Starting from December 2024 until current date/time
   */
  async scrapeChannel(channelUsername, limit = 1000) {
    try {
      console.log(`🔍 Scraping channel: @${channelUsername}`);
      
      // Get channel info first
      let chat;
      try {
        chat = await this.bot.getChat(`@${channelUsername}`);
        console.log(`📺 Channel: ${chat.title} (@${chat.username})`);
      } catch (error) {
        console.error(`❌ Could not access channel @${channelUsername}:`, error.message);
        return [];
      }

      const messages = [];
      let scrapedCount = 0;
      
      // Set start date to December 1, 2024
      const startDate = new Date('2024-12-01T00:00:00Z');
      const currentDate = new Date();
      
      console.log(`📅 Scraping from: ${startDate.toISOString()}`);
      console.log(`📅 Scraping until: ${currentDate.toISOString()}`);
      
      // Start from a reasonable message ID and work backwards
      // We'll use a higher starting point to get more recent messages first
      let currentMessageId = 10000; // Start from a high number
      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 50; // Stop if we hit too many failures in a row
      
      while (scrapedCount < limit && consecutiveFailures < maxConsecutiveFailures) {
        try {
          // Try to get message info
          const message = await this.bot.forwardMessage(
            process.env.TELEGRAM_BOT_TOKEN, // Forward to bot's own chat
            `@${channelUsername}`,
            currentMessageId
          );

          if (message) {
            // Check if message date is within our target range
            const messageDate = new Date(message.date * 1000); // Convert Unix timestamp to Date
            
            if (messageDate >= startDate && messageDate <= currentDate) {
              const processedMessage = await this.processMessage(message, chat);
              if (processedMessage) {
                messages.push(processedMessage);
                scrapedCount++;
                console.log(`📝 Processed message ${currentMessageId} from @${channelUsername} (${messageDate.toISOString()})`);
                
                // Reset failure counter on success
                consecutiveFailures = 0;
              }
            } else if (messageDate < startDate) {
              // We've gone too far back, stop scraping this channel
              console.log(`⏹️ Reached messages before ${startDate.toISOString()}, stopping for @${channelUsername}`);
              break;
            }
          }
        } catch (error) {
          consecutiveFailures++;
          
          // Message might not exist or be accessible
          if (!error.message.includes('message not found') && 
              !error.message.includes('message to forward not found')) {
            console.error(`Error getting message ${currentMessageId}:`, error.message);
          }
        }
        
        currentMessageId--;
        
        // Rate limiting to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ Scraped ${messages.length} messages from @${channelUsername} (Dec 2024 - Now)`);
    return messages;
  } catch (error) {
      console.error(`Error scraping channel @${channelUsername}:`, error);
    return [];
  }
}

  /**
   * Process a single message and extract all required data according to schema
   */
  async processMessage(message, chat) {
    try {
      const processedMessage = {
        channel_id: chat.id.toString(),
        channel_title: chat.title || chat.username || 'Unknown',
        message_id: message.message_id,
        text: message.text || message.caption || null,
        date: message.date,
        author_signature: message.author_signature || null,
        forward_from_chat_id: message.forward_from_chat?.id?.toString() || null,
        forward_from_chat_title: message.forward_from_chat?.title || null,
        forward_from_message_id: message.forward_from_message_id || null,
        forward_date: message.forward_date || null,
        reply_to_message_id: message.reply_to_message?.message_id || null,
        edit_date: message.edit_date || null,
        media_group_id: message.media_group_id || null,
        has_photo: Boolean(message.photo && message.photo.length > 0),
        has_video: Boolean(message.video),
        has_document: Boolean(message.document),
        has_audio: Boolean(message.audio),
        has_voice: Boolean(message.voice),
        has_video_note: Boolean(message.video_note),
        has_sticker: Boolean(message.sticker),
        has_animation: Boolean(message.animation),
        has_contact: Boolean(message.contact),
        has_location: Boolean(message.location),
        has_venue: Boolean(message.venue),
        has_poll: Boolean(message.poll),
        photo_urls: [],
        video_url: null,
        document_url: null,
        audio_url: null,
        voice_url: null,
        views: message.views || null,
        reactions_count: message.reactions_count || null,
        entities: message.entities || null,
        caption: message.caption || null,
        scraped_at: new Date().toISOString(),
        raw_data: message
      };

      // Download media if enabled for this channel
      const channelConfig = this.channels.find(c => c.username === chat.username);
      if (channelConfig?.scrape_media) {
        await this.downloadMedia(message, processedMessage);
      }

      return processedMessage;
    } catch (error) {
      console.error('Error processing message:', error);
      return null;
    }
  }

  /**
   * Download media files and store URLs
   */
  async downloadMedia(message, processedMessage) {
    try {
      // Download photos
      if (message.photo && message.photo.length > 0) {
        const photoUrls = [];
        const largestPhoto = message.photo[message.photo.length - 1];
        
        try {
          const fileLink = await this.bot.getFileLink(largestPhoto.file_id);
          const fileName = `photo_${message.message_id}_${Date.now()}.jpg`;
          const filePath = await this.downloadFile(fileLink, fileName);
          photoUrls.push(filePath);
        } catch (error) {
          console.error('Error downloading photo:', error);
        }
        
        processedMessage.photo_urls = photoUrls;
      }

      // Download video
      if (message.video) {
        try {
          const fileLink = await this.bot.getFileLink(message.video.file_id);
          const fileName = `video_${message.message_id}_${Date.now()}.mp4`;
          processedMessage.video_url = await this.downloadFile(fileLink, fileName);
        } catch (error) {
          console.error('Error downloading video:', error);
        }
      }

      // Download document
      if (message.document) {
        try {
          const fileLink = await this.bot.getFileLink(message.document.file_id);
          const extension = message.document.file_name?.split('.').pop() || 'bin';
          const fileName = `doc_${message.message_id}_${Date.now()}.${extension}`;
          processedMessage.document_url = await this.downloadFile(fileLink, fileName);
        } catch (error) {
          console.error('Error downloading document:', error);
        }
      }

      // Download audio
      if (message.audio) {
        try {
          const fileLink = await this.bot.getFileLink(message.audio.file_id);
          const fileName = `audio_${message.message_id}_${Date.now()}.mp3`;
          processedMessage.audio_url = await this.downloadFile(fileLink, fileName);
        } catch (error) {
          console.error('Error downloading audio:', error);
        }
      }

      // Download voice
      if (message.voice) {
        try {
          const fileLink = await this.bot.getFileLink(message.voice.file_id);
          const fileName = `voice_${message.message_id}_${Date.now()}.ogg`;
          processedMessage.voice_url = await this.downloadFile(fileLink, fileName);
        } catch (error) {
          console.error('Error downloading voice:', error);
        }
      }
    } catch (error) {
      console.error('Error in downloadMedia:', error);
    }
  }

  /**
   * Download file from Telegram servers
   */
  async downloadFile(fileUrl, fileName) {
    try {
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream'
      });

      const filePath = path.join(this.mediaDir, fileName);
      const writer = fs.createWriteStream(filePath);
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async storeMessages(messages) {
    try {
      if (messages.length === 0) return;

      const { data, error } = await this.supabase
    .from('telegram_messages')
        .upsert(messages, {
          onConflict: 'channel_id,message_id',
          ignoreDuplicates: true
        });

      if (error) throw error;

      console.log(`✅ Stored ${messages.length} messages`);
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  }

  async scrapeAllChannels(messagesPerChannel = 1000) {
    // Ensure channels are loaded before scraping
    if (this.channels.length === 0) {
      await this.loadChannels();
    }

    console.log('🚀 Starting bulk scraping of all channels...');
    
    for (const channel of this.channels) {
      try {
        // Double-check that channel still has recent messages before scraping
        const hasRecentMessages = await this.checkChannelHasRecentMessages(channel.username);
        
        if (hasRecentMessages) {
          console.log(`🔍 Scraping channel @${channel.username} - Has recent messages`);
          const messages = await this.scrapeChannel(channel.username, messagesPerChannel);
          if (messages.length > 0) {
            await this.storeMessages(messages);
          }
        } else {
          console.log(`⏭️ Skipping channel @${channel.username} - No recent messages from Dec 2024`);
          // Optionally disable the channel in database
          await this.disableChannel(channel.username);
        }
        
        // Rate limiting between channels
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping channel ${channel.username}:`, error);
      }
    }
    
    console.log('✅ Bulk scraping completed');
  }

  async searchMessages(query, channelUsername) {
    try {
      let supabaseQuery = this.supabase
        .from('telegram_messages')
        .select('*')
        .textSearch('text', query)
        .order('date', { ascending: false })
        .limit(100);

      if (channelUsername) {
        supabaseQuery = supabaseQuery.eq('channel_id', channelUsername);
      }

      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Discover channels based on keywords
   */
  async discoverChannels() {
    console.log('🔍 Starting Telegram channel discovery...');
    const discoveredChannels = [];

    // Use Telegram search API or alternative method to find channels
    for (const keyword of this.keywords) {
      try {
        // Note: This is a placeholder. Actual implementation depends on Telegram API capabilities
        const searchResults = await this.searchChannels(keyword);
        
        for (const channel of searchResults) {
          // Check if channel is already in database
          const existingChannel = await this.checkChannelExists(channel.username);
          
          if (!existingChannel) {
            // Check if channel has messages from December 2024 before adding
            const hasRecentMessages = await this.checkChannelHasRecentMessages(channel.username);
            
            if (hasRecentMessages) {
              // Add new channel only if it has recent messages
              const addedChannel = await this.addChannel({
                username: channel.username,
                display_name: channel.title,
                enabled: true,
                scrape_media: true,
                scrape_interval_minutes: 15
              });

              if (addedChannel) {
                discoveredChannels.push(addedChannel);
                console.log(`🆕 Discovered channel: @${channel.username} (${channel.title}) - Has messages from Dec 2024`);
              }
            } else {
              console.log(`⏭️ Skipping channel @${channel.username} - No messages from Dec 2024`);
            }
          }
        }

        // Rate limit to avoid potential API restrictions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error discovering channels for keyword "${keyword}":`, error);
      }
    }

    console.log(`✅ Channel discovery completed. Found ${discoveredChannels.length} new channels with recent messages.`);
    return discoveredChannels;
  }

  /**
   * Search for channels (simulated method)
   * Note: Actual implementation requires Telegram API or third-party service
   */
  async searchChannels(keyword) {
    // IMPORTANT: This is a MOCK implementation
    // In a real-world scenario, you'd need:
    // 1. Telegram Bot API (which doesn't directly support channel search)
    // 2. A third-party Telegram search service
    // 3. Web scraping (which may violate Telegram's terms of service)
    
    const mockChannels = [
      { 
        username: 'memecoin_hunters', 
        title: 'Memecoin Hunters',
        description: 'All about the latest memecoins on Solana'
      },
      { 
        username: 'solana_memes', 
        title: 'Solana Meme Coins',
        description: 'Tracking the hottest meme coins in the Solana ecosystem'
      },
      { 
        username: 'crypto_bags', 
        title: 'Crypto Bags',
        description: 'Community for crypto and memecoin enthusiasts'
      }
    ];

    // Filter mock channels based on keyword
    return mockChannels.filter(channel => 
      channel.title.toLowerCase().includes(keyword.toLowerCase()) ||
      channel.description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if a channel already exists in the database
   */
  async checkChannelExists(username) {
    try {
      const { data, error } = await this.supabase
        .from('telegram_channels')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error checking channel ${username}:`, error);
      return null;
    }
  }

  /**
   * Check if a channel has messages from December 2024 onwards
   */
  async checkChannelHasRecentMessages(username) {
    try {
      console.log(`🔍 Checking if @${username} has messages from Dec 2024...`);
      
      // Try to access the channel first
      let chat;
      try {
        chat = await this.bot.getChat(`@${username}`);
      } catch (error) {
        console.log(`❌ Cannot access channel @${username}: ${error.message}`);
        return false;
      }

      const startDate = new Date('2024-12-01T00:00:00Z');
      let hasRecentMessages = false;
      let checkedCount = 0;
      const maxCheckCount = 100; // Check up to 100 messages to find recent ones
      
      // Start from a reasonable message ID and check for recent messages
      let currentMessageId = 10000;
      
      while (checkedCount < maxCheckCount && !hasRecentMessages) {
        try {
          // Try to get message info
          const message = await this.bot.forwardMessage(
            process.env.TELEGRAM_BOT_TOKEN,
            `@${username}`,
            currentMessageId
          );

          if (message) {
            const messageDate = new Date(message.date * 1000);
            
            if (messageDate >= startDate) {
              hasRecentMessages = true;
              console.log(`✅ Found recent message in @${username}: ${messageDate.toISOString()}`);
              break;
            } else if (messageDate < startDate) {
              // We've gone too far back, this channel doesn't have recent messages
              console.log(`⏹️ Channel @${username} has no messages from Dec 2024 (oldest: ${messageDate.toISOString()})`);
              break;
            }
          }
          
          checkedCount++;
        } catch (error) {
          // Message might not exist or be accessible
          if (!error.message.includes('message not found') && 
              !error.message.includes('message to forward not found')) {
            console.error(`Error checking message ${currentMessageId} in @${username}:`, error.message);
          }
        }
        
        currentMessageId--;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (!hasRecentMessages) {
        console.log(`⏭️ Channel @${username} has no recent messages from Dec 2024`);
      }

      return hasRecentMessages;
    } catch (error) {
      console.error(`Error checking recent messages for @${username}:`, error);
      return false;
    }
  }

  /**
   * Disable a channel in the database if it has no recent messages
   */
  async disableChannel(username) {
    try {
      const { error } = await this.supabase
        .from('telegram_channels')
        .update({
          enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (error) {
        console.error(`Error disabling channel ${username}:`, error);
      } else {
        console.log(`🔒 Disabled channel @${username} - No recent messages`);
      }
    } catch (error) {
      console.error(`Error disabling channel ${username}:`, error);
    }
  }

  /**
   * Enhanced main method to include channel discovery
   */
  async main() {
    try {
      // Initialize database
      await this.initializeDatabase();

      // Discover and add new channels
      await this.discoverChannels();

      // Load channels (including newly discovered ones)
      await this.loadChannels();

      // Scrape all loaded channels from December 2024 to now
      await this.scrapeAllChannels(1000);

      // Optional: Set up scheduled tasks
      this.setupScheduledTasks();

  } catch (error) {
      console.error('Telegram scraper main error:', error);
    }
  }

  /**
   * Set up scheduled tasks for periodic scraping and channel discovery
   */
  setupScheduledTasks() {
    // Discover new channels every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Scheduled channel discovery starting...');
      await this.discoverChannels();
    });

    // Scrape all channels daily from December 2024 to now
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Scheduled full channel scrape starting (Dec 2024 - Now)...');
      await this.scrapeAllChannels(1000);
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new TelegramChannelScraper();
  scraper.main().catch(console.error);
}

export { TelegramChannelScraper };
