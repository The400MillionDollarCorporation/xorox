# 📡 ZoroX Telegram Scraper

## Overview
A powerful Telegram channel scraper that integrates with Supabase for storing and analyzing Telegram channel messages.

## Features
- 🤖 Telegram Bot API integration
- 💾 Supabase database storage
- 🔍 Channel message scraping
- 📊 Message search and analytics
- 🕒 Scheduled scraping

## Prerequisites
- Node.js 18+
- Telegram Bot Token
- Supabase Project

## Setup
1. Clone the repository
2. `cd js-scraper`
3. `npm install`
4. Copy `.env.example` to `.env`
5. Fill in your Telegram and Supabase credentials

## Usage
- `npm start`: Run the scraper
- `npm run scrape`: Manually trigger scraping

## Configuration
Edit `telegram_scraper.mjs` to configure:
- Channels to scrape
- Scraping intervals
- Media download settings

## License
MIT License
