import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, ShieldCheck, Check } from 'lucide-react';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Notification Center
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            In-App Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time milestone alerts, grade releases, and system messages.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700">
          <Bell className="w-4 h-4" />
          <span>{unreadCount} Unread Notifications</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">You are all caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isRead = !!n.read_at;
            return (
              <div 
                key={n.id} 
                className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center justify-between gap-4 transition-all ${
                  isRead ? 'border-slate-100 opacity-80' : 'border-blue-200 bg-blue-50/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xs'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.body}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer shrink-0 text-xs font-semibold flex items-center gap-1"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}