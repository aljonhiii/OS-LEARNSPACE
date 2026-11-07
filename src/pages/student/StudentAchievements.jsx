import React from 'react';
import { Sparkles, Award, Star, CheckCircle, Shield, GraduationCap, FileText, Zap, Trophy } from 'lucide-react';
import BadgeShield from '../../components/common/BadgeShield';

export default function StudentAchievements() {
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Completed first interactive structured syllabus lesson.',
      unlocked: true,
      points: 50,
      variant: 'blue',
      icon: GraduationCap,
      date: 'Nov 02, 2026'
    },
    {
      id: 2,
      title: 'Token Master',
      description: 'Submitted clean token architecture milestone with score >= 90%.',
      unlocked: true,
      points: 100,
      variant: 'yellow',
      icon: Award,
      date: 'Nov 05, 2026'
    },
    {
      id: 3,
      title: 'Verified Deliverable',
      description: 'Uploaded code and specification to course repository.',
      unlocked: true,
      points: 75,
      variant: 'teal',
      icon: FileText,
      date: 'Nov 06, 2026'
    },
    {
      id: 4,
      title: 'Quiz Ace',
      description: 'Scored 100% on a timed multi-choice knowledge check on first attempt.',
      unlocked: false,
      points: 150,
      variant: 'blue',
      icon: Trophy,
      date: 'Locked'
    },
    {
      id: 5,
      title: 'Curriculum Completer',
      description: 'Complete all modules and assignments in an enrolled course.',
      unlocked: false,
      points: 250,
      variant: 'yellow',
      icon: Zap,
      date: 'Locked'
    }
  ];

  const totalPoints = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.points, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Gamification & Recognition
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            My Achievements & Badges
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Earn points, unlock achievement shields, and showcase verified masteries on your profile.
          </p>
        </div>

        {/* Level & Points Banner */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/60 px-4 py-2 rounded-2xl shrink-0">
          <Trophy className="w-6 h-6 text-amber-600" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Level 3 Scholar</span>
            <span className="font-heading font-bold text-base text-amber-800">{totalPoints} Points Earned</span>
          </div>
        </div>
      </div>

      {/* Progress Level Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Next Rank: Master Craftsman (400 Points)</span>
          <span className="text-blue-600 font-mono">{totalPoints} / 400 pts</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${(totalPoints / 400) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <div 
              key={a.id} 
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                a.unlocked ? 'border-slate-100 hover:shadow-md' : 'border-dashed border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <BadgeShield variant={a.variant} icon={Icon} title={a.title} />
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    +{a.points} pts
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{a.date}</span>
                <span className={`font-semibold ${a.unlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {a.unlocked ? 'Unlocked' : 'In Progress'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}