import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Mock search results for development
    // TODO: Implement real web search integration
    const mockResults = [
      {
        title: 'Sample Search Result 1',
        content: `Information about "${query}" from a web search. This is mock data for development purposes.`,
        timestamp: new Date().toISOString(),
      },
      {
        title: 'Sample Search Result 2',
        content: `Additional context related to "${query}". More detailed information would be provided by a real search engine.`,
        timestamp: new Date().toISOString(),
      },
    ];

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      query,
      results: mockResults,
      source: 'mock',
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}