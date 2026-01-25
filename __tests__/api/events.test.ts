import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/events/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates event with valid data', async () => {
    const mockEvent = {
      id: 'event-123',
      title: 'Ski Trip 2025',
      hostName: 'Mike',
      adminToken: 'admin-token-456',
      weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
      attendees: [
        { id: 'att-1', name: 'John', token: 'john-token' },
        { id: 'att-2', name: 'Dave', token: 'dave-token' },
      ],
    };

    vi.mocked(prisma.event.create).mockResolvedValue(mockEvent as ReturnType<typeof prisma.event.create> extends Promise<infer T> ? T : never);

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Ski Trip 2025',
        hostName: 'Mike',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees: ['John', 'Dave'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.adminUrl).toContain('/e/event-123/admin-token-456');
    expect(data.attendeeLinks).toHaveLength(2);
    expect(data.attendeeLinks[0].name).toBe('John');
    expect(data.attendeeLinks[0].url).toContain('/e/event-123/john-token');
  });

  it('rejects empty title', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        hostName: 'Mike',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees: ['John'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Title required');
  });

  it('rejects title that is too long', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'x'.repeat(201),
        hostName: 'Mike',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees: ['John'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Title too long (max 200)');
  });

  it('rejects empty host name', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Trip',
        hostName: '',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees: ['John'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Host name required');
  });

  it('rejects no weekends', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Trip',
        hostName: 'Mike',
        weekends: [],
        attendees: ['John'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('At least one weekend required');
  });

  it('rejects too many weekends', async () => {
    const weekends = Array(21).fill({ start: '2025-02-01', end: '2025-02-02' });
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Trip',
        hostName: 'Mike',
        weekends,
        attendees: ['John'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Too many weekends (max 20)');
  });

  it('rejects no attendees', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Trip',
        hostName: 'Mike',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('At least one attendee required');
  });

  it('rejects too many attendees', async () => {
    const attendees = Array(51).fill('Person');
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Trip',
        hostName: 'Mike',
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
        attendees,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Too many attendees (max 50)');
  });
});
