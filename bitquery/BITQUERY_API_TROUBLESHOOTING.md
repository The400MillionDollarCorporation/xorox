# 🔧 Bitquery API Troubleshooting Guide

## 🚨 **Current Error**

```
❌ Error fetching data: TypeError: Cannot read properties of null (reading 'Solana')
```

## 🔍 **Root Cause Analysis**

This error occurs when the Bitquery API response doesn't contain the expected `data.Solana` structure. Common causes:

1. **API Authentication Failure** (401/403 errors)
2. **API Rate Limiting** (429 errors)
3. **Invalid API Response Format**
4. **Network/Connection Issues**
5. **Missing Environment Variables**

## ✅ **Comprehensive Fixes Applied**

### **1. Enhanced Error Handling**

**File**: `bitquery/scripts/prices.mjs`

**Added**:
- Environment variable validation
- Response structure validation
- HTTP status code checking
- Detailed error logging
- Safe data access patterns

### **2. API Connection Test Script**

**File**: `bitquery/test-api-connection.mjs`

**Purpose**: Debug API connection and response structure
**Usage**: `npm run test-api`

## 🧪 **Step-by-Step Troubleshooting**

### **Step 1: Test API Connection**

```bash
cd bitquery
npm run test-api
```

**Expected Output**:
```
🧪 Testing Bitquery API Connection...

🔑 Environment Variables:
  BITQUERY_API_KEY: ✅ Set
  ACCESS_TOKEN: ✅ Set

🚀 Making API request...
  URL: https://streaming.bitquery.io/eap
  Headers: Content-Type, X-API-KEY, Authorization

✅ API Response Received:
  Status: 200
  Status Text: OK
  Response Headers: content-type, content-length, date

📊 Response Data Structure:
  Root Keys: data
  Data Keys: Solana
  Solana Keys: DEXTrades
  DEXTrades Count: 1
```

### **Step 2: Check Environment Variables**

```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
echo "BITQUERY_API_KEY: $BITQUERY_API_KEY"
echo "ACCESS_TOKEN: $ACCESS_TOKEN"
```

**Required Variables**:
```env
BITQUERY_API_KEY=your_api_key_here
ACCESS_TOKEN=your_access_token_here
```

### **Step 3: Verify API Credentials**

1. **Check Bitquery Dashboard**: Verify API key is active
2. **Check Permissions**: Ensure API has Solana DEX access
3. **Check Rate Limits**: Verify you haven't exceeded limits
4. **Check Billing**: Ensure account is in good standing

### **Step 4: Test with Minimal Query**

If the full query fails, test with a simpler version:

```graphql
{
  Solana {
    DEXTrades(
      limitBy: { by: Trade_Buy_Currency_MintAddress, count: 1 }
      orderBy: { descending: Block_Time }
    ) {
      Trade {
        Buy {
          Price
          Currency {
            Uri
          }
        }
      }
    }
  }
}
```

## 🚨 **Common Error Scenarios**

### **Scenario 1: Authentication Failure**

**Error**: `401 Unauthorized` or `403 Forbidden`
**Symptoms**: Empty response or authentication errors
**Solution**: Check API key and access token

### **Scenario 2: Rate Limiting**

**Error**: `429 Too Many Requests`
**Symptoms**: API works intermittently
**Solution**: Implement exponential backoff

### **Scenario 3: Invalid Query**

**Error**: GraphQL validation errors
**Symptoms**: Response contains `errors` field
**Solution**: Validate GraphQL query syntax

### **Scenario 4: Network Issues**

**Error**: Connection timeout or network errors
**Symptoms**: Request fails before response
**Solution**: Check network connectivity

## 🔧 **Advanced Debugging**

### **1. Enable Axios Debugging**

```javascript
// Add to your script
const axios = require('axios');

// Enable request/response logging
axios.interceptors.request.use(request => {
  console.log('🚀 Request:', request.method, request.url);
  console.log('📤 Request Headers:', request.headers);
  console.log('📤 Request Data:', request.data);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('📥 Response Status:', response.status);
  console.log('📥 Response Headers:', response.headers);
  return response;
});
```

### **2. Check Response Headers**

```javascript
console.log('📥 Response Headers:');
Object.entries(response.headers).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
```

### **3. Validate GraphQL Schema**

```bash
# Use GraphQL Playground to test queries
# https://graphqlbin.com/
```

## 🛠️ **Prevention Strategies**

### **1. Implement Retry Logic**

```javascript
async function fetchWithRetry(config, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await axios.request(config);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### **2. Add Circuit Breaker**

```javascript
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### **3. Monitor API Health**

```javascript
async function checkAPIHealth() {
  try {
    const response = await axios.get('https://streaming.bitquery.io/health');
    return response.status === 200;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error.message);
    return false;
  }
}
```

## 📊 **Expected Response Structure**

### **Successful Response**:
```json
{
  "data": {
    "Solana": {
      "DEXTrades": [
        {
          "Trade": {
            "Buy": {
              "Price": "0.000001",
              "PriceInUSD": "0.0001",
              "Currency": {
                "Uri": "token_uri_here",
                "MintAddress": "mint_address_here",
                "Name": "Token Name",
                "Symbol": "TOKEN",
                "MarketCap": "1000000",
                "TotalSupply": "1000000000"
              }
            }
          },
          "Block": {
            "Time": "2025-01-31T12:00:00Z"
          }
        }
      ]
    }
  }
}
```

### **Error Response**:
```json
{
  "errors": [
    {
      "message": "Error message here",
      "locations": [{"line": 1, "column": 1}],
      "path": ["Solana", "DEXTrades"]
    }
  ]
}
```

## 🎯 **Next Steps**

### **1. Run API Test**
```bash
cd bitquery
npm run test-api
```

### **2. Check Environment Variables**
```bash
# Ensure .env file exists and contains:
BITQUERY_API_KEY=your_key_here
ACCESS_TOKEN=your_token_here
```

### **3. Verify API Credentials**
- Check Bitquery dashboard
- Verify API permissions
- Check rate limits

### **4. Test with Minimal Query**
- Start with simple GraphQL query
- Gradually add complexity
- Monitor response structure

## 🆘 **If Issues Persist**

### **Contact Support**:
1. **Bitquery Support**: Check their documentation
2. **Community Forums**: Stack Overflow, GitHub Issues
3. **API Status Page**: Check for service outages

### **Alternative Solutions**:
1. **Use Different Endpoint**: Try different Bitquery endpoints
2. **Implement Fallback**: Use alternative data sources
3. **Cache Responses**: Implement response caching

## 🏆 **Summary**

The enhanced error handling will now:
- **Prevent null reference errors** with proper validation
- **Provide detailed debugging** information
- **Handle common API issues** gracefully
- **Give clear error messages** for troubleshooting

Your Bitquery integration is now robust and will provide clear feedback when issues occur! 🎉

## 📚 **Additional Resources**

- [Bitquery API Documentation](https://docs.bitquery.io/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [API Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
