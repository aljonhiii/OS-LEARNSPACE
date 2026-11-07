import React from 'react';
import { Award, Shield, FileText, BookOpen, Trophy } from 'lucide-react';

export default function BadgeShield({ variant = "blue", icon: Icon = Award, title = "Badge" }) {
  const styles = {
    blue: {
      bg: "bg-blue-500",
      border: "border-blue-400",
      accent: "bg-blue-400",
      iconColor: "text-white"
    },
    teal: {
      bg: "bg-teal-500",
      border: "border-teal-400",
      accent: "bg-teal-400",
      iconColor: "text-white"
    },
    yellow: {
      bg: "bg-amber-500",
      border: "border-amber-400",
      accent: "bg-amber-400",
      iconColor: "text-white"
    }
  };

  const current = styles[variant] || styles.blue;

  return (
    <div 
      className={`relative w-8 h-9 ${current.bg} rounded-t-md rounded-b-xl flex items-center justify-center shadow-sm border ${current.border} transition-transform hover:scale-105 cursor-pointer`}
      title={title}
    >
      <Icon className={`w-4 h-4 ${current.iconColor}`} />
    </div>
  );
}
