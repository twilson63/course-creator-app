/**
 * VideoPreview Component
 *
 * Embeds video from various platforms (YouTube, Vimeo, Loom, Descript)
 * with timestamp support.
 *
 * @module src/components/studio/VideoPreview
 */

'use client';

import { useMemo } from 'react';

export interface VideoPreviewProps {
  /** Video URL */
  videoUrl?: string;
  /** Timestamp to start video at (MM:SS or H:MM:SS) */
  timestamp?: string;
}

/**
 * Parse timestamp to seconds
 *
 * @param timestamp - Timestamp in MM:SS or H:MM:SS format
 * @returns Seconds
 */
function parseTimestampToSeconds(timestamp?: string): number {
  if (!timestamp) return 0;

  const parts = timestamp.split(':').map(Number);

  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // H:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Parse timestamp to Vimeo format (e.g., "5m30s")
 */
function parseTimestampToVimeo(timestamp?: string): string {
  if (!timestamp) return '';

  const parts = timestamp.split(':').map(Number);

  if (parts.length === 2) {
    return `${parts[0]}m${parts[1]}s`;
  } else if (parts.length === 3) {
    return `${parts[0]}h${parts[1]}m${parts[2]}s`;
  }

  return '';
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract Loom video ID from URL
 */
function getLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/share\/([^?]+)/);
  return match ? match[1] : null;
}

/**
 * Extract Descript video ID from URL
 */
function getDescriptId(url: string): string | null {
  const match = url.match(/descript\.com\/view\/([^?]+)/);
  return match ? match[1] : null;
}

/**
 * VideoPreview - Embeds video with timestamp support
 */
export function VideoPreview({ videoUrl, timestamp }: VideoPreviewProps) {
  const embedInfo = useMemo(() => {
    if (!videoUrl) return null;

    const seconds = parseTimestampToSeconds(timestamp);
    const vimeoTime = parseTimestampToVimeo(timestamp);

    // YouTube
    const youtubeId = getYouTubeId(videoUrl);
    if (youtubeId) {
      const src = `https://www.youtube.com/embed/${youtubeId}${seconds > 0 ? `?start=${seconds}` : ''}`;
      return { type: 'youtube', src };
    }

    // Vimeo
    const vimeoId = getVimeoId(videoUrl);
    if (vimeoId) {
      const src = `https://player.vimeo.com/video/${vimeoId}${vimeoTime ? `#t=${vimeoTime}` : ''}`;
      return { type: 'vimeo', src };
    }

    // Loom
    const loomId = getLoomId(videoUrl);
    if (loomId) {
      const src = `https://www.loom.com/embed/${loomId}`;
      return { type: 'loom', src };
    }

    // Descript
    const descriptId = getDescriptId(videoUrl);
    if (descriptId) {
      const src = `https://share.descript.com/embed/${descriptId}`;
      return { type: 'descript', src };
    }

    return { type: 'unknown', url: videoUrl };
  }, [videoUrl, timestamp]);

  if (!embedInfo) return null;

  if (embedInfo.type === 'unknown') {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Video platform not supported</p>
        <p className="text-sm text-gray-500 mt-2">{embedInfo.url}</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <iframe
        src={embedInfo.src}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}