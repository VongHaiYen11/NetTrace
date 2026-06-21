import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type BadgeTone = 'neutral' | 'green' | 'amber' | 'red' | 'blue';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-white/10 text-[#cfc7dc]',
  green: 'bg-[#00f5d4]/15 text-[#00f5d4]',
  amber: 'bg-[#f8e231]/15 text-[#f8e231]',
  red: 'bg-[#ff2d85]/15 text-[#ff2d85]',
  blue: 'bg-[#00f5d4]/15 text-[#00f5d4]',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded px-2 text-xs font-medium capitalize',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
