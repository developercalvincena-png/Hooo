import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  GraduationCap, 
  ArrowRight, 
  Key, 
  CheckCircle2, 
  Filter,
  Sparkles,
  UserCheck
} from 'lucide-react';
import type { StudentProfile } from '../types';

interface StudentRosterDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
}

const CLASS_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Classes' },
  { id: 'Kg 2', label: 'Kg 2 (Kindergarten)' },
  { id: 'Primary 1', label: 'Pry 1' },
  { id: 'Primary 2', label: 'Pry 2' },
  { id: 'Primary 3', label: 'Pry 3' },
  { id: 'Primary 4', label: 'Pry 4' },
  { id: 'Primary 5', label: 'Pry 5' },
  { id: 'JSS 1', label: 'JSS 1' },
  { id: 'JSS 2', label: 'JSS 2' },
  { id: 'JSS 3', label: 'JSS 3' },
  { id: 'SSS 2 Science', label: 'SS 2' },
];

export const StudentRosterDirectoryModal: React.FC<StudentRosterDirectoryModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [copiedReg, setCopiedReg] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Exclude upgraded faculty tutors from roster view
      if (student.isUpgradedTutor) return false;

      // Filter by Class/Grade
      if (selectedClass !== 'all') {
        const gradeNorm = (student.grade || '').toLowerCase();
        const targetNorm = selectedClass.toLowerCase();
        if (targetNorm === 'kg 2' && !gradeNorm.includes('kg 2') && !gradeNorm.includes('nursery 2')) {
          return false;
        } else if (targetNorm.includes('primary') && !gradeNorm.includes(targetNorm) && !gradeNorm.includes(targetNorm.replace('primary', 'pry'))) {
          return false;
        } else if (targetNorm === 'sss 2 science' && !gradeNorm.includes('ss 2') && !gradeNorm.includes('sss 2')) {
          return false;
        } else if (!targetNorm.includes('primary') && targetNorm !== 'kg 2' && targetNorm !== 'sss 2 science') {
          if (!gradeNorm.includes(targetNorm)) return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (student.name || '').toLowerCase().includes(q);
        const regMatch = (student.regNumber || '').toLowerCase().includes(q);
        const gradeMatch = (student.grade || '').toLowerCase().includes(q);
        return nameMatch || regMatch || gradeMatch;
      }

      return true;
    });
  }, [students, selectedClass, searchQuery]);

  const handleCopy = (regNumber: string) => {
    navigator.clipboard?.writeText(regNumber);
    setCopiedReg(regNumber);
    setTimeout(() => setCopiedReg(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF7EE] text-neutral-900 rounded-3xl shadow-2xl border border-[#EAE2CE] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/15">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Official Enrolled Student Roster</span>
                <span className="text-[10px] uppercase font-extrabold bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full">
                  {students.length} Scholars
                </span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                Kindergarten, Primary & Junior/Senior Secondary • One-Click Fast Sign-In
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 bg-white/80 border-b border-[#EAE2CE] space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, registration number, or grade (e.g. David, Toiarhe, JSS 2)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-red-700 bg-[#FAF7EE]/60"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Class Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1 pr-1 shrink-0">
              <Filter className="w-3 h-3 text-amber-600" />
              Class:
            </span>
            {CLASS_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedClass(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedClass === cat.id
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scholar Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <GraduationCap className="w-12 h-12 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-neutral-700">No scholars found matching your criteria.</p>
              <p className="text-xs text-neutral-500">Try adjusting your search query or class filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((student) => {
                const surname = (student.name.split(' ').pop() || '').toLowerCase();
                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EAE2CE] shadow-xs hover:border-amber-400 hover:shadow-md transition space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                              {student.grade || 'Scholar'}
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                              {student.gender}
                            </span>
                            {student.house && (
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                {student.house.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reg Number & Password hint */}
                      <div className="mt-2 text-xs space-y-1 bg-[#FAF7EE] p-2 rounded-xl border border-[#EAE2CE]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-medium">Reg No:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(student.regNumber)}
                            className="font-mono font-bold text-neutral-800 hover:text-red-700 transition flex items-center gap-1 cursor-pointer"
                            title="Click to copy"
                          >
                            <span>{student.regNumber}</span>
                            {copiedReg === student.regNumber ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : null}
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-medium flex items-center gap-1">
                            <Key className="w-2.5 h-2.5 text-amber-600" />
                            Password:
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-neutral-700">
                            stanbax2025 <span className="text-neutral-400">or</span> {surname}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instant Login Button */}
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="w-full py-2 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Log In as {student.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 ml-auto" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-amber-50/90 border-t border-[#EAE2CE] text-xs text-neutral-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-semibold">
              Scholars can log in with their <strong>Full Name</strong>, <strong>Registration Number</strong>, or <strong>Student ID</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
