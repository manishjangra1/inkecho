import { ok, err, type Result } from '../shared/result';
import { createDomainError, type DomainError, DOMAIN_ERROR_CODES } from '../shared/errors';
import {
  type RoomStatus,
  type RoomEvent,
  canTransitionRoom,
  transitionRoomStatus,
} from './room-state-machine';

export interface RoomTransitionContext {
  readonly status: RoomStatus;
}

export function executeRoomTransition(
  context: RoomTransitionContext,
  event: RoomEvent
): Result<RoomStatus, DomainError> {
  if (!canTransitionRoom(context.status, event)) {
    return err(
      createDomainError(
        DOMAIN_ERROR_CODES.INVALID_ROOM_STATE,
        `Cannot execute event '${event}' while room is in '${context.status}' state.`
      )
    );
  }

  const nextStatus = transitionRoomStatus(context.status, event);
  if (!nextStatus) {
    return err(
      createDomainError(
        DOMAIN_ERROR_CODES.INVALID_ROOM_STATE,
        `No transition target found for event '${event}'.`
      )
    );
  }

  return ok(nextStatus);
}
