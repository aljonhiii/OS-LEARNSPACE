import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Clock, User, CheckCircle, X, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDiscussions() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Active Thread Modal
  const [activeThread, setActiveThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Topic Modal
  const [newTopicModal, setNewTopicModal] = useState(false);
  const [topicCourseId, setTopicCourseId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicBody, setTopicBody] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [coursesRes, discRes] = await Promise.all([
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/discussions' + (selectedCourse ? `?courseId=${selectedCourse}` : ''), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData);
        if (cData.length > 0 && !topicCourseId) setTopicCourseId(cData[0].id);
      }
      if (discRes.ok) {
        const dData = await discRes.json();
        setDiscussions(dData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourse]);

  const handleOpenThread = async (id) => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/discussions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullThread = await res.json();
        setActiveThread(fullThread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText || !activeThread) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/discussions/${activeThread.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: replyText })
      });
      if (res.ok) {
        setReplyText('');
        handleOpenThread(activeThread.id);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle || !topicBody || !topicCourseId) return alert('Fill in all fields');
    setSubmittingTopic(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: topicCourseId,
          title: topicTitle,
          body: topicBody
        })
      });

      if (res.ok) {
        setMessage('Discussion topic launched!');
        setTimeout(() => setMessage(null), 3000);
        setNewTopicModal(false);
        setTopicTitle('');
        setTopicBody('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTopic(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Interactive Forum
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Discussions & Office Hours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Answer student queries, moderate course questions, and facilitate peer-to-peer collaboration.
          </p>
        </div>

        <button 
          onClick={() => setNewTopicModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Start Discussion</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Course Filter:</span>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Course Discussions</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {discussions.length} Active Thread{discussions.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Discussions Threads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading discussions...
          </div>
        ) : discussions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active discussions</p>
            <p className="text-xs text-slate-400 mt-1">Start a discussion thread to prompt questions from students.</p>
          </div>
        ) : (
          discussions.map((d) => (
            <div 
              key={d.id} 
              onClick={() => handleOpenThread(d.id)}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img 
                  src={d.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {d.course_title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {d.author_role || 'Student'}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900 hover:text-blue-600 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                    {d.body}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Posted by <span className="font-medium text-slate-700">{d.author_name}</span> • {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-semibold text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{d.reply_count || 0} Replies</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread View & Reply Modal */}
      {activeThread && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {activeThread.course_title}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900 mt-1">{activeThread.title}</h3>
              </div>
              <button onClick={() => setActiveThread(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                <img src={activeThread.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-bold text-slate-800">{activeThread.author_name}</span>
                <span className="text-[10px] text-slate-400">({activeThread.author_role})</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{activeThread.body}</p>
            </div>

            {/* Replies List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Replies ({activeThread.replies?.length || 0})
              </h4>
              {activeThread.replies?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No replies yet. Be the first instructor to respond.</p>
              ) : (
                activeThread.replies?.map((r) => (
                  <div key={r.id} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={r.author_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-xs font-semibold text-slate-900">{r.author_name}</span>
                        {r.author_role === 'teacher' && (
                          <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                            Teacher
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(r.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-7">{r.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input 
                type="text" 
                required 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="Post an answer or feedback to this thread..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
              />
              <button 
                type="submit" 
                disabled={submittingReply}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Topic */}
      {newTopicModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Start Discussion Topic</h3>
              <button onClick={() => setNewTopicModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Course *</label>
                <select 
                  value={topicCourseId}
                  onChange={e => setTopicCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discussion Topic *</label>
                <input 
                  type="text" 
                  required 
                  value={topicTitle} 
                  onChange={e => setTopicTitle(e.target.value)} 
                  placeholder="e.g. Q&A: Structuring Global Color Tokens"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening Prompt *</label>
                <textarea 
                  rows={4} 
                  required 
                  value={topicBody} 
                  onChange={e => setTopicBody(e.target.value)} 
                  placeholder="Post instructions, question prompt, or code sample..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setNewTopicModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingTopic} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingTopic ? 'Posting...' : 'Start Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}