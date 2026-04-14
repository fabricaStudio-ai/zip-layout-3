import { cn } from '../../lib/utils';

type RiskButtonProps = {
  title: string;
  description: string;
  level: number;
  onClick: () => void;
};

export default function RiskButton({ title, description, level, onClick }: RiskButtonProps) {
  let bgClass = 'bg-white border-violet-100 text-violet-900';
  if (level === 2) bgClass = 'bg-violet-50 border-violet-200 text-violet-900';
  if (level === 3) bgClass = 'bg-violet-100 border-violet-300 text-violet-900';
  if (level === 4) bgClass = 'bg-violet-700 border-violet-700 text-white shadow-lg shadow-violet-700/30';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded-2xl border active:scale-[0.98] transition-transform flex flex-col gap-1',
        bgClass,
      )}
    >
      <span className="font-bold text-lg">{title}</span>
      <span className={cn('text-sm', level === 4 ? 'text-violet-200' : level === 3 ? 'text-violet-700' : 'text-slate-500')}>
        {description}
      </span>
    </button>
  );
}
