import React from 'react';
import { Users, UserCheck, UserX, Video, Building2, TrendingUp } from 'lucide-react';
import { RegistrationStats } from '../types';

interface StatsCardsProps {
  stats: RegistrationStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Total Registered Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Total Registered
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {stats.total}
          </span>
          <span className="text-xs text-slate-400">people RSVP'd</span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Responses
          </span>
          <span>100% recorded</span>
        </div>
      </div>

      {/* 2. Will Attend Meeting (The primary core requirement) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-lg shadow-emerald-950/20 group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Will Attend Meeting
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {stats.attending}
          </span>
          <span className="text-xs font-medium text-emerald-400">
            ({stats.attendanceRate}% of total)
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            {stats.inPerson} In-Person
          </span>
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            {stats.virtual} Virtual
          </span>
        </div>
      </div>

      {/* 3. In-Person vs Virtual Details */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Meeting Attendance Mode
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div>
            <div className="text-2xl font-bold text-white">{stats.inPerson}</div>
            <div className="text-[11px] text-slate-400">In-Person Seats</div>
          </div>
          <div className="text-slate-600 font-light text-xl">/</div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.virtual}</div>
            <div className="text-[11px] text-slate-400">Virtual Stream</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
            <div 
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${stats.attending > 0 ? (stats.inPerson / stats.attending) * 100 : 50}%` }}
              title={`In-Person: ${stats.inPerson}`}
            />
            <div 
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${stats.attending > 0 ? (stats.virtual / stats.attending) * 100 : 50}%` }}
              title={`Virtual: ${stats.virtual}`}
            />
          </div>
        </div>
      </div>

      {/* 4. Cannot Attend / Declined */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Cannot Attend (Apologies)
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {stats.declined}
          </span>
          <span className="text-xs text-rose-400/80">not attending</span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Minutes requested</span>
          <span className="text-slate-300 font-medium">Notified Dave & Kenny</span>
        </div>
      </div>
    </div>
  );
};
