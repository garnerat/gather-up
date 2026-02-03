// Shared types for the application

export type ResponseValue = 'yes' | 'no' | 'maybe' | null;

export interface Weekend {
  start: string;
  end: string;
}

export interface Attendee {
  id: string;
  name: string;
  responses: Record<string, string>;
}

export interface AttendeeWithToken extends Attendee {
  token: string;
}
