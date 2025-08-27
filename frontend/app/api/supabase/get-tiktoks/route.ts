import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_SECRET;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";

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
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch TikTok data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching TikTok data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
