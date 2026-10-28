import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Save, 
  Users, 
  BookOpen, 
  Search, 
  Sliders, 
  RotateCcw, 
  Printer, 
  ArrowRight,
  ChevronDown,
  Layers,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Eye,
  Check
} from '../../RealIcons';

interface FastClassScoreEntryProps {
  onOpenReportCardDispatcher?: () => void;
}

export const FastClassScoreEntry: React.FC<FastClassScoreEntryProps> = ({
  onOpenReportCardDispatcher
}) => {
  const { 
    tutor, 
    tutors, 
    students, 
    classes, 
    subjects, 
    assessmentConfig, 
    batchUpdateClassGrades,
    updateGrade,
    calculateGrade,
    schoolInfo,
    isAdminAuthenticated,
    houseStandings
  } = useSchool();

  // Determine user clearance roles
  const isGlobalAdmin = isAdminAuthenticated || 
    tutor.role?.toLowerCase().includes('admin') || 
    tutor.role?.toLowerCase().includes('super');

  const isPrincipal = 
    tutor.principalRole === 'principal_administrator' || 
    tutor.principalRole === 'principal_academics' || 
    tutor.principalPrivileges?.includes('manage_assessments') || 
    tutor.role?.toLowerCase().includes('principal') || 
    tutor.role?.toLowerCase().includes('head of school') ||
    tutor.role?.toLowerCase().includes('proprietress');

  // Classes where tutor is the designated class teacher
  const assignedClassesAsTeacher = classes.filter(c => c.classTeacherId === tutor.id);
  const isClassTeacher = assignedClassesAsTeacher.length > 0;
  const primaryClassAsTeacher = assignedClassesAsTeacher[0] || null;

  // Active Phase Configuration
  const activePhase = assessmentConfig.activePhase;
  const isMidTermOnly = activePhase === 'mid_term_ca';
  const isTerminalExam = activePhase === 'terminal_exam';
  const isClosed = activePhase === 'closed';

  const ca1Max = assessmentConfig.ca1Max ?? 10;
  const ca2Max = assessmentConfig.ca2Max ?? 10;
  const ca3Max = assessmentConfig.ca3Max ?? 10;
  const examMax = assessmentConfig.examMax ?? 70;
  const maxPossibleScore = isMidTermOnly ? (ca1Max + ca2Max) : (ca1Max + ca2Max + ca3Max + examMax);

  // Available classes based on permissions
  const availableClasses = useMemo(() => {
    if (isGlobalAdmin || isPrincipal) {
      return classes;
    }
    if (isClassTeacher) {
      // Prioritize their designated classes, but allow viewing other classes if assigned
      const assignedClassNames = tutor.assignedClasses || [];
      const tutorClassIds = new Set(assignedClassesAsTeacher.map(c => c.id));
      const combined = classes.filter(c => tutorClassIds.has(c.id) || assignedClassNames.includes(c.name));
      return combined.length > 0 ? combined : classes;
    }
    // Standard subject teacher: filter by assigned classes
    const assignedClassNames = tutor.assignedClasses || [];
    const matched = classes.filter(c => assignedClassNames.includes(c.name));
    return matched.length > 0 ? matched : classes;
  }, [classes, isGlobalAdmin, isPrincipal, isClassTeacher, assignedClassesAsTeacher, tutor.assignedClasses]);

  // Selected Class State
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (isClassTeacher && primaryClassAsTeacher) {
      return primaryClassAsTeacher.id;
    }
    return availableClasses[0]?.id || classes[0]?.id || '';
  });

  const selectedClassObj = classes.find(c => c.id === selectedClassId) || availableClasses[0] || classes[0];
  const isDesignatedTeacherOfThisClass = selectedClassObj?.classTeacherId === tutor.id;
  const classDesignatedTeacher = tutors.find(t => t.id === selectedClassObj?.classTeacherId);

  // Clearance Check for this specific class
  const hasClassScoreClearance = isGlobalAdmin || isPrincipal || isDesignatedTeacherOfThisClass || 
    (tutor.assignedClasses || []).includes(selectedClassObj?.name || '');

  // Available subjects for selected class
  const availableSubjectsForClass = useMemo(() => {
    const classCategory = selectedClassObj?.category;
    const allMatchingSubjects = subjects.filter(s => {
      if (!classCategory) return true;
      if (s.applicableCategories && s.applicableCategories.length > 0) {
        return s.applicableCategories.includes(classCategory);
      }
      if (s.applicableLevels && s.applicableLevels.length > 0) {
        return s.applicableLevels.includes(classCategory);
      }
      return true;
    });

    // If Admin, Principal, or Designated Class Teacher: CAN SCORE ANY SUBJECT IN THIS CLASS!
    if (isGlobalAdmin || isPrincipal || isDesignatedTeacherOfThisClass) {
      return allMatchingSubjects.length > 0 ? allMatchingSubjects : subjects;
    }

    // Otherwise, filter to tutor's assigned subjects
    const assignedSubs = tutor.assignedSubjects || [];
    const filtered = allMatchingSubjects.filter(s => assignedSubs.some(as => as.toLowerCase() === s.name.toLowerCase()));
    return filtered.length > 0 ? filtered : allMatchingSubjects;
  }, [subjects, selectedClassObj, isGlobalAdmin, isPrincipal, isDesignatedTeacherOfThisClass, tutor.assignedSubjects]);

  // Selected Subject State
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return availableSubjectsForClass[0]?.name || subjects[0]?.name || '';
  });

  // Dynamic House Color Resolver
  const getHouseColor = (houseName?: string) => {
    if (!houseName) return '#2563eb';
    const match = (houseStandings || []).find(h => 
      h.name.toLowerCase() === houseName.toLowerCase() || 
      houseName.toLowerCase().includes(h.name.toLowerCase())
    );
    if (match?.color) return match.color;
    const lower = houseName.toLowerCase();
    if (lower.includes('blue') || lower.includes('sapphire')) return '#2563eb';
    if (lower.includes('red') || lower.includes('ruby')) return '#dc2626';
    if (lower.includes('green') || lower.includes('emerald')) return '#16a34a';
    if (lower.includes('yellow') || lower.includes('gold') || lower.includes('topaz')) return '#ca8a04';
    if (lower.includes('purple')) return '#9333ea';
    return '#2563eb';
  };

  // Keep selected subject valid when class changes
  useEffect(() => {
    if (availableSubjectsForClass.length > 0) {
      const exists = availableSubjectsForClass.some(s => s.name.toLowerCase() === selectedSubject.toLowerCase());
      if (!exists) {
        setSelectedSubject(availableSubjectsForClass[0].name);
      }
    }
  }, [availableSubjectsForClass, selectedSubject]);

  // Active enrolled scholars in this class (excluding alumni)
  const classStudents = useMemo(() => {
    return students.filter(s => {
      if (s.isAlumni) return false;
      if (s.classId && selectedClassObj?.id) {
        return s.classId === selectedClassObj.id;
      }
      return s.grade?.toLowerCase() === selectedClassObj?.name?.toLowerCase();
    });
  }, [students, selectedClassObj]);

  // Local draft scores map: studentId -> { ca1, ca2, ca3, exam }
  const [draftScores, setDraftScores] = useState<Record<string, { ca1: number; ca2: number; ca3: number; exam: number }>>({});
  const [autoDistribute, setAutoDistribute] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'scored' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // Track last loaded subject & class to only reset draftScores when switching subject or class
  const lastLoadedKeyRef = useRef<string>('');

  // Initialize draft scores whenever classStudents or selectedSubject changes
  useEffect(() => {
    const currentKey = `${selectedClassId}__${selectedSubject.toLowerCase()}`;
    const isSubjectOrClassSwitch = lastLoadedKeyRef.current !== currentKey;
    lastLoadedKeyRef.current = currentKey;

    setDraftScores(prevDrafts => {
      const nextDrafts: Record<string, { ca1: number; ca2: number; ca3: number; exam: number }> = isSubjectOrClassSwitch ? {} : { ...prevDrafts };

      classStudents.forEach(stu => {
        const existingGrade = (stu.grades || []).find(g => g.subject.toLowerCase() === selectedSubject.toLowerCase());
        
        if (isSubjectOrClassSwitch) {
          // Fresh switch to a new subject or class: load the saved grades
          nextDrafts[stu.id] = existingGrade ? {
            ca1: existingGrade.ca1 ?? 0,
            ca2: existingGrade.ca2 ?? 0,
            ca3: existingGrade.ca3 ?? 0,
            exam: existingGrade.exam ?? 0
          } : { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
        } else {
          // Same subject & class: PRESERVE teacher's active entered scores!
          if (!nextDrafts[stu.id]) {
            nextDrafts[stu.id] = existingGrade ? {
              ca1: existingGrade.ca1 ?? 0,
              ca2: existingGrade.ca2 ?? 0,
              ca3: existingGrade.ca3 ?? 0,
              exam: existingGrade.exam ?? 0
            } : { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
          }
        }
      });

      return nextDrafts;
    });
  }, [selectedClassId, selectedSubject, classStudents]);

  // Helper to test if a student has been scored (non-zero or explicitly filled)
  const isStudentScored = (studentId: string): boolean => {
    const scores = draftScores[studentId];
    if (!scores) return false;
    if (isMidTermOnly) {
      return (scores.ca1 > 0 || scores.ca2 > 0);
    }
    return (scores.ca1 > 0 || scores.ca2 > 0 || scores.ca3 > 0 || scores.exam > 0);
  };

  // Completion calculation
  const totalStudentsCount = classStudents.length;
  const scoredStudentsCount = useMemo(() => {
    return classStudents.filter(s => isStudentScored(s.id)).length;
  }, [classStudents, draftScores, isMidTermOnly]);

  const completionPercent = totalStudentsCount > 0 
    ? Math.round((scoredStudentsCount / totalStudentsCount) * 100) 
    : 0;

  const isClassFullyScored = totalStudentsCount > 0 && scoredStudentsCount === totalStudentsCount;

  // Single student field change
  const handleScoreChange = (
    studentId: string, 
    field: 'ca1' | 'ca2' | 'ca3' | 'exam', 
    value: number | string
  ) => {
    if (isClosed) return;
    
    // Clamp to max allowable
    let max = 100;
    if (field === 'ca1') max = ca1Max;
    if (field === 'ca2') max = ca2Max;
    if (field === 'ca3') max = ca3Max;
    if (field === 'exam') max = examMax;

    const parsedVal = typeof value === 'string' ? (value.trim() === '' ? 0 : Number(value)) : value;
    const clamped = Math.max(0, Math.min(max, isNaN(parsedVal) ? 0 : parsedVal));

    setDraftScores(prev => {
      const currentStudentDraft = prev[studentId] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
      const updatedDraft = { ...currentStudentDraft, [field]: clamped };

      // If auto-distribute is active, distribute immediately to students portal!
      if (autoDistribute) {
        updateGrade(
          selectedSubject,
          updatedDraft.ca1,
          updatedDraft.ca2,
          updatedDraft.exam,
          updatedDraft.ca3,
          studentId
        );
      }

      return {
        ...prev,
        [studentId]: updatedDraft
      };
    });

    setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Batch Save & Distribute All to Student Portals
  const handleSaveAndDistributeAll = () => {
    if (isClosed) {
      setNotificationMsg({ type: 'error', text: 'Scoring is currently locked by the School Administration.' });
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    const payload = classStudents.map(s => {
      const scores = draftScores[s.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
      return {
        studentId: s.id,
        ca1: scores.ca1,
        ca2: scores.ca2,
        ca3: scores.ca3,
        exam: scores.exam
      };
    });

    batchUpdateClassGrades(selectedSubject, payload);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTimestamp(nowTime);

    setNotificationMsg({
      type: 'success',
      text: `Successfully distributed and published ${selectedSubject} scores to all ${payload.length} scholar portals! Results & averages updated.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Quick fill helper (e.g. prefill uniform CA score)
  const handleQuickFillCA = (testField: 'ca1' | 'ca2' | 'ca3', val: number) => {
    if (isClosed) return;
    const nextDrafts = { ...draftScores };
    classStudents.forEach(s => {
      const cur = nextDrafts[s.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
      nextDrafts[s.id] = { ...cur, [testField]: val };
    });
    setDraftScores(nextDrafts);

    if (autoDistribute) {
      const payload = classStudents.map(s => ({
        studentId: s.id,
        ca1: nextDrafts[s.id].ca1,
        ca2: nextDrafts[s.id].ca2,
        ca3: nextDrafts[s.id].ca3,
        exam: nextDrafts[s.id].exam
      }));
      batchUpdateClassGrades(selectedSubject, payload);
      setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    setNotificationMsg({ type: 'info', text: `Prefilled ${testField.toUpperCase()} with ${val} for all ${classStudents.length} students.` });
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Next subject shortcut
  const handleGoToNextSubject = () => {
    const currentIndex = availableSubjectsForClass.findIndex(s => s.name.toLowerCase() === selectedSubject.toLowerCase());
    if (currentIndex >= 0 && currentIndex < availableSubjectsForClass.length - 1) {
      setSelectedSubject(availableSubjectsForClass[currentIndex + 1].name);
    } else if (availableSubjectsForClass.length > 0) {
      setSelectedSubject(availableSubjectsForClass[0].name);
    }
  };

  // Filtered students for search and status filter
  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.regNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const scored = isStudentScored(s.id);
      if (filterMode === 'scored') return scored;
      if (filterMode === 'pending') return !scored;
      return true;
    });
  }, [classStudents, searchQuery, filterMode, draftScores, isMidTermOnly]);

  // Derived Class Statistics for the selected subject
  const subjectClassStats = useMemo(() => {
    const studentScores = classStudents.map(s => {
      const sc = draftScores[s.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
      const total = isMidTermOnly ? (sc.ca1 + sc.ca2) : (sc.ca1 + sc.ca2 + sc.ca3 + sc.exam);
      return { student: s, total };
    });

    if (studentScores.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passRate: 0, topScorer: null, gradeCounts: {} };
    }

    const scoresList = studentScores.map(x => x.total);
    const sum = scoresList.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / studentScores.length) * 10) / 10;
    const highest = Math.max(...scoresList);
    const lowest = Math.min(...scoresList);
    const topScorer = studentScores.find(x => x.total === highest)?.student || null;

    const passThreshold = isMidTermOnly 
      ? ((ca1Max + ca2Max) * 0.5) 
      : (assessmentConfig.promotionPassMarkPercent || 50);
    const passedCount = studentScores.filter(x => x.total >= passThreshold).length;
    const passRate = Math.round((passedCount / studentScores.length) * 100);

    const gradeCounts: Record<string, number> = {};
    studentScores.forEach(x => {
      const g = calculateGrade(isMidTermOnly ? Math.round((x.total / (ca1Max + ca2Max)) * 100) : x.total).grade;
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    });

    return { average: avg, highest, lowest, passRate, topScorer, gradeCounts };
  }, [classStudents, draftScores, isMidTermOnly, ca1Max, ca2Max, ca3Max, examMax, assessmentConfig.promotionPassMarkPercent, calculateGrade]);

  // Rank Map for students in this subject
  const studentRankMap = useMemo(() => {
    const sorted = [...classStudents].map(s => {
      const sc = draftScores[s.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
      const total = isMidTermOnly ? (sc.ca1 + sc.ca2) : (sc.ca1 + sc.ca2 + sc.ca3 + sc.exam);
      return { id: s.id, total };
    }).sort((a, b) => b.total - a.total);

    const ranks: Record<string, number> = {};
    sorted.forEach((item, idx) => {
      ranks[item.id] = idx + 1;
    });
    return ranks;
  }, [classStudents, draftScores, isMidTermOnly]);

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: User Clearance & Role Indicator */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 shadow-md border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isGlobalAdmin && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-blue-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-950" />
                  <span>Administrative Clearance (Full Access)</span>
                </span>
              )}
              {isPrincipal && !isGlobalAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-400 text-purple-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-purple-950" />
                  <span>Principal Academics Clearance (Full Access)</span>
                </span>
              )}
              {isDesignatedTeacherOfThisClass && (
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Designated Class Teacher (Form Master)</span>
                </span>
              )}
              {!isGlobalAdmin && !isPrincipal && !isDesignatedTeacherOfThisClass && (
                <span className="px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Subject Faculty Clearance</span>
                </span>
              )}

              <span className="text-xs font-bold text-slate-300">
                {assessmentConfig.activeTerm} • {schoolInfo.activeSession}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Fast Multi-Student Score Entry Desk</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isDesignatedTeacherOfThisClass || isGlobalAdmin || isPrincipal ? (
                <span>
                  You have <strong>full administrative clearance</strong> to enter, moderate, and publish scores for any subject in this class. Scores automatically distribute to scholar portals and calculate terminal positions upon entry.
                </span>
              ) : (
                <span>
                  Select your assigned subject to rapidly score all enrolled scholars. Scores are immediately verified and distributed to scholar dashboards.
                </span>
              )}
            </p>
          </div>

          {/* Quick status pill & action */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Mode</div>
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                {isMidTermOnly && 'Mid-Term CA (CA 1 + CA 2)'}
                {isTerminalExam && 'Terminal Exam (CA 1-3 + Exam)'}
                {isClosed && 'Entries Locked'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAndDistributeAll}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 fill-blue-950" />
              <span>Distribute All to Student Portals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
            : notificationMsg.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-900'
            : 'bg-blue-50 border border-blue-200 text-blue-900'
        }`}>
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Class & Subject Selector Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Class Picker */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select Classroom *</span>
              {isDesignatedTeacherOfThisClass && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                  Your Class
                </span>
              )}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-slate-50 cursor-pointer"
            >
              {availableClasses.map(c => {
                const isFormTeacher = c.classTeacherId === tutor.id;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} {isFormTeacher ? '(Your Class)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select Subject to Score *</span>
              <span className="text-[10px] text-blue-800 font-bold">
                {availableSubjectsForClass.length} Subjects
              </span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white cursor-pointer"
            >
              {availableSubjectsForClass.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Search Scholar */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Filter Scholars
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scholar name or reg no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Distribution Mode & View Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Auto-Distribute to Portal
            </label>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setAutoDistribute(!autoDistribute)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  autoDistribute 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoDistribute ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{autoDistribute ? 'Live Sync ON' : 'Manual Save'}</span>
              </button>

              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Card Grid View"
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Spreadsheet Table View"
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Strip: Form Master & Scoring Scale */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-blue-800" />
              <span>Class: <strong className="text-slate-900">{selectedClassObj?.name}</strong></span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Form Master: <strong className="text-slate-900">{classDesignatedTeacher?.name || 'Unassigned'}</strong></span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-blue-800" />
              <span>Subject: <strong className="text-blue-900">{selectedSubject}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              Scoring Weights:
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
              CA1 ({ca1Max}) + CA2 ({ca2Max})
              {!isMidTermOnly && ` + CA3 (${ca3Max}) + Exam (${examMax})`}
              {` = Total ${maxPossibleScore}`}
            </span>
            {lastSavedTimestamp && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Synced {lastSavedTimestamp}
              </span>
            )}
          </div>
        </div>

        {/* Quick Subject Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Class Subjects:
          </span>
          {availableSubjectsForClass.map(sub => {
            const isCurrent = sub.name.toLowerCase() === selectedSubject.toLowerCase();
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-blue-900 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{sub.name}</span>
                {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Live Results Calculation Banner */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isClassFullyScored 
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-emerald-300 text-emerald-950 shadow-xs' 
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${isClassFullyScored ? 'text-emerald-600' : 'text-blue-800'}`} />
                  <span>Class Scoring Progress:</span>
                </span>
                <span className="text-xs font-bold text-slate-600">
                  <strong className="text-blue-950 font-black">{scoredStudentsCount}</strong> of <strong className="text-blue-950 font-black">{totalStudentsCount}</strong> Scholars Scored
                </span>
              </div>
              <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full ${
                isClassFullyScored ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
              }`}>
                {completionPercent}% Completed
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isClassFullyScored ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-700 to-amber-500'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {isClassFullyScored ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>All scholars have been scored!</strong> Class positions, averages, and terminal report card results are fully calculated and distributed to student dashboards.
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Enter CA test marks and exam scores. When all scholars are filled, overall class positions and broadsheet are automatically calculated.
              </p>
            )}
          </div>

          {/* Quick Class Calculation Metrics */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Class Avg</div>
              <div className="text-sm font-black text-blue-950">{subjectClassStats.average}%</div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Highest</div>
              <div className="text-sm font-black text-emerald-700">{subjectClassStats.highest}%</div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Lowest</div>
              <div className="text-sm font-black text-amber-700">{subjectClassStats.lowest}%</div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pass Rate</div>
              <div className="text-sm font-black text-blue-900">{subjectClassStats.passRate}%</div>
            </div>

            <button
              type="button"
              onClick={handleGoToNextSubject}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-1"
              title="Save & Proceed to Next Subject"
            >
              <span>Next Subject</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Grade Distribution Bar */}
        {scoredStudentsCount > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Grade Distribution:</span>
              {Object.entries(subjectClassStats.gradeCounts).map(([grd, count]) => (
                <span key={grd} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold font-mono text-xs">
                  {grd}: <strong className="text-blue-950">{count}</strong>
                </span>
              ))}
            </div>

            {subjectClassStats.topScorer && (
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Subject Lead: <strong>{subjectClassStats.topScorer.name}</strong> ({subjectClassStats.highest}%)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Quick Utilities Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-bold">Filter View:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition ${
              filterMode === 'all' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Scholars ({totalStudentsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('scored')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition ${
              filterMode === 'scored' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Scored ({scoredStudentsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition ${
              filterMode === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending ({totalStudentsCount - scoredStudentsCount})
          </button>
        </div>

        {/* Quick Bulk Scoring Tools */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <span className="text-slate-400 font-bold hidden md:inline">Quick Fill:</span>
          <button
            type="button"
            onClick={() => handleQuickFillCA('ca1', Math.round(ca1Max * 0.8))}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
            title={`Prefill ${Math.round(ca1Max * 0.8)} marks (80%) in CA 1 for all scholars`}
          >
            CA1 = {Math.round(ca1Max * 0.8)}
          </button>
          <button
            type="button"
            onClick={() => handleQuickFillCA('ca2', Math.round(ca2Max * 0.8))}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
            title={`Prefill ${Math.round(ca2Max * 0.8)} marks (80%) in CA 2 for all scholars`}
          >
            CA2 = {Math.round(ca2Max * 0.8)}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isClosed) return;
              const nextDrafts: Record<string, { ca1: number; ca2: number; ca3: number; exam: number }> = {};
              classStudents.forEach(s => {
                nextDrafts[s.id] = { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
              });
              setDraftScores(nextDrafts);
              if (autoDistribute) {
                const payload = classStudents.map(s => ({
                  studentId: s.id,
                  ca1: 0,
                  ca2: 0,
                  ca3: 0,
                  exam: 0
                }));
                batchUpdateClassGrades(selectedSubject, payload);
              }
              setNotificationMsg({ type: 'info', text: `Reset ${selectedSubject} scores to 0 for all scholars.` });
              setTimeout(() => setNotificationMsg(null), 3000);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 font-bold text-[11px] cursor-pointer transition"
            title="Clear all scores to 0"
          >
            Reset 0s
          </button>
          {onOpenReportCardDispatcher && (
            <button
              type="button"
              onClick={onOpenReportCardDispatcher}
              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: STUDENT CARDS GRID (PRIMARY REQUESTED VIEW) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-700">No scholars found matching this filter</h3>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or reset the filter to view all scholars.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterMode('all'); }}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs cursor-pointer inline-block"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredStudents.map((scholar, idx) => {
              const scores = draftScores[scholar.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
              const currentTotal = isMidTermOnly 
                ? (scores.ca1 + scores.ca2) 
                : (scores.ca1 + scores.ca2 + scores.ca3 + scores.exam);

              const percentEquivalent = isMidTermOnly 
                ? Math.round((currentTotal / (ca1Max + ca2Max)) * 100) 
                : currentTotal;

              const { grade, remark, color } = calculateGrade(percentEquivalent);
              const scored = isStudentScored(scholar.id);
              const rank = studentRankMap[scholar.id];

              return (
                <div 
                  key={scholar.id} 
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md space-y-4 flex flex-col justify-between ${
                    scored 
                      ? 'border-slate-200 hover:border-blue-300 ring-1 ring-slate-100' 
                      : 'border-dashed border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {/* Scholar Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {scholar.passportPhoto ? (
                          <img 
                            src={scholar.passportPhoto} 
                            alt={scholar.name} 
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                            {scholar.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-sm truncate leading-snug">
                            {scholar.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <span>{scholar.regNumber}</span>
                            <span>•</span>
                            <span>{scholar.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rank & Status Pill */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          scored 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {scored ? 'Scored' : 'Unscored'}
                        </span>
                        {scored && rank && (
                          <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                            Pos: {getOrdinalSuffix(rank)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* House Badge */}
                    {scholar.house && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: getHouseColor(scholar.house) }} 
                        />
                        <span className="text-slate-600 font-medium truncate">{scholar.house}</span>
                      </div>
                    )}
                  </div>

                  {/* Score Inputs Grid */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* CA 1 */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>1st CA ({ca1Max})</span>
                          {isTerminalExam && (
                            <span className="text-[9px] text-emerald-700 font-bold">Retained</span>
                          )}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={ca1Max}
                          disabled={isTerminalExam || isClosed}
                          value={scores.ca1 === 0 ? '' : scores.ca1}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(scholar.id, 'ca1', e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-center font-black text-xs border focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition ${
                            isTerminalExam 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-900 border-slate-300'
                          }`}
                        />
                      </div>

                      {/* CA 2 */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>2nd CA ({ca2Max})</span>
                          {isTerminalExam && (
                            <span className="text-[9px] text-emerald-700 font-bold">Retained</span>
                          )}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={ca2Max}
                          disabled={isTerminalExam || isClosed}
                          value={scores.ca2 === 0 ? '' : scores.ca2}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(scholar.id, 'ca2', e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-center font-black text-xs border focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition ${
                            isTerminalExam 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-900 border-slate-300'
                          }`}
                        />
                      </div>

                      {/* CA 3 (3rd Test) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>3rd CA ({ca3Max})</span>
                          {isMidTermOnly && (
                            <span className="text-[9px] text-slate-400 font-semibold">Locked</span>
                          )}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={ca3Max}
                          disabled={isMidTermOnly || isClosed}
                          value={isMidTermOnly ? '' : (scores.ca3 === 0 ? '' : scores.ca3)}
                          placeholder={isMidTermOnly ? 'Locked' : '0'}
                          onChange={(e) => handleScoreChange(scholar.id, 'ca3', e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-center font-black text-xs border focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition ${
                            isMidTermOnly 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-900 border-slate-300'
                          }`}
                        />
                      </div>

                      {/* Final Exam */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Exam ({examMax})</span>
                          {isMidTermOnly && (
                            <span className="text-[9px] text-slate-400 font-semibold">Locked</span>
                          )}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={examMax}
                          disabled={isMidTermOnly || isClosed}
                          value={isMidTermOnly ? '' : (scores.exam === 0 ? '' : scores.exam)}
                          placeholder={isMidTermOnly ? 'Locked' : '0'}
                          onChange={(e) => handleScoreChange(scholar.id, 'exam', e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-center font-black text-xs border focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition ${
                            isMidTermOnly 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-900 border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Computed Result Summary for this Card */}
                    <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      scored 
                        ? 'bg-blue-50/80 border-blue-200' 
                        : 'bg-slate-100/70 border-slate-200'
                    }`}>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                          {isMidTermOnly ? 'Mid-Term Total' : 'Terminal Total'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-blue-950 font-mono">
                            {currentTotal}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            / {maxPossibleScore} ({percentEquivalent}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">{remark}</span>
                          <span 
                            className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black font-mono shadow-2xs text-white"
                            style={{ backgroundColor: color || '#2563eb' }}
                          >
                            {grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="text-slate-400">
                      Scholar ID: <span className="font-mono">{scholar.id}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleScoreChange(scholar.id, 'ca1', 0);
                          handleScoreChange(scholar.id, 'ca2', 0);
                          handleScoreChange(scholar.id, 'ca3', 0);
                          handleScoreChange(scholar.id, 'exam', 0);
                        }}
                        className="text-slate-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50 font-bold transition cursor-pointer"
                        title="Clear scores for this student"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: COMPACT SPREADSHEET TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-800" />
              <span>{selectedClassObj?.name} • {selectedSubject} Ledger</span>
            </h3>
            <span className="text-xs text-slate-500">
              Showing {filteredStudents.length} enrolled scholars
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[11px]">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-4">Scholar Name</th>
                  <th className="py-3 px-3">Reg No</th>
                  <th className="py-3 px-2 text-center">CA 1 ({ca1Max})</th>
                  <th className="py-3 px-2 text-center">CA 2 ({ca2Max})</th>
                  <th className="py-3 px-2 text-center">CA 3 ({ca3Max})</th>
                  <th className="py-3 px-2 text-center">Exam ({examMax})</th>
                  <th className="py-3 px-3 text-center">Total ({maxPossibleScore})</th>
                  <th className="py-3 px-2 text-center">Grade</th>
                  <th className="py-3 px-3">Remark</th>
                  <th className="py-3 px-2 text-center">Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((scholar, i) => {
                  const scores = draftScores[scholar.id] || { ca1: 0, ca2: 0, ca3: 0, exam: 0 };
                  const currentTotal = isMidTermOnly 
                    ? (scores.ca1 + scores.ca2) 
                    : (scores.ca1 + scores.ca2 + scores.ca3 + scores.exam);

                  const percentEquivalent = isMidTermOnly 
                    ? Math.round((currentTotal / (ca1Max + ca2Max)) * 100) 
                    : currentTotal;

                  const { grade, remark } = calculateGrade(percentEquivalent);
                  const rank = studentRankMap[scholar.id];

                  return (
                    <tr key={scholar.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono font-bold">{i + 1}</td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        {scholar.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">{scholar.regNumber}</td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={ca1Max}
                          disabled={isTerminalExam || isClosed}
                          value={scores.ca1 === 0 ? '' : scores.ca1}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(scholar.id, 'ca1', e.target.value)}
                          className="w-14 py-1 px-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={ca2Max}
                          disabled={isTerminalExam || isClosed}
                          value={scores.ca2 === 0 ? '' : scores.ca2}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(scholar.id, 'ca2', e.target.value)}
                          className="w-14 py-1 px-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={ca3Max}
                          disabled={isMidTermOnly || isClosed}
                          value={isMidTermOnly ? '' : (scores.ca3 === 0 ? '' : scores.ca3)}
                          placeholder={isMidTermOnly ? '-' : '0'}
                          onChange={(e) => handleScoreChange(scholar.id, 'ca3', e.target.value)}
                          className="w-14 py-1 px-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={examMax}
                          disabled={isMidTermOnly || isClosed}
                          value={isMidTermOnly ? '' : (scores.exam === 0 ? '' : scores.exam)}
                          placeholder={isMidTermOnly ? '-' : '0'}
                          onChange={(e) => handleScoreChange(scholar.id, 'exam', e.target.value)}
                          className="w-16 py-1 px-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-black text-blue-900 font-mono">
                        {currentTotal}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black font-mono">
                          {grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">{remark}</td>
                      <td className="py-3 px-2 text-center font-bold text-blue-900 font-mono">
                        {rank ? getOrdinalSuffix(rank) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Scoring: <strong>{selectedSubject}</strong> for <strong>{selectedClassObj?.name}</strong> • {scoredStudentsCount}/{totalStudentsCount} Scholars
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGoToNextSubject}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Next Subject</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={handleSaveAndDistributeAll}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save & Distribute to Student Portals</span>
          </button>
        </div>
      </div>
    </div>
  );
};
