import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: 'LearnSpace LMS',
    timezone: 'Asia/Manila (GMT+8)',
    self_registration: 'true',
    default_enrollment_policy: 'open',
    max_upload_size_mb: '25',
    maintenance_mode: 'false'
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            System Preferences
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Platform Configuration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system-wide organization rules, timezones, enrollment constraints, and storage quotas.
          </p>
        </div>

        {success && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">
            General Platform Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Platform Brand Name</label>
              <input 
                type="text" 
                value={settings.platform_name || ''} 
                onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Default Organization Timezone</label>
              <select 
                value={settings.timezone || ''} 
                onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Enrollment & Registration Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Public Student Self-Registration</label>
              <select 
                value={settings.self_registration || 'true'} 
                onChange={e => setSettings({ ...settings, self_registration: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Enabled (Students can register accounts)</option>
                <option value="false">Disabled (Administrator invitation only)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Default Course Enrollment Policy</label>
              <select 
                value={settings.default_enrollment_policy || 'open'} 
                onChange={e => setSettings({ ...settings, default_enrollment_policy: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open (Immediate 1-Click Enrollment)</option>
                <option value="approval">Approval Required by Teacher/Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">
            File Storage & Quotas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Max Upload File Size (MB)</label>
              <input 
                type="number" 
                value={settings.max_upload_size_mb || 25} 
                onChange={e => setSettings({ ...settings, max_upload_size_mb: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Maintenance Mode</label>
              <select 
                value={settings.maintenance_mode || 'false'} 
                onChange={e => setSettings({ ...settings, maintenance_mode: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Disabled (Normal Operations)</option>
                <option value="true">Enabled (System Under Maintenance)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Platform Configuration
          </span>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
