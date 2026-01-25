import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { token, weekendIndex, value } = body;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }
    if (typeof weekendIndex !== 'number' || weekendIndex < 0) {
      return NextResponse.json({ error: 'Valid weekendIndex required' }, { status: 400 });
    }
    if (!['yes', 'no', 'maybe', null].includes(value)) {
      return NextResponse.json({ error: 'Value must be yes, no, maybe, or null' }, { status: 400 });
    }

    // Find attendee and their event
    const attendee = await prisma.attendee.findUnique({
      where: { token },
      include: { event: { select: { weekends: true } } },
    });

    if (!attendee) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    // Validate weekendIndex is within bounds
    const weekends = attendee.event.weekends as Array<unknown>;
    if (weekendIndex >= weekends.length) {
      return NextResponse.json({ error: 'Invalid weekend index' }, { status: 400 });
    }

    // Update responses JSON
    const responses = (attendee.responses as Record<string, string>) || {};
    if (value === null) {
      delete responses[String(weekendIndex)];
    } else {
      responses[String(weekendIndex)] = value;
    }

    await prisma.attendee.update({
      where: { id: attendee.id },
      data: { responses },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Response update error:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}
