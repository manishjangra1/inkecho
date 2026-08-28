import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/shared/config/app.config';
import { env } from '@/shared/config/env';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { HealthCheckResponse } from '@/shared/types/api.types';

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const correlationId = await getCorrelationId();

  const responseBody: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: APP_CONFIG.version,
    environment: env.NODE_ENV,
  };

  return NextResponse.json(responseBody, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'x-correlation-id': correlationId,
    },
  });
}
