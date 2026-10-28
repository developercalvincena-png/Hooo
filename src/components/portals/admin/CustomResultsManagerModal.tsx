import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { StudentProfile, CustomResult, CustomResultSubject } from '../../../types';
import { 
  X, 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  AlertCircle,
  Eye,
  Printer,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Search,
  BookOpen,
  Zap,
  FileCheck,
  Lock,
  Edit3,
  RotateCcw,
  UserCheck,
  Cloud,
  Database,
  RefreshCw
} from '../../RealIcons';
import { isRemoteEnabled } from '../../../lib/supabase';
import { CertifiedExamResultSlipModal } from '../CertifiedExamResultSlipModal';

interface CustomResultsManagerModalProps {
  initialStudent?: StudentProfile | null;
  onClose: () => void;
}

// Preset standard subjects for rapid populating with full customization
const BECE_PRESET_SUBJECTS: Array<{ subject: string; score: string; grade: string; remark: string }> = [
  { subject: 'English Studies', score: '84', grade: 'A', remark: 'Distinction' },
  { subject: 'Mathematics', score: '88', grade: 'A', remark: 'Distinction' },
  { subject: 'Basic Science & Technology', score: '90', grade: 'A', remark: 'Distinction' },
  { subject: 'National Values Education', score: '85', grade: 'A', remark: 'Distinction' },
  { subject: 'Cultural & Creative Arts (CCA)', score: '78', grade: 'A', remark: 'Distinction' },
  { subject: 'Business Studies', score: '80', grade: 'A', remark: 'Distinction' },
  { subject: 'Pre-Vocational Studies', score: '82', grade: 'A', remark: 'Distinction' },
  { subject: 'French Language', score: '76', grade: 'C', remark: 'Credit' },
  { subject: 'Christian Religious Studies', score: '86', grade: 'A', remark: 'Distinction' },
  { subject: 'Computer Studies', score: '91', grade: 'A', remark: 'Distinction' }
];

const NCEE_PRESET_SUBJECTS: Array<{ subject: string; score: string; grade: string; remark: string }> = [
  { subject: 'Mathematics & Basic General Science', score: '92', grade: 'A1', remark: 'Distinction' },
  { subject: 'English Language & Social Studies', score: '88', grade: 'A1', remark: 'Distinction' },
  { subject: 'Quantitative Aptitude', score: '95', grade: 'A1', remark: 'Distinction' },
  { subject: 'Verbal Aptitude', score: '90', grade: 'A1', remark: 'Distinction' },
  { subject: 'General Vocational Aptitude', score: '91', grade: 'A1', remark: 'Distinction' }
];

const WAEC_PRESET_SUBJECTS: Array<{ subject: string; score: string; grade: string; remark: string }> = [
  { subject: 'English Language', score: '82', grade: 'A1', remark: 'Distinction' },
  { subject: 'General Mathematics', score: '86', grade: 'A1', remark: 'Distinction' },
  { subject: 'Civic Education', score: '84', grade: 'A1', remark: 'Distinction' },
  { subject: 'Physics', score: '88', grade: 'A1', remark: 'Distinction' },
  { subject: 'Chemistry', score: '81', grade: 'A1', remark: 'Distinction' },
  { subject: 'Biology', score: '79', grade: 'B2', remark: 'Very Good' },
  { subject: 'Further Mathematics', score: '85', grade: 'A1', remark: 'Distinction' },
  { subject: 'Technical Drawing', score: '83', grade: 'A1', remark: 'Distinction' },
  { subject: 'Data Processing', score: '90', grade: 'A1', remark: 'Distinction' }
];

