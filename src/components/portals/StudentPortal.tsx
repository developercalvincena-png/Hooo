import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ArrowLeft,
  UserCheck,
  FileText,
  LayoutDashboard,
  Shield,
  Send,
  Building2,
  Check,
  Download,
  History,
  Layers,
  ChevronRight,
  ExternalLink,
  CalendarDays,
  CheckCircle,
  Menu,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Camera,
  Upload,
  HeartPulse,
  MessageSquare,
  CreditCard,
  FlaskConical,
  TrendingUp,
  LineChart
} from '../RealIcons';
import { HistoricalSessionRecord, HistoricalTermRecord, GradeRecord, Homework, CustomResult } from '../../types';
import { generateStudentHistoricalRecords } from '../../data/schoolData';
import { PortalLoginPage } from '../PortalLoginPage';
import { StudentProgressDashboard } from './student/StudentProgressDashboard';
import { StudentLessonNotesTab } from './student/StudentLessonNotesTab';
import { StudentCbtTab } from './student/StudentCbtTab';
import { StudentLibraryTab } from './student/StudentLibraryTab';
import { VirtualScienceLab } from './VirtualScienceLab';
import { StudentTimetableTab } from './student/StudentTimetableTab';
import { StudentSickBayTab } from './student/StudentSickBayTab';
import { StudentIdCardModal } from './student/StudentIdCardModal';
import { StudentCalvinAiTab } from './student/StudentCalvinAiTab';
import { StudentWaecRegistrationTab } from './student/StudentWaecRegistrationTab';
import { WaecPromptModal } from './student/WaecPromptModal';
import { CertifiedExamResultSlipModal } from './CertifiedExamResultSlipModal';
import { SchoolChatSystem } from '../chat/SchoolChatSystem';
import { CampusGallery } from '../CampusGallery';
import { SchoolLogo } from '../SchoolLogo';
import { Crown, FileArchive, ClipboardList } from 'lucide-react';

