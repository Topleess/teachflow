import { describe, expect, it } from 'vitest';
import {
  createLessonSession,
  canAccessLessonSession,
  transitionLessonSession,
  attachOutcome,
  type LessonSession,
} from '../src/domain/lesson-session.js';

const teacherId = 'teacher-01';
const studentId = 'student-01';

function createSession(): LessonSession {
  return createLessonSession({ teacherId, studentId });
}

describe('Lesson Session domain', () => {
  it('creates opaque provider identifiers without participant PII', () => {
    const session = createSession();

    expect(session.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(session.status).toBe('scheduled');
    expect(session.videoRoomName).toBe(`tf_${session.id}`);
    expect(session.collaborationDocumentId).toBe(`tf_${session.id}`);
    expect(session.videoRoomName).not.toContain(teacherId);
    expect(session.videoRoomName).not.toContain(studentId);
  });

  it('allows only assigned teacher and student to access the session', () => {
    const session = createSession();

    expect(canAccessLessonSession(session, teacherId)).toBe(true);
    expect(canAccessLessonSession(session, studentId)).toBe(true);
    expect(canAccessLessonSession(session, 'outsider-01')).toBe(false);
  });

  it('allows scheduled to live to ended transitions', () => {
    const scheduled = createSession();
    const live = transitionLessonSession(scheduled, 'live');
    const ended = transitionLessonSession(live, 'ended');

    expect(live.status).toBe('live');
    expect(ended.status).toBe('ended');
  });

  it('rejects invalid or backwards transitions', () => {
    const scheduled = createSession();
    expect(() => transitionLessonSession(scheduled, 'ended')).toThrow(/invalid transition/i);

    const live = transitionLessonSession(scheduled, 'live');
    expect(() => transitionLessonSession(live, 'scheduled')).toThrow(/invalid transition/i);

    const ended = transitionLessonSession(live, 'ended');
    expect(() => transitionLessonSession(ended, 'live')).toThrow(/invalid transition/i);
  });

  it('attaches one immutable outcome reference after the session ends', () => {
    const live = transitionLessonSession(createSession(), 'live');
    const ended = transitionLessonSession(live, 'ended');
    const withOutcome = attachOutcome(ended, 'outcome-01');

    expect(withOutcome.outcomeId).toBe('outcome-01');
    expect(() => attachOutcome(withOutcome, 'outcome-02')).toThrow(/already attached/i);
    expect(() => attachOutcome(createSession(), 'outcome-03')).toThrow(/ended session/i);
  });
});
