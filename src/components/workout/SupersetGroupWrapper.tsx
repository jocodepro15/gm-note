import { ReactNode } from 'react';

const GROUP_COLORS: Record<number, { border: string; bg: string; text: string }> = {
  1: { border: 'border-purple-500', bg: 'bg-purple-900/10', text: 'text-purple-400' },
  2: { border: 'border-orange-500', bg: 'bg-orange-900/10', text: 'text-orange-400' },
  3: { border: 'border-cyan-500', bg: 'bg-cyan-900/10', text: 'text-cyan-400' },
};

interface Props {
  groupNumber: number;
  children: ReactNode;
}

export default function SupersetGroupWrapper({ groupNumber, children }: Props) {
  const colors = GROUP_COLORS[groupNumber] || GROUP_COLORS[1];

  return (
    <div className={`border-l-4 ${colors.border} ${colors.bg} rounded-r-xl pl-3 py-2 space-y-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
          Superset {groupNumber}
        </span>
        <div className={`flex-1 h-px ${colors.border} opacity-30`} />
      </div>
      {children}
    </div>
  );
}

export { GROUP_COLORS };
