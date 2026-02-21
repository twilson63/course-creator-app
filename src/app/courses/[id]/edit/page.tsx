/**
 * Course Edit Page
 *
 * Page for editing a course using the EditStudio.
 *
 * @module src/app/courses/[id]/edit/page
 */

import { notFound } from 'next/navigation';
import { EditStudio } from '@/components/studio';

// TODO: Replace with actual data fetching
async function getCourse(id: string) {
  // Placeholder - in production, fetch from hyper-micro
  return {
    meta: {
      title: 'Sample Course',
      description: 'A sample course for demonstration',
      author: 'Course Creator',
      estimatedTime: '30 minutes',
      difficulty: 'beginner' as const,
    },
    steps: [
      {
        id: 'step-1',
        title: 'Introduction',
        content: 'Welcome to this course! In this first step, we will introduce the main concepts and set the foundation for what follows.',
        videoTimestamp: '0:00',
        estimatedTime: '5 minutes',
      },
      {
        id: 'step-2',
        title: 'Getting Started',
        content: 'Now that we have the basics, let\'s dive into the practical aspects. This step will guide you through the initial setup.',
        videoTimestamp: '5:00',
        estimatedTime: '10 minutes',
      },
      {
        id: 'step-3',
        title: 'Advanced Topics',
        content: 'In this final step, we cover advanced topics that build on what we\'ve learned. Take your time with this material.',
        videoTimestamp: '15:00',
        estimatedTime: '15 minutes',
        checkpoint: {
          label: 'Ready to proceed?',
          hint: 'Review the previous steps before continuing.',
        },
      },
    ],
    resources: [],
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseEditPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="h-screen">
      <EditStudio course={course} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  return {
    title: course ? `Edit: ${course.meta.title}` : 'Course Not Found',
  };
}