export const CustomResultsManagerModal: React.FC<CustomResultsManagerModalProps> = ({
  initialStudent = null,
  onClose
}) => {
  const { 
    students, 
    customResults, 
    uploadCustomResult, 
    updateCustomResult,
    deleteCustomResult, 
    syncAllCustomDataToCloud,
    schoolInfo 
  } = useSchool();

  const [isSyncingOnline, setIsSyncingOnline] = useState(false);

  const handleManualSyncOnline = async () => {
    setIsSyncingOnline(true);
    try {
      const res = await syncAllCustomDataToCloud();
      setNotice({
        type: res.ok ? 'success' : 'error',
        text: res.ok 
          ? 'Cloud Synchronized! BECE, NCEE results and WAEC catalogs are fully live online in the database.' 
          : `Sync warning: ${res.message}`
      });
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.message || 'Failed to sync online.' });
    } finally {
      setIsSyncingOnline(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Active top mode
  const [activeViewTab, setActiveViewTab] = useState<'individual' | 'bece_broadsheet' | 'ncee_broadsheet'>('individual');
  
  // Cohort filter for individual student picker
  const [cohortFilter, setCohortFilter] = useState<'all' | 'bece_cohort' | 'ncee_cohort'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || students[0]?.id || ''
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<string>('BECE');
  const [session, setSession] = useState(schoolInfo.activeSession || '2025/2026 Academic Session');
  const [term, setTerm] = useState('Official Examination Diet');
  const [examDiet, setExamDiet] = useState('June/July National BECE Diet');
  const [candidateNumber, setCandidateNumber] = useState('');
  const [examinationBody, setExaminationBody] = useState('National Examinations Council (NECO)');
  const [centerName, setCenterName] = useState(`${schoolInfo.name} Examination Center`);
  const [overallScore, setOverallScore] = useState('');
  const [aggregate, setAggregate] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [remarks, setRemarks] = useState('Certified and authenticated by Central Academic Registry.');
  const [fileAttachment, setFileAttachment] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Subject rows for breakdown
  const [subjectRows, setSubjectRows] = useState<Array<{ subject: string; score: string; grade: string; remark: string }>>(
    BECE_PRESET_SUBJECTS
  );

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewingResult, setViewingResult] = useState<{ result: CustomResult; student: StudentProfile } | null>(null);

  // Helper to determine if a student is in JSS 3 - SS 3 or Alumni (BECE eligible)
  const isBeceCohortStudent = (s: StudentProfile) => {
    if (s.isAlumni) return true;
    const g = (s.grade || '').toLowerCase();
    return g.includes('jss 3') || g.includes('jss3') || 
           g.includes('sss') || g.includes('ss 1') || 
           g.includes('ss 2') || g.includes('ss 3') || 
           g.includes('ss1') || g.includes('ss2') || g.includes('ss3');
  };

  // Helper to determine if a student is in Primary 5 or JSS 1 (Common Entrance eligible)
  const isNceeCohortStudent = (s: StudentProfile) => {
    const g = (s.grade || '').toLowerCase();
    return g.includes('primary 5') || g.includes('primary 6') || 
           g.includes('pri 5') || g.includes('pri 6') || 
           g.includes('jss 1') || g.includes('jss1');
  };

  // Filtered student list for selector
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (cohortFilter === 'bece_cohort' && !isBeceCohortStudent(s)) return false;
      if (cohortFilter === 'ncee_cohort' && !isNceeCohortStudent(s)) return false;
      if (studentSearch.trim()) {
        const query = studentSearch.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchReg = s.regNumber.toLowerCase().includes(query);
        const matchGrade = (s.grade || '').toLowerCase().includes(query);
        if (!matchName && !matchReg && !matchGrade) return false;
      }
      return true;
    });
  }, [students, cohortFilter, studentSearch]);

  // Results for current student (merges global collection and student record)
  const studentResults = useMemo(() => {
    if (!selectedStudent) return [];
    const listFromGlobal = customResults.filter(r => {
      const rStudId = (r as any).studentId;
      const rReg = (r as any).studentRegNumber;
      return rStudId === selectedStudent.id || 
             (rReg && rReg.toLowerCase() === selectedStudent.regNumber.toLowerCase());
    });
    const fromStudentObj = selectedStudent.customResults || [];
    const mergedMap = new Map<string, CustomResult>();
    for (const r of listFromGlobal) mergedMap.set(r.id, r);
    for (const r of fromStudentObj) {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    }
    return Array.from(mergedMap.values());
  }, [customResults, selectedStudent]);

  // Pre-fill subject templates
  const applyPresetSubjects = (type: 'bece' | 'ncee' | 'waec') => {
    if (type === 'bece') {
      setExamType('BECE');
      setTitle('BECE / Junior WAEC Certified Statement of Result');
      setExaminationBody('National Examinations Council (NECO) & State Ministry of Education');
      setExamDiet('June/July National BECE Diet');
      setOverallScore('Distinction (8 Distinctions, 1 Credit)');
      setAggregate('9 Subjects Passed with Distinction Honours');
      setPlacementStatus('Cleared for Senior Secondary (Science Track)');
      setSubjectRows(BECE_PRESET_SUBJECTS);
    } else if (type === 'ncee') {
      setExamType('NCEE');
      setTitle('National Common Entrance Examination (NCEE) Placement Slip');
      setExaminationBody('National Examinations Council (NECO) - Federal Ministry of Education');
      setExamDiet('April National Primary School Common Entrance Diet');
      setOverallScore('186 / 200 (93.0% - Merit List)');
      setAggregate('Top 1% National Percentile');
      setPlacementStatus('Admitted into JSS 1 (Gold Class) - Merit List');
      setSubjectRows(NCEE_PRESET_SUBJECTS);
    } else if (type === 'waec') {
      setExamType('WAEC');
      setTitle('WAEC WASSCE Senior School Certificate Examination');
      setExaminationBody('West African Examinations Council (WAEC)');
      setExamDiet('May/June WASSCE Diet');
      setOverallScore('8 Distinctions, 1 Credit');
      setAggregate('High Distinction Average (A1 in 7 Subjects)');
      setPlacementStatus('Graduated Senior Secondary School with Honours');
      setSubjectRows(WAEC_PRESET_SUBJECTS);
    }
  };

  const handleStartCreate = (defaultType: 'BECE' | 'NCEE' | 'WAEC' = 'BECE') => {
    setEditingResultId(null);
    setShowForm(true);
    if (defaultType === 'BECE') {
      applyPresetSubjects('bece');
      if (selectedStudent) {
        setCandidateNumber(`BECE/${session.slice(0, 4)}/${selectedStudent.regNumber.split('/').pop() || '001'}`);
      }
    } else if (defaultType === 'NCEE') {
      applyPresetSubjects('ncee');
      if (selectedStudent) {
        setCandidateNumber(`NCEE/${session.slice(0, 4)}/${selectedStudent.regNumber.split('/').pop() || '101'}`);
      }
    } else {
      applyPresetSubjects('waec');
    }
  };

  // Start editing / altering an existing result (Only admin privilege)
  const handleStartEdit = (res: CustomResult) => {
    setEditingResultId(res.id);
    setTitle(res.title);
    setExamType(res.examType || 'BECE');
    setSession(res.session || schoolInfo.activeSession || '2025/2026 Academic Session');
    setTerm(res.term || 'Official Examination Diet');
    setExamDiet(res.examDiet || 'National Diet');
    setCandidateNumber(res.candidateNumber || '');
    setExaminationBody(res.examinationBody || 'National Examinations Council (NECO)');
    setCenterName(res.centerName || `${schoolInfo.name} Examination Center`);
    setOverallScore(res.overallScore || '');
    setAggregate(res.aggregate || '');
    setPlacementStatus(res.placementStatus || '');
    setRemarks(res.remarks || 'Certified and authenticated by Central Academic Registry.');
    setFileName(res.fileName || '');
    setFileAttachment(res.fileAttachment || null);

    if (res.subjectBreakdown && res.subjectBreakdown.length > 0) {
      setSubjectRows(res.subjectBreakdown.map(s => ({
        subject: s.subject || '',
        score: s.score ? String(s.score) : '',
        grade: s.grade || '',
        remark: s.remark || ''
      })));
    } else {
      setSubjectRows(BECE_PRESET_SUBJECTS);
    }

    setShowForm(true);
  };

  const handleAddSubjectRow = () => {
    setSubjectRows(prev => [...prev, { subject: '', score: '', grade: 'A', remark: 'Distinction' }]);
  };

  const handleRemoveSubjectRow = (idx: number) => {
    setSubjectRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubjectRowChange = (idx: number, field: string, value: string) => {
    setSubjectRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'Document attachment must be under 5MB.' });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) setFileAttachment(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setNotice({ type: 'error', text: 'Please select an enrolled student or alumni.' });
      return;
    }
    if (!title.trim()) {
      setNotice({ type: 'error', text: 'Please provide a descriptive title for this result.' });
      return;
    }

    const cleanSubjects: CustomResultSubject[] = subjectRows
      .filter(r => r.subject.trim())
      .map(r => ({
        subject: r.subject.trim(),
        score: r.score.trim() || undefined,
        grade: r.grade.trim() || undefined,
        remark: r.remark.trim() || undefined
      }));

    if (editingResultId) {
      // Alter existing result
      updateCustomResult(editingResultId, {
        title: title.trim(),
        examType,
        session: session.trim(),
        term: term.trim(),
        examDiet: examDiet.trim(),
        candidateNumber: candidateNumber.trim() || undefined,
        examinationBody: examinationBody.trim() || undefined,
        centerName: centerName.trim() || undefined,
        overallScore: overallScore.trim() || undefined,
        aggregate: aggregate.trim() || undefined,
        placementStatus: placementStatus.trim() || undefined,
        remarks: remarks.trim() || undefined,
        fileAttachment: fileAttachment || undefined,
        fileName: fileName || undefined,
        subjectBreakdown: cleanSubjects.length > 0 ? cleanSubjects : undefined,
        isOfficialExternal: true
      });

      setNotice({ 
        type: 'success', 
        text: `Result "${title}" was successfully altered by Admin and refreshed in ${selectedStudent.name}'s portal.` 
      });
    } else {
      // Post new result
      uploadCustomResult({
        studentId: selectedStudent.id,
        studentRegNumber: selectedStudent.regNumber,
        studentName: selectedStudent.name,
        targetClass: selectedStudent.grade,
        title: title.trim(),
        examType,
        session: session.trim(),
        term: term.trim(),
        examDiet: examDiet.trim(),
        candidateNumber: candidateNumber.trim() || undefined,
        examinationBody: examinationBody.trim() || undefined,
        centerName: centerName.trim() || undefined,
        overallScore: overallScore.trim() || undefined,
        aggregate: aggregate.trim() || undefined,
        placementStatus: placementStatus.trim() || undefined,
        remarks: remarks.trim() || undefined,
        fileAttachment: fileAttachment || undefined,
        fileName: fileName || undefined,
        subjectBreakdown: cleanSubjects.length > 0 ? cleanSubjects : undefined,
        isOfficialExternal: true
      });

      setNotice({ 
        type: 'success', 
        text: `Official result "${title}" successfully posted to ${selectedStudent.name}'s permanent portal.` 
      });
    }

    setShowForm(false);
    setEditingResultId(null);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleDelete = (resultId: string, resultTitle: string) => {
    if (confirm(`Are you sure you want to delete "${resultTitle}"? This will remove it from the scholar's permanent portal.`)) {
      deleteCustomResult(resultId);
      setNotice({ type: 'success', text: `Result "${resultTitle}" was deleted successfully.` });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Pre-calculate cohort counts
  const beceCohortStudents = useMemo(() => students.filter(isBeceCohortStudent), [students]);
  const nceeCohortStudents = useMemo(() => students.filter(isNceeCohortStudent), [students]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Nunito',sans-serif]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                  Admin Master Registry
                </span>
                <span className="text-xs text-blue-200">
                  BECE, Common Entrance & External Results
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Official Examination Results & Custom Subjects Manager
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleManualSyncOnline}
              disabled={isSyncingOnline}
              title="Ensure all custom results, BECE, NCEE, and WAEC records are synchronized directly to online Supabase database"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-[11px] text-emerald-300 font-bold hover:bg-emerald-500/30 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOnline ? 'animate-spin' : ''}`} />
              <span>{isSyncingOnline ? 'Syncing Online...' : 'Sync Online'}</span>
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/80 border border-blue-700/60 text-[11px] text-amber-300 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Only Admin Can Post / Alter</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 shrink-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveViewTab('individual')}
            className={`pb-3 px-4 font-black border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeViewTab === 'individual'
                ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl -mb-[1px] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-900" />
            <span>Scholar Results Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('bece_broadsheet')}
            className={`pb-3 px-4 font-black border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeViewTab === 'bece_broadsheet'
                ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl -mb-[1px] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>BECE Broadsheet (JSS 3 - SS 3 & Alumni) ({beceCohortStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('ncee_broadsheet')}
            className={`pb-3 px-4 font-black border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeViewTab === 'ncee_broadsheet'
                ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl -mb-[1px] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Common Entrance (Primary 5 & JSS 1) ({nceeCohortStudents.length})</span>
          </button>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className={`p-3.5 mx-6 mt-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shrink-0 ${
            notice.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{notice.text}</span>
            </div>
            <button onClick={() => setNotice(null)} className="p-1 hover:bg-black/5 rounded cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: INDIVIDUAL SCHOLAR DOSSIER */}
        {activeViewTab === 'individual' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
            {/* Filter and Selection Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Cohort Pill Filters */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-blue-900" />
                    <span>Target Examination Cohort:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setCohortFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                        cohortFilter === 'all'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Scholars & Alumni ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCohortFilter('bece_cohort')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                        cohortFilter === 'bece_cohort'
                          ? 'bg-amber-500 text-blue-950 shadow-xs font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BECE Group (JSS 3 - SS 3 & Alumni) ({beceCohortStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCohortFilter('ncee_cohort')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                        cohortFilter === 'ncee_cohort'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Common Entrance (Primary 5 & JSS 1) ({nceeCohortStudents.length})
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name, reg no, class..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              {/* Student Select Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center pt-2 border-t border-slate-200/80">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Select Scholar / Candidate Record:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setShowForm(false);
                      setEditingResultId(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                  >
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.regNumber}) — {s.isAlumni ? `Alumni (${s.graduationSession || 'Graduated'})` : s.grade}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black shrink-0 overflow-hidden">
                      {selectedStudent.passportPhoto ? (
                        <img src={selectedStudent.passportPhoto} alt={selectedStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedStudent.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-black text-xs text-slate-900 truncate">{selectedStudent.name}</span>
                      <span className="block text-[11px] text-slate-500 font-mono">{selectedStudent.regNumber}</span>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                        selectedStudent.isAlumni ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {selectedStudent.isAlumni ? 'Graduated Alumni' : selectedStudent.grade}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Bar for Posting Results */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 p-4 rounded-3xl">
              <div>
                <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Admin Fast Actions for {selectedStudent?.name}</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  Post new authenticated external slips or alter existing permanent records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartCreate('BECE')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Post BECE result with 10 standard subjects"
                >
                  <Award className="w-3.5 h-3.5 text-blue-950" />
                  <span>Post BECE Result</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartCreate('NCEE')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Post National Common Entrance result"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Post Common Entrance (NCEE)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartCreate('WAEC')}
                  className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Post senior WAEC/NECO or Custom external result"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Other External Slip</span>
                </button>
              </div>
            </div>

            {/* FORM: POST OR ALTER RESULT (ONLY ADMIN PRIVILEGE) */}
            {showForm && (
              <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white border-2 border-blue-900 shadow-md space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black">
                      {editingResultId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {editingResultId ? 'Alter Official Result (Admin Privilege)' : 'Post New Official Result'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Candidate: <strong>{selectedStudent?.name}</strong> • Permanent Student Portal Archive
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* 1-Click Subject Preset Switchers */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick-Fill Subject Templates:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetSubjects('bece')}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] cursor-pointer transition"
                    >
                      Standard BECE (10 Subjects)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSubjects('ncee')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-[11px] cursor-pointer transition"
                    >
                      Standard Common Entrance (5 Subjects)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSubjects('waec')}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-[11px] cursor-pointer transition"
                    >
                      Standard WAEC / NECO (9 Subjects)
                    </button>
                  </div>
                </div>

                {/* Core Result Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Result Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 2024 BECE Statement of Results"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Exam Category *</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none font-bold"
                    >
                      <option value="BECE">BECE / Junior WAEC</option>
                      <option value="NCEE">National Common Entrance (NCEE)</option>
                      <option value="WAEC">WAEC WASSCE (Senior)</option>
                      <option value="NECO">NECO SSCE (Senior)</option>
                      <option value="Cambridge">Cambridge IGCSE / Checkpoint</option>
                      <option value="JAMB">JAMB UTME</option>
                      <option value="Terminal">Custom Terminal Result</option>
                      <option value="Custom">External Assessment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Candidate / Exam Seat No</label>
                    <input
                      type="text"
                      value={candidateNumber}
                      onChange={(e) => setCandidateNumber(e.target.value)}
                      placeholder="e.g. BECE/2024/04291"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Examination Body</label>
                    <input
                      type="text"
                      value={examinationBody}
                      onChange={(e) => setExaminationBody(e.target.value)}
                      placeholder="e.g. NECO BECE Board"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Exam Diet / Term</label>
                    <input
                      type="text"
                      value={examDiet}
                      onChange={(e) => setExamDiet(e.target.value)}
                      placeholder="e.g. June/July National Diet"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      placeholder="e.g. 2024/2025 Academic Session"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Overall Standing / Evaluation</label>
                    <input
                      type="text"
                      value={overallScore}
                      onChange={(e) => setOverallScore(e.target.value)}
                      placeholder="e.g. Distinction (8 Distinctions, 1 Credit)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Admission / Placement Clearance</label>
                    <input
                      type="text"
                      value={placementStatus}
                      onChange={(e) => setPlacementStatus(e.target.value)}
                      placeholder="e.g. Cleared for Senior Secondary Science Track"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>

                {/* CUSTOM SUBJECTS BUILDER */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-900" />
                        <span>Custom Subjects Breakdown ({subjectRows.length} Subjects):</span>
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Admin can customize any subject name, enter raw marks, letter grades, and qualitative remarks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSubjectRow}
                      className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Subject</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5 text-center w-10">#</th>
                          <th className="p-2.5 text-left">Subject Name (Customizable)</th>
                          <th className="p-2.5 text-center w-28">Score (/100)</th>
                          <th className="p-2.5 text-center w-28">Grade</th>
                          <th className="p-2.5 text-left w-40">Remark / Classification</th>
                          <th className="p-2.5 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {subjectRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.subject}
                                onChange={(e) => handleSubjectRowChange(idx, 'subject', e.target.value)}
                                placeholder="e.g. Basic Science & Technology"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:border-blue-900 outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="text"
                                value={row.score}
                                onChange={(e) => handleSubjectRowChange(idx, 'score', e.target.value)}
                                placeholder="e.g. 88"
                                className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 font-mono font-bold focus:border-blue-900 outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="text"
                                value={row.grade}
                                onChange={(e) => handleSubjectRowChange(idx, 'grade', e.target.value)}
                                placeholder="A or A1"
                                className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 font-black text-blue-950 focus:border-blue-900 outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.remark}
                                onChange={(e) => handleSubjectRowChange(idx, 'remark', e.target.value)}
                                placeholder="e.g. Distinction"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 focus:border-blue-900 outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSubjectRow(idx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Remove subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Registry Comments & File Attachment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Registry Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      placeholder="Official authentication notes..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Optional Scanned Certificate / Slip Attachment (PDF or Image, max 5MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer"
                    />
                    {fileName && (
                      <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                        Attached: {fileName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingResultId(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{editingResultId ? 'Save Alterations (Push to Portal)' : 'Post Official Result to Portal'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Posted Results for Selected Scholar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>Permanent Results Archive for {selectedStudent?.name} ({studentResults.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Always visible to student in their portal. Only admin can alter or remove.
                  </p>
                </div>
              </div>

              {studentResults.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-50 border border-slate-200 text-slate-400 space-y-2">
                  <Award className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No external results posted yet for this scholar.</p>
                  <p className="text-[11px] text-slate-400">
                    Click "Post BECE Result" or "Post Common Entrance (NCEE)" above to attach an official certified result slip.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentResults.map((res) => {
                    const isBece = res.examType === 'BECE' || res.title.toLowerCase().includes('bece');
                    const isNcee = res.examType === 'NCEE' || res.title.toLowerCase().includes('common entrance');
                    return (
                      <div
                        key={res.id}
                        className={`p-5 rounded-3xl border shadow-xs transition space-y-3.5 bg-white ${
                          isBece ? 'border-amber-300' : isNcee ? 'border-emerald-300' : 'border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                              isBece ? 'bg-amber-100 text-amber-900' : isNcee ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                            }`}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                                  isBece ? 'bg-amber-100 text-amber-900' : isNcee ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {res.examType || (isBece ? 'BECE' : isNcee ? 'NCEE' : 'Result')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {res.candidateNumber || res.session}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 leading-snug">
                                {res.title}
                              </h4>
                            </div>
                          </div>
                        </div>

                        {/* Subject chips */}
                        {res.subjectBreakdown && res.subjectBreakdown.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Custom Subjects ({res.subjectBreakdown.length}):
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {res.subjectBreakdown.map((s, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold flex items-center gap-1">
                                  <span>{s.subject}</span>
                                  <strong className="text-blue-900">{s.grade || s.score}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aggregate & Remarks */}
                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] space-y-1 border border-slate-200">
                          {res.overallScore && (
                            <div>
                              <span className="text-slate-500 font-bold">Standing: </span>
                              <strong className="text-blue-950 font-bold">{res.overallScore}</strong>
                            </div>
                          )}
                          {res.placementStatus && (
                            <div>
                              <span className="text-slate-500 font-bold">Placement: </span>
                              <strong className="text-emerald-900 font-bold">{res.placementStatus}</strong>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            Uploaded by {res.uploadedBy || 'Academic Registry'} on {new Date(res.uploadedAt || Date.now()).toLocaleDateString()}
                            {res.updatedAt && ` • Altered on ${new Date(res.updatedAt).toLocaleDateString()}`}
                          </div>
                        </div>

                        {/* Action Buttons: View Certified Slip, Alter/Edit (Admin), Delete (Admin) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedStudent) {
                                setViewingResult({ result: res, student: selectedStudent });
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Statement Slip</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(res)}
                              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                              title="Alter subjects, marks, or remarks"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Alter</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(res.id, res.title)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete result record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BECE BROADSHEET (JSS 3 - SS 3 & ALUMNI) */}
        {activeViewTab === 'bece_broadsheet' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-900 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>BECE (Junior WAEC) Official Master Ledger</span>
                </h3>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Target cohort: <strong>JSS 3, SSS 1, SSS 2, SSS 3, and Alumni</strong>. Once posted, results are permanently locked into the student's portal and can only be altered here by Admin.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-left">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Scholar Name</th>
                    <th className="p-3">Admission Reg No</th>
                    <th className="p-3">Current / Former Class</th>
                    <th className="p-3">BECE Result Status</th>
                    <th className="p-3">Candidate / Exam No</th>
                    <th className="p-3">Aggregate Standing</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {beceCohortStudents.map((s, idx) => {
                    const beceRes = customResults.find(r => 
                      ((r as any).studentId === s.id || (r as any).studentRegNumber === s.regNumber) &&
                      (r.examType === 'BECE' || r.title.toLowerCase().includes('bece'))
                    );
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span>{s.name}</span>
                          {s.isAlumni && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-extrabold uppercase">
                              Alumni
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-blue-900 font-bold">{s.regNumber}</td>
                        <td className="p-3 text-slate-700">{s.isAlumni ? `Alumni (${s.graduationSession || 'Graduated'})` : s.grade}</td>
                        <td className="p-3">
                          {beceRes ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Posted ({beceRes.subjectBreakdown?.length || 0} Subjects)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                              <span>Pending Upload</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">
                          {beceRes?.candidateNumber || '—'}
                        </td>
                        <td className="p-3 text-slate-800 font-bold">
                          {beceRes?.overallScore || '—'}
                        </td>
                        <td className="p-3 text-right">
                          {beceRes ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingResult({ result: beceRes, student: s })}
                                className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-[11px] cursor-pointer"
                              >
                                View Slip
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(s.id);
                                  handleStartEdit(beceRes);
                                  setActiveViewTab('individual');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] cursor-pointer"
                              >
                                Alter
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(s.id);
                                handleStartCreate('BECE');
                                setActiveViewTab('individual');
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-[11px] cursor-pointer"
                            >
                              + Post BECE
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: NATIONAL COMMON ENTRANCE BROADSHEET (PRIMARY 5 & JSS 1) */}
        {activeViewTab === 'ncee_broadsheet' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-900 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>National Common Entrance Examination (NCEE) Ledger</span>
                </h3>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  Target cohort: <strong>Primary 5 & JSS 1 Scholars</strong>. Displays official entrance scores, percentile aggregate, and admission placement recommendations.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-left">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Scholar Name</th>
                    <th className="p-3">Admission Reg No</th>
                    <th className="p-3">Class Enrolled</th>
                    <th className="p-3">NCEE Result Status</th>
                    <th className="p-3">Candidate / Exam No</th>
                    <th className="p-3">Entrance Aggregate Score</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {nceeCohortStudents.map((s, idx) => {
                    const nceeRes = customResults.find(r => 
                      ((r as any).studentId === s.id || (r as any).studentRegNumber === s.regNumber) &&
                      (r.examType === 'NCEE' || r.title.toLowerCase().includes('common entrance'))
                    );
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 font-mono text-blue-900 font-bold">{s.regNumber}</td>
                        <td className="p-3 text-slate-700">{s.grade}</td>
                        <td className="p-3">
                          {nceeRes ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Posted ({nceeRes.subjectBreakdown?.length || 0} Subjects)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                              <span>Pending Upload</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">
                          {nceeRes?.candidateNumber || '—'}
                        </td>
                        <td className="p-3 text-emerald-950 font-bold">
                          {nceeRes?.overallScore || '—'}
                        </td>
                        <td className="p-3 text-right">
                          {nceeRes ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingResult({ result: nceeRes, student: s })}
                                className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-[11px] cursor-pointer"
                              >
                                View Slip
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(s.id);
                                  handleStartEdit(nceeRes);
                                  setActiveViewTab('individual');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-[11px] cursor-pointer"
                              >
                                Alter
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(s.id);
                                handleStartCreate('NCEE');
                                setActiveViewTab('individual');
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[11px] cursor-pointer"
                            >
                              + Post NCEE
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>
              All results posted here are cryptographically verified and permanently archived in the scholar's portal.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>

      {/* Modal for viewing the authentic certified statement slip */}
      {viewingResult && (
        <CertifiedExamResultSlipModal
          result={viewingResult.result}
          student={viewingResult.student}
          onClose={() => setViewingResult(null)}
          isAdmin={true}
          onEditByAdmin={(res) => {
            handleStartEdit(res);
            setViewingResult(null);
          }}
        />
      )}
    </div>
  );
};
