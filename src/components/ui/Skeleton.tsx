/**
 * Skeleton Component
 *
 * Loading skeleton placeholders.
 *
 * @module src/components/ui/Skeleton
 */

export interface SkeletonProps {
  /** Width class (e.g., 'w-32') */
  width?: string;
  /** Height class (e.g., 'h-8') */
  height?: string;
  /** Rounded corners */
  rounded?: boolean;
  /** Circle shape */
  circle?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Skeleton - Loading placeholder element
 */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  circle = false,
  className = '',
}: SkeletonProps) {
  const shapeClass = circle ? 'rounded-full' : rounded ? 'rounded' : 'rounded-md';

  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse bg-gray-200 ${width} ${height} ${shapeClass} ${className}`}
    />
  );
}

export interface SkeletonCardProps {
  /** Show avatar */
  showAvatar?: boolean;
  /** Number of content lines */
  lines?: number;
  /** Custom class name */
  className?: string;
}

/**
 * SkeletonCard - Card loading placeholder
 */
export function SkeletonCard({ showAvatar = true, lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div
      data-testid="skeleton-card"
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Header */}
      <div className="skeleton-header flex items-center gap-3 mb-4">
        {showAvatar && <Skeleton width="w-10" height="h-10" circle />}
        <div className="flex-1">
          <Skeleton width="w-3/4" height="h-4" className="mb-2" />
          <Skeleton width="w-1/2" height="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="skeleton-content space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? 'w-2/3' : 'w-full'}
            height="h-3"
          />
        ))}
      </div>
    </div>
  );
}

export interface SkeletonListProps {
  /** Number of items */
  count?: number;
  /** Show avatar */
  showAvatar?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * SkeletonList - List loading placeholder
 */
export function SkeletonList({ count = 3, showAvatar = true, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-testid="skeleton-item" className="flex items-center gap-3">
          {showAvatar && <Skeleton width="w-10" height="h-10" circle />}
          <div className="flex-1">
            <Skeleton width="w-1/3" height="h-4" className="mb-2" />
            <Skeleton width="w-2/3" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}