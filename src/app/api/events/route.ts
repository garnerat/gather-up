import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Input validation with length limits
    const title = body.title?.trim();
    const hostName = body.hostName?.trim();
    const weekends = body.weekends;
    const attendees = body.attendees;

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Title too long (max 200)' }, { status: 400 });
    }
    if (!hostName) {
      return NextResponse.json({ error: 'Host name required' }, { status: 400 });
    }
    if (hostName.length > 100) {
      return NextResponse.json({ error: 'Host name too long (max 100)' }, { status: 400 });
    }
    if (!weekends?.length) {
      return NextResponse.json({ error: 'At least one weekend required' }, { status: 400 });
    }
    if (weekends.length > 20) {
      return NextResponse.json({ error: 'Too many weekends (max 20)' }, { status: 400 });
    }
    if (!attendees?.length) {
      return NextResponse.json({ error: 'At least one attendee required' }, { status: 400 });
    }
    if (attendees.length > 50) {
      return NextResponse.json({ error: 'Too many attendees (max 50)' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        hostName,
        weekends,
        attendees: {
          create: attendees.map((name: string) => ({
            name: name.trim().slice(0, 100), // Limit name length
          })),
        },
      },
      include: { attendees: true },
    });

    // Build response with URLs (don't expose adminToken directly)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
