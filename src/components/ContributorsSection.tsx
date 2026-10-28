import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Contributor } from '../types';
import { 
  Users, 
  Award, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  Edit3, 
  ShieldCheck, 
  HeartHandshake,
  CheckCircle2
} from './RealIcons';

interface ContributorsSectionProps {
  onOpenAdminCredits?: () => void;
}

export const ContributorsSection: React.FC<ContributorsSectionProps> = ({ onOpenAdminCredits }) => {
  const { contributors, isAdminAuthenticated, setActiveSection } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter active contributors
  const activeContributors = contributors.filter(c => c.isActive !== false);

  const categories = ['All', ...Array.from(new Set(activeContributors.map(c => c.category || 'General Contributor')))];

  const displayed = selectedCategory === 'All' 
    ? activeContributors 
    : activeContributors.filter(c => (c.category || 'General Contributor') === selectedCategory);

  const handleGoToAdmin = () => {
    if (onOpenAdminCredits) {
      onOpenAdminCredits();
    } else {
      setActiveSection('admin-portal');
    }
  };

  return (
    <section id="contributors" className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 relative overflow-hidden border-t border-slate-200">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-100/40 via-amber-100/30 to-indigo-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-xs font-black uppercase tracking-wider shadow-xs">
            <HeartHandshake className="w-4 h-4 text-blue-700" />
            <span>Project Production & Production Credits</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            The Contributors Who Made This Platform Possible
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Honoring the dedicated software engineers, visionary educational leaders, curriculum directors, and scholars whose collective dedication brought the Stanbax Schools digital learning ecosystem to life.
          </p>

          {/* Admin Edit Link if Admin is logged in */}
          {isAdminAuthenticated && (
            <div className="pt-2">
              <button
                onClick={handleGoToAdmin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-sm transition cursor-pointer border border-amber-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Admin Quick Access: Manage Contributors & Credits</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20 scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {displayed.map((contributor) => {
            const isLead = contributor.highlight;

            return (
              <div
                key={contributor.id}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between group ${
                  isLead
                    ? 'bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/60 border-2 border-blue-600/40 shadow-xl shadow-blue-950/5 hover:-translate-y-1.5'
                    : 'bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1'
                }`}
              >
                {/* Highlight Badge */}
                {isLead && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 border border-amber-200">
                    <Award className="w-3 h-3 text-slate-950" />
                    <span>Featured Contributor</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Avatar and Role */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md p-1 bg-white ${
                        isLead ? 'ring-2 ring-blue-600' : 'ring-1 ring-slate-200'
                      }`}>
                        {contributor.avatarUrl ? (
                          <img
                            src={contributor.avatarUrl}
                            alt={contributor.name}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-800 to-indigo-900 text-white flex items-center justify-center font-black text-xl">
                            {contributor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {isLead && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      {contributor.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                          {contributor.badge}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                        {contributor.name}
                      </h3>
                      <p className="text-xs font-extrabold text-blue-700 leading-snug">
                        {contributor.role}
                      </p>
                      {contributor.category && (
                        <p className="text-[11px] font-semibold text-slate-400">
                          {contributor.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {contributor.bio}
                  </p>
                </div>

                {/* Social / External Links */}
                {contributor.links && Object.keys(contributor.links).length > 0 && (
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-2">
                    {contributor.links.github && (
                      <a
                        href={contributor.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                        title="GitHub Profile / Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {contributor.links.linkedin && (
                      <a
                        href={contributor.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {contributor.links.email && (
                      <a
                        href={`mailto:${contributor.links.email}`}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                        title="Contact Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {contributor.links.website && (
                      <a
                        href={contributor.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer"
                        title="Website / Portfolio"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Note */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-blue-900 text-white relative overflow-hidden shadow-lg shadow-blue-950/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1 max-w-2xl">
              <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
                Excellence in Collaboration
              </span>
              <h4 className="text-xl sm:text-2xl font-black">
                Proudly Built for Stanbax Schools Ibadan
              </h4>
              <p className="text-blue-100 text-xs sm:text-sm">
                Empowering teachers, parents, and scholars with 21st-century educational technology, automated curriculum grounding, and Calvin AI tutoring.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <a
                href="#about"
                className="px-5 py-2.5 rounded-xl bg-white text-blue-950 text-xs font-black hover:bg-blue-50 transition cursor-pointer shadow-sm"
              >
                Learn About Stanbax
              </a>
              {isAdminAuthenticated && (
                <button
                  onClick={handleGoToAdmin}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-500 transition cursor-pointer shadow-sm"
                >
                  Edit Credits
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
