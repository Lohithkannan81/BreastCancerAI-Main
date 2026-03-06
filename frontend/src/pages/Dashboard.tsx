
import React from 'react';
import { Icons } from '../constants';
import { useData } from '../contexts/DataContext';
import { TumorClass } from '../types';

interface DashboardProps {
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName = 'Doctor' }) => {
  const { reports, patients } = useData();

  // Calculate dynamic stats
  const totalAnalyses = reports.length;
  const recentReports = reports.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.date === today;
  }).length;

  const malignantCount = reports.filter(r => r.tumorClass === TumorClass.MALIGNANT).length;

  const stats = [
    { label: 'Total Analyses', value: totalAnalyses.toString(), change: totalAnalyses > 0 ? 'Active' : 'No data', icon: Icons.Analysis },
    { label: 'Today\'s Reports', value: recentReports.toString(), change: recentReports > 0 ? 'New' : 'Waiting', icon: Icons.Reports },
    { label: 'Malignant Cases', value: malignantCount.toString(), change: `${((malignantCount / (totalAnalyses || 1)) * 100).toFixed(0)}%`, icon: Icons.Microscope },
    { label: 'Registered Patients', value: patients.length.toString(), change: 'Total', icon: Icons.Profile },
  ];

  return (
    <div className="fade-in-up space-y-8" style={{ animationDuration: '0.6s' }}>
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome, {userName}</h1>
        <p className="text-slate-500 font-light mt-1">Here is what's happening in your department today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50/50 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <stat.icon />
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full uppercase tracking-wider">{stat.change}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium tracking-wide">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Diagnosis Distribution - Full Width */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-lg transition-shadow duration-500 p-8 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Diagnosis Distribution</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Benign</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Malignant</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 relative z-10">
          <div className="h-72 min-w-[500px] flex items-end justify-around p-4 border-b border-slate-200/50">
            {totalAnalyses > 0 ? (
              <>
                <div className="w-32 flex flex-col items-center gap-4 group">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-2xl transition-all duration-700 relative hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                    style={{
                      height: `${Math.max(((totalAnalyses - malignantCount) / totalAnalyses) * 100, 10)}%`,
                      minHeight: '40px'
                    }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white text-xs py-2 px-4 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl transform translate-y-2 group-hover:translate-y-0">
                      {totalAnalyses - malignantCount} cases
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45"></div>
                    </div>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white font-bold text-xl drop-shadow-md">
                      {totalAnalyses - malignantCount}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Benign</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{totalAnalyses > 0 ? Math.round(((totalAnalyses - malignantCount) / totalAnalyses) * 100) : 0}% of total</p>
                  </div>
                </div>

                <div className="w-32 flex flex-col items-center gap-4 group">
                  <div
                    className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-2xl transition-all duration-700 relative hover:from-rose-400 hover:to-rose-300 shadow-[0_0_20px_rgba(251,113,133,0.2)] group-hover:shadow-[0_0_25px_rgba(251,113,133,0.4)]"
                    style={{
                      height: `${Math.max((malignantCount / totalAnalyses) * 100, 10)}%`,
                      minHeight: '40px'
                    }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white text-xs py-2 px-4 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl transform translate-y-2 group-hover:translate-y-0">
                      {malignantCount} cases
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45"></div>
                    </div>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white font-bold text-xl drop-shadow-md">
                      {malignantCount}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Malignant</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{totalAnalyses > 0 ? Math.round((malignantCount / totalAnalyses) * 100) : 0}% of total</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400/80">
                <Icons.Analysis size={48} className="opacity-30 mb-4 animate-pulse" />
                <p className="text-sm font-medium tracking-wide">No predictions yet</p>
                <p className="text-xs mt-2 font-light">Perform an analysis to see statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
