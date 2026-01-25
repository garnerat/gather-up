import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ResponseGrid } from '@/components/ResponseGrid';
import { RefreshButton } from './RefreshButton';
import { InviteLinks } from './InviteLinks';

interface PageProps {
  params: Promise<{ eventId: string; token: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { eventId, token } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { attendees: true },
  });

  if (!event) notFound();

  // Determine if this is admin or attendee
  const isAdmin = event.adminToken === token;
  const currentAttendee = event.attendees.find(a => a.token === token);

  if (!isAdmin && !currentAttendee) notFound();

  const weekends = event.weekends as Array<{ start: string; end: string }>;

  // Transform attendees to have properly typed responses
  const attendeesWithResponses = event.attendees.map(a => ({
    id: a.id,
    name: a.name,
    token: a.token,
    responses: (a.responses as Record<string, string>) || {},
  }));

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
      <p className="text-gray-600 mb-6">Hosted by {event.hostName}</p>

      <ResponseGrid
        weekends={weekends}
        attendees={attendeesWithResponses}
        currentAttendeeId={currentAttendee?.id}
        currentToken={token}
      />

      {isAdmin && (
        <InviteLinks
          eventId={event.id}
          attendees={attendeesWithResponses}
        />
      )}

      <RefreshButton />
    </main>
  );
}
