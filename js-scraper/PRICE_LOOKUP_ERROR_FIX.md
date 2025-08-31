# 🔧 Price Lookup Error Fix Guide

## 🚨 **Error Description**
```
Error fetching price data: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type integer: "https://ipfs.io/ipfs/..."'
}
```

## 🔍 **Root Cause Analysis**

The error `22P02` indicates a **type mismatch** in the database query. The system is trying to use IPFS URLs (strings) where the database expects integer values.

### **Database Schema Issue**
- **`tokens` table**: Has `id` (INTEGER) and `uri` (TEXT)
- **`prices` table**: Has `token_id` (INTEGER) and `token_uri` (TEXT)
- **Problem**: Some queries are using `uri` (string) instead of `id` (integer)

### **Data Flow Problem**
```
❌ WRONG: Using token URI (IPFS URL) as token_id
✅ CORRECT: Use token.id (integer) for foreign key relationships
```

## 🛠️ **Fix Implementation**

### **1. Database Schema Updates**
```sql
-- Add index for efficient token_uri lookups
CREATE INDEX IF NOT EXISTS idx_prices_token_uri ON prices(token_uri);

-- Add foreign key constraint (optional)
ALTER TABLE prices ADD CONSTRAINT fk_prices_token_uri 
    FOREIGN KEY (token_uri) REFERENCES tokens(uri) ON DELETE CASCADE;
```

### **2. Data Integrity Check**
The fix script will:
- ✅ Add missing indexes
- 🔗 Link orphaned price records to tokens
- 📊 Verify data integrity
- 🧹 Clean up inconsistent data

## 🚀 **How to Fix**

### **Option 1: Run the Fix Script (Recommended)**
```bash
cd js-scraper
npm run fix-price-errors
```

### **Option 2: Manual Database Fix**
```sql
-- Connect to your Supabase database and run:

-- 1. Add index for token_uri
CREATE INDEX IF NOT EXISTS idx_prices_token_uri ON prices(token_uri);

-- 2. Check for orphaned prices
SELECT COUNT(*) FROM prices WHERE token_id IS NULL AND token_uri IS NOT NULL;

-- 3. Link orphaned prices to tokens
UPDATE prices 
SET token_id = tokens.id 
FROM tokens 
WHERE prices.token_uri = tokens.uri 
AND prices.token_id IS NULL;
```

## 📊 **What the Fix Does**

### **1. Index Creation**
- **Performance**: Faster lookups by `token_uri`
- **Efficiency**: Reduces query time for price data
- **Scalability**: Better performance as data grows

### **2. Data Linking**
- **Orphaned Records**: Finds prices without token references
- **Auto-linking**: Connects prices to tokens using URI
- **Data Integrity**: Ensures all prices have proper relationships

### **3. Verification**
- **Count Check**: Verifies total records in each table
- **Relationship Check**: Ensures foreign key integrity
- **Error Reporting**: Shows any remaining issues

## 🔄 **Expected Results**

### **Before Fix**
```
❌ Error fetching price data: invalid input syntax for type integer
❌ IPFS URLs being used as integer IDs
❌ Orphaned price records
❌ Poor query performance
```

### **After Fix**
```
✅ Price data fetched successfully
✅ Proper integer ID relationships
✅ All prices linked to tokens
✅ Fast, efficient queries
```

## 🧪 **Testing the Fix**

### **1. Run the Fix Script**
```bash
npm run fix-price-errors
```

### **2. Check Output**
Look for these success indicators:
```
✅ Index created successfully
✅ No orphaned price records found
✅ Price lookup error fixes completed!
```

### **3. Verify in Application**
- Run your correlation calculation again
- Check for price lookup errors
- Monitor database performance

## 🚨 **If Issues Persist**

### **1. Check Database Permissions**
```sql
-- Ensure your user has permission to create indexes
SELECT has_table_privilege('your_user', 'prices', 'CREATE');
```

### **2. Verify Table Structure**
```sql
-- Check if tables exist and have correct structure
\d tokens
\d prices
```

### **3. Check for Data Corruption**
```sql
-- Look for any remaining type mismatches
SELECT token_uri, token_id 
FROM prices 
WHERE token_uri ~ '^[0-9]+$' 
AND token_id IS NOT NULL;
```

## 📈 **Performance Impact**

### **Before Fix**
- **Query Time**: Slow due to missing indexes
- **Error Rate**: High due to type mismatches
- **Data Quality**: Poor due to orphaned records

### **After Fix**
- **Query Time**: Fast with proper indexing
- **Error Rate**: Near zero with proper types
- **Data Quality**: High with proper relationships

## 🏆 **Success Criteria**

The fix is successful when:
1. ✅ No more `22P02` errors in logs
2. ✅ Price data fetches successfully
3. ✅ Correlation calculations complete without errors
4. ✅ Database queries are fast and efficient
5. ✅ All price records have proper token relationships

## 🔮 **Prevention**

### **1. Code Review**
- Always use `token.id` (integer) for foreign keys
- Use `token.uri` (string) only for display/lookup
- Validate data types before database operations

### **2. Database Constraints**
- Use proper foreign key constraints
- Add check constraints for data types
- Implement triggers for data validation

### **3. Monitoring**
- Regular data integrity checks
- Performance monitoring
- Error log analysis

## 📞 **Support**

If you continue to experience issues:
1. Check the fix script output for specific errors
2. Verify database permissions and structure
3. Review the application code for type mismatches
4. Check Supabase logs for additional error details

---

**The fix script will resolve the immediate database issues and prevent future type mismatch errors!** 🎉
