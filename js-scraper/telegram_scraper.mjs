import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

class TelegramChannelScraper {
  constructor() {
    // Validate required environment variables
    this.validateEnv();

    // Initialize Telegram Bot (optional - only if token provided)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    }

    // Initialize Supabase Client
    this.supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_KEY
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
      'SUPABASE_URL', 
      'SUPABASE_KEY'
    ];

    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });

    // Bot token is optional for web scraping
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN not provided - using web scraping only');
    }
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
   * Scrape messages from a specific channel using both web scraping and RSS
   * Starting from December 2024 until current date/time
   */
  async scrapeChannel(channelUsername, limit = 1000) {
    try {
      console.log(`🔍 Scraping channel: @${channelUsername} using dual method approach`);
      
      // Set start date to December 1, 2024
      const startDate = new Date('2024-12-01T00:00:00Z');
      const currentDate = new Date();
      
      console.log(`📅 Scraping from: ${startDate.toISOString()}`);
      console.log(`📅 Scraping until: ${currentDate.toISOString()}`);
      
      const allMessages = [];
      
      // METHOD 1: Web Scraping
      console.log(`\n🌐 METHOD 1: Web Scraping from public preview page...`);
      const webMessages = await this.scrapePublicChannelWeb(channelUsername, limit);
      console.log(`✅ Web scraping completed: ${webMessages.length} messages`);
      
      // METHOD 2: RSS Feed Scraping
      console.log(`\n📡 METHOD 2: RSS Feed scraping...`);
      const rssMessages = await this.scrapeChannelRSS(channelUsername);
      console.log(`✅ RSS scraping completed: ${rssMessages.length} messages`);
      
      // Combine and deduplicate messages
      const combinedMessages = [...webMessages, ...rssMessages];
      const uniqueMessages = this.deduplicateMessages(combinedMessages);
      
      console.log(`📊 Combined messages: ${combinedMessages.length}`);
      console.log(`📊 Unique messages after deduplication: ${uniqueMessages.length}`);
      
      // Filter messages by date range
      const filteredMessages = uniqueMessages.filter(msg => {
        const messageDate = new Date(msg.date * 1000);
        return messageDate >= startDate && messageDate <= currentDate;
      });
      
      console.log(`✅ Final result: ${filteredMessages.length} messages from @${channelUsername} (Dec 2024 - Now)`);
      return filteredMessages;
    } catch (error) {
      console.error(`Error scraping channel @${channelUsername}:`, error);
      return [];
    }
  }

  /**
   * Deduplicate messages based on message_id and channel_id
   */
  deduplicateMessages(messages) {
    const seen = new Set();
    const uniqueMessages = [];
    
    for (const message of messages) {
      const key = `${message.channel_id}_${message.message_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(message);
      }
    }
    
    return uniqueMessages;
  }

  /**
   * METHOD 1: Web Scraping Telegram's Public Preview Pages
   * This is the most reliable method for public channels
   */
  async scrapePublicChannelWeb(channelUsername, limit = 1000) {
    try {
      console.log(`🌐 Scraping public web preview for @${channelUsername}`);
      
      const url = `https://t.me/s/${channelUsername}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const messages = [];

      $('.tgme_widget_message').each((index, element) => {
        if (messages.length >= limit) return;

        const $msg = $(element);
        const messageId = parseInt($msg.attr('data-post')?.split('/')[1] || '0');
        const text = $msg.find('.tgme_widget_message_text').text().trim();
        const dateStr = $msg.find('.tgme_widget_message_date time').attr('datetime');
        const viewsText = $msg.find('.tgme_widget_message_views').text();
        
        // Extract media information
        const hasPhoto = $msg.find('.tgme_widget_message_photo').length > 0;
        const hasVideo = $msg.find('.tgme_widget_message_video').length > 0;
        const photoUrl = $msg.find('.tgme_widget_message_photo_wrap').attr('style')?.match(/url\('([^']+)'\)/)?.[1];

        if (messageId && (text || hasPhoto || hasVideo)) {
          messages.push({
            channel_id: channelUsername,
            channel_title: channelUsername,
            message_id: messageId,
            text: text || '[Media]',
            date: dateStr ? Math.floor(new Date(dateStr).getTime() / 1000) : 0,
            views: viewsText ? this.parseViews(viewsText) : null,
            has_photo: hasPhoto,
            has_video: hasVideo,
            photo_urls: photoUrl ? [photoUrl] : [],
            scraped_at: new Date().toISOString(),
            raw_data: {
              message_id: messageId,
              text: text,
              date: dateStr,
              views: viewsText,
              has_photo: hasPhoto,
              has_video: hasVideo,
              photo_url: photoUrl
            }
          });
        }
      });

      console.log(`✅ Scraped ${messages.length} messages from web preview`);
      return messages;
    } catch (error) {
      console.error('Error scraping web preview:', error);
      return [];
    }
  }

  /**
   * Parse view count from Telegram's view text
   */
  parseViews(viewsText) {
    if (!viewsText) return null;
    
    const views = viewsText.trim();
    if (views.includes('K')) {
      return parseInt(views.replace('K', '')) * 1000;
    } else if (views.includes('M')) {
      return parseInt(views.replace('M', '')) * 1000000;
    } else {
      return parseInt(views) || null;
    }
  }

  /**
   * METHOD 2: Using Telegram's RSS Feeds (if available)
   * Some public channels provide RSS feeds
   */
  async scrapeChannelRSS(channelUsername) {
    try {
      console.log(`📡 Attempting RSS scraping for @${channelUsername}`);
      
      // Try common RSS feed patterns
      const rssUrls = [
        `https://rsshub.app/telegram/channel/${channelUsername}`,
        `https://t.me/s/${channelUsername}/rss`,
        `https://rsshub.app/telegram/channel/${channelUsername}/rss`
      ];

      for (const rssUrl of rssUrls) {
        try {
          console.log(`🔍 Trying RSS URL: ${rssUrl}`);
          const response = await axios.get(rssUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
          });

          if (response.status === 200 && response.data) {
            console.log(`✅ Found RSS feed for @${channelUsername} at ${rssUrl}`);
            return await this.parseRSSFeed(response.data, channelUsername);
          }
        } catch (error) {
          console.log(`❌ RSS URL failed: ${rssUrl} - ${error.message}`);
          continue; // Try next URL
        }
      }

      console.log(`⚠️ No RSS feed found for @${channelUsername}`);
      return [];
    } catch (error) {
      console.error('Error scraping RSS:', error);
      return [];
    }
  }

  /**
   * Parse RSS feed XML data
   */
  async parseRSSFeed(xmlData, channelUsername) {
    try {
      // Simple XML parsing for RSS feeds
      // Note: For production use, consider using 'xml2js' package
      const messages = [];
      
      // Extract items from RSS XML
      const itemMatches = xmlData.match(/<item>([\s\S]*?)<\/item>/g);
      
      if (itemMatches) {
        for (const item of itemMatches) {
          try {
            // Extract message data from RSS item
            const titleMatch = item.match(/<title>(.*?)<\/title>/);
            const descriptionMatch = item.match(/<description>(.*?)<\/description>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
            const guidMatch = item.match(/<guid>(.*?)<\/guid>/);
            
            if (titleMatch || descriptionMatch) {
              const messageId = this.extractMessageIdFromLink(linkMatch?.[1] || guidMatch?.[1] || '');
              const text = (titleMatch?.[1] || '') + (descriptionMatch?.[1] ? ' ' + descriptionMatch?.[1] : '');
              const pubDate = pubDateMatch?.[1] ? new Date(pubDateMatch[1]) : new Date();
              
              if (messageId && text) {
                messages.push({
                  channel_id: channelUsername,
                  channel_title: channelUsername,
                  message_id: messageId,
                  text: text.trim(),
                  date: Math.floor(pubDate.getTime() / 1000),
                  has_photo: text.includes('[Photo]') || text.includes('[Image]'),
                  has_video: text.includes('[Video]') || text.includes('[Media]'),
                  photo_urls: [],
                  scraped_at: new Date().toISOString(),
                  raw_data: {
                    title: titleMatch?.[1],
                    description: descriptionMatch?.[1],
                    link: linkMatch?.[1],
                    pubDate: pubDateMatch?.[1],
                    guid: guidMatch?.[1],
                    source: 'RSS'
                  }
                });
              }
            }
          } catch (itemError) {
            console.error('Error parsing RSS item:', itemError);
            continue;
          }
        }
      }
      
      console.log(`📊 Parsed ${messages.length} messages from RSS feed for @${channelUsername}`);
    return messages;
  } catch (error) {
      console.error('Error parsing RSS feed:', error);
    return [];
  }
}

  /**
   * Extract message ID from Telegram link
   */
  extractMessageIdFromLink(link) {
    try {
      // Extract message ID from various Telegram link formats
      const patterns = [
        /t\.me\/[^\/]+\/(\d+)/,           // t.me/channel/123
        /telegram\.me\/[^\/]+\/(\d+)/,    // telegram.me/channel/123
        /\/s\/[^\/]+\/(\d+)/,             // /s/channel/123
        /post\/(\d+)/,                     // post/123
        /message\/(\d+)/                   // message/123
      ];
      
      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
          return parseInt(match[1]);
        }
      }
      
      // If no pattern matches, generate a hash-based ID
      return Math.abs(link.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
    } catch (error) {
      console.error('Error extracting message ID from link:', error);
      return Date.now(); // Fallback to timestamp
    }
  }

  /**
   * Process a single message and extract all required data
   * Now works with web scraped data
   */
  async processMessage(message, chat) {
    try {
      // If message is already in the correct format from web scraping, return it
      if (message.channel_id && message.message_id) {
        return message;
      }

      // Fallback for bot API messages (if needed)
      const processedMessage = {
        channel_id: chat?.id?.toString() || message.channel_id || 'unknown',
        channel_title: chat?.title || chat?.username || message.channel_title || 'Unknown',
        message_id: message.message_id || message.id,
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
        has_photo: Boolean(message.photo && message.photo.length > 0) || message.has_photo || false,
        has_video: Boolean(message.video) || message.has_video || false,
        has_document: Boolean(message.document) || false,
        has_audio: Boolean(message.audio) || false,
        has_voice: Boolean(message.voice) || false,
        has_video_note: Boolean(message.video_note) || false,
        has_sticker: Boolean(message.sticker) || false,
        has_animation: Boolean(message.animation) || false,
        has_contact: Boolean(message.contact) || false,
        has_location: Boolean(message.location) || false,
        has_venue: Boolean(message.venue) || false,
        has_poll: Boolean(message.poll) || false,
        photo_urls: message.photo_urls || [],
        video_url: message.video_url || null,
        document_url: message.document_url || null,
        audio_url: message.audio_url || null,
        voice_url: message.voice_url || null,
        views: message.views || null,
        reactions_count: message.reactions_count || null,
        entities: message.entities || null,
        caption: message.caption || null,
        scraped_at: message.scraped_at || new Date().toISOString(),
        raw_data: message.raw_data || message
      };

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
      
      // Extract and store token mentions from messages
      await this.extractAndStoreTokenMentions(messages);
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  }

  /**
   * Extract token mentions from Telegram messages and store them
   */
  async extractAndStoreTokenMentions(messages) {
    try {
      // Get all tokens from database
      const { data: tokens, error: tokensError } = await this.supabase
        .from('tokens')
        .select('id, symbol')
        .order('id', { ascending: true });

      if (tokensError) {
        console.error('Error fetching tokens:', tokensError);
        return;
      }

      // Create a map of symbol to token IDs
      const symbolToTokens = new Map();
      tokens.forEach((token) => {
        if (!symbolToTokens.has(token.symbol)) {
          symbolToTokens.set(token.symbol, []);
        }
        symbolToTokens.get(token.symbol).push(token.id);
      });

      const mentionsData = [];
      const mentionAt = new Date().toISOString();

      // Process each message for token mentions
      for (const message of messages) {
        if (!message.text) continue;

        const messageText = message.text.toLowerCase();
        
        // Check for token symbols in the message
        for (const [symbol, tokenIds] of symbolToTokens) {
          const symbolLower = symbol.toLowerCase();
          
          // Simple keyword matching - you can enhance this with regex or NLP
          if (messageText.includes(symbolLower) || 
              messageText.includes(`#${symbolLower}`) ||
              messageText.includes(`$${symbolLower}`)) {
            
            // Count occurrences
            const count = (messageText.match(new RegExp(symbolLower, 'gi')) || []).length;
            
            // Add mention entry for each token ID associated with the symbol
            for (const tokenId of tokenIds) {
              mentionsData.push({
                tiktok_id: null, // Telegram messages don't have TikTok IDs
                token_id: tokenId,
                count: count,
                mention_at: mentionAt,
                source: 'telegram',
                channel_id: message.channel_id,
                message_id: message.message_id
              });
            }
          }
        }
      }

      if (mentionsData.length > 0) {
        // Store mentions in the mentions table
        const { error: mentionsError } = await this.supabase
          .from('mentions')
          .insert(mentionsData);

        if (mentionsError) {
          console.error('Error inserting mentions:', mentionsError);
        } else {
          console.log(`🔗 Stored ${mentionsData.length} token mentions from Telegram messages`);
        }
      }
    } catch (error) {
      console.error('Error extracting token mentions:', error);
    }
  }

  async scrapeAllChannels(messagesPerChannel = 50) {
    // Ensure channels are loaded before scraping
    if (this.channels.length === 0) {
      await this.loadChannels();
    }

    console.log('🚀 Starting bulk scraping of all channels...');
    
    for (const channel of this.channels) {
      try {
        const messages = await this.scrapeChannel(channel.username, messagesPerChannel);
        if (messages.length > 0) {
          await this.storeMessages(messages);
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
            // Add new channel
            const addedChannel = await this.addChannel({
              username: channel.username,
              display_name: channel.title,
              enabled: true,
              scrape_media: true,
              scrape_interval_minutes: 15
            });

            if (addedChannel) {
              discoveredChannels.push(addedChannel);
              console.log(`🆕 Discovered channel: @${channel.username} (${channel.title})`);
            }
          }
        }

        // Rate limit to avoid potential API restrictions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error discovering channels for keyword "${keyword}":`, error);
      }
    }

    console.log(`✅ Channel discovery completed. Found ${discoveredChannels.length} new channels.`);
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
        username: 'nitrotrades10', 
        title: 'Nitro Trades',
        description: 'Premium trading signals and crypto analysis for profitable trades'
      },
      { 
        username: 'garden_btc', 
        title: 'Garden BTC',
        description: 'Bitcoin trading community with expert insights and market analysis'
      },
      { 
        username: 'cryptofuturesspotsignals', 
        title: 'Crypto Futures Spot Signals',
        description: 'Professional crypto futures and spot trading signals with high accuracy'
      },
      { 
        username: 'binancetrade9', 
        title: 'Binance Trade',
        description: 'Binance trading signals and cryptocurrency market analysis'
      },
      { 
        username: 'crypto_miami', 
        title: 'Crypto Miami',
        description: 'Miami-based crypto community with trading insights and market updates'
      },
      { 
        username: 'okx_encryption', 
        title: 'OKX Encryption',
        description: 'OKX exchange trading signals and cryptocurrency analysis'
      },
      { 
        username: 'currency_flashing', 
        title: 'Currency Flashing',
        description: 'Real-time currency and crypto trading signals with flash updates'
      },
      { 
        username: 'wallstreetqueentrade', 
        title: 'Wall Street Queen Official',
        description: 'Welcome to Wall Street Queen Official Your premier source for stock market insights, trading tips, and investing strategies. Expert analysis | Daily market updates | Smart investing Empowering traders to conquer Wall Street with confidence.'
      },
      { 
        username: 'predictumindicatorcrypto', 
        title: 'Predictum Indicator Crypto',
        description: 'Advanced crypto trading indicators and predictive analysis tools'
      },
      { 
        username: 'hodlnations', 
        title: 'HODL Nations',
        description: 'Long-term crypto holding community with strategic investment advice'
      },
      { 
        username: 'ayub_khan_admin', 
        title: 'Ayub Khan Admin',
        description: 'Crypto trading bot and automated trading signals by Ayub Khan'
      },
      { 
        username: 'cryptoninjas_tradings', 
        title: 'Crypto Ninjas Trading',
        description: 'Stealth trading strategies and ninja-level crypto market analysis'
      },
      { 
        username: 'remoteweb3jobs', 
        title: 'Remote Web3 Jobs',
        description: 'Job opportunities in Web3, blockchain, and cryptocurrency industries'
      },
      { 
        username: 'usdtgainandfreebnb', 
        title: 'USDT Gain and Free BNB',
        description: 'USDT earning strategies and free BNB giveaways for crypto enthusiasts'
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
