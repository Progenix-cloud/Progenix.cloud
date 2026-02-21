import { exportService } from '@/lib/export-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const format = req.nextUrl.searchParams.get('format') || 'json';
    const entity = req.nextUrl.searchParams.get('entity');
    const type = req.nextUrl.searchParams.get('type') || 'full';

    let data: string;
    let contentType = 'application/json';
    let filename = `export-${Date.now()}`;

    if (format === 'csv' && entity) {
      data = await exportService.exportCSV(entity);
      contentType = 'text/csv';
      filename = `${entity}-${Date.now()}.csv`;
    } else if (type === 'analytics') {
      data = await exportService.exportAnalytics();
      filename = `analytics-${Date.now()}.json`;
    } else if (type === 'project' && entity) {
      data = await exportService.exportProjectReport(entity);
      filename = `project-report-${entity}-${Date.now()}.json`;
    } else if (type === 'invoice-summary' && entity) {
      data = await exportService.exportInvoiceSummary(entity);
      filename = `invoice-summary-${entity}-${Date.now()}.json`;
    } else {
      data = await exportService.exportJSON();
      filename = `full-export-${Date.now()}.json`;
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[v0] Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
