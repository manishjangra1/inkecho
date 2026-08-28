import { NextResponse } from 'next/server';
import { adminService } from '@/features/admin/services/admin.service';
import { banUserSchema } from '@/features/admin/schemas/ban-user.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { id } = await params;
    const body = await request.json();
    const input = banUserSchema.parse({
      ...body,
      userId: id,
    });

    const ctx = await getAuthContext();
    const res = await adminService.banUser(input, ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
