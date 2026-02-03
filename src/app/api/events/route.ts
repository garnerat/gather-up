import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEventSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { title, hostName, weekends, attendees } = parsed.data;

    const event = await prisma.event.create({
      data: {
        title,
        hostName,
        weekends,
        attendees: {
          create: attendees.map((name) => ({ name })),
        },
      },
      include: { attendees: true },
    });

    // Build response with URLs (don't expose adminToken directly)
    // Use request headers to determine the actual host for correct URL generation
    const headers = request.headers;
    const host = headers.get('host');
    const protocol = headers.get('x-forwarded-proto') || 'https';

    // Determine base URL: use request host in production, fall back to env var or localhost
    const baseUrl = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      adminUrl: `${baseUrl}/e/${event.id}/${event.adminToken}`,
      attendeeLinks: event.attendees.map(a => ({
        name: a.name,
        url: `${baseUrl}/e/${event.id}/${a.token}`,
      })),
    }, { status: 201 });

  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
