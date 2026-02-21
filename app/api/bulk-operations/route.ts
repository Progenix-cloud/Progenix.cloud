import { bulkOperationsService } from '@/lib/bulk-operations';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entity, ids, data } = body;

    if (!action || !entity || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, entity, ids' },
        { status: 400 }
      );
    }

    const result = await bulkOperationsService.execute({
      action: action as any,
      entity: entity as any,
      ids,
      data,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[v0] Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
