import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TikTokData {
  url: string;
  username: string;
  views: number;
  comments: string[];
  hashtags: string[];
  description: string;
  timestamp: string;
}

interface TokenData {
  name: string;
  symbol: string;
  uri: string;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  created_timestamp: string;
}

interface KeywordMatch {
  keyword: string;
  tiktok_mentions: number;
  token_names: string[];
}

interface AnalysisRequest {
  tiktok_data: TikTokData[];
  token_data: TokenData[];
  keyword_matches: KeywordMatch[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Memecoin Analysis API called');

    const body: AnalysisRequest = await request.json();
    const { tiktok_data, token_data, keyword_matches } = body;

    if (!tiktok_data || !token_data || !keyword_matches) {
      return NextResponse.json(
        { error: 'Missing required data fields' },
        { status: 400 }
      );
    }

    console.log(`📊 Analyzing ${tiktok_data.length} TikTok videos, ${token_data.length} tokens, ${keyword_matches.length} keyword matches`);

    // Prepare the analysis prompt
    const analysisPrompt = `
You are an expert cryptocurrency and social media analyst for ZoroX, a memecoin hunting system. Your job is to analyze TikTok trends, token data, and social sentiment to predict which memecoins will succeed.

## Input Data

### TikTok Data (${tiktok_data.length} videos):
${JSON.stringify(tiktok_data, null, 2)}

### Token Data (${token_data.length} tokens):
${JSON.stringify(token_data, null, 2)}

### Keyword Matches (${keyword_matches.length} matches):
${JSON.stringify(keyword_matches, null, 2)}

## Analysis Tasks

### 1. Sentiment Analysis
- Analyze comment sentiment (1-10 scale: bearish to bullish)
- Detect genuine excitement vs bot/fake engagement
- Identify warning signals or negative sentiment

### 2. Content Quality Assessment
- Rate "memeability" potential (1-10 scale)
- Assess creator credibility and follower quality
- Detect coordinated promotion vs organic content

### 3. Viral Prediction
- Predict viral potential based on engagement patterns
- Identify early-stage trending indicators
- Assess content uniqueness and shareability

### 4. Market Correlation Analysis
- Explain WHY social metrics correlate with price
- Identify leading vs lagging indicators
- Detect market manipulation patterns

### 5. Risk Assessment
- Evaluate token legitimacy and rug pull risk
- Assess social momentum sustainability
- Rate overall investment risk (1-10 scale)

## Output Format
Return analysis as JSON with this exact structure:

{
  "analysis_summary": {
    "timestamp": "ISO_date",
    "confidence_score": 0.85,
    "overall_recommendation": "BUY|HOLD|AVOID",
    "key_insights": ["insight1", "insight2", "insight3"]
  },
  "token_analysis": [
    {
      "token_symbol": "TICKER",
      "sentiment_score": 8.2,
      "viral_potential": 7.5,
      "credibility_score": 6.8,
      "risk_level": 3.2,
      "correlation_strength": 0.75,
      "recommendation": "Strong correlation detected. Creator has 85% success rate on previous calls.",
      "reasoning": "High engagement from verified accounts, organic growth pattern, strong meme potential"
    }
  ],
  "creator_analysis": [
    {
      "username": "creator_name",
      "credibility_score": 8.1,
      "historical_success_rate": 0.73,
      "follower_quality": "high",
      "influence_level": "medium"
    }
  ],
  "market_signals": {
    "momentum_indicator": "strong_bullish",
    "manipulation_risk": "low",
    "viral_trajectory": "early_stage",
    "recommended_action": "monitor_closely"
  },
  "predictions": {
    "24h_outlook": "positive",
    "viral_probability": 0.82,
    "price_movement_prediction": "moderate_upward",
    "timeline_to_peak": "3-7_days"
  }
}

## Guidelines
- Focus on actionable insights, not just data summaries
- Prioritize early detection over post-pump analysis
- Consider both social momentum AND token fundamentals
- Flag potential scams or manipulation attempts
- Provide confidence levels for all predictions
- Explain reasoning in simple, clear language
- Use realistic numbers and avoid over-optimistic predictions
- Be conservative with risk assessments

Analyze the data and provide your expert analysis in the exact JSON format specified above.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert cryptocurrency and social media analyst specializing in memecoin prediction and social sentiment analysis. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const analysisResult = completion.choices[0]?.message?.content;
    
    if (!analysisResult) {
      throw new Error('No analysis result from OpenAI');
    }

    // Parse the JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisResult);
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI response:', parseError);
      console.log('Raw response:', analysisResult);
      
      // Fallback analysis if JSON parsing fails
      parsedAnalysis = {
        analysis_summary: {
          timestamp: new Date().toISOString(),
          confidence_score: 0.5,
          overall_recommendation: "HOLD",
          key_insights: ["Analysis parsing failed, manual review recommended"]
        },
        token_analysis: [],
        creator_analysis: [],
        market_signals: {
          momentum_indicator: "neutral",
          manipulation_risk: "unknown",
          viral_trajectory: "unknown",
          recommended_action: "manual_review"
        },
        predictions: {
          "24h_outlook": "neutral",
          viral_probability: 0.5,
          price_movement_prediction: "stable",
          timeline_to_peak: "unknown"
        }
      };
    }

    // Add metadata
    const response = {
      ...parsedAnalysis,
      metadata: {
        analysis_timestamp: new Date().toISOString(),
        data_sources: {
          tiktok_videos: tiktok_data.length,
          tokens_analyzed: token_data.length,
          keyword_matches: keyword_matches.length
        },
        model_used: "gpt-4",
        processing_time_ms: Date.now() - Date.now() // This would be calculated properly in production
      }
    };

    console.log('✅ AI analysis completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in AI memecoin analysis:', error);
    
    // Return error response with fallback data
    const errorResponse = {
      analysis_summary: {
        timestamp: new Date().toISOString(),
        confidence_score: 0.0,
        overall_recommendation: "ERROR",
        key_insights: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      },
      token_analysis: [],
      creator_analysis: [],
      market_signals: {
        momentum_indicator: "error",
        manipulation_risk: "unknown",
        viral_trajectory: "unknown",
        recommended_action: "retry_analysis"
      },
      predictions: {
        "24h_outlook": "unknown",
        viral_probability: 0.0,
        price_movement_prediction: "unknown",
        timeline_to_peak: "unknown"
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET endpoint to fetch recent analysis results
export async function GET() {
  try {
    console.log('📊 Fetching recent AI analysis results');

    // This would typically fetch from a database
    // For now, return a mock response
    const mockAnalysis = {
      analysis_summary: {
        timestamp: new Date().toISOString(),
        confidence_score: 0.85,
        overall_recommendation: "BUY",
        key_insights: [
          "Strong social momentum detected across multiple platforms",
          "High-quality creator engagement with verified accounts",
          "Early-stage viral indicators showing positive trajectory"
        ]
      },
      token_analysis: [
        {
          token_symbol: "PEPE",
          sentiment_score: 8.2,
          viral_potential: 7.5,
          credibility_score: 6.8,
          risk_level: 3.2,
          correlation_strength: 0.75,
          recommendation: "Strong correlation detected. Creator has 85% success rate on previous calls.",
          reasoning: "High engagement from verified accounts, organic growth pattern, strong meme potential"
        }
      ],
      creator_analysis: [
        {
          username: "crypto_whale_2024",
          credibility_score: 8.1,
          historical_success_rate: 0.73,
          follower_quality: "high",
          influence_level: "medium"
        }
      ],
      market_signals: {
        momentum_indicator: "strong_bullish",
        manipulation_risk: "low",
        viral_trajectory: "early_stage",
        recommended_action: "monitor_closely"
      },
      predictions: {
        "24h_outlook": "positive",
        viral_probability: 0.82,
        price_movement_prediction: "moderate_upward",
        timeline_to_peak: "3-7_days"
      },
      metadata: {
        analysis_timestamp: new Date().toISOString(),
        data_sources: {
          tiktok_videos: 15,
          tokens_analyzed: 8,
          keyword_matches: 12
        },
        model_used: "gpt-4"
      }
    };

    return NextResponse.json(mockAnalysis);

  } catch (error) {
    console.error('❌ Error fetching AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis results' },
      { status: 500 }
    );
  }
}
