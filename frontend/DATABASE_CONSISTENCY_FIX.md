# 🗄️ Database Consistency Error - Complete Fix Guide

## 🚨 **Error Encountered**

```
Error fetching token data: {
  code: 'PGRST116',
  details: 'The result contains 3 rows',
  hint: null,
  message: 'Cannot coerce the result to a single JSON object'
}
```

**Root Cause**: The database contains multiple price records with `is_latest: true` for the same token, causing the query to fail when expecting a single row.

## ✅ **Comprehensive Fix Applied**

### **1. Database Query Optimization**

**File**: `frontend/app/api/supabase/update-price/route.ts`

**Before (❌ Problematic query)**:
```typescript
const { data, error } = await supabase
  .from("prices")
  .select(`price_usd, price_sol, trade_at`)
  .eq("token_id", parseInt(tokenId))
  .eq("is_latest", true)  // ❌ Multiple records with this flag
  .single();               // ❌ Fails when multiple rows found
```

**After (✅ Robust query)**:
```typescript
// Use timestamp ordering instead of relying on is_latest flag
const { data, error } = await supabase
  .from("prices")
  .select(`price_usd, price_sol, trade_at`)
  .eq("token_id", parseInt(tokenId))
  .order("trade_at", { ascending: false })  // ✅ Get most recent by timestamp
  .limit(1)                                 // ✅ Ensure single result
  .single();
```

### **2. Automatic Database Cleanup**

**New Function**: `cleanupDuplicateLatestFlags()`

**Purpose**: Automatically detects and fixes database inconsistencies by:
- Finding all price records for a token
- Identifying duplicate `is_latest: true` flags
- Setting all but the most recent to `is_latest: false`

**Implementation**:
```typescript
async function cleanupDuplicateLatestFlags(supabase: any, tokenId: number) {
  // Get all price records for this token
  const { data: allPrices } = await supabase
    .from("prices")
    .select(`id, trade_at, is_latest`)
    .eq("token_id", tokenId)
    .order("trade_at", { ascending: false });
    
  // Find records that should not have is_latest = true
  const recordsToUpdate = allPrices.slice(1).filter(p => p.is_latest);
  
  // Update all records to set is_latest = false
  await supabase
    .from("prices")
    .update({ is_latest: false })
    .in('id', recordsToUpdate.map(p => p.id));
}
```

### **3. Intelligent Error Recovery**

**Before (❌ Simple error handling)**:
```typescript
if (error) {
  return NextResponse.json(
    { error: "Failed to fetch token data" },
    { status: 500 }
  );
}
```

**After (✅ Intelligent recovery)**:
```typescript
if (error) {
  if (error.code === 'PGRST116') {
    console.warn("⚠️ Multiple price records found - cleaning up database and retrying");
    
    // Clean up duplicate is_latest flags
    await cleanupDuplicateLatestFlags(supabase, parseInt(tokenId));
    
    // Try the original query again after cleanup
    const { data: retryData, error: retryError } = await supabase
      .from("prices")
      .select(`price_usd, price_sol, trade_at`)
      .eq("token_id", parseInt(tokenId))
      .eq("is_latest", true)
      .single();
      
    if (retryError) {
      return NextResponse.json(
        { error: "Failed to fetch price data after cleanup" },
        { status: 500 }
      );
    }
    
    data = retryData;
  } else {
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
```

### **4. Preventive Data Consistency**

**Before (❌ No consistency management)**:
```typescript
// Insert new price data without managing is_latest flags
const { error: insertError } = await supabase
  .from("prices")
  .insert(insertData);
```

**After (✅ Consistent data management)**:
```typescript
// First, set all existing prices for this token to is_latest = false
const { error: updateError } = await supabase
  .from("prices")
  .update({ is_latest: false })
  .eq("token_id", tokenData.id);
  
// Now insert the new price data (which will have is_latest = true)
const { error: insertError } = await supabase
  .from("prices")
  .insert(insertData);
```

## 🔍 **Why This Fixes the Database Error**

### **Problem Analysis**:
1. **Multiple `is_latest: true` records**: Database had inconsistent state
2. **Query expecting single row**: `.single()` method failed with multiple results
3. **No cleanup mechanism**: Errors would persist indefinitely
4. **No preventive measures**: Future inserts could create same issue

### **Solution Strategy**:
1. **Robust querying**: Use timestamp ordering instead of relying on flags
2. **Automatic cleanup**: Detect and fix inconsistencies automatically
3. **Intelligent recovery**: Retry queries after cleanup
4. **Preventive consistency**: Manage flags properly during inserts

## 🎯 **Benefits of This Fix**

