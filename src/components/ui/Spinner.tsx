/**
 * Spinner Component
 *
 * Loading spinner with sizes and colors.
 *
 * @module src/components/ui/Spinner
 */

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Spinner color */
  color?: 'default' | 'primary' | 'white';
  /** Custom class name */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const CIRCLE_COLORS = {
  default: 'text-gray-200',
  primary: 'text-blue-200',
  white: 'text-white/30',
};

const PATH_COLORS = {
  default: 'text-gray-700',
  primary: 'text-blue-600',
  white: 'text-white',
};

/**
 * Spinner - Loading indicator
 */
export function Spinner({
  size = 'md',
  color = 'default',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      className={`animate-spin ${SIZES[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className={CIRCLE_COLORS[color]}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className={PATH_COLORS[color]}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}