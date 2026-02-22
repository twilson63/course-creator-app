/**
 * Course Record Service
 *
 * Helpers for loading and persisting course records in hyper-micro.
 *
 * @module src/lib/course/record-service
 */

import { dataApi } from '@/lib/hyper-micro';
import type {
  CourseDefinition,
  CourseRecord,
  PublishHistoryEntry,
} from '@/types/course';

const COURSE_DB = 'courses';

export interface LoadCourseRecordResult {
  record: CourseRecord;
  definition: CourseDefinition;
}

export interface UpdateCourseRecordInput {
  courseId: string;
  record: CourseRecord;
  definition: CourseDefinition;
  title?: string;
  description?: string;
  videoUrl?: string;
  generatedHtml?: string;
  zenbinId?: string;
  zenbinUrl?: string;
  publishHistory?: PublishHistoryEntry[];
  status?: CourseRecord['status'];
}

function getDefinitionFromRecord(record: CourseRecord): CourseDefinition | null {
  return record.course_json ?? record.definition ?? null;
}

export async function loadCourseRecord(
  courseId: string
): Promise<LoadCourseRecordResult> {
  const result = await dataApi.getDocument<CourseRecord>(COURSE_DB, courseId);

  if (!result.ok || !result.data) {
    throw new Error(result.error || 'Course not found');
  }

  const definition = getDefinitionFromRecord(result.data);
  if (!definition) {
    throw new Error('Course definition is missing');
  }

  return {
    record: result.data,
    definition,
  };
}

export async function updateCourseRecord(
  input: UpdateCourseRecordInput
): Promise<LoadCourseRecordResult> {
  const now = new Date().toISOString();
  const title = input.title ?? input.definition.meta.title;
  const description = input.description ?? input.definition.meta.description;

  const updatedRecord: CourseRecord = {
    ...input.record,
    title,
    description,
    video_url: input.videoUrl ?? input.record.video_url,
    course_json: input.definition,
    definition: input.definition,
    generated_html: input.generatedHtml ?? input.record.generated_html,
    zenbin_id: input.zenbinId ?? input.record.zenbin_id,
    zenbin_url: input.zenbinUrl ?? input.record.zenbin_url,
    publish_history: input.publishHistory ?? input.record.publish_history,
    status: input.status ?? input.record.status,
    updated_at: now,
  };

  const result = await dataApi.updateDocument<CourseRecord>(
    COURSE_DB,
    input.courseId,
    updatedRecord
  );

  if (!result.ok) {
    throw new Error(result.error || 'Failed to update course');
  }

  const record = result.data?.value ?? updatedRecord;
  const definition = getDefinitionFromRecord(record);
  if (!definition) {
    throw new Error('Updated course definition is missing');
  }

  return {
    record,
    definition,
  };
}
