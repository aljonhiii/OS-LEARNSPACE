import React, { useState, useEffect } from 'react';
import { Bell, Pin, Clock, User, BookOpen } from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/announcements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setAnnouncements(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Notice Board
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Announcements & Updates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official platform bulletins, mentor office hour updates, and course notifications.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {announcements.length} Published Updates
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No announcements yet</p>
            <p className="text-xs text-slate-400 mt-1">Updates from instructors will be broadcast here.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div 
              key={a.id} 
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-3 transition-shadow hover:shadow-md ${
                a.is_pinned ? 'border-blue-200 bg-blue-50/20 ring-1 ring-blue-500/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={a.author_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900">{a.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-700">{a.author_name || 'Instructor'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(a.published_at || a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {a.is_pinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {a.body}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}