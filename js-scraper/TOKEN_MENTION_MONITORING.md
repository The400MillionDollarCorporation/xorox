# Token Mention Monitoring System

## Overview

This system continuously monitors existing TikTok videos for new token mentions, automatically detecting and storing cryptocurrency token references in comments.

## 🚀 Features

- **Continuous Monitoring**: Automatically checks for new mentions every 10 minutes
- **Duplicate Prevention**: Avoids storing duplicate mentions
- **Error Handling**: Graceful error handling with retry mechanisms
- **Integration**: Works with existing TikTok scraper infrastructure
- **Real-time Updates**: Updates mention check timestamps to track progress

## 📁 Files

### Core Monitoring Files
- `token_mention_monitor.mjs` - Standalone monitoring service
- `integrated_monitor.mjs` - Integrated monitoring with existing scraper
- `store_scraped_data.mjs` - Stores existing scraped data

### Database Schema
- `supabase_schema.sql` - Updated database schema with monitoring support
- `SUPABASE_SETUP.md` - Database setup instructions

## 🗄️ Database Schema Updates

The monitoring system requires these additional fields:

```sql
-- Add to tiktoks table
ALTER TABLE tiktoks ADD COLUMN last_mention_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add index for performance
CREATE INDEX idx_tiktoks_last_mention_check ON tiktoks(last_mention_check);
```

## 🚀 Usage

### 1. Single Check
Run a one-time mention check:
```bash
node integrated_monitor.mjs --single
```

### 2. Continuous Monitoring
Start continuous monitoring:
```bash
node integrated_monitor.mjs --continuous
```

### 3. Standalone Monitor
Use the standalone version:
```bash
node token_mention_monitor.mjs --continuous
```

## ⚙️ Configuration

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_SECRET=your_supabase_key
```

### Monitoring Settings
```javascript
const MONITORING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 30 * 1000; // 30 seconds
```

## 🔄 How It Works

### 1. **Discovery Phase**
- Queries database for TikToks that need mention checking
- Prioritizes TikToks never checked or checked >10 minutes ago
- Processes 5 TikToks per cycle to avoid overwhelming

### 2. **Mention Extraction**
- Uses existing `extractComments()` function from scraper
- Extracts token symbols and mention counts from comments
- Maps symbols to database token IDs

### 3. **Storage & Deduplication**
- Checks for existing mentions to prevent duplicates
- Stores new mentions with timestamps
- Updates mention check timestamps

### 4. **Error Handling**
- Graceful error handling for individual TikToks
- Retry mechanism for failed operations
- Continues processing other TikToks on errors

## 📊 Monitoring Output

### Success Messages
```
🚀 Starting Integrated Token Mention Monitor...
⏰ Monitoring interval: 600 seconds
📊 Found 3 TikToks to check for mentions
🔍 Checking mentions for TikTok: 7465712088011377953
✅ Found mentions for 2 tokens
🎯 Stored 2 new mentions for TikTok 7465712088011377953
✅ Monitoring complete. New mentions found: 2
```

### Error Handling
```
❌ Error processing TikTok 7465712088011377953: Network error
⏳ Waiting 30 seconds before retry...
```

## 🔧 Integration Points

### With Existing Scraper
- Uses `extractComments()` function for comment parsing
- Leverages existing token database structure
- Integrates with TikTok storage system

### With Frontend
- Real-time mention data available via Supabase
- Mentions table can be queried for analytics
- Token mention counts updated automatically

## 📈 Performance Considerations

### Rate Limiting
- Processes 5 TikToks per cycle
- 2-second delay between TikTok processing
- 10-minute intervals between monitoring cycles

### Database Optimization
- Index on `last_mention_check` for fast queries
- Batch processing to reduce database calls
- Efficient duplicate checking

## 🚨 Troubleshooting

### Common Issues

1. **No Mentions Found**
   - Check if tokens exist in database
   - Verify comment extraction is working
   - Check TikTok URLs are valid

2. **Database Errors**
   - Verify Supabase credentials
   - Check database schema is updated
   - Ensure proper permissions

3. **Scraping Failures**
   - Check network connectivity
   - Verify TikTok scraping functions
   - Monitor rate limiting

### Debug Mode
Enable verbose logging by modifying the monitoring functions to include more detailed output.

## 🔮 Future Enhancements

### Planned Features
- **Webhook Notifications**: Real-time alerts for new mentions
- **Analytics Dashboard**: Mention trends and statistics
- **Token Price Integration**: Correlate mentions with price movements
- **Social Media Integration**: Cross-platform mention monitoring

### Scalability Improvements
- **Distributed Processing**: Multiple monitoring instances
- **Queue System**: Redis-based job queuing
- **API Rate Limiting**: Intelligent rate limiting based on platform limits

## 📝 Maintenance

### Regular Tasks
- Monitor error logs for patterns
- Update token database regularly
- Review monitoring intervals
- Clean up old mention data

### Health Checks
- Database connectivity
- Scraping function availability
- Mention detection accuracy
- Storage performance

## 🤝 Contributing

When modifying the monitoring system:
1. Test with single check first
2. Verify database schema compatibility
3. Update documentation
4. Test error handling scenarios

## 📞 Support

For issues or questions:
1. Check error logs
2. Verify configuration
3. Test individual components
4. Review database schema
