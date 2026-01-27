
import React from 'react';

interface StatusDashboardProps {
  total: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({ total, completed, failed, isProcessing }) => {
  if (total === 0) return null;

  const processed = completed + failed;
  const pending = total - processed;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8 transition-all duration-500">
      <div className="flex flex-col gap-6">
        {/* Header & Progress */}
        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <div className="flex items-center gap-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Batch Status</h3>
                {isProcessing && (
                     <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Active</span>
                     </div>
                )}
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{percentage}<span className="text-xl text-slate-500 ml-1">%</span></span>
          </div>
          
          {/* Modern Progress Bar */}
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            >
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total" value={total} color="slate" />
            <StatCard label="Done" value={completed} color="emerald" />
            <StatCard label="Failed" value={failed} color="red" />
            <StatCard label="Queue" value={pending} color="indigo" isActive={isProcessing && pending > 0} />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: 'slate' | 'emerald' | 'red' | 'indigo'; isActive?: boolean }> = ({ label, value, color, isActive }) => {
    const colors = {
        slate: 'bg-slate-900/40 border-slate-800 text-slate-300',
        emerald: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400',
        red: 'bg-red-500/5 border-red-500/10 text-red-400',
        indigo: 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'
    };

    const activeClass = isActive ? 'ring-1 ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : '';

    return (
        <div className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300 ${colors[color]} ${activeClass}`}>
            <span className="text-2xl md:text-3xl font-black tracking-tight mb-1">{value}</span>
            <span className="text-[8px] md:text-[9px] font-black opacity-60 uppercase tracking-[0.2em]">{label}</span>
        </div>
    );
}

export default StatusDashboard;
