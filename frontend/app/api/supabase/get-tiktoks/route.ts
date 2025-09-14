import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_SECRET;

    console.log('🔍 TikTok API called - checking credentials...');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_ANON_SECRET:', supabaseKey ? '✅ Set' : '❌ Missing');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";

    console.log(`🔍 Querying tiktoks table with limit: ${limit}, offset: ${offset}`);

    let query = supabase
      .from("tiktoks")
      .select("*")
      .order("fetched_at", { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`username.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch TikTok data", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ TikTok data fetched successfully: ${data?.length || 0} records`);
    console.log('Sample data:', data?.slice(0, 2));

    // Ensure we always return a consistent structure
    const safeData = Array.isArray(data) ? data : [];
    const safeCount = typeof count === 'number' ? count : 0;

    return NextResponse.json({
      data: safeData,
      count: safeCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("❌ Error fetching TikTok data:", error);
    // Return empty data structure on error to prevent frontend crashes
    return NextResponse.json({
      data: [],
      count: 0,
      limit: parseInt(request.nextUrl.searchParams.get("limit") || "50"),
      offset: parseInt(request.nextUrl.searchParams.get("offset") || "0"),
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
