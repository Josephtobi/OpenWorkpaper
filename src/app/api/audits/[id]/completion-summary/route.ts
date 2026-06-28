import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { getCompletionSummary } from '@/lib/completion';

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const summary = await getCompletionSummary(auditId);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[Completion Summary API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load completion summary.' }, { status: 500 });
  }
}
