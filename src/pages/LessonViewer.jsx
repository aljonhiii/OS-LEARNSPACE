import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Share2, Sparkles } from 'lucide-react';

export default function LessonViewer({ lessonId = 1, onBack, onComplete }) {
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch(`/api/lessons/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
          setCompleted(data.isCompleted);
        }
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonId]);

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCompleted(true);
        if (onComplete) onComplete();
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-400">
        Loading lesson content...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-500">
        Lesson not found. <button onClick={onBack} className="text-blue-600 underline">Return</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Workspace</span>
        </button>

        <div className="flex items-center gap-2">
          {completed ? (
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </span>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving to DB...' : 'Mark as Completed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Lesson Content Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
            <span>{lesson.course_title}</span>
            <span>•</span>
            <span className="text-slate-500">{lesson.module_title}</span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-slate-900 tracking-tight">
            {lesson.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {lesson.estimated_minutes} minutes
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Verified Curriculum</span>
          </div>
        </div>

        {/* Lesson Body */}
        <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
          <p className="font-medium text-slate-600">
            {lesson.description}
          </p>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 my-4">
            <h4 className="font-heading font-bold text-blue-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 mt-2">
              <li>Understand the role of tokens in enterprise design systems</li>
              <li>Establish WCAG AA contrast ratio compliance (4.5:1 minimum)</li>
              <li>Coordinate elevation, density dials, and responsive typography</li>
            </ul>
          </div>

          <div className="whitespace-pre-line font-sans text-sm text-slate-700 leading-relaxed">
            {lesson.content}
          </div>
        </div>

        {/* Footer Completion Action */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Progress automatically recorded in your gradebook.
          </div>

          {!completed && (
            <button
              onClick={handleMarkComplete}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Lesson Complete</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
