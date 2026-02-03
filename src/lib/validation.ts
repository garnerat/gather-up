import { z } from 'zod';

// Weekend schema with date format and range validation
const weekendSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
}).refine(
  (data) => new Date(data.start) <= new Date(data.end),
  { message: 'Weekend end date must be on or after start date' }
);

export const createEventSchema = z.object({
  title: z.string().trim().min(1, 'Title required').max(200, 'Title too long (max 200)'),
  hostName: z.string().trim().min(1, 'Host name required').max(100, 'Host name too long (max 100)'),
  weekends: z.array(weekendSchema)
    .min(1, 'At least one weekend required')
    .max(20, 'Too many weekends (max 20)'),
  attendees: z.array(z.string().trim().min(1).max(100))
    .min(1, 'At least one attendee required')
    .max(50, 'Too many attendees (max 50)'),
});

export const updateResponseSchema = z.object({
  token: z.string().min(1, 'Token required'),
  weekendIndex: z.number().int().min(0, 'Valid weekendIndex required'),
  value: z.enum(['yes', 'no', 'maybe']).nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>;
