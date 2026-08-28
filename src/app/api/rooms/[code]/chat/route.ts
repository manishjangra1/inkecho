import { NextResponse } from 'next/server';
import { chatService } from '@/features/chat/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const messages = chatService.getRecentMessages(code);
  return NextResponse.json({
    success: true,
    data: {
      messages,
    },
  });
}
