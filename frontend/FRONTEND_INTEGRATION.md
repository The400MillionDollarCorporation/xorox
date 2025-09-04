# 🎨 Frontend Integration with Scrapers & Pattern Analysis

## Overview

The Iris frontend provides a comprehensive dashboard that integrates with all backend systems:
- **TikTok Scraper**: Real-time video scraping and analysis
- **Telegram Scraper**: Channel message monitoring and keyword tracking
- **Pattern Analysis**: AI-powered correlation analysis and trading recommendations

## 🏗️ **Architecture**

### **Frontend Components**
```
Dashboard Page
├── Real-time Data Overview
│   ├── TikTok Live Data
│   ├── Telegram Live Data
│   └── Pattern Analysis Live Data
├── Scraper Status Overview
│   ├── TikTok Scraper Status
│   ├── Telegram Scraper Status
│   └── Pattern Analysis Status
└── Main Content Tabs
    ├── Analysis Results
    ├── Trending Keywords
    └── System Control
```

### **API Endpoints**
- **`/api/dashboard/scraper-status`**: Get scraper status and metrics
- **`/api/dashboard/analysis-results`**: Fetch pattern analysis results
- **`/api/dashboard/trending-keywords`**: Get trending keywords data
- **`/api/dashboard/start-scraper`**: Start specific scrapers
- **`/api/dashboard/stop-scraper`**: Stop specific scrapers
- **`/api/dashboard/run-analysis`**: Trigger pattern analysis

## 🚀 **Features**

### **1. Real-time Data Monitoring**
- **Live Updates**: Auto-refresh every 10-30 seconds
- **Scraper Status**: Real-time status of all systems
- **Data Metrics**: Live counts and performance indicators

### **2. Scraper Control**
- **Start/Stop**: Individual control of each scraper
- **Bulk Operations**: Start/stop all scrapers at once
- **Status Monitoring**: Visual indicators for running/idle/error states

### **3. Pattern Analysis Integration**
- **Results Display**: View all analysis results with filtering
- **Recommendations**: Trading recommendations with risk levels
- **Platform Filtering**: Filter by TikTok, Telegram, or comprehensive

## 📱 **Dashboard Sections**

### **Real-time Data Overview**
- **TikTok Live**: Recent videos, total views, trending tokens
- **Telegram Live**: Recent messages, active channels, trending keywords
- **Analysis Live**: Last analysis time, correlations, recommendations

### **Scraper Status Cards**
- **Status Indicators**: Color-coded status (green=running, red=error, gray=idle)
- **Metrics Display**: Total data and today's activity
- **Control Buttons**: Start/stop individual scrapers

### **Analysis Results Tab**
- **Result Cards**: Detailed analysis information
- **Summary Metrics**: Key statistics and counts
- **Recommendations**: Top trading recommendations with risk levels

## 🔧 **Setup & Configuration**

### **Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Usage**
1. **Setup Environment**: Configure Supabase credentials
2. **Start Backend**: Ensure scrapers and analysis are running
3. **Launch Frontend**: Start the Next.js development server
4. **Access Dashboard**: Navigate to `/dashboard`

The frontend provides a **comprehensive, real-time interface** for monitoring and controlling all Iris systems! 🚀