interface StudentPortalProps {
  onBackToWebsite: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onBackToWebsite }) => {
  const { 
    student, 
    homeworks, 
    toggleHomeworkStatus, 
    grades, 
    schoolInfo, 
    calculateGrade,
    images,
    assessmentConfig,
    getNextClass,
    availableSessions,
    isStudentAuthenticated,
    logoutStudent,
    changePassword,
    updateStudentPassport,
    lessonNotes,
    getClassRankings,
    acceptTokenPromptAndActivate,
    dismissTokenPrompt,
    houseStandings,
    pressClubPresidentStudentId,
    pressClubEditorStudentIds,
    getTotalUnreadCount,
    officialSignatures,
    resolveReportSheetSignatures,
    calculateGpa,
    isCgpaActiveForClass,
    waecRegistrations,
    waecPromptBroadcast,
    dismissWaecPromptForStudent,
    customResults
  } = useSchool();

  const isSeniorSecondaryWaec = /SSS?\s*[23]/i.test(student.grade || '');
  const currentWaecRegistration = waecRegistrations?.find(
    r => r.studentId === student.id || r.regNumber === student.regNumber
  ) || student.waecRegistration;

  const [showWaecAutoModal, setShowWaecAutoModal] = useState<boolean>(() => {
    if (!isSeniorSecondaryWaec) return false;
    if (!waecPromptBroadcast?.isActive) return false;
    if (student.waecPromptDismissed) return false;
    if (!currentWaecRegistration || currentWaecRegistration.status === 'draft' || currentWaecRegistration.status === 'queried') {
      return true;
    }
    return false;
  });

  const studentChatUnread = getTotalUnreadCount(student.id);

  // Automatic class ranking calculation
  const isAutoRankingOn = assessmentConfig.autoRankingEnabled !== false;
  const currentClassLeaderboard = getClassRankings ? getClassRankings(student.classId || student.grade, assessmentConfig.activeTerm) : [];
  const myRankRecord = currentClassLeaderboard.find(r => r.student.id === student.id);

  const passportInputRef = React.useRef<HTMLInputElement | null>(null);
  const [passportNotice, setPassportNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPassportNotice({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setPassportNotice({ type: 'error', text: 'Image file size must be less than 2.5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        updateStudentPassport(student.id, base64);
        setPassportNotice({ 
          type: 'success', 
          text: 'Official passport photo updated successfully! It is now attached to your academic profile and report sheet.' 
        });
        setTimeout(() => setPassportNotice(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentStudentPass, setCurrentStudentPass] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');
  const [confirmStudentPass, setConfirmStudentPass] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [studentPassMsg, setStudentPassMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // If scholar is not authenticated, delegate to unified PortalLoginPage
  if (!isStudentAuthenticated) {
    return (
      <PortalLoginPage
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'chat' | 'calvin_ai' | 'notes' | 'cbt' | 'library' | 'sciencelab' | 'homework' | 'grades' | 'timetable' | 'sickbay' | 'gallery' | 'waec' | 'bece' | 'ncee'>('overview');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  // Close side menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSideMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when side menu is open
  useEffect(() => {
    if (isSideMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSideMenuOpen]);
  const [selectedSession, setSelectedSession] = useState<string>(assessmentConfig.activeSession || '2026/2027 Academic Session');
  const [reportTerm, setReportTerm] = useState<string>(schoolInfo.activeTerm || '1st Term (Michaelmas Term)');
  // Two report cards per term: mid-term (CA1+CA2) and end-of-term (CA1–3+Exam).
  // Admin publishes each independently via the collation desk.
  const [reportCardKind, setReportCardKind] = useState<'mid' | 'end'>(
    assessmentConfig.dispatchedReportKind ||
      student?.lastCollatedResult?.reportKind ||
      (assessmentConfig.endTermResultsPublished ? 'end' : assessmentConfig.midTermResultsPublished ? 'mid' : 'end')
  );
  const [dismissedSpotlight, setDismissedSpotlight] = useState<boolean>(false);

  useEffect(() => {
    if (assessmentConfig.dispatchedReportKind) {
      setReportCardKind(assessmentConfig.dispatchedReportKind);
    } else if (student?.lastCollatedResult?.reportKind) {
      setReportCardKind(student.lastCollatedResult.reportKind);
    }
  }, [assessmentConfig.dispatchedReportKind, student?.lastCollatedResult?.reportKind]);

  const [viewMode, setViewMode] = useState<'term_sheet' | 'session_progression' | 'bece_result' | 'ncee_result' | 'external_results'>('term_sheet');
  const [modalExamResult, setModalExamResult] = useState<CustomResult | null>(null);

  // External Certified Results & Placement (BECE for JSS 3 - SS 3 & Alumni, NCEE for Primary 5 & JSS 1)
  const isBeceEligible = useMemo(() => {
    if (student.isAlumni) return true;
    const g = (student.grade || '').toLowerCase();
    return g.includes('jss 3') || g.includes('jss3') || 
           g.includes('sss') || g.includes('ss 1') || 
           g.includes('ss 2') || g.includes('ss 3') || 
           g.includes('ss1') || g.includes('ss2') || g.includes('ss3');
  }, [student]);

  const isNceeEligible = useMemo(() => {
    const g = (student.grade || '').toLowerCase();
    return g.includes('primary 5') || g.includes('primary 6') || 
           g.includes('pri 5') || g.includes('pri 6') || 
           g.includes('jss 1') || g.includes('jss1');
  }, [student]);

  const studentCustomResults = useMemo(() => {
    const listFromGlobal = (customResults || []).filter(r => {
      const rId = (r as any).studentId;
      const rReg = (r as any).studentRegNumber;
      return rId === student.id || 
             (rReg && rReg.toLowerCase() === student.regNumber.toLowerCase());
    });
    const fromStudentObj = student.customResults || [];
    const mergedMap = new Map<string, CustomResult>();
    for (const r of listFromGlobal) mergedMap.set(r.id, r);
    for (const r of fromStudentObj) {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    }
    return Array.from(mergedMap.values());
  }, [customResults, student]);

  const studentBeceResult = useMemo(() => {
    return studentCustomResults.find(r => 
      r.examType === 'BECE' || 
      r.title.toLowerCase().includes('bece') || 
      r.title.toLowerCase().includes('junior waec')
    );
  }, [studentCustomResults]);

  const studentNceeResult = useMemo(() => {
    return studentCustomResults.find(r => 
      r.examType === 'NCEE' || 
      r.title.toLowerCase().includes('common entrance') || 
      r.title.toLowerCase().includes('ncee')
    );
  }, [studentCustomResults]);

  // Homework is tracked per scholar: submissions[student.id] overrides the
  // class-level status, and the list is filtered to this scholar's class.
  const myHomeworks = homeworks.filter(hw => {
    // Join by classId when present; legacy records fall back to name matching
    if (hw.targetClassId) {
      return !student.classId || hw.targetClassId === student.classId;
    }
    const target = (hw.targetClass || '').toLowerCase();
    if (!target || target.includes('all')) return true;
    const grade = (student.grade || '').toLowerCase();
    if (!grade) return false;
    return target === grade || target.includes(grade) || grade.includes(target);
  });
  const hwStatusFor = (hw: Homework) => hw.submissions?.[student.id] ?? hw.status;
  const pendingHwCount = myHomeworks.filter(h => hwStatusFor(h) === 'Pending').length;

  // Resiliently resolve student's full historical academic records
  const studentHistory = (student.academicHistory && student.academicHistory.length > 0)
    ? student.academicHistory
    : generateStudentHistoricalRecords(student);

  // Complete available session list across active session and student past records
  const sessionList = Array.from(new Set([
    assessmentConfig.activeSession,
    ...studentHistory.map(h => h.sessionName),
    ...(availableSessions || [])
  ])).filter(Boolean);

  const isCurrentSession = selectedSession === assessmentConfig.activeSession;
  const currentTermKey: '1st Term' | '2nd Term' | '3rd Term' = 
    reportTerm.includes('1st') ? '1st Term' : 
    reportTerm.includes('2nd') ? '2nd Term' : '3rd Term';
  const is3rdTerm = currentTermKey === '3rd Term';

  // Historical session data if user selected a past session
  const historicalSession = !isCurrentSession 
    ? (studentHistory.find(h => h.sessionName === selectedSession) || studentHistory[0])
    : undefined;

  const historicalTermRecord = historicalSession?.terms?.[currentTermKey];

  // Dynamic values tailored to the selected session & term
  const displayClass = historicalSession ? historicalSession.classEnrolled : student.grade;

  // Records are stored on the 10/10/10/70 scale; when viewing a past term
  // we project that term's total onto the current CA/Exam split.
  const projectToTermScale = (g: GradeRecord, termKey: '1st Term' | '2nd Term' | '3rd Term'): GradeRecord => {
    const tot = termKey === '1st Term'
      ? (g.term1Total ?? g.total)
      : termKey === '2nd Term'
      ? (g.term2Total ?? g.total)
      : (g.term3Total ?? g.total);
    const caEach = Math.min(10, Math.max(0, Math.round(tot * 0.1)));
    const exam = Math.max(0, tot - caEach * 3);
    const { grade, remark } = calculateGrade(tot);
    return { ...g, ca1: caEach, ca2: caEach, ca3: caEach, exam, total: tot, grade, remark };
  };

  const displayGrades: GradeRecord[] = historicalTermRecord
    ? historicalTermRecord.grades
    : grades.map(g => projectToTermScale(g, currentTermKey));

  const displayTermAverage = historicalTermRecord
    ? historicalTermRecord.termAverage
    : (currentTermKey === '1st Term'
        ? (student.term1Average ?? student.termAverage)
        : currentTermKey === '2nd Term'
        ? (student.term2Average ?? student.termAverage)
        : (student.term3Average ?? student.termAverage));

  const displayAttendance = historicalTermRecord
    ? `${historicalTermRecord.attendanceDays} / ${historicalTermRecord.totalSchoolDays} Days (${Math.round((historicalTermRecord.attendanceDays / historicalTermRecord.totalSchoolDays) * 100)}%)`
    : `${student.attendanceDays ?? 0} / ${student.totalSchoolDays ?? 0} Days (${student.totalSchoolDays
        ? Math.round(((student.attendanceDays ?? 0) / student.totalSchoolDays) * 1000) / 10
        : 0}%)`;

  const displayAnnualAverage = historicalSession
    ? historicalSession.annualAverage
    : (student.cumulativeAnnualAverage ?? displayTermAverage);

  const displayIsPass = displayAnnualAverage >= assessmentConfig.promotionPassMarkPercent;

  const displayPromotionStatus = historicalSession
    ? historicalSession.promotionStatus
    : (student.promotionStatus || (displayIsPass ? 'Promoted' : 'Repeat'));

  // Publication gate — applies only to the live session; archives always show.
  const midPublished = !!assessmentConfig.midTermResultsPublished;
  const endPublished = !!assessmentConfig.endTermResultsPublished;
  const isMidSheet = isCurrentSession && reportCardKind === 'mid';
  const kindPublished = !isCurrentSession || (isMidSheet ? midPublished : endPublished);

  // Mid-term card = CA1 + CA2 (out of 20) rescaled to a percentage.
  const reportGrades: GradeRecord[] = isMidSheet
    ? displayGrades.map(g => {
        const midTotal = (g.ca1 ?? 0) + (g.ca2 ?? 0);
        const pct = Math.round(midTotal * 5);
        const gi = calculateGrade(pct);
        return { ...g, total: pct, grade: gi.grade, remark: gi.remark };
      })
    : displayGrades;

  const displayPromotedTo = historicalSession
    ? (historicalSession.promotedToGrade || getNextClass(historicalSession.classEnrolled))
    : (student.promotedToGrade || student.promotionTargetClass || getNextClass(student.grade));

  const displayTeacherRemark = historicalTermRecord?.teacherRemark || 
    (currentTermKey === '1st Term' 
      ? 'Commendable attendance and active participation in classroom STEM discussions.'
      : currentTermKey === '2nd Term'
      ? 'Consistent academic diligence, thoughtful analytical contributions, and exemplary peer teamwork.'
      : `${student.name} demonstrates phenomenal grasp of STEM concepts and actively coaches peers during laboratory practicals. High recommendation.`);

  const displayPrincipalRemark = historicalTermRecord?.principalRemark ||
    (currentTermKey === '1st Term'
      ? 'Solid foundational start to the academic session. Commended by the Faculty.'
      : currentTermKey === '2nd Term'
      ? 'Consistent academic diligence and commendable character. Keep up the high standard.'
      : (displayIsPass 
          ? `PROMOTED TO ${displayPromotedTo.toUpperCase()} ON ACADEMIC MERIT.`
          : 'REPEAT CURRENT CLASS RECOMMENDED TO STRENGTHEN FOUNDATIONS.'));

  const handleDownloadHtmlResult = () => {
    const effectiveLogo = images?.logo || '';
    const resolvedSigs = resolveReportSheetSignatures(student.grade);
    const primarySig = resolvedSigs.primary;
    const secondarySig = resolvedSigs.secondary;

    const endorsementTitle = `${primarySig.label.replace(/Signature.*$/i, '').trim() || 'Executive'} Endorsement`;
    const endorsementAuthor = `— ${primarySig.name} (${primarySig.title})`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${schoolInfo.name} - Official Result Sheet - ${student.name} - ${selectedSession}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #0f172a; background: #ffffff; }
    .header { border-bottom: 3px double #1e3a8a; padding-bottom: 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .header-logo { width: 85px; height: 85px; object-fit: contain; }
    .header-info { text-align: center; flex: 1; }
    .school-title { font-size: 26px; font-weight: 900; color: #1e3a8a; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .school-sub { font-size: 13px; color: #475569; margin: 3px 0; }
    .school-contact { font-size: 13px; font-weight: bold; color: #0f172a; margin: 3px 0; }
    .badge-official { display: inline-block; padding: 6px 12px; background: #dbeafe; color: #1e40af; font-weight: 800; font-size: 12px; border-radius: 6px; text-transform: uppercase; }
    .badge-archive { display: inline-block; padding: 6px 12px; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 12px; border-radius: 6px; text-transform: uppercase; margin-top: 4px; }
    .title-banner { background: #1e3a8a; color: #ffffff; text-align: center; padding: 10px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; border-radius: 6px; margin-bottom: 18px; }
    .student-section { display: flex; align-items: stretch; gap: 16px; margin-bottom: 22px; }
    .student-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; background: #f8fafc; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; align-items: center; }
    .student-grid div strong { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .student-grid div span { font-size: 13px; font-weight: bold; color: #0f172a; }
    .passport-container { width: 95px; height: 115px; border: 2px solid #1e3a8a; border-radius: 8px; background: #ffffff; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-sizing: border-box; }
    .passport-container img { width: 100%; height: 88px; object-fit: cover; border-radius: 5px; display: block; }
    .passport-container .passport-label { font-size: 7.5px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .passport-placeholder { width: 95px; height: 115px; border: 1.5px dashed #94a3b8; border-radius: 8px; background: #f8fafc; padding: 8px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-sizing: border-box; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 12px; }
    th { background: #f1f5f9; color: #1e293b; font-weight: 800; border: 1px solid #cbd5e1; padding: 9px 8px; text-align: center; text-transform: uppercase; font-size: 11px; }
    th.sub-col { text-align: left; padding-left: 12px; }
    td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
    td.sub-col { text-align: left; font-weight: bold; padding-left: 12px; color: #0f172a; }
    .grade-badge { font-weight: 900; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .promotion-card { border: 2px solid ${displayIsPass ? '#16a34a' : '#dc2626'}; border-radius: 8px; padding: 16px; background: ${displayIsPass ? '#f0fdf4' : '#fef2f2'}; margin-bottom: 22px; text-align: center; }
    .summary-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 12px; }
    .remark-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #fbfbfb; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #94a3b8; text-align: center; font-size: 12px; }
    .sig-line { border-top: 1px solid #334155; margin-top: 45px; padding-top: 6px; font-weight: bold; }
    @media print {
      body { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="header">
    ${effectiveLogo ? `<img src="${effectiveLogo}" alt="Stanbax Logo" class="header-logo" onerror="this.style.display='none'" />` : '<div style="width:85px;height:85px;border-radius:50%;background:#1e3a8a;color:white;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;">STX</div>'}
    <div class="header-info">
      <h1 class="school-title">${schoolInfo.name}</h1>
      <p class="school-sub">${schoolInfo.location}</p>
      <p class="school-contact">Official Phone: ${schoolInfo.phone} &bull; Admissions Hotline: ${schoolInfo.admissionsPhone}</p>
      <p class="school-sub">Government Approved &bull; WAEC/NECO Examination Centre No: 421098</p>
    </div>
    <div style="text-align: right;">
      <span class="badge-official">CERTIFIED RECORD</span>
      ${!isCurrentSession ? '<br/><span class="badge-archive">ARCHIVED SESSION</span>' : ''}
    </div>
  </div>

  <div class="title-banner">
    ${isMidSheet
      ? `Mid-Term Continuous Assessment Report &mdash; 1st &amp; 2nd CA (${reportTerm} &bull; ${selectedSession})`
      : `Continuous Assessment &amp; Terminal Academic Progress Report (${reportTerm} &bull; ${selectedSession})`}
  </div>

  <div class="student-section">
    ${student.passportPhoto ? `
      <div class="passport-container">
        <img src="${student.passportPhoto}" alt="${student.name}" />
        <span class="passport-label">OFFICIAL PASSPORT</span>
      </div>
    ` : `
      <div class="passport-placeholder">
        <span style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">AFFIX</span>
        <span style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">PASSPORT</span>
      </div>
    `}
    <div class="student-grid">
      <div>
        <strong>Scholar Name</strong>
        <span>${student.name}</span>
      </div>
      <div>
        <strong>Student Reg No.</strong>
        <span style="font-family: monospace;">${student.regNumber}</span>
      </div>
      <div>
        <strong>Class Enrolled</strong>
        <span>${displayClass}</span>
      </div>
      <div>
        <strong>Academic Session</strong>
        <span>${selectedSession}</span>
      </div>
      ${isCgpaActiveForClass(displayClass) ? `
      <div>
        <strong>Cumulative CGPA</strong>
        <span style="color: #1e3a8a; font-weight: 900;">
          ${calculateGpa(reportGrades).gpa.toFixed(2)} / ${calculateGpa(reportGrades).scale.toFixed(1)} (${calculateGpa(reportGrades).classification})
        </span>
      </div>
      ` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="sub-col">Curriculum Subject</th>
        <th>1st CA (${assessmentConfig.ca1Max ?? 10})</th>
        <th>2nd CA (${assessmentConfig.ca2Max ?? 10})</th>
        ${isMidSheet ? '' : `<th>3rd CA (${assessmentConfig.ca3Max ?? 10})</th>
        <th>Exam (${assessmentConfig.examMax ?? 70})</th>`}
        <th>${isMidSheet ? 'Mid Total (20)' : 'Term Total (100)'}</th>
        <th>Grade</th>
        ${isCgpaActiveForClass(displayClass) ? `<th>GP (${calculateGpa(reportGrades).scale.toFixed(1)} Pt)</th>` : ''}
        ${is3rdTerm && !isMidSheet ? '<th>T1 (100)</th><th>T2 (100)</th><th>Annual Avg</th>' : ''}
        <th>Faculty Remark</th>
      </tr>
    </thead>
    <tbody>
      ${reportGrades.map(g => {
        const gInfo = calculateGrade(g.total);
        const t1 = g.term1Total ?? Math.max(70, g.total - 3);
        const t2 = g.term2Total ?? Math.max(72, g.total + 2);
        const t3 = g.term3Total ?? g.total;
        const ann = g.annualAverage ?? Math.round((t1 + t2 + t3) / 3);
        const isClassCgpa = isCgpaActiveForClass(displayClass);
        const scaleVal = calculateGpa(reportGrades).scale;
        const gpVal = ((gInfo.gradePoint ?? 0) * (scaleVal === 4.0 ? 0.8 : 1.0)).toFixed(2);
        return `<tr>
          <td class="sub-col">${g.subject}</td>
          <td>${g.ca1}</td>
          <td>${g.ca2}</td>
          ${isMidSheet ? '' : `<td>${g.ca3 ?? 8}</td>
          <td>${g.exam}</td>`}
          <td style="font-weight: 800; color: #1e3a8a;">${isMidSheet ? `${(g.ca1 ?? 0) + (g.ca2 ?? 0)}/20 (${g.total}%)` : `${g.total}%`}</td>
          <td><span class="grade-badge">${g.grade || gInfo.grade}</span></td>
          ${isClassCgpa ? `<td style="font-weight: 900; color: #1e3a8a; background: #f0fdf4;">${gpVal}</td>` : ''}
          ${is3rdTerm && !isMidSheet ? `<td>${t1}%</td><td>${t2}%</td><td style="font-weight: 900; color: #0f172a; background: #fef3c7;">${ann}%</td>` : ''}
          <td style="font-style: italic;">${g.remark || gInfo.remark}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  ${is3rdTerm ? `
  <div class="promotion-card">
    <h3 style="margin: 0 0 6px 0; font-size: 16px; text-transform: uppercase; color: ${displayIsPass ? '#166534' : '#991b1b'};">
      ${displayIsPass ? 'Academic Promotion Granted' : 'Promotion Pass Mark Not Attained'}
    </h3>
    <p style="margin: 4px 0; font-size: 13px; color: #334155;">
      3-Term Cumulative Annual Average: <strong>${displayAnnualAverage}%</strong> &bull; Minimum Pass Benchmark: <strong>${assessmentConfig.promotionPassMarkPercent}%</strong>
    </p>
    <div style="margin-top: 8px; font-weight: 800; font-size: 14px; color: ${displayIsPass ? '#15803d' : '#b91c1c'};">
      ${displayIsPass 
        ? `Status: PROMOTED TO NEXT CLASS &bull; Proceeding to: ${displayPromotedTo}`
        : 'Status: REPEAT CURRENT CLASS TO CONSOLIDATE FOUNDATIONAL COMPETENCE'
      }
    </div>
  </div>
  ` : `
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 22px; display: flex; justify-content: space-around; font-size: 12px;">
    <div><strong>Term Continuous Assessment Average:</strong> <span style="font-size: 14px; font-weight: bold; color: #1e3a8a;">${displayTermAverage}%</span></div>
    <div><strong>Attendance Record:</strong> <span>${displayAttendance}</span></div>
    <div><strong>Academic Standing:</strong> <span>Distinction Rank</span></div>
  </div>
  `}

  <div class="summary-box">
    <div class="remark-card">
      <strong style="color: #1e3a8a;">Class Master's Assessment</strong>
      <p style="margin: 6px 0; font-style: italic;">"${displayTeacherRemark}"</p>
      <div style="font-size: 11px; font-weight: bold; color: #475569;">— Faculty Form Tutor</div>
    </div>
    <div class="remark-card">
      <strong style="color: #1e3a8a;">${endorsementTitle}</strong>
      <p style="margin: 6px 0; font-style: italic;">"${displayPrincipalRemark}"</p>
      <div style="font-size: 11px; font-weight: bold; color: #475569;">${endorsementAuthor}</div>
    </div>
  </div>

  <div class="signatures">
    <div>
      <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center;">
        <span style="font-family: cursive; font-size: 18px; color: #1e3a8a; opacity: 0.85;">Certified Form Tutor</span>
      </div>
      <div class="sig-line">Class Master / Tutor</div>
    </div>

    <div>
      <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center;">
        ${primarySig.signatureUrl ? `<img src="${primarySig.signatureUrl}" style="max-height: 46px; max-width: 140px; object-fit: contain;" alt="${primarySig.name} Signature" />` : `<span style="font-family: cursive; font-size: 18px; color: #1e3a8a;">${primarySig.name}</span>`}
      </div>
      <div class="sig-line">
        ${primarySig.name}<br>
        <span style="font-size: 10px; font-weight: normal; color: #64748b;">${primarySig.title}</span>
      </div>
    </div>

    ${secondarySig ? `
    <div>
      <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center;">
        ${secondarySig.isOfficialSeal
          ? `<div style="width: 44px; height: 44px; border: 2px double #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; color: #1e3a8a; text-transform: uppercase;">SEAL</div>`
          : secondarySig.signatureUrl
          ? `<img src="${secondarySig.signatureUrl}" style="max-height: 46px; max-width: 140px; object-fit: contain;" alt="${secondarySig.name} Signature" />`
          : `<span style="font-family: cursive; font-size: 18px; color: #1e3a8a;">${secondarySig.name}</span>`}
      </div>
      <div class="sig-line">
        ${secondarySig.name}<br>
        <span style="font-size: 10px; font-weight: normal; color: #64748b;">${secondarySig.title}</span>
      </div>
    </div>
    ` : ''}
  </div>

  <div style="margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    Official Electronic Result Transcript generated by ${schoolInfo.name}. Phone: ${schoolInfo.phone} &bull; Location: ${schoolInfo.location}.
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanSession = selectedSession.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanTerm = currentTermKey.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Stanbax_${student.name.replace(/\s+/g, '_')}_Official_Result_${cleanSession}_${cleanTerm}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const studentModules = [
    { 
      id: 'overview' as const, 
      label: 'Overview & Highlights', 
      badge: 'Dashboard',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: LayoutDashboard,
      description: 'Quick snapshot of attendance, GPA, house points & upcoming classes'
    },
    { 
      id: 'progress' as const, 
      label: 'My Academic Progress', 
      badge: 'Growth Analytics',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: TrendingUp,
      description: 'Term-over-term GPA improvements, subject performance trends & velocity'
    },
    { 
      id: 'chat' as const, 
      label: 'Scholar & Faculty Chat Hub', 
      badge: studentChatUnread > 0 ? `${studentChatUnread} New` : 'Class & Clubs',
      badgeColor: studentChatUnread > 0 ? 'bg-rose-500 text-white border-rose-400 font-black animate-pulse' : 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: MessageSquare,
      description: 'Interact with peers, class forums, extracurricular societies & tutors'
    },
    { 
      id: 'calvin_ai' as const, 
      label: 'Calvin AI Tutor', 
      badge: student.calvinAiAccess?.active 
        ? (student.calvinAiAccess.tier === 'premium' ? 'Premium' : 'Active') 
        : 'Get Token',
      badgeColor: student.calvinAiAccess?.active 
        ? (student.calvinAiAccess.tier === 'premium' ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30') 
        : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: GraduationCap,
      description: 'Age & class-tailored AI tutor with deep reasoning, worked steps & exam secrets'
    },
    { 
      id: 'notes' as const, 
      label: 'Teacher Lesson Notes', 
      badge: `${lessonNotes.length} Notes`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: BookOpen,
      description: 'Download study materials, lecture summaries, and diagrams from tutors'
    },
    { 
      id: 'cbt' as const, 
      label: 'CBT Examination & Mock Hall', 
      badge: 'Timed Drills',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      icon: Award,
      description: 'Interactive timed WAEC/NECO multiple-choice tests with instant auto-grading'
    },
    ...(isSeniorSecondaryWaec ? [{
      id: 'waec' as const, 
      label: 'WAEC Bio-Data & 9 Subjects', 
      badge: currentWaecRegistration?.status === 'verified' 
        ? 'Verified' 
        : currentWaecRegistration?.status === 'submitted'
        ? 'Submitted'
        : 'Action Required',
      badgeColor: currentWaecRegistration?.status === 'verified'
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : currentWaecRegistration?.status === 'submitted'
        ? 'bg-blue-400/20 text-blue-300 border-blue-400/30'
        : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
      icon: Award,
      description: 'Official WASSCE bio-data, 3 compulsory core + 6 electives (9 subjects total), and candidate ZIP package'
    }] : []),
    ...(isBeceEligible ? [{
      id: 'bece' as const, 
      label: 'BECE / Junior WAEC Results', 
      badge: studentBeceResult ? 'Certified Slip' : 'Academic Board',
      badgeColor: studentBeceResult 
        ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' 
        : 'bg-blue-400/20 text-blue-300 border-blue-400/30',
      icon: Award,
      description: 'Official Basic Education Certificate Examination result slip, custom subjects & distinctions'
    }] : []),
    ...(isNceeEligible ? [{
      id: 'ncee' as const, 
      label: 'National Common Entrance (NCEE)', 
      badge: studentNceeResult ? 'Placement Slip' : 'Academic Board',
      badgeColor: studentNceeResult 
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
        : 'bg-blue-400/20 text-blue-300 border-blue-400/30',
      icon: Award,
      description: 'Official National Common Entrance Examination scores, percentile aggregate & placement slip'
    }] : []),
    { 
      id: 'library' as const, 
      label: 'Digital Library & E-Textbooks', 
      badge: 'E-Library Lounge',
      badgeColor: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
      icon: BookOpen,
      description: 'Curriculum textbooks, reading lounge, audiobooks, and revision digests'
    },
    { 
      id: 'sciencelab' as const, 
      label: 'Virtual Science Lab Simulator', 
      badge: 'WAEC Practicals',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: FlaskConical,
      description: 'Hands-on practical experiments for Chemistry Titration, Physics Pendulum & Biology Starch'
    },
    { 
      id: 'homework' as const, 
      label: 'Daily Homework', 
      badge: pendingHwCount > 0 ? `${pendingHwCount} Due` : 'All Done',
      badgeColor: pendingHwCount > 0 ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: BookOpen,
      description: 'Subject assignments, project deadlines & homework submission portal'
    },
    { 
      id: 'grades' as const, 
      label: 'Continuous Assessment & Report Sheet', 
      badge: 'Term & Session Results',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      icon: Award,
      description: 'Review terminal CA breakdowns, official report cards & multi-session archive'
    },
    { 
      id: 'timetable' as const, 
      label: 'Weekly Class Timetable', 
      badge: 'Schedule',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Calendar,
      description: 'View period timings, subject classrooms & appointed tutor slots'
    },
    { 
      id: 'sickbay' as const, 
      label: 'Health Bay & Clinic Pass', 
      badge: 'Medical Log',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: HeartPulse,
      description: 'Medical history, on-campus clinic attendance, nursing logs & clinic pass'
    },
    { 
      id: 'gallery' as const, 
      label: 'Campus & Events Gallery', 
      badge: 'Photos',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      icon: Camera,
      description: 'Explore campus facilities, STEM laboratories, sports pavilions & school events'
    },
  ];

  const currentStudentModule = studentModules.find(m => m.id === activeTab) || studentModules[0];
  const CurrentStudentIcon = currentStudentModule.icon;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Nunito',sans-serif]">
      {/* Student Portal Header */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white sticky top-0 z-30 shadow-lg border-b border-blue-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Scholar Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-md border border-amber-300 overflow-hidden">
                {student.passportPhoto ? (
                  <img
                    src={student.passportPhoto}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <button
                type="button"
                onClick={() => passportInputRef.current?.click()}
                title="Update official passport photo"
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-900 hover:bg-blue-800 text-amber-400 rounded-full flex items-center justify-center border border-amber-400/80 shadow-xs cursor-pointer transition active:scale-95"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base md:text-lg tracking-tight truncate">
                  STANBAX SCHOLAR PORTAL
                </span>
                <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-blue-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide border border-amber-400/30 shrink-0">
                  {student.grade}
                </span>
              </div>
              <p className="text-xs text-blue-200 truncate hidden sm:block">
                Logged in as <strong>{student.name}</strong> • Reg: <span className="font-mono text-amber-300">{student.regNumber}</span>
              </p>
            </div>
          </div>

          {/* Corner Menu Bar Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Digital ID Badge Button */}
            <button
              onClick={() => setIsIdCardOpen(true)}
              id="student-id-card-btn"
              className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-blue-700 active:scale-95"
              title="View & Print Official Scholar ID Card"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">ID Card</span>
            </button>

            {/* Corner Side Menu Trigger Button */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              id="student-corner-menu-btn"
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer border border-amber-300 active:scale-95"
              aria-label="Open Scholar Navigation Menu"
            >
              <Menu className="w-4 h-4 text-blue-950 stroke-[2.5]" />
              <span>Menu</span>
            </button>

            <button
              onClick={() => {
                setStudentPassMsg(null);
                setCurrentStudentPass('');
                setNewStudentPass('');
                setConfirmStudentPass('');
                setShowPasswordModal(true);
              }}
              className="hidden sm:flex px-3.5 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer border border-blue-700 shadow-sm"
              title="Change Account Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </button>

            <button
              onClick={() => {
                logoutStudent();
                onBackToWebsite();
              }}
              className="hidden sm:flex px-3.5 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer border border-rose-700/50 shadow-sm"
              title="Sign Out of Scholar Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sleek Active Module Strip (Replaces horizontal tab bar) */}
        <div className="bg-blue-950/90 border-t border-blue-900/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-blue-300 font-bold shrink-0 hidden xs:inline">Current Module:</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 font-extrabold text-xs truncate">
                <CurrentStudentIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentStudentModule.label}</span>
                {currentStudentModule.badge && (
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-400/25 text-amber-200 font-bold ml-1">
                    {currentStudentModule.badge}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors py-0.5 shrink-0"
            >
              <span className="hidden sm:inline">Browse Scholar Modules</span>
              <span className="sm:hidden">Change</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* HIDDEN SIDE MENU DRAWER */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-blue-950/75 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
            onClick={() => setIsSideMenuOpen(false)}
          />

          {/* Slide-out Side Menu from Corner */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md flex z-50">
            <div className="w-full bg-blue-950 text-white shadow-2xl border-l border-blue-800 flex flex-col h-full overflow-hidden">
              {/* Side Menu Header */}
              <div className="p-4 sm:p-5 border-b border-blue-800/80 flex items-center justify-between bg-blue-900/60 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-md shrink-0 overflow-hidden border border-amber-300">
                    {student.passportPhoto ? (
                      <img src={student.passportPhoto} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-sm sm:text-base text-white">SCHOLAR MENU</h2>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-400/30 shrink-0">
                        {student.grade}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-300 truncate">{student.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors cursor-pointer border border-blue-700 shrink-0 ml-2"
                  aria-label="Close Scholar Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scholar Details Card */}
              <div className="px-4 sm:px-5 py-3 bg-blue-900/30 border-b border-blue-800/60 text-xs space-y-1.5 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-blue-300 font-bold shrink-0">Registration No:</span>
                  <span className="font-mono text-amber-300 font-bold text-right truncate">{student.regNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-blue-300 font-bold shrink-0">Class / Arm:</span>
                  <span className="text-white font-bold text-right truncate">{student.grade}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-blue-300 font-bold shrink-0">House / Dorm:</span>
                  {(() => {
                    const matched = houseStandings.find(h => 
                      student.house && (h.name.toLowerCase().includes(student.house.toLowerCase()) || student.house.toLowerCase().includes(h.name.toLowerCase()))
                    ) || houseStandings[0];
                    return (
                      <span className="font-bold flex items-center gap-1.5 text-right truncate" style={{ color: matched?.color || '#34d399' }}>
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: matched?.color || '#34d399' }} />
                        <span className="truncate">{student.house || matched?.name || 'Blue House'}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-2 pb-6">
                <div className="px-2 pb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                    Scholar Portals & Workspaces ({studentModules.length})
                  </span>
                </div>

                {studentModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSideMenuOpen(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-400 text-blue-950 font-black shadow-lg ring-2 ring-amber-300'
                          : 'bg-blue-900/40 hover:bg-blue-900/70 text-slate-100 border border-blue-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-blue-950 text-amber-400'
                              : 'bg-blue-800/80 text-amber-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                  isActive
                                    ? 'bg-blue-950/20 text-blue-950 border-blue-950/30'
                                    : item.badgeColor
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isActive ? 'text-blue-950 font-medium' : 'text-blue-200'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-950' : 'text-blue-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Side Menu Footer Actions */}
              <div className="p-4 border-t border-blue-800 bg-blue-950 space-y-2 shrink-0">
                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    setStudentPassMsg(null);
                    setCurrentStudentPass('');
                    setNewStudentPass('');
                    setConfirmStudentPass('');
                    setShowPasswordModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-blue-700"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    onBackToWebsite();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-blue-700"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>View Public School Website</span>
                </button>

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    logoutStudent();
                    onBackToWebsite();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-rose-700/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sign Out & Exit Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Student Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Alumni Archive Banner if marked as Alumni */}
        {student.isAlumni && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-blue-950 text-white shadow-md border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-amber-300">
                    Distinguished Stanbax Alumni Record
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-extrabold uppercase border border-amber-400/40">
                    Graduated {student.graduationSession || schoolInfo.activeSession || '2026/2027'}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">
                  Welcome, <strong>{student.name}</strong>. Your full academic transcript, cumulative performance archives, and terminal report sheets are permanently preserved. Active continuous assessments and future class updates are archived.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('grades')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-black shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Access Complete Transcript History
            </button>
          </div>
        )}

        {/* Promotion Announcement Banner if upgraded to next session */}
        {student.promotionStatus === 'Promoted' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 text-white shadow-md border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6 text-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-amber-300">
                    Academic Promotion Confirmed!
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase border border-emerald-400/40">
                    New Session Active
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                  Congratulations <strong>{student.name}</strong>! You satisfied the academic benchmark ({student.cumulativeAnnualAverage || 85}%) and have been successfully upgraded to <strong>{student.grade}</strong> for the {assessmentConfig.activeSession}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('grades')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-black shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              View Official Transcript
            </button>
          </div>
        )}

        {/* Press Club Leadership & Editorial Desk Banner */}
        {((student.id === pressClubPresidentStudentId) || (pressClubEditorStudentIds && pressClubEditorStudentIds.includes(student.id))) && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white shadow-md border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <Crown className="w-6 h-6 text-neutral-950 fill-neutral-900" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base text-amber-300">
                    {student.id === pressClubPresidentStudentId ? 'Appointed Press Club President' : 'Nominated Press Club Editor'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/70 text-white text-[10px] font-extrabold uppercase border border-red-400/40">
                    The Stanbax Gazette
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">
                  You are officially authorized to curate, draft, and publish news dispatches to the School News & Blog. {student.id === pressClubPresidentStudentId && 'As President, you can also nominate peer student editors to the editorial board.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onBackToWebsite();
                setTimeout(() => {
                  const el = document.getElementById('news-blog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shrink-0 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Open Press Room & Gazette
            </button>
          </div>
        )}

        {/* Official Dispatched Collated Result Sheet Spotlight — Shown Immediately Upon Scholar Login */}
        {(assessmentConfig.resultsDispatchedToDashboard || Boolean(student.lastCollatedResult)) && !dismissedSpotlight && (() => {
          const collated = student.lastCollatedResult;
          const activeDispatchedKind = assessmentConfig.dispatchedReportKind || collated?.reportKind || reportCardKind;
          const isDispatchedMid = activeDispatchedKind === 'mid';
          const effectiveGrades = (collated?.grades && collated.grades.length > 0 ? collated.grades : reportGrades).map(g => {
            if (isDispatchedMid) {
              const midSum = (g.ca1 ?? 0) + (g.ca2 ?? 0);
              const pct = Math.round(midSum * 5);
              const gi = calculateGrade(pct);
              return { ...g, total: pct, grade: gi.grade, remark: gi.remark, midRaw: midSum };
            }
            const gi = calculateGrade(g.total);
            return { ...g, grade: g.grade || gi.grade, remark: g.remark || gi.remark, midRaw: (g.ca1 ?? 0) + (g.ca2 ?? 0) };
          });
          const effectiveAvg = collated?.termAverage ?? displayTermAverage;
          const effectiveRank = collated?.overallPosition || (myRankRecord ? myRankRecord.positionText : undefined);
          const effectiveTotalInClass = collated?.totalStudentsInClass || currentClassLeaderboard.length || undefined;

          return (
            <div className="rounded-3xl bg-white border-2 border-emerald-600 shadow-xl overflow-hidden animate-fadeIn">
              {/* Top Official Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-blue-950 to-slate-900 text-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Official Collated Result Released</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black uppercase">
                      {isDispatchedMid ? 'Mid-Term Assessment (CA 1 + CA 2)' : 'End-of-Term Examination Dossier'}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      • {collated?.term || assessmentConfig.resultsDispatchedTerm || assessmentConfig.activeTerm} ({collated?.session || assessmentConfig.resultsDispatchedSession || assessmentConfig.activeSession})
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    {student.name} — Official Collated Academic Result ({student.grade})
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl">
                    {assessmentConfig.resultsDispatchMessage ||
                      collated?.broadcastMessage ||
                      `Your official collated academic result for ${assessmentConfig.activeTerm} has been verified and published by the Examination Board.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadHtmlResult}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Print Result Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportCardKind(activeDispatchedKind);
                      setActiveTab('grades');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-black text-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span>Full Report Card View</span>
                  </button>
                </div>
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-200 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Collated Average</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-900">{effectiveAvg}%</span>
                  <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                    {effectiveAvg >= (assessmentConfig.promotionPassMarkPercent || 50) ? 'Passed Benchmark' : 'Below Pass Benchmark'}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Class Standing</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-950">
                    {effectiveRank || 'Ranked'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                    {effectiveTotalInClass ? `Out of ${effectiveTotalInClass} Scholars in ${student.grade}` : student.grade}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Cumulative GPA</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-950">
                    {Number(collated?.cgpa ?? calculateGpa(effectiveGrades).gpa).toFixed(2)} / {Number(collated?.cgpaScale ?? calculateGpa(effectiveGrades).scale).toFixed(1)}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 block mt-0.5">
                    {collated?.classification || calculateGpa(effectiveGrades).classification}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Standing / Status</span>
                  <span className="text-base sm:text-lg font-black text-emerald-800 block truncate">
                    {collated?.promotionStatus || displayPromotionStatus}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                    Reg: {student.regNumber}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black uppercase text-[11px]">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">1st CA ({assessmentConfig.ca1Max ?? 10})</th>
                        <th className="py-3 px-3 text-center">2nd CA ({assessmentConfig.ca2Max ?? 10})</th>
                        {!isDispatchedMid && (
                          <>
                            <th className="py-3 px-3 text-center">3rd CA ({assessmentConfig.ca3Max ?? 10})</th>
                            <th className="py-3 px-3 text-center">Exam ({assessmentConfig.examMax ?? 70})</th>
                          </>
                        )}
                        <th className="py-3 px-3 text-center">{isDispatchedMid ? 'Mid-Term %' : 'Total (100)'}</th>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-4">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {effectiveGrades.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-black text-slate-900">{g.subject}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{g.ca1 ?? 0}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{g.ca2 ?? 0}</td>
                          {!isDispatchedMid && (
                            <>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700">{g.ca3 ?? 0}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700">{g.exam ?? 0}</td>
                            </>
                          )}
                          <td className="py-2.5 px-3 text-center font-black text-blue-950">
                            {isDispatchedMid ? `${g.midRaw}/20 (${g.total}%)` : `${g.total}%`}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              g.grade === 'A1' ? 'bg-emerald-100 text-emerald-800' :
                              g.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                              g.grade.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {g.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-600">{g.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Official Endorsements & Admin-Configured Report Sheet Signatures */}
                {(() => {
                  const sigConfig = resolveReportSheetSignatures(student.grade);
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block mb-1">
                            Form Tutor&apos;s Official Remark
                          </span>
                          <p className="font-bold text-slate-800 italic">
                            &ldquo;{collated?.teacherRemark || displayTeacherRemark}&rdquo;
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 block mb-1">
                            {sigConfig.primary.label} &amp; Endorsement
                          </span>
                          <p className="font-bold text-emerald-950 italic">
                            &ldquo;{collated?.principalRemark || displayPrincipalRemark}&rdquo;
                          </p>
                          <p className="text-[11px] font-black text-slate-900 mt-1">
                            — {sigConfig.primary.name} ({sigConfig.primary.title})
                          </p>
                        </div>
                      </div>

                      {sigConfig.showOnPortal && (
                        <div className={`grid grid-cols-1 ${sigConfig.secondary ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-3 pt-1`}>
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                                {sigConfig.primary.label}
                              </span>
                              <div className="text-xs font-black text-slate-900 mt-0.5">{sigConfig.primary.name}</div>
                              <div className="text-[10px] font-bold text-slate-500">{sigConfig.primary.title}</div>
                            </div>
                            {sigConfig.primary.signatureUrl ? (
                              <img
                                src={sigConfig.primary.signatureUrl}
                                alt={sigConfig.primary.name}
                                className="h-12 max-w-[140px] object-contain shrink-0"
                              />
                            ) : (
                              <span className="text-xs font-serif italic text-blue-900 font-bold shrink-0">
                                {sigConfig.primary.name}
                              </span>
                            )}
                          </div>

                          {sigConfig.secondary && (
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                                  {sigConfig.secondary.label}
                                </span>
                                <div className="text-xs font-black text-slate-900 mt-0.5">{sigConfig.secondary.name}</div>
                                <div className="text-[10px] font-bold text-slate-500">{sigConfig.secondary.title}</div>
                              </div>
                              {sigConfig.secondary.isOfficialSeal ? (
                                <div className="px-3 py-1 rounded-full border-2 border-double border-blue-900 text-blue-900 font-black text-[10px] uppercase tracking-widest shrink-0">
                                  OFFICIAL SEAL
                                </div>
                              ) : sigConfig.secondary.signatureUrl ? (
                                <img
                                  src={sigConfig.secondary.signatureUrl}
                                  alt={sigConfig.secondary.name}
                                  className="h-12 max-w-[140px] object-contain shrink-0"
                                />
                              ) : (
                                <span className="text-xs font-serif italic text-blue-900 font-bold shrink-0">
                                  {sigConfig.secondary.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

        {/* Scholar Banner & Key Metrics */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black">
              <UserCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Term Attendance</span>
              <p className="text-xl font-black text-blue-950">{student.attendancePercent}%</p>
              <span className="text-[10px] text-emerald-600 font-bold">{student.attendanceDays ?? 58} / {student.totalSchoolDays ?? 59} Days</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Cumulative Average</span>
                {isAutoRankingOn && myRankRecord && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black text-[9px] uppercase">
                    Rank {myRankRecord.positionText}
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-blue-950">{student.termAverage}%</p>
              <span className="text-[10px] text-amber-700 font-bold">
                {isAutoRankingOn && myRankRecord 
                  ? `Position: ${myRankRecord.positionText} of ${currentClassLeaderboard.length} scholars` 
                  : 'Grade: Distinction (A1)'}
              </span>
            </div>
          </div>

          {/* Bursary Clearance & Tuition Pass */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-black">
              <CreditCard className="w-6 h-6 text-purple-200" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Bursary Clearance</span>
              <p className="text-sm font-black text-purple-950 truncate">{student.feeStatus || 'Partially Paid'}</p>
              <span className={`text-[10px] font-bold block ${student.feeStatus === 'Fully Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {student.feeStatus === 'Fully Paid' ? 'Bursary Cleared • Exam Pass' : `₦${(student.feeBalance ?? 80000).toLocaleString()} Balance`}
              </span>
            </div>
          </div>

          {(() => {
            const matchedHouse = houseStandings.find(h => 
              student.house && (h.name.toLowerCase().includes(student.house.toLowerCase()) || student.house.toLowerCase().includes(h.name.toLowerCase()))
            ) || houseStandings[0];
            const sortedHouses = [...houseStandings].sort((a, b) => b.points - a.points);
            const houseRank = matchedHouse ? sortedHouses.findIndex(h => h.name === matchedHouse.name) + 1 : 1;
            const houseColor = matchedHouse?.color || '#2563eb';
            const houseName = student.house || matchedHouse?.name || 'Unassigned House';
            const housePoints = matchedHouse?.points ?? 1420;

            return (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-black shadow-xs shrink-0"
                  style={{ backgroundColor: houseColor }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Athletic House Team</span>
                  <p className="text-sm font-black text-blue-950 truncate" title={houseName}>{houseName}</p>
                  <span className="text-[10px] text-indigo-600 font-bold block">
                    Rank #{houseRank} ({housePoints.toLocaleString()} pts)
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black">
              <BookOpen className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Active Homeworks</span>
              <p className="text-xl font-black text-blue-950">{pendingHwCount} Pending</p>
              <span className="text-[10px] text-emerald-600 font-bold">Total {myHomeworks.length} assigned</span>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Affirmation & Schedule */}
              <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black uppercase tracking-wider">
                    School Virtue of the Week: Perseverance & Curiosity
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    "Excellence is not an act, but a diligent daily habit."
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
                    {student.name.split(' ')[0]}, you are currently in strong academic standing in {student.grade}. Prepare diligently for your upcoming continuous assessment milestones and practical sessions.
                  </p>
                </div>
              </div>

              {/* My Progress & GPA Improvement Snapshot Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Academic Growth
                      </span>
                      <span className="text-xs text-blue-200">
                        Term-over-Term Analytics
                      </span>
                    </div>
                    <h4 className="font-black text-base text-white mt-1">
                      My Academic Progress & Recharts Trajectory
                    </h4>
                    <p className="text-xs text-blue-100/80 leading-relaxed mt-0.5">
                      Current Term Average: <strong>{student.termAverage}%</strong> &bull; CGPA: <strong>{calculateGpa(grades).gpa.toFixed(2)}</strong> ({calculateGpa(grades).classification})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('progress')}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                >
                  <TrendingUp className="w-4 h-4 text-slate-950" />
                  <span>Open Progress Dashboard →</span>
                </button>
              </div>

              {/* Admin Calvin AI Token Activation Prompt Banner */}
              {student.tokenPrompt && student.tokenPrompt.status === 'pending' && (
                <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border-2 border-indigo-400/80 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Administrative Token Activation Prompt</span>
                        </span>
                        {student.tokenPrompt.tier && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            {student.tokenPrompt.tier === 'premium' ? 'Premium Masterclass' : 'Regular Pass'}
                          </span>
                        )}
                        {student.tokenPrompt.durationLabel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                            {student.tokenPrompt.durationLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        Calvin AI Access Prompt from the School Administration
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl font-medium">
                        {student.tokenPrompt.message}
                      </p>
                      {student.tokenPrompt.tokenCode && (
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <span className="text-slate-500 font-bold">Allocated Voucher:</span>
                          <code className="bg-white px-3 py-1 rounded-xl border border-indigo-200 font-mono font-black text-indigo-700 text-xs shadow-xs">
                            {student.tokenPrompt.tokenCode}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const res = acceptTokenPromptAndActivate(student.id);
                          setActiveTab('calvin_ai');
                        }}
                        className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-300" />
                        <span>Activate & Launch Calvin AI →</span>
                      </button>
                      <button
                        onClick={() => dismissTokenPrompt(student.id)}
                        className="px-3.5 py-3 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-white/60 text-xs font-bold transition-all cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WAEC / WASSCE Bio-Data & 9-Subject Registration Prompt Banner for SS2 & SS3 Students */}
              {isSeniorSecondaryWaec && (
                <div className={`rounded-3xl p-5 sm:p-6 shadow-md border-2 relative overflow-hidden transition-all ${
                  currentWaecRegistration?.status === 'verified'
                    ? 'bg-linear-to-r from-emerald-950 via-teal-950 to-stone-900 border-emerald-500/50 text-white'
                    : currentWaecRegistration?.status === 'submitted'
                    ? 'bg-linear-to-r from-blue-950 via-indigo-950 to-stone-900 border-blue-400/50 text-white'
                    : 'bg-linear-to-r from-amber-500/15 via-rose-500/10 to-amber-500/20 border-amber-400/80 text-stone-900'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>Official WAEC Portal &bull; {student.grade}</span>
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          currentWaecRegistration?.status === 'verified'
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : currentWaecRegistration?.status === 'submitted'
                            ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                            : 'bg-rose-500 text-white animate-pulse'
                        }`}>
                          {currentWaecRegistration?.status === 'verified'
                            ? 'Bio-Data Verified'
                            : currentWaecRegistration?.status === 'submitted'
                            ? 'Submitted (Pending Clearance)'
                            : 'Mandatory Registration Required'}
                        </span>
                        {waecPromptBroadcast?.deadline && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                            Deadline: {new Date(waecPromptBroadcast.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>

                      <h4 className={`font-black text-base ${
                        currentWaecRegistration?.status === 'verified' || currentWaecRegistration?.status === 'submitted'
                          ? 'text-white'
                          : 'text-stone-900'
                      }`}>
                        {currentWaecRegistration?.status === 'verified'
                          ? 'Your Official WAEC Bio-Data & 9 Subjects Are Fully Cleared'
                          : currentWaecRegistration?.status === 'submitted'
                          ? 'WAEC Bio-Data Submitted — Awaiting Final Examination Office Verification'
                          : 'Mandatory: Submit WAEC Bio-Data, National NIN & 9 Subjects'}
                      </h4>

                      <p className={`text-xs leading-relaxed ${
                        currentWaecRegistration?.status === 'verified' || currentWaecRegistration?.status === 'submitted'
                          ? 'text-stone-300'
                          : 'text-stone-700'
                      }`}>
                        {currentWaecRegistration?.status === 'verified'
                          ? `Official Candidate Index No: ${currentWaecRegistration.candidateNumber || 'Allocated'}. You can download your complete registration package (broadsheet, bio-data & photo) in a ZIP file.`
                          : 'All SS 2 and SS 3 scholars must provide: Surname, First name, Middle name, DOB, Gender, State, LGA, Religion, Phone, 11-digit NIN, Home Address, Email, Department, and select 9 subjects (English, Maths, Civic + 6 electives).'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab('waec')}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Award className="w-4 h-4" />
                        <span>{currentWaecRegistration ? 'Open WAEC Bio-Data & Slip' : 'Fill WAEC Details Now →'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BECE / Junior WAEC Certified Result Card (JSS 3 - SS 3 & Alumni) */}
              {(isBeceEligible || studentBeceResult) && (
                <div className="rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-amber-300 bg-linear-to-r from-amber-50 via-white to-amber-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-xs shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-950 font-black text-[10px] uppercase tracking-wider border border-amber-400/50">
                            BECE / Junior WAEC Archive
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {student.isAlumni ? 'Permanent Alumni Dossier' : `Cohort: ${student.grade}`}
                          </span>
                        </div>
                        <h4 className="font-black text-base text-slate-900 mt-0.5">
                          {studentBeceResult ? studentBeceResult.title : 'Basic Education Certificate Examination (BECE) Dossier'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {studentBeceResult && (
                        <button
                          type="button"
                          onClick={() => setModalExamResult(studentBeceResult)}
                          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Official Statement Slip</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {studentBeceResult ? (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-white border border-amber-200 text-xs">
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Exam Candidate No</span>
                          <span className="font-mono font-bold text-blue-950 text-[11px]">{studentBeceResult.candidateNumber || 'Allocated'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Session & Diet</span>
                          <span className="font-bold text-slate-800 text-[11px]">{studentBeceResult.session}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Overall Evaluation</span>
                          <span className="font-black text-emerald-800 text-[11px]">{studentBeceResult.overallScore || 'Passed'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Custom Subjects</span>
                          <span className="font-bold text-slate-800 text-[11px]">{studentBeceResult.subjectBreakdown?.length || 0} Subjects Recorded</span>
                        </div>
                      </div>

                      {/* Subject Chips */}
                      {studentBeceResult.subjectBreakdown && studentBeceResult.subjectBreakdown.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {studentBeceResult.subjectBreakdown.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-950 text-[11px] font-bold border border-amber-200 flex items-center gap-1.5">
                              <span>{s.subject}:</span>
                              <strong className="text-blue-900">{s.grade || s.score}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {studentBeceResult.placementStatus && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Placement Clearance: <strong>{studentBeceResult.placementStatus}</strong></span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Official Examination Ledger &bull; Authenticated by Academic Registry (Alterable by Admin Only)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('grades');
                            setViewMode('bece_result');
                          }}
                          className="font-bold text-blue-900 hover:underline cursor-pointer"
                        >
                          Open in Grades Tab →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">
                        Official BECE results with custom subjects will remain permanently available in this portal once posted by the School Academic Registry.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Scholars in JSS 3 through SS 3 and Alumni have permanent verification access. Alterations can only be performed by the Examination Administration.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* National Common Entrance Examination (NCEE) Card (Primary 5 & JSS 1) */}
              {(isNceeEligible || studentNceeResult) && (
                <div className="rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-emerald-300 bg-linear-to-r from-emerald-50 via-white to-teal-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-black text-[10px] uppercase tracking-wider border border-emerald-300">
                            National Common Entrance (NCEE)
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Primary 5 & JSS 1 Official Ledger
                          </span>
                        </div>
                        <h4 className="font-black text-base text-slate-900 mt-0.5">
                          {studentNceeResult ? studentNceeResult.title : 'National Common Entrance Examination & Placement Dossier'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {studentNceeResult && (
                        <button
                          type="button"
                          onClick={() => setModalExamResult(studentNceeResult)}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Official Placement Slip</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {studentNceeResult ? (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs">
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Exam Candidate No</span>
                          <span className="font-mono font-bold text-blue-950 text-[11px]">{studentNceeResult.candidateNumber || 'Allocated'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Entrance Aggregate</span>
                          <span className="font-black text-emerald-800 text-[11px]">{studentNceeResult.overallScore || 'Cleared'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Percentile Rank</span>
                          <span className="font-bold text-slate-800 text-[11px]">{studentNceeResult.aggregate || 'Top Percentile'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400">Custom Subjects</span>
                          <span className="font-bold text-slate-800 text-[11px]">{studentNceeResult.subjectBreakdown?.length || 0} Test Papers</span>
                        </div>
                      </div>

                      {/* Subject Chips */}
                      {studentNceeResult.subjectBreakdown && studentNceeResult.subjectBreakdown.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {studentNceeResult.subjectBreakdown.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-950 text-[11px] font-bold border border-emerald-200 flex items-center gap-1.5">
                              <span>{s.subject}:</span>
                              <strong className="text-emerald-900">{s.grade || s.score}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {studentNceeResult.placementStatus && (
                        <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Admission Placement: <strong>{studentNceeResult.placementStatus}</strong></span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Official Entrance Board Ledger &bull; Authenticated by Academic Registry (Alterable by Admin Only)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('grades');
                            setViewMode('ncee_result');
                          }}
                          className="font-bold text-emerald-800 hover:underline cursor-pointer"
                        >
                          Open in Grades Tab →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white/80 border border-emerald-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">
                        Official National Common Entrance Examination (NCEE) scores and junior secondary placement slips will appear here for Primary 5 and JSS 1 scholars.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Permanent entrance records are preserved in the scholar portal. Only authorized administrators can alter scores.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Calvin AI Companion Banner */}
              <div className="bg-linear-to-r from-indigo-900 via-purple-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xs border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-7 h-7 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-white">Calvin AI Academic Tutor</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 font-semibold">
                        {student.calvinAiAccess?.active ? (student.calvinAiAccess.tier === 'premium' ? 'Premium Active' : 'Regular Active') : 'Token Required'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Tailored specifically for {student.grade} syllabus with step-by-step guidance & exam strategies.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('calvin_ai')}
                  className="relative z-10 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center shrink-0 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{student.calvinAiAccess?.active ? 'Launch Calvin AI →' : 'Redeem Token / Launch →'}</span>
                </button>
              </div>

              {/* Homework quick cards */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-800" />
                    <span>Priority Tasks Due This Week</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('homework')}
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 cursor-pointer"
                  >
                    View All Homework →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myHomeworks.slice(0, 2).map((hw) => (
                    <div key={hw.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase">
                          {hw.subject}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hwStatusFor(hw) === 'Submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hwStatusFor(hw)}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900">{hw.title}</h5>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Due: {hw.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar quick info */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>My Enrolled Societies</span>
                </h4>
                <div className="space-y-2.5">
                  {(student.clubs && student.clubs.length > 0 
                    ? student.clubs 
                    : ['Literary & Debating Society', 'Junior Engineers & Technicians (JETS) Club']
                  ).map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-800" />
                      <span className="text-xs font-bold text-slate-800">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-800" />
                  <span>Academic Library & ICT Pass</span>
                </h4>
                <div className="p-3 rounded-xl bg-blue-50 text-blue-950 text-xs space-y-1">
                  <p className="font-bold">Main Digital Learning Resource Bay</p>
                  <p className="text-[11px] text-blue-700">Clearance: Full E-Library & STEM Access</p>
                  <p className="text-[11px] text-blue-700">Hours: 7:30 AM – 4:30 PM Daily</p>
                </div>
              </div>

              {/* Academic History & Previous Sessions Snapshot */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-500" />
                    <span>Academic History</span>
                  </h4>
                  <button
                    onClick={() => {
                      setActiveTab('grades');
                      setViewMode('session_progression');
                    }}
                    className="text-[11px] font-bold text-blue-800 hover:text-blue-950 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {studentHistory.slice(0, 2).map((hist, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedSession(hist.sessionName);
                        setActiveTab('grades');
                        setViewMode('term_sheet');
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 group-hover:text-blue-900">{hist.sessionName}</span>
                        <span className="font-mono text-[11px] font-black text-emerald-700">{hist.annualAverage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{hist.classEnrolled}</span>
                        <span className="text-blue-800 font-bold group-hover:underline flex items-center gap-1">
                          <span>{hist.promotionStatus}</span>
                          <ChevronRight className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MY ACADEMIC PROGRESS & PERFORMANCE TRENDS (RECHARTS VISUAL DASHBOARD) */}
        {activeTab === 'progress' && (
          <StudentProgressDashboard
            student={student}
            studentHistory={studentHistory}
            onOpenCalvinAi={() => setActiveTab('calvin_ai')}
            onOpenGradesTab={() => setActiveTab('grades')}
          />
        )}

        {/* TAB: SCHOLAR & FACULTY CHAT HUB */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 text-white p-6 rounded-3xl shadow-sm border border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  Student Community Network
                </span>
                <h2 className="text-xl font-black">Stanbax Scholar Discussion & Society Hub</h2>
                <p className="text-xs text-blue-200 max-w-xl">
                  Collaborate with your {student.grade} classmates, discuss assignments in co-curricular clubs, and message peers privately.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-xs text-indigo-200 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">Private Peer Chat</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-xs text-amber-200 shrink-0">
                  <span className="font-medium text-amber-300">Audience:</span>
                  <span className="font-black text-white">
                    {student.chatSettings?.dmPermission === 'classmates_only' ? 'Classmates Only' : 'Anyone'}
                  </span>
                </div>
              </div>
            </div>

            <SchoolChatSystem
              currentUserRole="student"
              currentUserId={student.id}
              currentUserName={student.name}
              currentUserSubtext={`${student.grade} Scholar`}
            />
          </div>
        )}

        {/* TAB: CALVIN AI TUTOR */}
        {activeTab === 'calvin_ai' && (
          <StudentCalvinAiTab student={student} />
        )}

        {/* TAB: TEACHER LESSON NOTES */}
        {activeTab === 'notes' && (
          <StudentLessonNotesTab />
        )}

        {/* TAB: CBT EXAMINATION & MOCK PRACTICE */}
        {activeTab === 'cbt' && (
          <StudentCbtTab />
        )}

        {/* TAB: WAEC / WASSCE BIO-DATA & 9 SUBJECTS REGISTRATION */}
        {activeTab === 'waec' && (
          <StudentWaecRegistrationTab student={student} />
        )}

        {/* TAB: DIGITAL LIBRARY & E-TEXTBOOKS */}
        {activeTab === 'library' && (
          <StudentLibraryTab />
        )}

        {/* TAB: VIRTUAL SCIENCE PRACTICAL SIMULATOR */}
        {activeTab === 'sciencelab' && (
          <VirtualScienceLab />
        )}

        {/* TAB 2: DAILY HOMEWORK */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            {student.isAlumni && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <p className="font-bold">Alumni Status Notice</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    As an alumnus, your terminal assignments are concluded. This archive shows previous class coursework for reference. Ongoing submissions are closed for alumni accounts.
                  </p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-800" />
                  <span>Class Assignments & Projects</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Review assignment requirements, attach work, or toggle completion status for your tutors.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                {pendingHwCount} Pending Submission
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {myHomeworks.map((hw) => (
                <div 
                  key={hw.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-900 font-black text-xs">
                        {hw.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Assigned by {hw.assignedBy}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        hwStatusFor(hw) === 'Graded'
                          ? 'bg-purple-100 text-purple-800'
                          : hwStatusFor(hw) === 'Submitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hwStatusFor(hw)}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">{hw.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.instructions}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-rose-600 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {hw.dueDate}</span>
                      </div>
                      {hw.grade && (
                        <div className="font-black text-purple-700">
                          Grade Awarded: {hw.grade}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleHomeworkStatus(hw.id, student.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                      hwStatusFor(hw) === 'Submitted'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-900 hover:bg-blue-950 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{hwStatusFor(hw) === 'Submitted' ? 'Mark as Unfinished' : 'Submit Assignment'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REPORT SHEET / GRADES */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* Header, Session & Term Switchers, View Mode & Download/Print options */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      isCurrentSession 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {selectedSession}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                      {isCurrentSession ? 'Current Active Session' : 'Archived Academic Session'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mt-1">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span>Academic Performance & Certified Report Sheets</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Viewing records for <strong className="text-slate-700">{displayClass}</strong> • {selectedSession} • {reportTerm}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setViewMode('term_sheet')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        viewMode === 'term_sheet'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Term Sheet</span>
                    </button>
                    <button
                      onClick={() => setViewMode('session_progression')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        viewMode === 'session_progression'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Session Progression</span>
                    </button>

                    {/* BECE Result Mode (JSS 3 - SS 3 & Alumni) */}
                    {(isBeceEligible || studentBeceResult) && (
                      <button
                        onClick={() => setViewMode('bece_result')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                          viewMode === 'bece_result'
                            ? 'bg-amber-400 text-blue-950 font-black shadow-xs ring-1 ring-amber-500'
                            : 'text-amber-950 hover:bg-amber-100/70 bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        <span>BECE Certified Slip</span>
                        {studentBeceResult && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" title="Result Certified" />
                        )}
                      </button>
                    )}

                    {/* National Common Entrance Examination (NCEE) Mode (Primary 5 & JSS 1) */}
                    {(isNceeEligible || studentNceeResult) && (
                      <button
                        onClick={() => setViewMode('ncee_result')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                          viewMode === 'ncee_result'
                            ? 'bg-emerald-700 text-white font-black shadow-xs ring-1 ring-emerald-800'
                            : 'text-emerald-950 hover:bg-emerald-100/70 bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Common Entrance (NCEE)</span>
                        {studentNceeResult && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Result Certified" />
                        )}
                      </button>
                    )}

                    {studentCustomResults.length > 0 && (
                      <button
                        onClick={() => setViewMode('external_results')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                          viewMode === 'external_results'
                            ? 'bg-blue-900 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <FileArchive className="w-3.5 h-3.5" />
                        <span>All Official Slips ({studentCustomResults.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Download Official Result Button */}
                  <button
                    onClick={handleDownloadHtmlResult}
                    disabled={!kindPublished}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    title={kindPublished ? 'Download offline official transcript file' : 'Not yet published by administration'}
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Download Result (.html)</span>
                  </button>

                  {/* Print / Save PDF Button */}
                  <button
                    onClick={() => window.print()}
                    disabled={!kindPublished}
                    className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Session Selector & Term Filters */}
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Academic Session Selector Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    <span>Select Academic Session:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {sessionList.map((sess) => {
                      const isSelected = selectedSession === sess;
                      const isLive = sess === assessmentConfig.activeSession;
                      return (
                        <button
                          key={sess}
                          onClick={() => {
                            setSelectedSession(sess);
                            setViewMode('term_sheet');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                          }`}
                        >
                          <span>{sess}</span>
                          {isLive ? (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              isSelected ? 'bg-amber-400 text-blue-950' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              Active
                            </span>
                          ) : (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
                            }`}>
                              Archive
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Term selector filter */}
                {viewMode === 'term_sheet' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
                      <span>Select Term:</span>
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      {['1st Term (Michaelmas Term)', '2nd Term (Lent Term)', '3rd Term (Trinity Term)'].map(termOption => {
                        const isSelected = reportTerm === termOption;
                        const isSystemActive = isCurrentSession && assessmentConfig.activeTerm === termOption.split(' ')[0] + ' ' + termOption.split(' ')[1];
                        return (
                          <button
                            key={termOption}
                            onClick={() => setReportTerm(termOption)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            <span>{termOption.split(' ')[0]} {termOption.split(' ')[1]}</span>
                            {isSystemActive && (
                              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block align-middle" title="Current Active Term" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Archived Session Notice Banner */}
            {!isCurrentSession && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">
                        Viewing Historical Academic Record: {selectedSession}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                        Archived Ledger
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Class Enrolled during this session: <strong>{displayClass}</strong> • Annual Academic Average: <strong>{displayAnnualAverage}%</strong> ({displayPromotionStatus})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSession(assessmentConfig.activeSession)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors cursor-pointer shrink-0 border border-amber-400/50"
                >
                  Return to Active Session ({assessmentConfig.activeSession})
                </button>
              </div>
            )}

            {/* VIEW MODE 1: TERMINAL REPORT CARD */}
            {viewMode === 'term_sheet' && (
              <>
              {/* Mid-Term / End-of-Term card selector (current session only) */}
              {isCurrentSession && (
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-fit">
                  <button
                    onClick={() => setReportCardKind('mid')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      reportCardKind === 'mid'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {!midPublished && <Lock className="w-3 h-3" />}
                    <span>Mid-Term Report (CA 1 + CA 2)</span>
                  </button>
                  <button
                    onClick={() => setReportCardKind('end')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      reportCardKind === 'end'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {!endPublished && <Lock className="w-3 h-3" />}
                    <span>End-of-Term Report (CA 1–3 + Exam)</span>
                  </button>
                </div>
              )}

              {!kindPublished ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 mt-4">
                    {isMidSheet ? 'Mid-Term' : 'End-of-Term'} Results Not Yet Published
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    The school administration is still collating and moderating scores. This report card will appear here automatically once officially released.
                  </p>
                </div>
              ) : (
              <div id="official-result-sheet" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                {/* Institution and Term Header Banner with Logo, School Name, and Phone Number */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* School Logo */}
                      <div className="shrink-0">
                        <SchoolLogo size="lg" showText={false} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-amber-400">
                          Official Academic Transcript & Continuous Assessment
                        </span>
                        <h4 className="font-black text-xl sm:text-2xl tracking-tight">
                          {schoolInfo.name.toUpperCase()}
                        </h4>
                        <p className="text-xs text-blue-200 flex flex-wrap items-center gap-2">
                          <span>{schoolInfo.location}</span>
                          <span>•</span>
                          <span className="font-bold text-amber-200">Phone: {schoolInfo.phone}</span>
                          <span>•</span>
                          <span>Admissions: {schoolInfo.admissionsPhone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Academic Year and Term Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-left md:text-right shrink-0 space-y-1">
                      <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                        Academic Ledger
                      </div>
                      <div className="text-lg font-black text-white">
                        {selectedSession}
                      </div>
                      <div className="text-xs font-extrabold text-blue-200 bg-blue-800/60 px-2.5 py-1 rounded-md inline-block">
                        {reportTerm}
                      </div>
                      {isCurrentSession && (
                        <div className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider ${
                          isMidSheet ? 'bg-cyan-500/80 text-blue-950' : 'bg-amber-400/90 text-blue-950'
                        }`}>
                          {isMidSheet ? 'Mid-Term Card (CA 1 + CA 2)' : 'End-of-Term Card (CA 1-3 + Exam)'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scholar Profile Strip with Official Passport */}
                  <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center gap-5 text-xs">
                    {/* Official Report Sheet Passport Photo */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative group">
                        <div className="w-20 h-24 sm:w-22 sm:h-28 rounded-xl bg-white p-1 shadow-md border-2 border-amber-400 overflow-hidden flex flex-col items-center justify-between">
                          {student.passportPhoto ? (
                            <img
                              src={student.passportPhoto}
                              alt={student.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-slate-100 flex flex-col items-center justify-center p-1 text-center text-slate-400">
                              <UserCheck className="w-6 h-6 text-slate-400 mb-1" />
                              <span className="text-[9px] font-bold text-slate-600 uppercase leading-none">Passport</span>
                              <span className="text-[8px] text-slate-400 mt-0.5">Not Set</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => passportInputRef.current?.click()}
                          title="Upload or change report sheet passport photo"
                          className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 shadow-md border border-amber-300 cursor-pointer transition active:scale-95"
                          id="btn-upload-report-passport"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-amber-400" />
                          <span>{student.passportPhoto ? 'Passport Attached' : 'Optional Passport'}</span>
                        </div>
                        <p className="text-[10px] text-blue-200/90 leading-tight">
                          Included in your certified report sheet & transcripts.
                        </p>
                        <button
                          type="button"
                          onClick={() => passportInputRef.current?.click()}
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{student.passportPhoto ? 'Change Passport' : 'Upload Passport'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-blue-300">Scholar Name</span>
                        <span className="font-black text-white text-sm">{student.name}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-blue-300">Student Reg. No</span>
                        <span className="font-mono font-bold text-amber-300">{student.regNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-blue-300">Class Enrolled</span>
                        <span className="font-bold text-white">{displayClass}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-blue-300">Academic Standing</span>
                        <span className="font-black text-emerald-300">
                          {displayAnnualAverage >= 75 ? 'Distinction Honours' : 'Good Standing'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Passport File Input */}
                  <input
                    ref={passportInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePassportUpload}
                    id="student-passport-file-input"
                  />

                  {/* Passport upload notification toast */}
                  {passportNotice && (
                    <div className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      passportNotice.type === 'error'
                        ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                    }`}>
                      {passportNotice.type === 'error' ? (
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span>{passportNotice.text}</span>
                    </div>
                  )}
                </div>

                {/* Term Assessment Highlights */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-black text-blue-900">Term:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold font-mono">
                      {reportTerm}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-black text-blue-900">Session:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-900 font-bold font-mono">
                      {selectedSession}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                    <span className="text-slate-600">Total Subjects: <strong className="text-slate-900">{displayGrades.length}</strong></span>
                    <span className="text-slate-600">Term Average: <strong className="text-blue-900">{displayTermAverage}%</strong></span>
                    <span className="text-slate-600">Attendance: <strong className="text-emerald-700">{displayAttendance}</strong></span>
                    {isCgpaActiveForClass(displayClass) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-900 text-white font-black shadow-xs ring-1 ring-indigo-500/40">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>CGPA:</span>
                        <span className="text-sm font-mono text-amber-300">
                          {calculateGpa(reportGrades).gpa.toFixed(2)} / {calculateGpa(reportGrades).scale.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white ml-1">
                          {calculateGpa(reportGrades).classification}
                        </span>
                      </span>
                    )}
                    {isAutoRankingOn && myRankRecord && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs ring-1 ring-amber-500/40">
                        <span>Class Position:</span>
                        <span className="text-sm underline">{myRankRecord.positionText}</span>
                        <span className="text-[10px] font-bold opacity-85">({myRankRecord.rank} of {currentClassLeaderboard.length})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Grades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6">Subject</th>
                        <th className="py-3.5 px-3 text-center">CA 1 ({assessmentConfig.ca1Max ?? 10})</th>
                        <th className="py-3.5 px-3 text-center">CA 2 ({assessmentConfig.ca2Max ?? 10})</th>
                        {!isMidSheet && (
                          <>
                            <th className="py-3.5 px-3 text-center">CA 3 ({assessmentConfig.ca3Max ?? 10})</th>
                            <th className="py-3.5 px-3 text-center">Exam ({assessmentConfig.examMax ?? 70})</th>
                          </>
                        )}
                        <th className="py-3.5 px-3 text-center font-black">{isMidSheet ? 'Mid Total (20)' : 'Term Total (100)'}</th>
                        <th className="py-3.5 px-3 text-center">Grade</th>
                        {isCgpaActiveForClass(displayClass) && (
                          <th className="py-3.5 px-3 text-center bg-indigo-50/80 text-indigo-950 font-black">
                            GP ({calculateGpa(reportGrades).scale.toFixed(1)} Pt)
                          </th>
                        )}
                        {is3rdTerm && !isMidSheet && (
                          <>
                            <th className="py-3.5 px-3 text-center bg-blue-50/50 text-blue-900">1st Term</th>
                            <th className="py-3.5 px-3 text-center bg-blue-50/50 text-blue-900">2nd Term</th>
                            <th className="py-3.5 px-3 text-center bg-amber-100/60 font-black text-blue-950">Annual Avg</th>
                          </>
                        )}
                        <th className="py-3.5 px-4 sm:px-6">Faculty Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {reportGrades.map((g, idx) => {
                        const gradeInfo = calculateGrade(g.total);
                        const t1 = g.term1Total ?? Math.max(70, g.total - 3);
                        const t2 = g.term2Total ?? Math.max(72, g.total + 2);
                        const t3 = g.term3Total ?? g.total;
                        const annualAvg = g.annualAverage ?? Math.round((t1 + t2 + t3) / 3);
                        const isClassCgpa = isCgpaActiveForClass(displayClass);
                        const gpaScale = calculateGpa(reportGrades).scale;
                        const pointVal = ((gradeInfo.gradePoint ?? 0) * (gpaScale === 4.0 ? 0.8 : 1.0)).toFixed(2);

                        return (
                          <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-3 px-4 sm:px-6 font-black text-slate-900">{g.subject}</td>
                            <td className="py-3 px-3 text-center text-slate-700 font-semibold">{g.ca1}</td>
                            <td className="py-3 px-3 text-center text-slate-700 font-semibold">{g.ca2}</td>
                            {!isMidSheet && (
                              <>
                                <td className="py-3 px-3 text-center text-slate-700 font-semibold">{g.ca3 ?? 8}</td>
                                <td className="py-3 px-3 text-center text-slate-700 font-semibold">{g.exam}</td>
                              </>
                            )}
                            <td className="py-3 px-3 text-center font-black text-blue-950">
                              {isMidSheet ? `${(g.ca1 ?? 0) + (g.ca2 ?? 0)}/20 (${g.total}%)` : `${g.total}%`}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-black text-xs font-mono">
                                {gradeInfo.grade || g.grade}
                              </span>
                            </td>
                            {isClassCgpa && (
                              <td className="py-3 px-3 text-center font-mono font-black text-indigo-900 bg-indigo-50/30">
                                {pointVal}
                              </td>
                            )}

                            {is3rdTerm && !isMidSheet && (
                              <>
                                <td className="py-3 px-3 text-center text-slate-600 bg-blue-50/30">{t1}%</td>
                                <td className="py-3 px-3 text-center text-slate-600 bg-blue-50/30">{t2}%</td>
                                <td className="py-3 px-3 text-center font-black text-blue-950 bg-amber-50/80">
                                  {annualAvg}%
                                </td>
                              </>
                            )}

                            <td className="py-3 px-4 sm:px-6 text-slate-600 italic text-xs">{g.remark || gradeInfo.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 3rd Term Annual Average & Automatic Promotion Verdict Section */}
                {is3rdTerm && !isMidSheet && (
                  <div className="p-6 bg-amber-50/60 border-t border-amber-200">
                    <div className="rounded-2xl bg-white p-5 border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[11px] uppercase tracking-wider">
                            3-Term Annual Summary & Promotion Decision
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            (Pass Mark: {assessmentConfig.promotionPassMarkPercent}%)
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          Cumulative 3-Term Academic Average: <span className="text-blue-900">{displayAnnualAverage}%</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Calculated across 1st Term, 2nd Term, and 3rd Term Continuous Assessments & Examinations.
                        </p>
                      </div>

                      <div className={`px-4 py-3 rounded-2xl border text-center shrink-0 ${
                        displayIsPass 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}>
                        <div className="text-[10px] uppercase font-bold tracking-wider">
                          Promotion Committee Verdict
                        </div>
                        <div className="text-sm font-black mt-0.5 flex items-center justify-center gap-1.5">
                          {displayIsPass ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>PROMOTED TO NEXT CLASS</span>
                            </>
                          ) : (
                            <span>REPEAT CURRENT CLASS</span>
                          )}
                        </div>
                        <div className="text-[11px] font-bold opacity-80 mt-0.5">
                          {displayIsPass ? `Target: ${displayPromotedTo}` : 'Benchmark not attained'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Principal & Counselor Remarks + Admin-Selected Official Report Sheet Signatures */}
                {(() => {
                  const sigConfig = resolveReportSheetSignatures(student.grade);
                  return (
                    <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-800">Class Master's Assessment</span>
                          <p className="text-xs text-slate-700 italic mt-1">
                            "{displayTeacherRemark}"
                          </p>
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 pt-2 border-t border-slate-100">
                          — Certified Form Master ({student.grade})
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-800">
                            {sigConfig.primary.label}
                          </span>
                          <p className="text-xs text-slate-700 italic mt-1">
                            "{displayPrincipalRemark}"
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-black text-slate-900">— {sigConfig.primary.name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">{sigConfig.primary.title}</p>
                          </div>
                          {sigConfig.showOnPortal && sigConfig.primary.signatureUrl && (
                            <img
                              src={sigConfig.primary.signatureUrl}
                              alt={sigConfig.primary.name}
                              className="h-10 max-w-[110px] object-contain shrink-0"
                            />
                          )}
                        </div>
                      </div>

                      {/* Co-Signatory or Institutional Stamp Box */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col justify-between space-y-2">
                        {sigConfig.secondary && !sigConfig.secondary.isOfficialSeal ? (
                          <>
                            <div>
                              <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                                <Shield className="w-4 h-4 text-blue-700" />
                                <span>{sigConfig.secondary.label}</span>
                              </div>
                              <div className="text-xs font-black text-slate-900 mt-1.5">
                                {sigConfig.secondary.name}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-600">
                                {sigConfig.secondary.title}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                              {sigConfig.showOnPortal && sigConfig.secondary.signatureUrl ? (
                                <img
                                  src={sigConfig.secondary.signatureUrl}
                                  alt={sigConfig.secondary.name}
                                  className="h-10 max-w-[120px] object-contain"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-500">Co-Endorsed Record</span>
                              )}
                              <span className="font-mono text-[10px] text-emerald-700 font-bold">SEAL VALID</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                                <Shield className="w-4 h-4 text-blue-700" />
                                <span>Verified Terminal Record</span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1">
                                Certified for: <strong className="text-blue-950">{selectedSession}</strong>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Contact: <strong className="text-blue-950">{schoolInfo.phone}</strong>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Issued by Academic Secretariat</span>
                              <span className="font-mono text-emerald-700 font-bold">SEAL VALID</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              )}
              </>
            )}

            {/* VIEW MODE 2: SESSION PROGRESSION & MULTI-YEAR LEDGER */}
            {viewMode === 'session_progression' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-800" />
                    <span>Comprehensive Academic History & Multi-Session Progression</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Review your entire academic trajectory, annual promotion milestones, and previous term results across all enrolled sessions at Stanbax Schools.
                  </p>
                </div>

                {/* Current Active Session Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-blue-600/60 space-y-4 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-900 text-white text-xs font-black">
                          {assessmentConfig.activeSession}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Current Active Session</span>
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Enrolled Class: <span className="text-blue-900">{student.grade}</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSession(assessmentConfig.activeSession);
                          setViewMode('term_sheet');
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Open Active Report Sheet
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500">1st Term Average</span>
                      <p className="text-lg font-black text-blue-950 mt-0.5">{student.term1Average ?? student.termAverage}%</p>
                      <button 
                        onClick={() => {
                          setSelectedSession(assessmentConfig.activeSession);
                          setReportTerm('1st Term (Michaelmas Term)');
                          setViewMode('term_sheet');
                        }}
                        className="text-[10px] font-bold text-blue-800 hover:underline mt-1 cursor-pointer"
                      >
                        View Term Sheet →
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-blue-800">2nd Term Average</span>
                      <p className="text-lg font-black text-blue-950 mt-0.5">{student.term2Average ?? '—'}</p>
                      <button 
                        onClick={() => {
                          setSelectedSession(assessmentConfig.activeSession);
                          setReportTerm('2nd Term (Lent Term)');
                          setViewMode('term_sheet');
                        }}
                        className="text-[10px] font-bold text-blue-800 hover:underline mt-1 cursor-pointer"
                      >
                        View Term Sheet →
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500">3rd Term Average</span>
                      <p className="text-lg font-black text-blue-950 mt-0.5">{student.term3Average ?? '—'}</p>
                      <button 
                        onClick={() => {
                          setSelectedSession(assessmentConfig.activeSession);
                          setReportTerm('3rd Term (Trinity Term)');
                          setViewMode('term_sheet');
                        }}
                        className="text-[10px] font-bold text-blue-800 hover:underline mt-1 cursor-pointer"
                      >
                        View Term Sheet →
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Annual Average</span>
                      <p className="text-lg font-black text-blue-950 mt-0.5">{student.cumulativeAnnualAverage || 89.4}%</p>
                      <span className="text-[10px] font-extrabold text-emerald-700 block mt-1">
                        {(student.cumulativeAnnualAverage ?? 89.4) >= 70 ? 'On Track for Promotion' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Historical Sessions Cards */}
                {studentHistory.map((hist, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-xs font-black">
                            {hist.sessionName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                            Class: {hist.classEnrolled}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            {hist.promotionStatus} → {hist.promotedToGrade}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-600">
                          Annual Cumulative Average: <strong className="text-blue-900 font-black text-base">{hist.annualAverage}%</strong>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSession(hist.sessionName);
                            setViewMode('term_sheet');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-900 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Open Certified Record
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {(['1st Term', '2nd Term', '3rd Term'] as const).map(tKey => {
                        const termData = hist.terms[tKey];
                        const termLabel = tKey === '1st Term' ? '1st Term (Michaelmas Term)' : tKey === '2nd Term' ? '2nd Term (Lent Term)' : '3rd Term (Trinity Term)';
                        return (
                          <div key={tKey} className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-colors">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">{tKey}</span>
                              <span className="font-mono font-black text-blue-900">{termData?.termAverage ?? 0}%</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">
                              "{termData?.teacherRemark || 'Terminal records preserved'}"
                            </p>
                            <button
                              onClick={() => {
                                setSelectedSession(hist.sessionName);
                                setReportTerm(termLabel);
                                setViewMode('term_sheet');
                              }}
                              className="text-[10px] font-bold text-blue-800 hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Term Report</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE 3: BECE / JUNIOR WAEC CERTIFIED STATEMENT OF RESULTS */}
            {viewMode === 'bece_result' && (
              <div className="space-y-5">
                {studentBeceResult ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-300 relative space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-xs shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                              Official BECE Board Statement
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              Candidate No: <strong className="text-blue-950 font-black">{studentBeceResult.candidateNumber || 'Allocated'}</strong>
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                            {studentBeceResult.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setModalExamResult(studentBeceResult)}
                          className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Full Screen Slip & Print</span>
                        </button>
                      </div>
                    </div>

                    {/* Candidate & Board Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Examination Body</span>
                        <span className="font-bold text-slate-800">{studentBeceResult.examinationBody || 'NECO BECE Board'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Session & Diet</span>
                        <span className="font-bold text-slate-800">{studentBeceResult.session}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Exam Center</span>
                        <span className="font-bold text-slate-800 truncate block">{studentBeceResult.centerName || `${schoolInfo.name} Hall`}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Overall Evaluation</span>
                        <span className="font-black text-emerald-800">{studentBeceResult.overallScore || 'Passed with Distinction'}</span>
                      </div>
                    </div>

                    {/* Custom Subjects Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <span>Authenticated Subject Marks & Grades ({studentBeceResult.subjectBreakdown?.length || 0} Subjects):</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          Permanent Board Record
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-blue-900 text-white font-black text-center text-[11px] uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-12">#</th>
                              <th className="py-2.5 px-3 text-left">Exam Subject</th>
                              <th className="py-2.5 px-3 w-28">Score (/100)</th>
                              <th className="py-2.5 px-3 w-24">Grade</th>
                              <th className="py-2.5 px-3 w-40 text-left">Classification</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {(studentBeceResult.subjectBreakdown || []).map((sub, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">{sub.score || '—'}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                                    {sub.grade || 'A'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-700">{sub.remark || 'Distinction'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Official Remarks & Placement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {studentBeceResult.placementStatus && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                            Senior Secondary Placement Clearance
                          </span>
                          <p className="text-sm font-black text-emerald-950">{studentBeceResult.placementStatus}</p>
                        </div>
                      )}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Registry Comments
                        </span>
                        <p className="text-xs text-slate-700 italic">"{studentBeceResult.remarks || 'Result verified and cleared.'}"</p>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-3">
                      <Lock className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <strong className="block font-bold">Official Examination Board Ledger (Read-Only)</strong>
                        <p className="text-[11px] text-amber-900 leading-snug">
                          This statement of results is permanently archived in your portal. In compliance with examination standards, <strong>only authorized School Administrators have credentials to alter or moderate these subjects and grades</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">BECE / Junior WAEC Results Not Yet Posted</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      The School Academic Registry has not yet posted external Basic Education Certificate Examination results for your profile. Once uploaded by the examination office, your certified result slip and custom subjects will remain permanently accessible here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 4: NATIONAL COMMON ENTRANCE EXAMINATION (NCEE) */}
            {viewMode === 'ncee_result' && (
              <div className="space-y-5">
                {studentNceeResult ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-300 relative space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                              National Common Entrance (NCEE)
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              Candidate No: <strong className="text-blue-950 font-black">{studentNceeResult.candidateNumber || 'Allocated'}</strong>
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                            {studentNceeResult.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setModalExamResult(studentNceeResult)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-amber-300" />
                          <span>Full Screen Slip & Print</span>
                        </button>
                      </div>
                    </div>

                    {/* Candidate & Board Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Examination Board</span>
                        <span className="font-bold text-slate-800">{studentNceeResult.examinationBody || 'National Examinations Council (NECO)'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Session & Diet</span>
                        <span className="font-bold text-slate-800">{studentNceeResult.session}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Entrance Aggregate</span>
                        <span className="font-black text-emerald-800">{studentNceeResult.overallScore || 'Cleared'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase text-slate-400">Percentile Standing</span>
                        <span className="font-bold text-slate-800">{studentNceeResult.aggregate || 'Top Percentile'}</span>
                      </div>
                    </div>

                    {/* Custom Subjects Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>Test Papers & Scores Breakdown ({studentNceeResult.subjectBreakdown?.length || 0} Papers):</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          NECO Standard Assessment
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-emerald-800 text-white font-black text-center text-[11px] uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-12">#</th>
                              <th className="py-2.5 px-3 text-left">Examination Paper</th>
                              <th className="py-2.5 px-3 w-28">Score (/100)</th>
                              <th className="py-2.5 px-3 w-24">Grade</th>
                              <th className="py-2.5 px-3 w-40 text-left">Classification</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {(studentNceeResult.subjectBreakdown || []).map((sub, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-900">{sub.score || '—'}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                                    {sub.grade || 'A1'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-700">{sub.remark || 'Distinction'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Official Remarks & Placement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {studentNceeResult.placementStatus && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                            Junior Secondary Admission Clearance
                          </span>
                          <p className="text-sm font-black text-emerald-950">{studentNceeResult.placementStatus}</p>
                        </div>
                      )}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Registry Endorsement
                        </span>
                        <p className="text-xs text-slate-700 italic">"{studentNceeResult.remarks || 'Result verified and cleared.'}"</p>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
                      <Lock className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <strong className="block font-bold">Official Entrance Board Ledger (Read-Only)</strong>
                        <p className="text-[11px] text-emerald-900 leading-snug">
                          This entrance examination record is permanently archived in your portal. In compliance with registry standards, <strong>only authorized School Administrators have credentials to alter or moderate these subjects and grades</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">National Common Entrance Results Not Yet Posted</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Official National Common Entrance Examination results for Primary 5 and JSS 1 have not yet been posted by the administration. Once posted, your placement slip and test paper marks will remain permanently accessible here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 5: ALL OFFICIAL EXTERNAL TRANSCRIPTS & CUSTOM SLIPS */}
            {viewMode === 'external_results' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-blue-800" />
                    <span>Permanent External Examination Records & Certificates ({studentCustomResults.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Certified results posted and authenticated by the School Administration. Alterations are restricted to authorized administrators.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentCustomResults.map((res) => (
                    <div key={res.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase">
                          {res.examType || 'External Slip'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {res.session}
                        </span>
                      </div>

                      <h4 className="font-black text-base text-slate-900">{res.title}</h4>
                      
                      {res.overallScore && (
                        <p className="text-xs text-slate-700">
                          Evaluation: <strong className="text-blue-950 font-bold">{res.overallScore}</strong>
                        </p>
                      )}

                      {res.subjectBreakdown && res.subjectBreakdown.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {res.subjectBreakdown.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                              {s.subject}: <strong className="text-blue-900">{s.grade || s.score}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setModalExamResult(res)}
                          className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Certified Slip</span>
                        </button>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked (Admin only)</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WEEKLY TIMETABLE */}
        {activeTab === 'timetable' && (
          <StudentTimetableTab />
        )}

        {/* TAB: SICK BAY & CLINIC PASS */}
        {activeTab === 'sickbay' && (
          <StudentSickBayTab />
        )}

        {/* TAB: CAMPUS & EVENTS GALLERY */}
        {activeTab === 'gallery' && (
          <div className="rounded-3xl overflow-hidden shadow-xs border border-slate-200 bg-white">
            <CampusGallery showAdminControls={false} />
          </div>
        )}

        {/* TAB: BECE / JUNIOR WAEC RESULTS (DEDICATED VIEW) */}
        {activeTab === 'bece' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-3xl p-6 shadow-sm border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-950 text-amber-300 text-xs font-black uppercase tracking-wider">
                  Basic Education Certificate Examination (BECE) Dossier
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
                  BECE / Junior WAEC Certified Results & Distinctions
                </h3>
                <p className="text-xs text-blue-950/80 font-bold mt-0.5">
                  Permanent academic record for JSS 3 through SS 3 scholars and Alumni. Alterations can only be made by the School Administration.
                </p>
              </div>

              {studentBeceResult && (
                <button
                  type="button"
                  onClick={() => setModalExamResult(studentBeceResult)}
                  className="px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print / Save Official Statement Slip</span>
                </button>
              )}
            </div>

            {studentBeceResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-300 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-amber-900">Candidate / Exam No</span>
                    <span className="font-mono font-black text-blue-950 text-sm">{studentBeceResult.candidateNumber || 'Allocated'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-amber-900">Session & Diet</span>
                    <span className="font-bold text-slate-800 text-xs">{studentBeceResult.session}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-amber-900">Overall Evaluation</span>
                    <span className="font-black text-emerald-800 text-xs">{studentBeceResult.overallScore || 'Passed'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-amber-900">Custom Subjects</span>
                    <span className="font-bold text-slate-800 text-xs">{studentBeceResult.subjectBreakdown?.length || 0} Subjects Recorded</span>
                  </div>
                </div>

                {/* Custom Subjects Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Official Subject Marks & Letter Grades ({studentBeceResult.subjectBreakdown?.length || 0} Subjects):</span>
                  </h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-blue-900 text-white font-black text-center text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-12">#</th>
                          <th className="py-2.5 px-3 text-left">Exam Subject</th>
                          <th className="py-2.5 px-3 w-28">Score (/100)</th>
                          <th className="py-2.5 px-3 w-24">Grade</th>
                          <th className="py-2.5 px-3 w-40 text-left">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(studentBeceResult.subjectBreakdown || []).map((sub, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">{sub.score || '—'}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                                {sub.grade || 'A'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">{sub.remark || 'Distinction'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Official Remarks & Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studentBeceResult.placementStatus && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                        Senior Secondary Placement Clearance
                      </span>
                      <p className="text-sm font-black text-emerald-950">{studentBeceResult.placementStatus}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Registry Endorsement
                    </span>
                    <p className="text-xs text-slate-700 italic">"{studentBeceResult.remarks || 'Result verified and cleared.'}"</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <strong className="block font-bold">Official Examination Board Ledger (Read-Only)</strong>
                    <p className="text-[11px] text-amber-900 leading-snug">
                      This statement of results is permanently archived in your portal. In compliance with examination standards, <strong>only authorized School Administrators have credentials to alter or moderate these subjects and grades</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-base">BECE / Junior WAEC Results Not Yet Posted</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  The School Academic Registry has not yet posted external Basic Education Certificate Examination results for your profile. Once uploaded by the examination office, your certified result slip and custom subjects will remain permanently accessible here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: NATIONAL COMMON ENTRANCE EXAMINATION (NCEE) DEDICATED VIEW */}
        {activeTab === 'ncee' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 shadow-sm border border-emerald-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
                  National Common Entrance Examination (NCEE) Ledger
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  National Common Entrance & Junior Secondary Placement
                </h3>
                <p className="text-xs text-emerald-100 font-bold mt-0.5">
                  Official entrance record for Primary 5 and JSS 1 scholars. Alterations can only be performed by the School Administration.
                </p>
              </div>

              {studentNceeResult && (
                <button
                  type="button"
                  onClick={() => setModalExamResult(studentNceeResult)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-700" />
                  <span>Print / Save Official Placement Slip</span>
                </button>
              )}
            </div>

            {studentNceeResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-300 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-emerald-900">Candidate / Exam No</span>
                    <span className="font-mono font-black text-blue-950 text-sm">{studentNceeResult.candidateNumber || 'Allocated'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-emerald-900">Entrance Aggregate</span>
                    <span className="font-black text-emerald-800 text-xs">{studentNceeResult.overallScore || 'Cleared'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-emerald-900">Percentile Standing</span>
                    <span className="font-bold text-slate-800 text-xs">{studentNceeResult.aggregate || 'Top Percentile'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-emerald-900">Custom Subjects</span>
                    <span className="font-bold text-slate-800 text-xs">{studentNceeResult.subjectBreakdown?.length || 0} Test Papers</span>
                  </div>
                </div>

                {/* Custom Subjects Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Test Papers Breakdown & Quantitative Marks ({studentNceeResult.subjectBreakdown?.length || 0} Papers):</span>
                  </h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-emerald-800 text-white font-black text-center text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-12">#</th>
                          <th className="py-2.5 px-3 text-left">Examination Paper</th>
                          <th className="py-2.5 px-3 w-28">Score (/100)</th>
                          <th className="py-2.5 px-3 w-24">Grade</th>
                          <th className="py-2.5 px-3 w-40 text-left">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(studentNceeResult.subjectBreakdown || []).map((sub, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-900">{sub.score || '—'}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                                {sub.grade || 'A1'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">{sub.remark || 'Distinction'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Official Remarks & Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studentNceeResult.placementStatus && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                        Junior Secondary Admission Clearance
                      </span>
                      <p className="text-sm font-black text-emerald-950">{studentNceeResult.placementStatus}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Registry Endorsement
                    </span>
                    <p className="text-xs text-slate-700 italic">"{studentNceeResult.remarks || 'Result verified and cleared.'}"</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="block font-bold">Official Entrance Board Ledger (Read-Only)</strong>
                    <p className="text-[11px] text-emerald-900 leading-snug">
                      This entrance examination record is permanently archived in your portal. In compliance with registry standards, <strong>only authorized School Administrators have credentials to alter or moderate these subjects and grades</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-base">National Common Entrance Results Not Yet Posted</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Official National Common Entrance Examination results for Primary 5 and JSS 1 have not yet been posted by the administration. Once posted, your placement slip and test paper marks will remain permanently accessible here.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                  <KeyRound className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your scholar portal access key</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentPassMsg && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                studentPassMsg.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold'
              }`}>
                <span>{studentPassMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStudentPassMsg(null);
                if (!currentStudentPass.trim()) {
                  setStudentPassMsg({ type: 'error', text: 'Please enter your current password.' });
                  return;
                }
                if (newStudentPass.length < 4) {
                  setStudentPassMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
                  return;
                }
                if (newStudentPass !== confirmStudentPass) {
                  setStudentPassMsg({ type: 'error', text: 'New passwords do not match.' });
                  return;
                }
                const res = await changePassword('student', currentStudentPass, newStudentPass);
                if (res.success) {
                  setStudentPassMsg({ type: 'success', text: res.message });
                  setCurrentStudentPass('');
                  setNewStudentPass('');
                  setConfirmStudentPass('');
                  setTimeout(() => setShowPasswordModal(false), 1800);
                } else {
                  setStudentPassMsg({ type: 'error', text: res.message });
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={currentStudentPass}
                  onChange={(e) => setCurrentStudentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={newStudentPass}
                  onChange={(e) => setNewStudentPass(e.target.value)}
                  placeholder="Create new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={confirmStudentPass}
                  onChange={(e) => setConfirmStudentPass(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassText(!showPassText)}
                  className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPassText ? 'Hide Password' : 'Show Password'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black shadow-md shadow-blue-900/20 transition cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* STUDENT ID CARD MODAL */}
      <StudentIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* AUTOMATIC / ADMIN WAEC PROMPT MODAL FOR SS2 & SS3 STUDENTS */}
      {showWaecAutoModal && waecPromptBroadcast && (
        <WaecPromptModal
          student={{ ...student, waecRegistration: currentWaecRegistration }}
          prompt={waecPromptBroadcast}
          onOpenRegistration={() => {
            setShowWaecAutoModal(false);
            setActiveTab('waec');
          }}
          onDismiss={() => {
            setShowWaecAutoModal(false);
            dismissWaecPromptForStudent(student.id);
          }}
        />
      )}
    </div>
  );
};
