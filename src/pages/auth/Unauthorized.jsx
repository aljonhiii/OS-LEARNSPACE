import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Unauthorized({ onBackToDashboard }) {
  const { currentUser } = useAuth();

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-800">
          Access Forbidden (403)
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
          You do not have the required permissions to view this section. This module is restricted to authorized roles.
        </p>
        <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
          Current Role: <span className="font-bold uppercase text-slate-800">{currentUser?.role || 'Guest'}</span>
        </div>
        <button
          onClick={onBackToDashboard}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Dashboard</span>
        </button>
      </div>
    </div>
  );
}