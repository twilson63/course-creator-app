/**
 * Course Delete Service
 *
 * Handles course deletion and archival.
 *
 * @module src/lib/course/delete
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6363';

/**
 * Delete a course permanently
 *
 * @param courseId - Course ID to delete
 * @returns True if deleted successfully
 */
export async function deleteCourse(courseId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to delete course:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

/**
 * Archive a course (soft delete)
 *
 * @param courseId - Course ID to archive
 * @returns True if archived successfully
 */
export async function archiveCourse(courseId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to archive course:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
}

/**
 * Restore an archived course
 *
 * @param courseId - Course ID to restore
 * @returns True if restored successfully
 */
export async function restoreCourse(courseId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to restore course:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error restoring course:', error);
    throw error;
  }
}