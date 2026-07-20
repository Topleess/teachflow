import { randomUUID } from 'node:crypto';

export type LessonSessionStatus = 'scheduled' | 'live' | 'ended';

export interface LessonSession {
  readonly id: string;
  readonly teacherId: string;
  readonly studentId: string;
  readonly status: LessonSessionStatus;
  readonly videoRoomName: string;
  readonly collaborationDocumentId: string;
  readonly outcomeId?: string;
}

export interface CreateLessonSessionInput {
  teacherId: string;
  studentId: string;
}

const allowedTransitions: Readonly<Record<LessonSessionStatus, readonly LessonSessionStatus[]>> = {
  scheduled: ['live'],
  live: ['ended'],
  ended: [],
};

export function createLessonSession(input: CreateLessonSessionInput): LessonSession {
  const id = randomUUID();
  const providerIdentifier = `tf_${id}`;

  return Object.freeze({
    id,
    teacherId: input.teacherId,
    studentId: input.studentId,
    status: 'scheduled',
    videoRoomName: providerIdentifier,
    collaborationDocumentId: providerIdentifier,
  });
}

export function canAccessLessonSession(session: LessonSession, userId: string): boolean {
  return userId === session.teacherId || userId === session.studentId;
}

export function transitionLessonSession(
  session: LessonSession,
  nextStatus: LessonSessionStatus,
): LessonSession {
  if (!allowedTransitions[session.status].includes(nextStatus)) {
    throw new Error(`Invalid transition from ${session.status} to ${nextStatus}`);
  }

  return Object.freeze({ ...session, status: nextStatus });
}

export function attachOutcome(session: LessonSession, outcomeId: string): LessonSession {
  if (session.status !== 'ended') {
    throw new Error('Outcome can only be attached to an ended session');
  }

  if (session.outcomeId !== undefined) {
    throw new Error('Outcome is already attached');
  }

  return Object.freeze({ ...session, outcomeId });
}
