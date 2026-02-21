/**
 * Services Module
 *
 * Business logic services using hyper-micro.
 *
 * @module src/lib/services
 */

export { courseService } from './course-service';
export type { CourseRecord, CourseStatus, CreateCourseInput, UpdateCourseInput } from './course-service';

export { userService } from './user-service';
export type { UserRecord, SafeUser, SignupInput, LoginInput, LoginResult } from './user-service';

export { sessionService, createSession, getSession, deleteSession } from './session-service';
export type { SessionRecord } from './session-service';