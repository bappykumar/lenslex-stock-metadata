
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
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8 transition-all duration-500">
      <div className="flex flex-col gap-6">
        {/* Header & Progress */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
            <div className="flex items-center gap-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Batch Status</h3>
                {isProcessing && (
                     <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Processing
                     </span>
                )}
            </div>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{percentage}%</span>
          </div>
          
          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10" 
                  style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 50%, #ffffff 50%, #ffffff 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}>
             </div>
             
             {/* Fill Bar */}
            <div 
              className={`h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-500 ease-out relative`}
              style={{ width: `${percentage}%` }}
            >
                {/* Shine Effect */}
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shine_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 md:gap-6">
            <StatCard label="Total Files" value={total} color="slate" />
            <StatCard label="Completed" value={completed} color="emerald" />
            <StatCard label="Errors" value={failed} color="red" />
            <StatCard label="Pending" value={pending} color="indigo" isActive={isProcessing && pending > 0} />
        </div>
      </div>
      <style>{`
        @keyframes shine {
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: 'slate' | 'emerald' | 'red' | 'indigo'; isActive?: boolean }> = ({ label, value, color, isActive }) => {
    const colors = {
        slate: 'bg-slate-900/60 border-slate-700/50 text-slate-200',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    };

    const activeClass = isActive ? 'ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[1.02]' : '';

    return (
        <div className={`flex flex-col items-center justify-center p-3 md:p-5 rounded-2xl border transition-all duration-300 ${colors[color]} ${activeClass}`}>
            <span className="text-[9px] md:text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 text-center leading-tight truncate w-full">{label}</span>
            <span className="text-xl md:text-3xl font-black tracking-tight">{value}</span>
        </div>
    );
}

export default StatusDashboard;
