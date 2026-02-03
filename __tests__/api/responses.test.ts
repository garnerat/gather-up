import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/responses/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendee: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('POST /api/responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates response with valid token and value', async () => {
    const mockAttendee = {
      id: 'att-1',
      name: 'John',
      token: 'valid-token',
      responses: {},
      event: {
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
      },
    };

    vi.mocked(prisma.attendee.findUnique).mockResolvedValue(mockAttendee as ReturnType<typeof prisma.attendee.findUnique> extends Promise<infer T> ? T : never);
    vi.mocked(prisma.attendee.update).mockResolvedValue({ ...mockAttendee, responses: { '0': 'yes' } } as ReturnType<typeof prisma.attendee.update> extends Promise<infer T> ? T : never);

    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        weekendIndex: 0,
        value: 'yes',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('rejects missing token', async () => {
    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        weekendIndex: 0,
        value: 'yes',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('string');  // Zod error for missing string
  });

  it('rejects invalid token', async () => {
    vi.mocked(prisma.attendee.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'invalid-token',
        weekendIndex: 0,
        value: 'yes',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Invalid token');
  });

  it('rejects invalid weekendIndex (negative)', async () => {
    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        weekendIndex: -1,
        value: 'yes',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Valid weekendIndex required');
  });

  it('rejects weekendIndex out of bounds', async () => {
    const mockAttendee = {
      id: 'att-1',
      name: 'John',
      token: 'valid-token',
      responses: {},
      event: {
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }], // Only 1 weekend
      },
    };

    vi.mocked(prisma.attendee.findUnique).mockResolvedValue(mockAttendee as ReturnType<typeof prisma.attendee.findUnique> extends Promise<infer T> ? T : never);

    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        weekendIndex: 5, // Out of bounds
        value: 'yes',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Invalid weekend index');
  });

  it('rejects invalid value', async () => {
    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        weekendIndex: 0,
        value: 'invalid',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('yes');  // Zod error mentions valid options
  });

  it('accepts null value to clear response', async () => {
    const mockAttendee = {
      id: 'att-1',
      name: 'John',
      token: 'valid-token',
      responses: { '0': 'yes' },
      event: {
        weekends: [{ start: '2025-02-01', end: '2025-02-02' }],
      },
    };

    vi.mocked(prisma.attendee.findUnique).mockResolvedValue(mockAttendee as ReturnType<typeof prisma.attendee.findUnique> extends Promise<infer T> ? T : never);
    vi.mocked(prisma.attendee.update).mockResolvedValue({ ...mockAttendee, responses: {} } as ReturnType<typeof prisma.attendee.update> extends Promise<infer T> ? T : never);

    const request = new Request('http://localhost/api/responses', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        weekendIndex: 0,
        value: null,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
