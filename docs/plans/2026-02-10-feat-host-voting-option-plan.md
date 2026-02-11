---
title: "feat: Add host voting option"
type: feat
date: 2026-02-10
---

# feat: Add Host Voting Option

Allow the event host/administrator to optionally participate in voting by receiving their own voting link.

## Problem Statement

Currently, the host creates an event and can only view votes via the admin link - they cannot vote themselves. Some hosts want to participate in the voting to indicate their own availability.

## Proposed Solution

Add a checkbox on the event creation form: "I want to vote too". When checked, the host's name is added to the attendee list and they receive a voting link alongside the admin link.

## Acceptance Criteria

- [ ] Add checkbox to EventForm: "Include me as a voter"
- [ ] When checked, add hostName to attendees list before API call
- [ ] API already handles this (attendees array just includes host name)
- [ ] Success screen shows host's voting link prominently (if opted in)
- [ ] Host appears in the voting grid like any other attendee

## Implementation

### 1. EventForm.tsx

Add state and checkbox:

```tsx
const [hostWantsToVote, setHostWantsToVote] = useState(false);
```

In handleSubmit, prepend host to attendees if checked:

```tsx
const allAttendees = hostWantsToVote
  ? [hostName, ...attendees]
  : attendees;
```

Add checkbox UI after host name input:

```tsx
<label className="flex items-center gap-2 mt-2">
  <input
    type="checkbox"
    checked={hostWantsToVote}
    onChange={(e) => setHostWantsToVote(e.target.checked)}
    className="..."
  />
  <span className="text-sm text-gray-600">I want to vote too</span>
</label>
```

### 2. page.tsx (success screen)

Highlight host's link if they opted in - already handled since host will be in attendeeLinks.

## Files to Modify

- `src/components/EventForm.tsx` - Add checkbox and logic

## Notes

- No database changes needed
- No API changes needed (host just becomes an attendee)
- Host will have both admin link AND voting link