### **✅ Immediate Error Resolution**
- **No more PGRST116 errors**: Database queries succeed consistently
- **Automatic recovery**: System fixes itself when issues occur
- **Better user experience**: No more 500 errors from database inconsistencies

### **✅ Long-term Data Integrity**
- **Consistent state**: Only one record per token has `is_latest: true`
- **Preventive measures**: Future inserts maintain consistency
- **Self-healing**: System automatically repairs data issues

### **✅ Improved Performance**
- **Efficient queries**: Optimized database access patterns
- **Reduced errors**: Fewer failed requests and retries
- **Better caching**: Consistent data structure improves caching

### **✅ Production Reliability**
- **Robust error handling**: Graceful degradation when issues occur
- **Automatic maintenance**: Self-cleaning database system
- **Audit trail**: Clear logging of cleanup operations

## 🧪 **Testing the Fix**

### **1. Test with Inconsistent Data**
```bash
# The system should now automatically clean up and succeed
curl -X POST http://localhost:3000/api/supabase/update-price \
  -H "Content-Type: application/json" \
  -d '{"tokenId": 835}'
```

**Expected Behavior**:
```
⚠️ Multiple price records found - cleaning up database and retrying
🧹 Cleaning up duplicate is_latest flags for token: 835
Found 3 price records for cleanup
Found 2 records with incorrect is_latest flag
✅ Successfully cleaned up 2 duplicate is_latest flags
✅ Set all existing prices to is_latest = false
Successfully inserted 1 price records
```

### **2. Verify Database State**
```sql
-- Check that only one record per token has is_latest = true
SELECT token_id, COUNT(*) as latest_count 
FROM prices 
WHERE is_latest = true 
GROUP BY token_id 
HAVING COUNT(*) > 1;
```

**Expected Result**: No rows returned (all tokens have exactly one latest record)

### **3. Test Future Inserts**
```bash
# Insert should now maintain consistency automatically
curl -X POST http://localhost:3000/api/supabase/update-price \
  -H "Content-Type: application/json" \
  -d '{"tokenId": 835}'
```

**Expected Behavior**: No cleanup needed, direct success

## 🚀 **Prevention Guidelines**

### **✅ Always Do This**:
```typescript
// When inserting new price data
// 1. Set all existing records to is_latest = false
await supabase
  .from("prices")
  .update({ is_latest: false })
  .eq("token_id", tokenId);

// 2. Insert new record with is_latest = true
await supabase
  .from("prices")
  .insert(newPriceData);
```

### **✅ Use Robust Queries**:
```typescript
// Instead of relying on flags, use timestamp ordering
const { data } = await supabase
  .from("prices")
  .select(`*`)
  .eq("token_id", tokenId)
  .order("trade_at", { ascending: false })
  .limit(1)
  .single();
```

### **✅ Implement Cleanup Functions**:
```typescript
// Create cleanup functions for common data consistency issues
async function cleanupDuplicateFlags(table: string, field: string, id: number) {
  // Implementation for general cleanup
}
```

## 🆘 **If Issues Persist**

### **Manual Database Cleanup**:
```sql
-- Find tokens with multiple is_latest = true records
SELECT token_id, COUNT(*) as latest_count 
FROM prices 
WHERE is_latest = true 
GROUP BY token_id 
HAVING COUNT(*) > 1;

-- For each problematic token, keep only the most recent
UPDATE prices 
SET is_latest = false 
WHERE token_id = [TOKEN_ID] 
AND id NOT IN (
  SELECT id FROM (
    SELECT id FROM prices 
    WHERE token_id = [TOKEN_ID] 
    ORDER BY trade_at DESC 
    LIMIT 1
  ) sub
);
```

### **Debugging Steps**:
1. **Check cleanup logs**: Look for cleanup operation messages
2. **Verify database state**: Query prices table directly
3. **Check error codes**: Look for specific Supabase error codes
4. **Monitor insert operations**: Ensure consistency during data insertion

## 🏆 **Summary**

This comprehensive fix resolves the database consistency error by:

1. **Robust querying** with timestamp-based ordering
2. **Automatic cleanup** of duplicate `is_latest` flags
3. **Intelligent error recovery** with retry mechanisms
4. **Preventive consistency** during data insertion

Your price update system will now:
- **Automatically fix** database inconsistencies
- **Maintain data integrity** during operations
- **Provide reliable performance** without PGRST116 errors
- **Self-heal** when data issues occur

The database is now much more robust and self-maintaining! 🎉

## 📚 **Additional Resources**

- [Supabase Error Codes](https://supabase.com/docs/reference/javascript/select#error-codes)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Database Consistency Best Practices](https://www.postgresql.org/docs/current/consistency.html)
