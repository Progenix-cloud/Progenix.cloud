import { searchService } from '@/lib/search-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');
    const type = req.nextUrl.searchParams.get('type');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters', results: [] },
        { status: 400 }
      );
    }

    const results = await searchService.search(query, {
      type: type ? [type as any] : undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('[v0] Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
