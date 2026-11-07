import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Trash2, Calendar, Users } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [isPinned, setIsPinned] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert('Title and body are required');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, body, audience, is_pinned: isPinned })
      });
      if (res.ok) {
        alert('Announcement published successfully!');
        setCreateModal(false);
        setTitle('');
        setBody('');
        loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
            Broadcast Communications
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Announcements Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish organization-wide notices, pinned alerts, and audience-targeted announcements.
          </p>
        </div>

        <button 
          onClick={() => setCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {ann.is_pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Pinned</span>
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                    Audience: {ann.audience}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-base">{ann.title}</h3>
              </div>

              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(ann.published_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {ann.body}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Author: <strong className="text-slate-700">{ann.author_name || 'System Admin'}</strong></span>
              <span>Broadcast ID: <code className="font-mono text-slate-500">#{ann.id}</code></span>
            </div>
          </div>
        ))}
      </div>

      {createModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
              Post New Announcement
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Broadcasts announcements to selected platform user roles.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Announcement Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. System Maintenance Notice this Saturday"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
                <select 
                  value={audience} 
                  onChange={e => setAudience(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users (Students, Teachers, Admins)</option>
                  <option value="teachers">Instructors / Faculty Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Message Body</label>
                <textarea 
                  rows="4"
                  value={body} 
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type the full announcement message..."
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)} 
                  className="text-blue-600 rounded"
                />
                <span>Pin this announcement to the top of all user dashboards</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
