# Windows Setup Guide for ZoroX TikTok Scraper

## Problem
The Linux version of the scraper tries to use `/usr/bin/google-chrome` which doesn't exist on Windows, causing this error:
```
Failed to launch browser: Error: Browser was not found at the configured executablePath (/usr/bin/google-chrome)
```

## Solution
Use the Windows-specific version of the scraper that automatically detects Chrome on Windows.

## Quick Start

### 1. **Use Windows-Specific Scripts**
Instead of running `node index.mjs`, use these Windows-optimized commands:

```bash
# Option 1: Use the Windows startup script (recommended)
npm run start-windows

# Option 2: Run Windows scraper directly
npm run scrape-windows

# Option 3: Run Windows scraper manually
node windows/index.mjs
```

### 2. **Set Up Environment Variables**
Create a `.env` file in the `js-scraper` directory:

```bash
# Copy the example file
copy env.example .env

# Edit .env with your Supabase credentials
notepad .env
```

**Required Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Chrome Configuration (optional - let Puppeteer auto-detect)
EXECUTABLE_PATH=
USER_DATA_DIR=
```

## Detailed Setup

### Step 1: Install Dependencies
```bash
cd js-scraper
npm install
# or
yarn install
```

### Step 2: Configure Environment
1. **Copy the example environment file:**
   ```bash
   copy env.example .env
   ```

2. **Edit the `.env` file with your Supabase credentials:**
   ```env
   SUPABASE_URL=https://srsapzqvwxgrohisrwnm.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Chrome Configuration (Optional):**
   - **Auto-detect (Recommended):** Leave `EXECUTABLE_PATH` empty
   - **Manual path:** Set to your Chrome installation path:
     ```env
     EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
     ```

### Step 3: Run the Scraper
```bash
# Use Windows startup script (recommended)
npm run start-windows

# Or run directly
npm run scrape-windows
```

## Troubleshooting

### Chrome Not Found
If Puppeteer still can't find Chrome:

1. **Check if Chrome is installed:**
   - Open Command Prompt and type: `chrome --version`
   - If not found, install Chrome from: https://www.google.com/chrome/

2. **Set Chrome path manually:**
   ```env
   EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
   ```

3. **Common Chrome paths on Windows:**
   - `C:\Program Files\Google\Chrome\Application\chrome.exe`
   - `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
   - `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

### Permission Issues
If you get permission errors:

1. **Run Command Prompt as Administrator**
2. **Check Windows Defender/Firewall settings**
3. **Ensure Chrome has necessary permissions**

### Supabase Connection Issues
If you can't connect to Supabase:

1. **Verify your credentials in `.env`**
2. **Check if your IP is whitelisted in Supabase**
3. **Ensure your Supabase project is active**

## File Structure

```
js-scraper/
├── windows/                 # Windows-specific scraper files
│   ├── index.mjs           # Main Windows scraper
│   └── alt.mjs             # Alternative Windows scraper
├── index.mjs               # Linux version (don't use on Windows)
├── start-windows.mjs       # Windows startup script
├── package.json            # Package configuration
├── .env                    # Environment variables (create this)
└── env.example             # Environment template
```

## Available Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `npm run start-windows` | Windows startup script | **Recommended for Windows users** |
| `npm run scrape-windows` | Direct Windows scraper | Quick testing |
| `npm run start` | Telegram scraper | Telegram functionality |
| `npm run setup-db` | Database setup | Initial setup |

## Why Use Windows Version?

The Windows version of the scraper:
- ✅ **Auto-detects Chrome** on Windows
- ✅ **Uses Windows-optimized paths**
- ✅ **Handles Windows-specific browser arguments**
- ✅ **Configurable via environment variables**
- ✅ **Better error handling** for Windows systems

## Next Steps

After successful setup:

1. **Test the scraper:** `npm run scrape-windows`
2. **Set up database:** `npm run setup-db`
3. **Configure scraping parameters** in the Windows scraper files
4. **Monitor logs** for successful TikTok data collection

## Support

If you encounter issues:
1. Check this guide first
2. Verify your `.env` configuration
3. Ensure Chrome is properly installed
4. Check the console output for specific error messages

**Happy Scraping! 🚀**
