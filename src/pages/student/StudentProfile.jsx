import React, { useState } from 'react';
import { User, Mail, MapPin, Key, Shield, CheckCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { currentUser } = useAuth();
  const [firstName, setFirstName] = useState(currentUser?.first_name || 'Jane');
  const [lastName, setLastName] = useState(currentUser?.last_name || 'Cooper');
  const [email] = useState(currentUser?.email || 'jane.cooper@example.com');
  const [headline, setHeadline] = useState(currentUser?.headline || 'Product Design Student & Token Enthusiast');
  const [location, setLocation] = useState(currentUser?.location || 'Kyiv, Ukraine (GMT +3)');
  
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setMessage('Profile settings successfully saved!');
      setTimeout(() => setMessage(null), 3000);
      setSaving(false);
    }, 600);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('New passwords do not match');
    setSaving(true);
    setTimeout(() => {
      setMessage('Password updated successfully!');
      setTimeout(() => setMessage(null), 3000);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Personal Account
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            My Profile & Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your public learner card, credentials, and regional settings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Verified Student Account</span>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img 
          src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
          alt="" 
          className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50 shadow-sm"
        />
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            {firstName} {lastName}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{headline}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Mail className="w-3 h-3" />
              {email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {location}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Details Form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Public Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Headline</label>
              <input 
                type="text" 
                value={headline} 
                onChange={e => setHeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location & Timezone</label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Security & Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Password</label>
              <input 
                type="password" 
                required 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">New Password</label>
              <input 
                type="password" 
                required 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}