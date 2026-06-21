import { AlertCircle, Loader2 } from 'lucide-react';

interface StateBlockProps {
  title: string;
  description?: string;
  state?: 'loading' | 'error' | 'empty';
}

export function StateBlock({ title, description, state = 'empty' }: StateBlockProps) {
  const Icon = state === 'loading' ? Loader2 : AlertCircle;
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
      <Icon className={state === 'loading' ? 'animate-spin text-signal' : 'text-muted'} size={22} />
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm text-muted">{description}</p> : null}
    </div>
  );
}
