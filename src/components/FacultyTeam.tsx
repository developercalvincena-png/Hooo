import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  GraduationCap, 
  Settings, 
  ArrowRight, 
  Calendar, 
  X, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen 
} from './RealIcons';
import { useSchool } from '../context/SchoolContext';
import { FacultyMember } from '../types';

export const FacultyTeam: React.FC = () => {
  const { images, facultyList, isAdminAuthenticated, setActiveSection, proprietressProfile } = useSchool();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  return (
    <section id="faculty" className="py-12 sm:py-16 lg:py-20 bg-[#FDFBF7] border-b border-[#EAE2CE] font-['Nunito',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Founder Spotlight */}
        <div className="mb-12 sm:mb-16 bg-gradient-to-br from-[#111827] via-neutral-900 to-[#450A0A] rounded-3xl p-5 sm:p-7 lg:p-8 text-white border-2 border-amber-400/50 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-8 relative z-10">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl bg-neutral-800">
                <img
                  src={proprietressProfile.portraitUrl}
                  alt={proprietressProfile.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider whitespace-nowrap shadow-sm">
                Founder (Est. {proprietressProfile.establishedYear})
              </div>
            </div>

            <div className="flex-grow text-center md:text-left space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/20">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Leadership & Founder's Desk</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                {proprietressProfile.name}
              </h3>
              <p className="text-amber-300 text-xs sm:text-sm font-bold">
                {proprietressProfile.honorifics} • {proprietressProfile.title}
              </p>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-3xl italic">
                "{proprietressProfile.tagline}"
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('proprietress')}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Visit Proprietress Desk & Addresses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('proprietress')}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Book an Audience</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-neutral-900 border border-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-red-600" />
            <span>Academic Leadership</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
            Meet Our Faculty & Administration
          </h2>
          <p className="text-neutral-600 text-xs sm:text-sm lg:text-base mt-2.5 sm:mt-3 leading-relaxed">
            Dedicated educators, mentors, and administrators committed to cultivating intellect, discipline, and moral distinction at Stanbax Schools Ibadan.
          </p>

          {isAdminAuthenticated && (
            <div className="mt-4 inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSection('admin-portal')}
                className="min-h-[44px] px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-amber-700" />
                <span>Manage Staff / Faculty in Admin Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* Faculty Grid: 1 col on mobile, 2 on sm tablet, 3 on lg, 4 on xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {facultyList.map((member) => {
            const facultyImg = member.imageUrl 
              || (member.imageKey ? images[member.imageKey] : undefined) 
              || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
            
            return (
              <div
                key={member.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFaculty(member)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFaculty(member);
                  }
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-lg active:scale-[0.98] transition-all duration-200 border border-[#EAE2CE] hover:border-amber-400 group flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2 touch-manipulation select-none"
                aria-label={`View credentials of ${member.name}, ${member.role}`}
              >
                <div>
                  {/* Faculty Photo Container with responsive height */}
                  <div className="relative h-60 sm:h-64 overflow-hidden bg-neutral-100">
                    <img
                      src={facultyImg}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-amber-300 text-[11px] font-black shadow-xs backdrop-blur-xs border border-amber-400/30">
                      {member.department}
                    </div>

                    {/* Touch-Friendly Cue Badge on Mobile Devices */}
                    <div className="absolute bottom-3 right-3 sm:hidden px-2.5 py-1 rounded-full bg-neutral-950/85 text-amber-300 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-amber-400/30">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tap for Bio</span>
                    </div>
                  </div>

                  {/* Faculty Info with clear typographic hierarchy */}
                  <div className="p-4 sm:p-5 text-center">
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 group-hover:text-red-700 transition-colors">
                      {member.name}
                    </h3>
                    <div className="text-xs font-black text-red-700 mt-1">
                      {member.role}
                    </div>
                    <div className="text-[11px] font-semibold text-neutral-500 mt-0.5 mb-2.5">
                      {member.qualification}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed text-left border-t border-[#F0EAE0] pt-2.5 line-clamp-3">
                      {member.bio}
                    </p>
                  </div>
                </div>

                {/* Touch-Friendly Action Button */}
                <div className="p-3.5 bg-[#FAF7EE] border-t border-[#EAE2CE]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFaculty(member);
                    }}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100 active:scale-95 text-neutral-900 font-black text-xs border border-amber-300 shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>View Credentials & Bio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher to student ratio note - Responsive Stack on Mobile */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-neutral-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-neutral-800">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-black shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white">
                Low 1:12 Teacher-to-Student Ratio
              </div>
              <p className="text-xs sm:text-sm text-[#E5DEC9] mt-0.5 leading-relaxed">
                Ensuring individualized attention, continuous remedial support, and regular parent-teacher dialogues.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto text-center min-h-[44px] flex items-center justify-center text-xs font-black text-amber-400 bg-white/10 px-4 py-2.5 rounded-xl shrink-0 border border-white/10">
            TRCN & Cambridge Certified Faculty
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TOUCH-FRIENDLY FACULTY PROFILE & CREDENTIALS MODAL (RESPONSIVE BOTTOM SHEET ON MOBILE) */}
      {/* ========================================================================= */}
      {selectedFaculty && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedFaculty(null)}
        >
          <div 
            className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 my-0 sm:my-auto animate-in slide-in-from-bottom sm:slide-in-from-none sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-modal-title"
          >
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-stone-50/70 border-b border-stone-100">
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedFaculty.department}
                </span>
                <span className="text-[11px] font-bold text-stone-500 hidden sm:inline">
                  Faculty Dossier
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-700 flex items-center justify-center transition cursor-pointer"
                aria-label="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 space-y-5 max-h-[72dvh] sm:max-h-[75vh] overflow-y-auto overscroll-contain">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-stone-100 shrink-0">
                  <img
                    src={selectedFaculty.imageUrl 
                      || (selectedFaculty.imageKey ? images[selectedFaculty.imageKey] : undefined) 
                      || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedFaculty.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="space-y-1">
                  <h3 id="faculty-modal-title" className="text-xl sm:text-2xl font-black text-neutral-900">
                    {selectedFaculty.name}
                  </h3>
                  <p className="text-sm font-bold text-red-700">
                    {selectedFaculty.role}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    {selectedFaculty.qualification}
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>TRCN & Cambridge Certified Faculty</span>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Academic Background & Philosophy</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#EAE2CE] text-neutral-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedFaculty.bio}
                </div>
              </div>

              {/* Specializations & Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Department</span>
                  <span className="font-extrabold text-neutral-900">{selectedFaculty.department}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Academic Board</span>
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified Standing
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedFaculty(null);
                  setActiveSection('contact');
                }}
                className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Academic Department</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-700 font-bold text-xs flex items-center justify-center transition cursor-pointer"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
