import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Sliders, 
  TrendingUp, 
  GraduationCap, 
  Calendar, 
  Users, 
  AlertCircle,
  Clock,
  Printer,
  RotateCcw,
  FileText,
  Database,
  RefreshCw,
  Activity,
  Upload
} from '../../RealIcons';
import { CustomResultsManagerModal } from './CustomResultsManagerModal';
import { FastClassScoreEntry } from '../tutor/FastClassScoreEntry';
import { OfficialSignaturesDesk } from '../OfficialSignaturesDesk';
import { BatchResultsUploadModal } from './BatchResultsUploadModal';
import { ReportSheetSignatureMode, ReportSheetSecondarySignature } from '../../../types';

export const AdminResultCollationTab: React.FC = () => {
  const { 
    assessmentConfig, 
    updateAssessmentConfig, 
    setActiveAssessmentPhase, 
    setActiveAssessmentTerm, 
    setPromotionPassMark,
    toggleAutoRanking,
    getClassRankings,
    students,
    classes,
    schoolInfo,
    isCgpaActiveForClass,
    calculateGpa,
    toggleCgpaForClass,
    setCgpaActiveClasses,
    dispatchCollatedResultsToDashboards,
    officialSignatures,
    updateOfficialSignatures,
    resolveReportSheetSignatures,
    unifyLocalStorageResultsToDatabase,
    activeOnlineUsersCount
  } = useSchool();

  const [passMark, setPassMark] = useState<number>(assessmentConfig.promotionPassMarkPercent || 50);
  const [ca1Max, setCa1Max] = useState<number>(assessmentConfig.ca1Max ?? 10);
  const [ca2Max, setCa2Max] = useState<number>(assessmentConfig.ca2Max ?? 10);
  const [ca3Max, setCa3Max] = useState<number>(assessmentConfig.ca3Max ?? 10);
  const [examMax, setExamMax] = useState<number>(assessmentConfig.examMax ?? 70);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [selectedRankingClass, setSelectedRankingClass] = useState<string>('JSS 1 Gold');
  const [showCustomResultsModal, setShowCustomResultsModal] = useState<boolean>(false);
  const [showFastScoreModal, setShowFastScoreModal] = useState<boolean>(false);
  const [showSignaturesModal, setShowSignaturesModal] = useState<boolean>(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState<boolean>(false);
  const [dispatchReportKind, setDispatchReportKind] = useState<'end' | 'mid'>(
    assessmentConfig.dispatchedReportKind || 'end'
  );
  const [dispatchBroadcastNote, setDispatchBroadcastNote] = useState<string>(
    assessmentConfig.resultsDispatchMessage ||
      `Official collated results for ${assessmentConfig.activeTerm} (${schoolInfo.activeSession}) have been released by the Principal's Office.`
  );
  const [isDispatchingResults, setIsDispatchingResults] = useState<boolean>(false);
  const [isUnifying, setIsUnifying] = useState<boolean>(false);
  const [unifyFeedback, setUnifyFeedback] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);

  const handleUnifyResults = async () => {
    setIsUnifying(true);
    setUnifyFeedback(null);
    try {
      const res = await unifyLocalStorageResultsToDatabase();
      setUnifyFeedback({
        success: res.ok,
        message: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      if (res.ok) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } catch (err: any) {
      setUnifyFeedback({
        success: false,
        message: err?.message || 'Error occurred while unifying results to database.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } finally {
      setIsUnifying(false);
    }
  };

  const handleSendResultsToDashboards = async () => {
    setIsDispatchingResults(true);
    try {
      const res = await dispatchCollatedResultsToDashboards({
        reportKind: dispatchReportKind,
        broadcastMessage: dispatchBroadcastNote.trim(),
        dispatchedBy: schoolInfo.principalName
          ? `${schoolInfo.principalName} (Principal & Controller of Examinations)`
          : 'School Administration & Examination Board',
      });
      setSuccessMsg(
        `Collated ${dispatchReportKind === 'mid' ? 'Mid-Term' : 'End-of-Term'} results for ${res.dispatchedCount} scholars have been sent to all Parent & Scholar Dashboards and permanently saved to the database!`
      );
      setTimeout(() => setSuccessMsg(''), 7000);
    } finally {
      setIsDispatchingResults(false);
    }
  };

  const handleRecallDispatchedResults = () => {
    updateAssessmentConfig({
      resultsDispatchedToDashboard: false,
    });
    setSuccessMsg('Pinned result spotlight removed from the top of Parent & Scholar login dashboards.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const totalAssessmentMax = Number(ca1Max) + Number(ca2Max) + Number(ca3Max) + Number(examMax);

  const isAutoRankingOn = assessmentConfig.autoRankingEnabled !== false;
  const isCgpaEnabled = assessmentConfig.cgpaEnabled !== false;
  const activeCgpaClasses = assessmentConfig.cgpaActiveClasses || [];
  const currentCgpaScale = assessmentConfig.cgpaScale || 5.0;
  const isCurrentClassCgpaActive = isCgpaActiveForClass(selectedRankingClass);
  const currentClassRankings = getClassRankings(selectedRankingClass, assessmentConfig.activeTerm);

  const handlePhaseChange = (phase: any) => {
    setActiveAssessmentPhase(phase);
    setSuccessMsg(`Assessment phase successfully updated to ${phase.replace('_', ' ').toUpperCase()}.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleTermChange = (term: any) => {
    setActiveAssessmentTerm(term);
    setSuccessMsg(`Active assessment term switched to ${term}.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSavePassMark = (e: React.FormEvent) => {
    e.preventDefault();
    setPromotionPassMark(passMark);
    setSuccessMsg(`Official promotion pass threshold set to ${passMark}%.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveMarksBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssessmentConfig({
      ca1Max: Number(ca1Max),
      ca2Max: Number(ca2Max),
      ca3Max: Number(ca3Max),
      examMax: Number(examMax),
    });
    setSuccessMsg(`Assessment score breakdown saved: CA1 (${ca1Max}), CA2 (${ca2Max}), CA3 (${ca3Max}), Exam (${examMax}) = Total ${totalAssessmentMax} marks.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetMarksToDefault = () => {
    setCa1Max(10);
    setCa2Max(10);
    setCa3Max(10);
    setExamMax(70);
    updateAssessmentConfig({
      ca1Max: 10,
      ca2Max: 10,
      ca3Max: 10,
      examMax: 70,
    });
    setSuccessMsg('Assessment marks restored to standard 10 + 10 + 10 + 70 = 100 marks structure.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handlePublicationToggle = (kind: 'mid' | 'end') => {
    if (kind === 'mid') {
      const next = !assessmentConfig.midTermResultsPublished;
      updateAssessmentConfig({
        midTermResultsPublished: next,
        midTermPublishedAt: next ? new Date().toISOString() : undefined,
      });
      setSuccessMsg(next
        ? 'Mid-Term report card (CA 1 + CA 2) published — now live on scholar & parent dashboards.'
        : 'Mid-Term report card unpublished — hidden from scholar & parent dashboards.');
    } else {
      const next = !assessmentConfig.endTermResultsPublished;
      updateAssessmentConfig({
        endTermResultsPublished: next,
        endTermPublishedAt: next ? new Date().toISOString() : undefined,
      });
      setSuccessMsg(next
        ? 'End-of-Term report card (CA 1–3 + Examination) published — now live on scholar & parent dashboards.'
        : 'End-of-Term report card unpublished — hidden from scholar & parent dashboards.');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleCgpaMaster = () => {
    const nextVal = !isCgpaEnabled;
    updateAssessmentConfig({ cgpaEnabled: nextVal });
    setSuccessMsg(nextVal ? 'CGPA Calculation System ACTIVATED across eligible classes.' : 'CGPA Calculation System PAUSED school-wide.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleSetScale = (scale: 5.0 | 4.0) => {
    updateAssessmentConfig({ cgpaScale: scale });
    setSuccessMsg(`CGPA Standard Scale switched to ${scale.toFixed(1)} Point Maximum.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleBulkClassCgpa = (type: 'all-senior' | 'all-junior' | 'all' | 'none') => {
    if (type === 'all') {
      const allClassNames = classes.map(c => c.name);
      setCgpaActiveClasses(allClassNames);
      setSuccessMsg(`CGPA activated for ALL ${allClassNames.length} classes in the school.`);
    } else if (type === 'all-senior') {
      const senior = classes.filter(c => c.category === 'Senior Secondary' || c.name.includes('SSS') || c.name.includes('SS')).map(c => c.name);
      setCgpaActiveClasses(senior);
      setSuccessMsg(`CGPA activated for all ${senior.length} Senior Secondary classes.`);
    } else if (type === 'all-junior') {
      const junior = classes.filter(c => c.category === 'Junior Secondary' || c.name.includes('JSS') || c.name.includes('JS')).map(c => c.name);
      setCgpaActiveClasses(junior);
      setSuccessMsg(`CGPA activated for all ${junior.length} Junior Secondary classes.`);
    } else {
      setCgpaActiveClasses([]);
      setSuccessMsg('CGPA deactivated for all classes.');
    }
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-blue-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 fill-blue-950" />
              <span>Continuous Assessment & Results Engine</span>
            </span>
            <span className="text-xs font-bold text-slate-300">• Terminal Collation Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Academic Scoring & Promotion Moderation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Control the academic assessment timeline across CA tests, terminal exams, pass-mark thresholds, and session promotions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-2xl bg-white/10 text-amber-300 border border-white/10 text-xs font-black">
            Pass Mark: {assessmentConfig.promotionPassMarkPercent}%
          </span>
          <button
            type="button"
            onClick={() => setShowBatchUploadModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-950" />
            <span>Batch Upload Results (CSV/JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFastScoreModal(true)}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Fast Class Scoring Desk</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCustomResultsModal(true)}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload / Manage Custom Results</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Real-time Central Database Unification & High-Concurrency Status Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 shadow-xl border-2 border-indigo-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Database className="w-3.5 h-3.5 fill-slate-950" />
                <span>Multi-Admin Database Unifier</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Concurrent Active Users: <strong className="text-white font-black">{Math.max(activeOnlineUsersCount, 1)}</strong> (10+ High Concurrency Ready)</span>
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Unify Results Saved on Local Storage to Central Database</span>
            </h3>
            
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              When multiple administrators enter scores across different browsers or accounts, click below to atomically unify and merge all locally stored student grades, averages, rankings, and assessment configs into the central database. All connected portals receive the synced results immediately.
            </p>

            {unifyFeedback && (
              <div className={`mt-2 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                unifyFeedback.success 
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' 
                  : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
              }`}>
                {unifyFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                )}
                <span>{unifyFeedback.message}</span>
                {unifyFeedback.timestamp && (
                  <span className="ml-auto text-[10px] text-slate-400 font-normal">
                    Synced at {unifyFeedback.timestamp}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={handleUnifyResults}
              disabled={isUnifying}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                isUnifying
                  ? 'bg-indigo-700/60 text-indigo-200 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 active:scale-98 shadow-emerald-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isUnifying ? 'animate-spin' : ''}`} />
              <span>{isUnifying ? 'Unifying Results to Database...' : 'Unify & Commit Local Results to Database'}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Realtime event sync active across all admin accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Collated Result Dispatch to All Parent & Scholar Dashboards */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-6 shadow-lg border-2 border-emerald-500/40 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Direct Dashboard Result Broadcast</span>
              </span>
              {assessmentConfig.resultsDispatchedToDashboard ? (
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black">
                  LIVE ON ALL PARENT &amp; SCHOLAR LOGIN DASHBOARDS ({assessmentConfig.dispatchedReportKind === 'mid' ? 'MID-TERM' : 'END-OF-TERM'})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15 text-[11px] font-bold">
                  Ready to Dispatch ({students.length} Scholars)
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Send Collated Results to All Parent &amp; Scholar Dashboards
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              Once collation is complete, press the button below to compute final subject grades, class rankings, and CGPA for all{' '}
              <strong>{students.length} scholars</strong>, save them permanently to the database, and pin each scholar&apos;s official result sheet right at the top of their Scholar &amp; Parent Portal whenever they log in.
            </p>
            {assessmentConfig.resultsDispatchedAt && (
              <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Last Dispatched: {new Date(assessmentConfig.resultsDispatchedAt).toLocaleString()} •{' '}
                  {assessmentConfig.resultsDispatchedTerm || assessmentConfig.activeTerm} ({assessmentConfig.resultsDispatchedSession || schoolInfo.activeSession}) • By {assessmentConfig.resultsDispatchedBy || 'School Administration'}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isDispatchingResults}
              onClick={handleSendResultsToDashboards}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Award className="w-5 h-5 text-slate-950 shrink-0" />
              <span>
                {isDispatchingResults
                  ? 'Collating & Syncing to Database...'
                  : assessmentConfig.resultsDispatchedToDashboard
                  ? `Re-Send & Update ${dispatchReportKind === 'mid' ? 'Mid-Term' : 'End-of-Term'} Results on All Dashboards`
                  : `Send ${dispatchReportKind === 'mid' ? 'Mid-Term' : 'End-of-Term'} Results to All Parent & Scholar Dashboards`}
              </span>
            </button>
            {assessmentConfig.resultsDispatchedToDashboard && (
              <button
                type="button"
                onClick={handleRecallDispatchedResults}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/20 text-xs font-bold transition cursor-pointer text-center"
              >
                Unpin from Top of Login Dashboards
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-emerald-800/70 text-xs">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-300 mb-1.5">
              1. Select Collated Result Sheet to Push
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDispatchReportKind('end')}
                className={`p-2.5 rounded-xl border font-black text-xs transition cursor-pointer ${
                  dispatchReportKind === 'end'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                }`}
              >
                End-of-Term (CA 1–3 + Exam)
              </button>
              <button
                type="button"
                onClick={() => setDispatchReportKind('mid')}
                className={`p-2.5 rounded-xl border font-black text-xs transition cursor-pointer ${
                  dispatchReportKind === 'mid'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                }`}
              >
                Mid-Term (CA 1 + CA 2)
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-300 mb-1.5">
              2. Official Principal / Examination Board Note (Shown on Parent &amp; Scholar Dashboards)
            </label>
            <input
              type="text"
              value={dispatchBroadcastNote}
              onChange={(e) => setDispatchBroadcastNote(e.target.value)}
              placeholder="Enter official remark or announcement shown with the collated results..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/50 font-bold text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Assessment Entry Phase */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-800" />
            <h3 className="font-black text-slate-900 text-sm">Active Assessment Phase</h3>
          </div>

          <p className="text-slate-500">
            Controls what faculty tutors are permitted to enter in their gradebooks:
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handlePhaseChange('mid_term_ca')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                assessmentConfig.activePhase === 'mid_term_ca'
                  ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-black text-xs">
                <span>Mid-Term CA Entry</span>
                {assessmentConfig.activePhase === 'mid_term_ca' && <CheckCircle2 className="w-4 h-4 text-blue-800" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                Tutors enter 1st and 2nd continuous assessment test marks. Exams are locked.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePhaseChange('terminal_exam')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                assessmentConfig.activePhase === 'terminal_exam'
                  ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-black text-xs">
                <span>Terminal Examination Entry</span>
                {assessmentConfig.activePhase === 'terminal_exam' && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                Tutors enter 3rd CA and final examination marks. CA 1 & 2 remain preserved.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePhaseChange('closed')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                assessmentConfig.activePhase === 'closed'
                  ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-black text-xs">
                <span>Collation Closed / Locked</span>
                {assessmentConfig.activePhase === 'closed' && <CheckCircle2 className="w-4 h-4 text-rose-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                All score entry locked for administrative report card collation and review.
              </p>
            </button>
          </div>
        </div>

        {/* Panel 1B: Results Publication Control */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-slate-900 text-sm">Report Card Publication</h3>
          </div>

          <p className="text-slate-500">
            Controls when results appear on scholar and parent dashboards. Unpublished results stay hidden even if scores are collated.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handlePublicationToggle('mid')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                assessmentConfig.midTermResultsPublished
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-black text-xs">
                <span>Mid-Term Report (CA 1 + CA 2)</span>
                {assessmentConfig.midTermResultsPublished
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  : <Lock className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                {assessmentConfig.midTermResultsPublished
                  ? `Live on scholar dashboards${assessmentConfig.midTermPublishedAt ? ` since ${new Date(assessmentConfig.midTermPublishedAt).toLocaleString()}` : ''}. Tap to unpublish.`
                  : 'Hidden from scholars. Tap to publish the mid-term CA summary card.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePublicationToggle('end')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                assessmentConfig.endTermResultsPublished
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-black text-xs">
                <span>End-of-Term Report (CA 1–3 + Exam)</span>
                {assessmentConfig.endTermResultsPublished
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  : <Lock className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                {assessmentConfig.endTermResultsPublished
                  ? `Live on scholar dashboards${assessmentConfig.endTermPublishedAt ? ` since ${new Date(assessmentConfig.endTermPublishedAt).toLocaleString()}` : ''}. Tap to unpublish.`
                  : 'Hidden from scholars. Tap to publish the full terminal report card.'}
              </p>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Tip: set the phase to "Collation Closed" before publishing to freeze score entry first.
          </p>
        </div>

        {/* Panel 2: Term and Session Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-indigo-800" />
            <h3 className="font-black text-slate-900 text-sm">Term & Academic Year</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Active Session</label>
              <input
                type="text"
                value={schoolInfo.activeSession}
                disabled
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assessment Term</label>
              <div className="space-y-1.5">
                {(['1st Term', '2nd Term', '3rd Term'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTermChange(t)}
                    className={`w-full text-left p-2.5 rounded-xl border font-bold flex items-center justify-between cursor-pointer ${
                      assessmentConfig.activeTerm === t
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t}</span>
                    {assessmentConfig.activeTerm === t && (
                      <span className="text-[10px] bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded-full font-black">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {assessmentConfig.activeTerm === '3rd Term' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-[11px] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                <span>3rd Term calculates the 3-term cumulative annual average for scholar promotion.</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Promotion Pass Mark Threshold */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-slate-900 text-sm">Pass Mark & Promotion Standard</h3>
          </div>

          <form onSubmit={handleSavePassMark} className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Minimum Annual Average for Automatic Promotion (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={40}
                  max={75}
                  value={passMark}
                  onChange={e => setPassMark(Number(e.target.value))}
                  className="w-24 p-2.5 rounded-xl border border-slate-300 font-black text-sm text-center"
                />
                <span className="font-bold text-slate-500">%</span>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer"
                >
                  Update
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Scholars scoring below this cumulative annual threshold in 3rd term will be marked for repeat/probation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Enrolled Student Body</span>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Active Scholars:</span>
                <span className="font-black text-slate-900">{students.filter(s => !s.isAlumni).length}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Alumni Graduated:</span>
                <span className="font-black text-slate-900">{students.filter(s => s.isAlumni).length}</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Panel 3B: Report Sheet Signature Decision Control */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-400 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Report Sheet Endorsement Control</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Decide the Signature(s) Contained in Report Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Choose which official signature(s) and signatory titles appear on student and parent report sheets across on-screen portals and downloaded transcripts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSignaturesModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Draw / Upload Signatures & Titles</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Primary Report Sheet Signatory Mode
            </label>
            <select
              value={officialSignatures.reportSheetSignatureMode || 'auto_by_level'}
              onChange={(e) => {
                updateOfficialSignatures({
                  reportSheetSignatureMode: e.target.value as ReportSheetSignatureMode
                });
                setSuccessMsg('Report sheet primary signature mode updated and saved!');
                setTimeout(() => setSuccessMsg(''), 3500);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            >
              <option value="auto_by_level">Automatic by School Section (HM for Primary / Principals for Sec)</option>
              <option value="principal_admin">Principal (Administration) — {officialSignatures.principalAdminName || schoolInfo.principalName}</option>
              <option value="principal_academics">Principal (Academics) — {officialSignatures.principalAcademicsName || schoolInfo.academicsName}</option>
              <option value="headmistress">Headmistress — {officialSignatures.headmistressName || schoolInfo.headmistressName}</option>
              <option value="dual_principals">Dual Principals (Principal Academics + Principal Admin)</option>
              <option value="proprietress">Proprietress — {officialSignatures.proprietressName || 'Mrs. Adebisi Folashade Bello'}</option>
              <option value="custom">Custom / Selected Staff Signatory</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Determines whose signature & name endorse the primary slot on report cards.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Second Slot / Co-Signatory on Report Sheets
            </label>
            <select
              value={officialSignatures.reportSheetSecondarySignature || ''}
              onChange={(e) => {
                const val = e.target.value as ReportSheetSecondarySignature | '';
                updateOfficialSignatures({
                  reportSheetSecondarySignature: val ? (val as ReportSheetSecondarySignature) : undefined
                });
                setSuccessMsg('Report sheet secondary signature / seal slot updated!');
                setTimeout(() => setSuccessMsg(''), 3500);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Default for Selected Mode</option>
              <option value="none">Single Signature Only (No Second Slot)</option>
              <option value="official_seal">Official School Registry Stamp & Seal</option>
              <option value="principal_admin">Principal (Administration) Signature</option>
              <option value="principal_academics">Principal (Academics) Signature</option>
              <option value="headmistress">Headmistress Signature</option>
              <option value="proprietress">Proprietress Signature</option>
              <option value="class_teacher">Class Teacher / Form Master Signature</option>
              <option value="custom">Custom Signatory Signature</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Choose a co-signatory, class teacher, official seal, or single-signatory layout.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-900 mb-1">
                Active Endorsement Summary ({selectedRankingClass})
              </div>
              {(() => {
                const preview = resolveReportSheetSignatures(selectedRankingClass);
                return (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-semibold">Primary:</span>
                      <span className="font-black text-slate-900 truncate">{preview.primary.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-semibold">Second Slot:</span>
                      <span className="font-black text-slate-900 truncate">
                        {preview.secondary ? preview.secondary.name : 'Single Signatory Only'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <label className="flex items-center gap-2 pt-2 mt-2 border-t border-blue-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={officialSignatures.showSignaturesOnPortalReport !== false}
                onChange={(e) => updateOfficialSignatures({ showSignaturesOnPortalReport: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-900"
              />
              <span className="text-[11px] font-bold text-blue-950">
                Display digital signature images on portal screen & downloads
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Modal for Full Digital Signature Pad */}
      {showSignaturesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Report Sheet Signatures & Official Endorsements
              </h3>
              <button
                type="button"
                onClick={() => setShowSignaturesModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Done & Close
              </button>
            </div>
            <OfficialSignaturesDesk roleFilter="all" />
          </div>
        </div>
      )}

      {/* Panel 4: CA Tests & Examination Maximum Marks Allocation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-blue-600 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-black shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Score Structure Moderation</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Continuous Assessment (CA) & Examination Score Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Configure the maximum mark allocations for Continuous Assessment tests and terminal exams across all student gradebooks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMarksToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to 10/10/10/70 standard"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to 10/10/10/70</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveMarksBreakdown} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CA 1 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                1st CA Test Max Marks
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={ca1Max}
                  onChange={e => setCa1Max(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-base text-blue-900 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-400">pts</span>
              </div>
              <p className="text-[11px] text-slate-500">First Continuous Assessment</p>
            </div>

            {/* CA 2 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                2nd CA Test Max Marks
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={ca2Max}
                  onChange={e => setCa2Max(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-base text-blue-900 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-400">pts</span>
              </div>
              <p className="text-[11px] text-slate-500">Mid-term Continuous Assessment</p>
            </div>

            {/* CA 3 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                3rd CA Test Max Marks
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={ca3Max}
                  onChange={e => setCa3Max(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-base text-blue-900 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-400">pts</span>
              </div>
              <p className="text-[11px] text-slate-500">Project / Assignment CA</p>
            </div>

            {/* Exam */}
            <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/50 space-y-2">
              <label className="block text-xs font-bold text-amber-950">
                Terminal Examination Max
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={100}
                  required
                  value={examMax}
                  onChange={e => setExamMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 font-black text-base text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-amber-700">pts</span>
              </div>
              <p className="text-[11px] text-amber-800">Final Term Examination Paper</p>
            </div>
          </div>

          {/* Verification Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-black ${
                totalAssessmentMax === 100 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                Total: {totalAssessmentMax} / 100 Marks
              </div>
              <span className="text-xs text-slate-600">
                Formula: CA1 ({ca1Max}) + CA2 ({ca2Max}) + CA3 ({ca3Max}) + Exam ({examMax}) = {totalAssessmentMax}
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Save Marks Allocation</span>
            </button>
          </div>
        </form>
      </div>

      {/* Panel 5: Cumulative Grade Point Average (CGPA) Engine & Class Decider */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-indigo-500/40 space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shrink-0 border border-indigo-400/30">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-black uppercase tracking-wider mb-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Cumulative Grade Point Average (CGPA) Authority</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                CGPA Calculation System & Class Activation Matrix
              </h3>
              <p className="text-xs text-indigo-200/90 max-w-2xl">
                Enable academic CGPA calculations and decide exactly which classes in the school have CGPA active. Active classes calculate quality points, scale averages, and honours classifications on scholar transcripts and parent reports.
              </p>
            </div>
          </div>

          {/* Master CGPA Switch */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 shrink-0">
            <div className="text-right">
              <div className="text-xs font-black text-white">
                {isCgpaEnabled ? 'CGPA System Active' : 'CGPA Paused'}
              </div>
              <div className="text-[10px] text-indigo-200">
                {isCgpaEnabled ? `${activeCgpaClasses.length} Classes Enrolled` : 'All Classes Muted'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleCgpaMaster}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isCgpaEnabled ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                  isCgpaEnabled ? 'translate-x-6 bg-white' : 'translate-x-0 bg-slate-300'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CGPA Scale & Class Matrix Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Scale Selector & Formula Specs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                Standard CGPA Evaluation Scale
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetScale(5.0)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    currentCgpaScale === 5.0
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-black text-sm flex items-center justify-between">
                    <span>5.00 Scale</span>
                    {currentCgpaScale === 5.0 && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                  </div>
                  <p className="text-[10px] opacity-80 mt-1">WAEC / Nigerian University Standard (4.50+ First Class)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetScale(4.0)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    currentCgpaScale === 4.0
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-black text-sm flex items-center justify-between">
                    <span>4.00 Scale</span>
                    {currentCgpaScale === 4.0 && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                  </div>
                  <p className="text-[10px] opacity-80 mt-1">US / Cambridge GPA Standard (3.50+ Distinction)</p>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-indigo-200 space-y-1">
                <span className="font-bold text-white block">Quality Points Weighting:</span>
                <p>• A1 (75%+) = {currentCgpaScale === 5.0 ? '5.0 pts' : '4.0 pts'} (Distinction)</p>
                <p>• B2/B3 (65–74%) = {currentCgpaScale === 5.0 ? '4.0 / 3.5 pts' : '3.5 / 3.0 pts'} (Credit Upper)</p>
                <p>• C4–C6 (50–64%) = {currentCgpaScale === 5.0 ? '3.0 / 2.0 pts' : '2.5 / 2.0 pts'} (Credit)</p>
                <p>• D7/E8 (40–49%) = {currentCgpaScale === 5.0 ? '1.5 / 1.0 pts' : '1.5 / 1.0 pts'} (Pass)</p>
                <p>• F9 (&lt;40%) = 0.0 pts (Fail)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Class Decider Matrix */}
          <div className="lg:col-span-8 bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <span>Class Eligibility Selector</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {activeCgpaClasses.length} of {classes.length} Active
                  </span>
                </h4>
                <p className="text-xs text-indigo-200">
                  Click any class chip to toggle CGPA on/off. Use quick action presets below for batch assignment.
                </p>
              </div>

              {/* Quick Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleBulkClassCgpa('all-senior')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-indigo-100 text-[11px] font-bold cursor-pointer transition"
                >
                  All Senior Secondary (SS1-3)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkClassCgpa('all-junior')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-indigo-100 text-[11px] font-bold cursor-pointer transition"
                >
                  All Junior (JS1-3)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkClassCgpa('all')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-[11px] font-bold cursor-pointer transition"
                >
                  All School Classes
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkClassCgpa('none')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[11px] font-bold cursor-pointer transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Grid of Class Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
              {classes.map(c => {
                const isActive = isCgpaActiveForClass(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      toggleCgpaForClass(c.name);
                      setSuccessMsg(`Toggled CGPA for ${c.name} (${!isActive ? 'ACTIVE' : 'MUTED'}).`);
                      setTimeout(() => setSuccessMsg(''), 2500);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-indigo-600/80 border-indigo-400 text-white shadow-sm ring-1 ring-amber-400/50'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">{c.name}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-amber-400 shadow-xs' : 'bg-slate-600'}`} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] opacity-75 mt-1.5">
                      <span className="truncate">{c.category}</span>
                      <span className="font-mono font-bold">{isActive ? 'CGPA ON' : 'OFF'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Panel 6: Automatic Student Ranking System (Toggle & Class Leaderboard) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Scholar Merit & Positioning</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Automatic Student Class Ranking System & Broadsheet
              </h3>
              <p className="text-xs text-slate-500">
                Automatically calculate student class positions (1st, 2nd, 3rd...) and view full broadsheet standing with CGPA.
              </p>
            </div>
          </div>

          {/* Ranking Toggle Control */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">
                {isAutoRankingOn ? 'Ranking Enabled' : 'Ranking Disabled'}
              </div>
              <div className="text-[10px] text-slate-500">
                {isAutoRankingOn ? 'Shown on Report Sheets' : 'Hidden from Cards'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleAutoRanking();
                const nextState = !isAutoRankingOn;
                setSuccessMsg(
                  nextState 
                    ? 'Automatic class ranking ENABLED! Scholar positions (1st, 2nd, 3rd...) are now calculated and displayed across report sheets.'
                    : 'Automatic class ranking DISABLED! Position rankings are now suppressed on terminal report cards.'
                );
                setTimeout(() => setSuccessMsg(''), 4500);
              }}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isAutoRankingOn ? 'bg-blue-900' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAutoRankingOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Class Selector and Ranking Metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Inspect Class Broadsheet:</label>
            <select
              value={selectedRankingClass}
              onChange={e => setSelectedRankingClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">
              Scholars Ranked: <strong className="text-slate-900 font-black">{currentClassRankings.length}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Active Term: <strong className="text-blue-900 font-black">{assessmentConfig.activeTerm}</strong>
            </span>
            <span className="text-slate-300">•</span>
            {isCurrentClassCgpaActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-black">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                <span>CGPA ACTIVE ({currentCgpaScale.toFixed(1)} Scale)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toggleCgpaForClass(selectedRankingClass);
                  setSuccessMsg(`CGPA activated for ${selectedRankingClass}.`);
                  setTimeout(() => setSuccessMsg(''), 3000);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 font-bold transition cursor-pointer"
              >
                <span>+ Activate CGPA for {selectedRankingClass}</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Class Rankings Broadsheet Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Scholar Details</th>
                <th className="py-3 px-4 text-center">Admission ID</th>
                <th className="py-3 px-4 text-right">Average Score</th>
                {isCurrentClassCgpaActive && (
                  <>
                    <th className="py-3 px-4 text-center bg-indigo-50/80 text-indigo-950 font-black">
                      CGPA ({currentCgpaScale.toFixed(1)} Pt)
                    </th>
                    <th className="py-3 px-4 text-center bg-indigo-50/50 text-indigo-950 font-black">
                      Honours Standing
                    </th>
                  </>
                )}
                <th className="py-3 px-4 text-center">Academic Standing</th>
                <th className="py-3 px-4 text-center">Promotion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentClassRankings.length === 0 ? (
                <tr>
                  <td colSpan={isCurrentClassCgpaActive ? 8 : 6} className="py-8 text-center text-slate-500">
                    No scholars enrolled in {selectedRankingClass} yet. Add students or enroll new admissions to compute ranking.
                  </td>
                </tr>
              ) : (
                currentClassRankings.map(({ student, rank, positionText, average }) => {
                  const isTop3 = rank <= 3;
                  const isPass = average >= passMark;
                  const gpaResult = calculateGpa(student.grades || [], currentCgpaScale);

                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors ${
                        rank === 1 
                          ? 'bg-amber-50/50 hover:bg-amber-50' 
                          : rank === 2 
                          ? 'bg-slate-50/60 hover:bg-slate-100/60' 
                          : rank === 3 
                          ? 'bg-orange-50/30 hover:bg-orange-50/60' 
                          : 'hover:bg-blue-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center font-black text-xs px-2.5 py-1 rounded-xl shadow-xs ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900 font-bold'
                            : rank === 3
                            ? 'bg-amber-700 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 font-bold'
                        }`}>
                          {positionText}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.passportPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{student.name}</span>
                              {rank === 1 && (
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black">
                                  Class Valedictorian
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{student.grade} • {student.house || 'Scholar'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                        {student.regNumber}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {average.toFixed(1)}%
                        </div>
                        <div className="w-20 ml-auto bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              average >= 75 ? 'bg-emerald-600' : average >= 60 ? 'bg-blue-600' : average >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, average)}%` }}
                          />
                        </div>
                      </td>

                      {/* CGPA Column */}
                      {isCurrentClassCgpaActive && (
                        <>
                          <td className="py-3 px-4 text-center font-mono font-black text-sm text-indigo-900 bg-indigo-50/40">
                            {gpaResult.gpa.toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-normal block">
                              / {currentCgpaScale.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center bg-indigo-50/20">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              gpaResult.gpa >= (currentCgpaScale === 5.0 ? 4.5 : 3.5)
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : gpaResult.gpa >= (currentCgpaScale === 5.0 ? 3.5 : 3.0)
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : gpaResult.gpa >= (currentCgpaScale === 5.0 ? 2.5 : 2.0)
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}>
                              {gpaResult.classification}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          average >= 75
                            ? 'bg-emerald-100 text-emerald-800 font-black'
                            : average >= 60
                            ? 'bg-blue-100 text-blue-900 font-bold'
                            : average >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {average >= 75 ? 'Distinction' : average >= 60 ? 'Credit' : average >= 50 ? 'Pass' : 'Weak'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPass ? 'Promotion Eligible' : 'Below Pass Threshold'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Ranking status notification footer */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-950 font-medium">
            <AlertCircle className="w-4 h-4 text-blue-900 shrink-0" />
            <span>
              {isAutoRankingOn
                ? 'Automatic ranking is currently ACTIVE. Positions are printed on Student Report Sheets & Parent Portal.'
                : 'Automatic ranking is currently MUTED. Positions are suppressed from student-facing report cards.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleAutoRanking();
              setSuccessMsg(`Automatic ranking toggled ${!isAutoRankingOn ? 'ON' : 'OFF'}.`);
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
            className="px-3 py-1 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-950 transition-colors cursor-pointer text-[11px]"
          >
            {isAutoRankingOn ? 'Disable Ranking' : 'Enable Ranking'}
          </button>
        </div>
      </div>

      {showCustomResultsModal && (
        <CustomResultsManagerModal
          onClose={() => setShowCustomResultsModal(false)}
        />
      )}

      {showBatchUploadModal && (
        <BatchResultsUploadModal
          onClose={() => setShowBatchUploadModal(false)}
        />
      )}

      {showFastScoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex items-start justify-center">
          <div className="bg-slate-100 rounded-3xl max-w-7xl w-full p-4 sm:p-6 shadow-2xl border border-slate-300 relative my-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-900 text-amber-400 font-black">
                  <Award className="w-5 h-5 text-amber-400" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Administrator Multi-Student Scoring & Moderation Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct access to score any classroom and subject. Scores sync in real time to scholar and parent portals.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFastScoreModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs border border-slate-300 cursor-pointer"
              >
                Close Desk
              </button>
            </div>

            <FastClassScoreEntry />
          </div>
        </div>
      )}
    </div>
  );
};
