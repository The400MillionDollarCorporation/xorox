# Outlight.fun Telegram Scraper Setup Guide

## Overview

The Outlight.fun Telegram Scraper is designed to discover and scrape Telegram channels and messages from the [Outlight.fun](https://www.outlight.fun/home) website. It follows the same pattern as the existing TikTok scraper but targets Telegram data sources.

## Features

- **Channel Discovery**: Automatically discovers Telegram channels from Outlight.fun homepage
- **Dual Scraping Methods**: Uses both Puppeteer and Cheerio for comprehensive data extraction
- **Message Scraping**: Scrapes messages from discovered Telegram channels
- **Database Storage**: Stores channels in `telegram_channels` table and messages in `telegram_messages` table
- **Token Mentions**: Automatically extracts and stores token mentions from messages
- **Rate Limiting**: Implements proper rate limiting to avoid being blocked

## Prerequisites

1. **Environment Variables**: Ensure you have the following in your `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

2. **Database Schema**: The scraper requires the following tables (already included in `supabase_schema.sql`):
   - `telegram_channels`
   - `telegram_messages`
   - `mentions`
   - `tokens`

3. **Dependencies**: All required packages are already included in `package.json`

## Usage

### 1. Run the Complete Scraper

```bash
cd js-scraper
npm run scrape-outlight
```

This will:
- Scrape Outlight.fun homepage for Telegram channels
- Store discovered channels in the database
- Scrape messages from each channel
- Store messages and extract token mentions

### 2. Run Tests

```bash
npm run test-outlight
```

This will run comprehensive tests to verify the scraper functionality.

### 3. Manual Testing

```javascript
import { OutlightScraper } from './outlight-scraper.mjs';

const scraper = new OutlightScraper();
await scraper.main();
```

## How It Works

### 1. Channel Discovery

The scraper uses two methods to discover Telegram channels from Outlight.fun:

#### Method 1: Puppeteer Web Scraping
- Launches a headless browser
- Navigates to https://www.outlight.fun/home
- Extracts Telegram links using various selectors
- Looks for `@mentions` in text content

#### Method 2: Cheerio HTML Parsing
- Makes HTTP requests to the homepage
- Parses HTML using Cheerio
- Extracts Telegram links and mentions
- Provides faster, lighter alternative to Puppeteer

### 2. Channel Storage

Discovered channels are stored in the `telegram_channels` table with:
- `username`: Telegram channel username
- `display_name`: Human-readable name
- `enabled`: Whether to scrape this channel
- `scrape_interval_minutes`: How often to scrape
- `last_message_id`: Last scraped message ID

### 3. Message Scraping

For each discovered channel, the scraper:
- Accesses the public Telegram preview page (`https://t.me/s/{username}`)
- Extracts message data including:
  - Message ID and text
  - Timestamp and view count
  - Media information (photos, videos)
  - Raw data for analysis

### 4. Message Storage

Messages are stored in the `telegram_messages` table with:
- Channel information
- Message content and metadata
- Media URLs and types
- Scraping timestamp

### 5. Token Mention Extraction

The scraper automatically:
- Compares message text against known token symbols
- Counts mentions of each token
- Stores mentions in the `mentions` table with source='telegram'

## Configuration

### Rate Limiting

The scraper implements rate limiting to avoid being blocked:
- 500ms delay between channel storage operations
- 2 seconds delay between channel scraping operations
- 30-second timeout for HTTP requests

### Scraping Limits

- Default: 200 messages per channel
- Configurable via the `limit` parameter
- Can be adjusted in the `scrapeTelegramChannel` method

### Error Handling

- Graceful handling of network errors
- Continues processing even if individual channels fail
- Comprehensive logging for debugging

## Database Schema

### telegram_channels Table

```sql
CREATE TABLE telegram_channels (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    enabled BOOLEAN DEFAULT true,
    last_message_id BIGINT DEFAULT 0,
    scrape_media BOOLEAN DEFAULT false,
    scrape_interval_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### telegram_messages Table

```sql
CREATE TABLE telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date BIGINT,
    views BIGINT,
    has_photo BOOLEAN DEFAULT false,
    has_video BOOLEAN DEFAULT false,
    photo_urls TEXT[],
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB,
    UNIQUE(channel_id, message_id)
);
```

## Monitoring and Logging

The scraper provides comprehensive logging:
- Channel discovery progress
- Message scraping statistics
- Error reporting and recovery
- Database operation summaries

## Integration with Existing System

The Outlight scraper integrates seamlessly with the existing ZoroX platform:

1. **Data Flow**: Channels and messages are stored in the same database tables used by the existing Telegram scraper
2. **Token Mentions**: Automatically links to the existing token database
3. **Frontend Integration**: Data is immediately available in the dashboard
4. **Pattern Analysis**: Can be used with existing pattern analysis tools

## Troubleshooting

### Common Issues

1. **No Channels Found**
   - Check if Outlight.fun is accessible
   - Verify the website structure hasn't changed
   - Check network connectivity

2. **Database Errors**
   - Ensure Supabase credentials are correct
   - Verify database schema is up to date
   - Check for duplicate key constraints

3. **Scraping Failures**
   - Some channels may be private or restricted
   - Rate limiting may cause temporary failures
   - Check Telegram's public preview availability

### Debug Mode

Enable detailed logging by modifying the scraper:

```javascript
// Add to constructor
this.debug = true;

// Use in methods
if (this.debug) {
  console.log('Debug info:', data);
}
```

## Future Enhancements

1. **Scheduled Scraping**: Add cron job support for regular updates
2. **Channel Validation**: Verify channel accessibility before scraping
3. **Content Analysis**: Add sentiment analysis for messages
4. **Media Download**: Download and store media files locally
5. **API Integration**: Add REST API endpoints for manual triggering

## Security Considerations

- Respects rate limits to avoid being blocked
- Uses proper User-Agent headers
- Implements error handling for network issues
- Stores only publicly available data
- Follows Telegram's terms of service

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables and database connectivity
3. Test individual components using the test script
4. Review the troubleshooting section above
