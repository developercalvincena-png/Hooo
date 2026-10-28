import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { StudentProfile, TutorProfile } from '../../../types';
import { 
  GraduationCap, 
  Search, 
  Award, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  ShieldCheck, 
  Users, 
  ChevronRight, 
  PlusCircle, 
  BookOpen, 
  ArrowRight, 
  Filter, 
  Database, 
  FileText, 
  Clock, 
  Trash2, 
  Check,
  UserPlus,
  Globe,
  RefreshCw,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Download
} from '../../RealIcons';
import { isRemoteEnabled } from '../../../lib/supabase';
import { NetlifyCloudSyncModal } from './NetlifyCloudSyncModal';
import { CustomResultsManagerModal } from './CustomResultsManagerModal';
import { AdminEditStudentModal } from './AdminEditStudentModal';
import { AdminFamilyLinkageModal } from './AdminFamilyLinkageModal';
import { AdminDownloadStudentLoginsModal } from './AdminDownloadStudentLoginsModal';
import { StudentRosterDirectoryModal } from '../../StudentRosterDirectoryModal';
import { BatchResultsUploadModal } from './BatchResultsUploadModal';
import { Edit3, Calendar as CalendarIcon, UploadCloud } from 'lucide-react';

export const AdminStudentsAlumniTab: React.FC = () => {
  const { 
    students, 
    classes,
    addStudent,
    deleteStudent,
    syncOnlineStudentsNow,
    onlineStudentsSynced,
    toggleStudentAlumni, 
    upgradeStudentToTutor, 
    createTutorAccount,
    alumniRegistrations,
    approveAlumniRegistration,
    rejectAlumniRegistration,
    deleteAlumniRegistration,
    updateStudent,
    houseStandings,
    schoolInfo 
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'alumni' | 'upgraded' | 'pending_alumni'>('all');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [studentToEdit, setStudentToEdit] = useState<StudentProfile | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [studentForCustomResults, setStudentForCustomResults] = useState<StudentProfile | null>(null);
  const [isRefreshingOnline, setIsRefreshingOnline] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDownloadLoginsModal, setShowDownloadLoginsModal] = useState(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false);

  const getScholarAge = (dob?: string): number | null => {
    if (!dob) return null;
    const b = new Date(dob);
    if (isNaN(b.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age >= 0 ? age : null;
  };

  // Upgrade confirmation modal
  const [studentToUpgrade, setStudentToUpgrade] = useState<StudentProfile | null>(null);

  // Admin New Scholar Registration Modal state
  const [showRegisterScholarModal, setShowRegisterScholarModal] = useState(false);
  const [isSubmittingScholar, setIsSubmittingScholar] = useState(false);
  const [createdScholar, setCreatedScholar] = useState<StudentProfile | null>(null);
  const [createdTutor, setCreatedTutor] = useState<TutorProfile | null>(null);
  const [scholarCopiedField, setScholarCopiedField] = useState<string | null>(null);

  // Admin Scholar Form fields
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('SSS 1 Science');
  const [formGender, setFormGender] = useState<'Male' | 'Female'>('Male');
  const [formDateOfBirth, setFormDateOfBirth] = useState('2010-04-15');
  const [formHouse, setFormHouse] = useState('Sapphire (Blue House)');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formAddress, setFormAddress] = useState('Ibadan, Oyo State');
  const [formPassword, setFormPassword] = useState('stanbax2025');
  const [formCustomRegNumber, setFormCustomRegNumber] = useState('');
  const [formCalvinTier, setFormCalvinTier] = useState<'regular' | 'premium'>('premium');
  const [formFeeDeposit, setFormFeeDeposit] = useState('265000');

  // New tutor modal
  const [showNewTutorModal, setShowNewTutorModal] = useState(false);
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorPassword, setNewTutorPassword] = useState('stanbax2025');
  const [newTutorDept, setNewTutorDept] = useState('Sciences & STEM Faculty');
  const [newTutorRole, setNewTutorRole] = useState('Subject Teacher');
  const [newTutorQual, setNewTutorQual] = useState('B.Sc / B.Ed, TRCN Certified');
  const [newTutorPhone, setNewTutorPhone] = useState('+234 803 000 0000');
  const [showRosterModal, setShowRosterModal] = useState(false);

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.house && s.house.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedHouseFilter !== 'all') {
      const match = s.house === selectedHouseFilter || 
        (s.house && (s.house.toLowerCase().includes(selectedHouseFilter.toLowerCase().split(' ')[0]) || selectedHouseFilter.toLowerCase().includes(s.house.toLowerCase())));
      if (!match) return false;
    }

    if (selectedClassFilter !== 'all') {
      const gNorm = (s.grade || '').toLowerCase();
      const targetNorm = selectedClassFilter.toLowerCase();
      if (targetNorm === 'kg 2' && !gNorm.includes('kg 2') && !gNorm.includes('nursery 2')) {
        return false;
      } else if (targetNorm.includes('primary') && !gNorm.includes(targetNorm) && !gNorm.includes(targetNorm.replace('primary', 'pry'))) {
        return false;
      } else if (targetNorm === 'sss 2 science' && !gNorm.includes('ss 2') && !gNorm.includes('sss 2')) {
        return false;
      } else if (!targetNorm.includes('primary') && targetNorm !== 'kg 2' && targetNorm !== 'sss 2 science') {
        if (!gNorm.includes(targetNorm)) return false;
      }
    }

    if (filterType === 'active') return !s.isAlumni;
    if (filterType === 'alumni') return !!s.isAlumni;
    if (filterType === 'upgraded') return !!s.isUpgradedTutor;
    return true;
  });

  const handleSaveStudentReassignments = (id: string, updates: Partial<StudentProfile>) => {
    updateStudent(id, updates);
    const targetStudent = students.find(s => s.id === id);
    const scholarName = updates.name || targetStudent?.name || 'Scholar';
    setSuccessMsg(`Successfully updated and reassigned profile for ${scholarName}!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete || isDeletingStudent) return;
    setIsDeletingStudent(true);
    try {
      deleteStudent(studentToDelete.id);
      setSuccessMsg(`Scholar ${studentToDelete.name} has been permanently deleted.`);
      setStudentToDelete(null);
    } catch {
      setErrorMsg('Failed to delete student.');
    } finally {
      setIsDeletingStudent(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4500);
    }
  };

  const handleToggleAlumni = (student: StudentProfile) => {
    const nextAlumniState = !student.isAlumni;
    toggleStudentAlumni(student.id, nextAlumniState);
    if (nextAlumniState) {
      setSuccessMsg(`${student.name} marked as Graduated Alumni. Their academic history is preserved, but they will no longer appear in active class lists or receive future updates.`);
    } else {
      setSuccessMsg(`${student.name} restored to Active Scholar enrollment.`);
    }
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleApproveAlumni = async (regId: string) => {
    const res = await approveAlumniRegistration(regId);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 5000);
  };

  const handleRejectAlumni = (regId: string) => {
    const res = rejectAlumniRegistration(regId);
    setSuccessMsg(res.message);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteAlumni = (regId: string) => {
    if (confirm('Are you sure you want to remove this alumni application record?')) {
      const res = deleteAlumniRegistration(regId);
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleConfirmUpgrade = () => {
    if (!studentToUpgrade) return;
    const res = upgradeStudentToTutor(studentToUpgrade.id);
    if (res.success) {
      setSuccessMsg(res.message);
      setStudentToUpgrade(null);
    } else {
      setErrorMsg(res.message);
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 5000);
  };

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorName.trim() || !newTutorEmail.trim()) return;

    const newT = createTutorAccount({
      name: newTutorName.trim(),
      email: newTutorEmail.trim(),
      password: newTutorPassword.trim() || 'stanbax2025',
      department: newTutorDept,
      role: newTutorRole,
      qualification: newTutorQual,
      assignedClasses: [],
      assignedSubjects: [],
      phone: newTutorPhone
    });

    setCreatedTutor(newT);
    setSuccessMsg(`Faculty Tutor account created for ${newTutorName} (${newT.staffId}). Initial password: ${newTutorPassword}. Saved permanently online.`);
    setShowNewTutorModal(false);
    setNewTutorName('');
    setNewTutorEmail('');
    setNewTutorPassword('stanbax2025');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleRefreshOnline = async () => {
    setIsRefreshingOnline(true);
    try {
      await syncOnlineStudentsNow();
      setSuccessMsg('Synchronized successfully with online server database (/api/students).');
    } catch {
      setErrorMsg('Could not refresh online scholars from server.');
    } finally {
      setIsRefreshingOnline(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
    }
  };

  const handleCopyScholarInfo = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setScholarCopiedField(id);
    setTimeout(() => setScholarCopiedField(null), 2500);
  };

  const handleRegisterScholarOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formParentName.trim() || !formParentPhone.trim()) {
      setErrorMsg('Please complete all required fields: Scholar Full Name, Parent Name, and Parent Phone.');
      setTimeout(() => setErrorMsg(''), 4500);
      return;
    }

    setIsSubmittingScholar(true);
    try {
      const targetClass = classes.find(c => c.name === formGrade);
      const feeTotal = targetClass?.tuitionPerTerm || 265000;
      const feePaid = Number(formFeeDeposit) || 0;
      const feeBalance = Math.max(0, feeTotal - feePaid);
      const feeStatus = feeBalance === 0 ? 'Fully Paid' : feePaid > 0 ? 'Partially Paid' : 'Outstanding';

      const res = await addStudent({
        name: formName.trim(),
        grade: formGrade,
        classId: targetClass?.id,
        gender: formGender,
        dateOfBirth: formDateOfBirth,
        house: formHouse,
        parentName: formParentName.trim(),
        parentPhone: formParentPhone.trim(),
        parentEmail: formParentEmail.trim(),
        address: formAddress.trim(),
        password: formPassword.trim() || 'stanbax2025',
        regNumber: formCustomRegNumber.trim() || undefined,
        feeTotal,
        feePaid,
        feeBalance,
        feeStatus,
        attendancePercent: 100,
        attendanceDays: 0,
        totalSchoolDays: 60,
        termAverage: 0,
        calvinAiAccess: {
          active: true,
          tier: formCalvinTier,
          tokenCode: `CALVIN-${Date.now().toString().slice(-6)}`,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          durationHours: 8760,
          questionsCount: 0
        }
      }, 'admin', 'Chief Administrator');

      if (res.success && res.student) {
        setCreatedScholar(res.student);
        setShowRegisterScholarModal(false);
        setSuccessMsg(`Scholar ${res.student.name} (${res.student.regNumber}) registered and saved permanently online to the server database.`);
        setFormName('');
        setFormParentName('');
        setFormParentPhone('');
        setFormParentEmail('');
        setFormAddress('');
        setFormCustomRegNumber('');
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setErrorMsg(res.message || 'Could not register scholar account online.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to commit scholar account online.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsSubmittingScholar(false);
    }
  };

  const activeCount = students.filter(s => !s.isAlumni).length;
  const alumniCount = students.filter(s => s.isAlumni).length;
  const upgradedCount = students.filter(s => s.isUpgradedTutor).length;
  const pendingAlumniCount = alumniRegistrations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-950">
            <GraduationCap className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black">Scholars, Admissions & Faculty Accounts</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Register new scholars directly online, manage active admissions and alumni records, create faculty tutor accounts, and configure permissions. All accounts save directly to the central online database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleRefreshOnline}
            disabled={isRefreshingOnline}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-300 disabled:opacity-50"
            title="Synchronize and verify with server database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOnline ? 'animate-spin text-blue-900' : 'text-slate-600'}`} />
            <span>{isRefreshingOnline ? 'Syncing...' : 'Sync Server'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreatedScholar(null);
              setShowRegisterScholarModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2"
            id="btn-admin-register-scholar"
          >
            <UserPlus className="w-4 h-4 text-neutral-950" />
            <span>Register New Scholar</span>
          </button>

          {/* Enrolled Student Roster & Fast Sign-In Directory Button */}
          <button
            type="button"
            onClick={() => setShowRosterModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-900 hover:to-amber-950 text-white text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2 border border-amber-500/40 active:scale-98"
            title="View Enrolled Student Roster & Fast Sign-In Directory"
            id="btn-admin-tab-student-roster"
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>Enrolled Student Roster</span>
            <span className="text-[10px] font-bold bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full ml-1">
              {students.length} Scholars
            </span>
          </button>

          {/* Download Student & Parent Logins Button (Tabulated) */}
          <button
            type="button"
            onClick={() => setShowDownloadLoginsModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2 border border-emerald-500/40 active:scale-98"
            title="Download names of all students, class, password, and parent login in tabulated format"
            id="btn-admin-tab-download-logins"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Download Logins</span>
            <span className="text-[10px] font-bold bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full ml-1">
              Tabulated
            </span>
          </button>

          {/* Batch Upload Results Button */}
          <button
            type="button"
            onClick={() => setShowBatchUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2 border border-blue-400/40 active:scale-98"
            title="Batch upload CSV/JSON student results, auto-sync existing students, and auto-provision accounts for new scholars"
            id="btn-admin-tab-batch-upload-results"
          >
            <UploadCloud className="w-4 h-4 text-cyan-300" />
            <span>Batch Upload Results</span>
            <span className="text-[10px] font-bold bg-cyan-400 text-slate-900 px-2 py-0.5 rounded-full ml-1">
              CSV / JSON
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowFamilyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-300 text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-2"
            title="Assign siblings to one parent, merge parent accounts, and manage family links"
            id="btn-admin-family-linkage"
          >
            <Users className="w-4 h-4 text-purple-700" />
            <span>Family & Sibling Linkage</span>
          </button>

          <button
            onClick={() => setStudentForCustomResults(students[0] || null)}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-2"
            title="Upload and manage custom result slips, WAEC, NECO, and certified certificates"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Manage Custom Results</span>
          </button>

          <button
            onClick={() => setShowNewTutorModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
            id="btn-create-tutor-account"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create New Tutor Account</span>
          </button>
        </div>
      </div>

      {/* Online Server Database Persistence Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-emerald-950">
                Online Central Database Active (<code className="text-emerald-800 font-mono font-bold">/api/students</code> & <code className="text-emerald-800 font-mono font-bold">/api/tutors</code>)
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Permanent Server Persistence
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug mt-1">
              All accounts created by Administrators and Moderators are committed directly to the central online server database. Credentials persist permanently worldwide across all browsers, phones, and computers without relying on local storage.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefreshOnline}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOnline ? 'animate-spin' : ''}`} />
          <span>Verify Online Sync</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'all' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-xs uppercase font-bold opacity-80">Total Registered</div>
          <div className="text-2xl font-black mt-1">{students.length}</div>
        </div>

        <div 
          onClick={() => setFilterType('active')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'active' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-xs uppercase font-bold opacity-80">Active Scholars</div>
          <div className="text-2xl font-black mt-1">{activeCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('alumni')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'alumni' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-xs uppercase font-bold opacity-80">Graduated Alumni</div>
          <div className="text-2xl font-black mt-1 text-amber-500">{alumniCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('pending_alumni')}
          className={`p-4 rounded-2xl border transition cursor-pointer relative ${
            filterType === 'pending_alumni' ? 'bg-amber-700 text-white border-amber-700 shadow-sm' : 'bg-white border-amber-300 text-slate-800'
          }`}
        >
          <div className="text-xs uppercase font-bold text-amber-800 opacity-90">Pending Alumni</div>
          <div className="text-2xl font-black mt-1 text-amber-600">{pendingAlumniCount}</div>
          {pendingAlumniCount > 0 && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              Needs Review
            </span>
          )}
        </div>

        <div 
          onClick={() => setFilterType('upgraded')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'upgraded' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-xs uppercase font-bold opacity-80">Promoted to Tutors</div>
          <div className="text-2xl font-black mt-1 text-emerald-400">{upgradedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, Reg No, or class..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
            />
          </div>

          {/* Class Filter Dropdown */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-800 shrink-0"
            title="Filter roster by Enrolled Class / Grade"
          >
            <option value="all">All Classes / Grades</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            {!classes.some(c => c.name.toLowerCase() === 'kg 2') && (
              <option value="Kg 2">Kg 2</option>
            )}
            {!classes.some(c => c.name.toLowerCase() === 'primary 1') && (
              <option value="Primary 1">Primary 1</option>
            )}
          </select>

          {/* House Filter Dropdown */}
          <select
            value={selectedHouseFilter}
            onChange={(e) => setSelectedHouseFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-800 shrink-0"
            title="Filter roster by Inter-House Sports Team"
          >
            <option value="all">All Athletic Houses</option>
            {houseStandings.map(h => (
              <option key={h.name} value={h.name}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">Filter:</span>
          {([
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'alumni', label: 'Alumni' },
            { id: 'pending_alumni', label: `Pending (${pendingAlumniCount})` },
            { id: 'upgraded', label: 'Tutors' }
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition cursor-pointer shrink-0 ${
                filterType === item.id 
                  ? (item.id === 'pending_alumni' ? 'bg-amber-600 text-white' : 'bg-blue-900 text-white') 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Alumni Applications Review Section */}
      {alumniRegistrations.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-5 sm:p-6 border border-amber-300 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-950">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black">
                Pending Alumni Registration Requests ({alumniRegistrations.filter(r => r.status === 'pending').length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Action Required by Admin or Academic Delegate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alumniRegistrations.filter(r => r.status === 'pending').map((reg) => (
              <div 
                key={reg.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{reg.fullName}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {reg.formerRegNumber || 'Reg No Not Provided'}
                      </span>
                      <span>•</span>
                      <span>Class of {reg.graduationYear}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    Pending
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                    <span className="font-medium text-slate-800 break-all">{reg.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                    <span className="font-medium text-slate-800">{reg.phone}</span>
                  </div>
                  {reg.currentOccupation && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Occupation / Institution</span>
                      <span className="font-medium text-slate-800">{reg.currentOccupation} {reg.currentInstitution ? `(${reg.currentInstitution})` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleRejectAlumni(reg.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveAlumni(reg.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Account</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Directory List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-xs border border-slate-200">
            No scholars match your current search and filter criteria.
          </div>
        ) : (
          filteredStudents.map((std) => (
            <div 
              key={std.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                std.isAlumni ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Scholar Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{std.name}</span>
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {std.regNumber}
                  </span>

                  {std.isAlumni && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide border border-amber-300">
                      Alumni • {std.graduationSession || 'Class Completed'}
                    </span>
                  )}

                  {std.isUpgradedTutor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      Elevated to Faculty Tutor
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  <span>Class: <strong className="text-slate-900 font-extrabold">{std.grade}</strong></span>
                  <span>•</span>
                  <span>
                    Gender: <strong className="text-slate-800">{std.gender || 'Not Specified'}</strong>
                  </span>
                  {std.dateOfBirth && (
                    <>
                      <span>•</span>
                      <span>
                        DOB: <strong className="text-slate-800">{std.dateOfBirth}</strong>
                        {getScholarAge(std.dateOfBirth) !== null && (
                          <span className="ml-1 text-[11px] text-blue-800 font-bold">
                            ({getScholarAge(std.dateOfBirth)} yrs)
                          </span>
                        )}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>Annual Average: <strong className="text-slate-800">{std.termAverage}%</strong></span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">House:</span>
                    {(() => {
                      const matchedHouse = (houseStandings || []).find(h => 
                        h.name.toLowerCase() === (std.house || '').toLowerCase() ||
                        h.name.toLowerCase().includes((std.house || '').toLowerCase()) ||
                        (std.house || '').toLowerCase().includes(h.name.toLowerCase())
                      ) || houseStandings?.[0];
                      return (
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                          {matchedHouse?.color && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs border border-white"
                              style={{ backgroundColor: matchedHouse.color }}
                            />
                          )}
                          <select
                            value={std.house || ''}
                            onChange={(e) => {
                              updateStudent(std.id, { house: e.target.value });
                              setSuccessMsg(`Assigned ${std.name} to ${e.target.value || 'Unassigned House'}`);
                              setTimeout(() => setSuccessMsg(''), 3500);
                            }}
                            className="text-xs font-bold text-slate-800 bg-transparent border-none cursor-pointer outline-none focus:ring-0 p-0"
                            title="Change this scholar's assigned athletic house"
                          >
                            <option value="">-- Unassigned --</option>
                            {houseStandings.map(h => (
                              <option key={h.name} value={h.name}>
                                {h.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {std.isAlumni && (
                  <p className="text-[11px] text-amber-800 font-medium">
                    Academic records and transcripts are preserved in the Alumni Archive. Future class submissions and roster updates are closed.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Reassign & Edit Scholar Profile */}
                <button
                  type="button"
                  onClick={() => setStudentToEdit(std)}
                  className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer border border-blue-800 active:scale-98"
                  title="Reassign Class, Athletic House, DOB, Age, Gender or Portal Credentials"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Reassign & Edit</span>
                </button>

                {/* Custom Results Manager */}
                <button
                  type="button"
                  onClick={() => setStudentForCustomResults(std)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Upload or view custom/external results and certificates for this scholar"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-800" />
                  <span>Results & Transcripts</span>
                </button>

                {/* Toggle Alumni Status */}
                <button
                  onClick={() => handleToggleAlumni(std)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    std.isAlumni
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-amber-500 hover:bg-amber-600 text-blue-950 border-amber-400 shadow-sm'
                  }`}
                  title={std.isAlumni ? 'Reactivate as active student' : 'Mark as graduated alumni'}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{std.isAlumni ? 'Restore to Active Class' : 'Mark as Alumni'}</span>
                </button>

                {/* Upgrade to Tutor Privilege */}
                {!std.isUpgradedTutor ? (
                  <button
                    onClick={() => setStudentToUpgrade(std)}
                    className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Promote to Faculty Tutor"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upgrade to Tutor</span>
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    Tutor Privilege Active
                  </span>
                )}

                {/* Delete Scholar Button */}
                <button
                  type="button"
                  onClick={() => setStudentToDelete(std)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200 active:scale-98"
                  title="Permanently delete this scholar account and records"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Upgrade Student to Tutor */}
      {studentToUpgrade && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-black">Promote Scholar to Faculty Tutor</h3>
                <p className="text-xs text-slate-500">Grant teaching and assessment privileges.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2 text-xs text-slate-700">
              <p>
                You are elevating <strong>{studentToUpgrade.name}</strong> ({studentToUpgrade.regNumber}) to an Associate Faculty Tutor account.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                <li>A new Faculty Staff ID (e.g. STX-TUT-XXX) will be provisioned.</li>
                <li>Initial password will mirror their scholar credentials or standard default.</li>
                <li><strong>Onboarding Requirement:</strong> Upon first logging in to the Tutor Portal, they will be required to complete their profile details (Department, assigned subjects, qualifications, and bio).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToUpgrade(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Tutor Account */}
      {showNewTutorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                <PlusCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-black">Provision New Faculty Tutor Account</h3>
                <p className="text-xs text-slate-500">Register and configure credentials for a new educator.</p>
              </div>
            </div>

            <form onSubmit={handleCreateTutor} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={newTutorName}
                  onChange={(e) => setNewTutorName(e.target.value)}
                  placeholder="e.g. Dr. Oladipo Adeleke"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newTutorEmail}
                    onChange={(e) => setNewTutorEmail(e.target.value)}
                    placeholder="o.adeleke@stanbaxschools.edu.ng"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newTutorPassword}
                    onChange={(e) => setNewTutorPassword(e.target.value)}
                    placeholder="Enter initial password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    value={newTutorDept}
                    onChange={(e) => setNewTutorDept(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  >
                    <option value="Sciences & STEM Faculty">Sciences & STEM Faculty</option>
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                    <option value="Languages & Humanities">Languages & Humanities</option>
                    <option value="Arts, Music & Vocational">Arts, Music & Vocational</option>
                    <option value="Junior Secondary & Basic">Junior Secondary & Basic</option>
                    <option value="Primary & Early Years">Primary & Early Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Faculty Role
                  </label>
                  <input
                    type="text"
                    required
                    value={newTutorRole}
                    onChange={(e) => setNewTutorRole(e.target.value)}
                    placeholder="e.g. Senior Physics & Chemistry Tutor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Academic Qualifications
                  </label>
                  <input
                    type="text"
                    required
                    value={newTutorQual}
                    onChange={(e) => setNewTutorQual(e.target.value)}
                    placeholder="e.g. M.Sc Chemistry, PGDE, TRCN"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newTutorPhone}
                    onChange={(e) => setNewTutorPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTutorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Register Tutor Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Scholar Credentials Slip (Admin Creation) */}
      {createdScholar && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fade-in text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Scholar Account Created Online</h3>
                <p className="text-xs text-slate-500">Official student registration slip & portal login credentials.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Saved permanently online to server database (<code className="font-mono text-emerald-800">/api/students</code>). Ready for instant login!</span>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold">Scholar Name:</span>
                <span className="font-black text-sm text-slate-900">{createdScholar.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[11px] block uppercase font-bold">Class / Grade:</span>
                  <span className="font-bold text-slate-800">{createdScholar.grade}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block uppercase font-bold">House:</span>
                  <span className="font-bold text-slate-800">{createdScholar.house || 'Sapphire'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Portal Registration Number (ID):</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-blue-900 text-sm">
                  <span>{createdScholar.regNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdScholar.regNumber);
                      setScholarCopiedField('reg');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Registration Number"
                  >
                    {scholarCopiedField === 'reg' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Initial Password / PIN:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-800 text-xs">
                  <span>{createdScholar.password || 'stanbax2025'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdScholar.password || 'stanbax2025');
                      setScholarCopiedField('pass');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Password"
                  >
                    {scholarCopiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Official Student Email:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-slate-700 text-xs">
                  <span>{createdScholar.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdScholar.email || '');
                      setScholarCopiedField('email');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Email"
                  >
                    {scholarCopiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const slip = `STANBAX SCHOOLS IBADAN - SCHOLAR REGISTRATION SLIP\nName: ${createdScholar.name}\nClass: ${createdScholar.grade}\nRegistration Number: ${createdScholar.regNumber}\nPortal Password: ${createdScholar.password || 'stanbax2025'}\nEmail: ${createdScholar.email}\nPortal URL: ${window.location.origin}`;
                  navigator.clipboard.writeText(slip);
                  setScholarCopiedField('slip');
                  setTimeout(() => setScholarCopiedField(null), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {scholarCopiedField === 'slip' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{scholarCopiedField === 'slip' ? 'Full Slip Copied!' : 'Copy Full Slip'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedScholar(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-md cursor-pointer transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Faculty Tutor Credentials Slip (Admin Creation) */}
      {createdTutor && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fade-in text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Faculty Tutor Account Created</h3>
                <p className="text-xs text-slate-500">Official staff credentials saved online for faculty workspace login.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Saved permanently online to server database (<code className="font-mono text-emerald-800">/api/tutors</code>). Ready for instant login!</span>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold">Faculty Name:</span>
                <span className="font-black text-sm text-slate-900">{createdTutor.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[11px] block uppercase font-bold">Department:</span>
                  <span className="font-bold text-slate-800">{createdTutor.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block uppercase font-bold">Designation:</span>
                  <span className="font-bold text-slate-800">{createdTutor.role}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Staff ID:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-blue-900 text-sm">
                  <span>{createdTutor.staffId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTutor.staffId || '');
                      setScholarCopiedField('staffId');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Staff ID"
                  >
                    {scholarCopiedField === 'staffId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Staff Email:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-slate-700 text-xs">
                  <span>{createdTutor.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTutor.email);
                      setScholarCopiedField('tutorEmail');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Email"
                  >
                    {scholarCopiedField === 'tutorEmail' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase font-bold mb-1">Initial Password:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-800 text-xs">
                  <span>{createdTutor.password || 'stanbax2025'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTutor.password || 'stanbax2025');
                      setScholarCopiedField('tutorPass');
                      setTimeout(() => setScholarCopiedField(null), 2500);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Copy Password"
                  >
                    {scholarCopiedField === 'tutorPass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreatedTutor(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-md cursor-pointer transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Netlify Cloud Sync Modal */}
      <NetlifyCloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* Custom & External Results Manager Modal */}
      {studentForCustomResults && (
        <CustomResultsManagerModal
          initialStudent={studentForCustomResults}
          onClose={() => setStudentForCustomResults(null)}
        />
      )}

      {/* Admin Reassign & Edit Student Profile Modal */}
      <AdminEditStudentModal
        isOpen={!!studentToEdit}
        onClose={() => setStudentToEdit(null)}
        student={studentToEdit}
        classes={classes}
        houseStandings={houseStandings}
        onSave={handleSaveStudentReassignments}
        onDelete={(id) => {
          setStudentToEdit(null);
          const s = students.find(x => x.id === id);
          if (s) setStudentToDelete(s);
        }}
      />

      {/* Admin Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">Delete Scholar Account</h3>
                <p className="text-xs text-slate-500">Permanent record removal</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-rose-50 text-xs space-y-1.5 text-rose-900 border border-rose-200">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  Irreversible Action
                </div>
                <p className="text-slate-600">
                  Are you sure you want to permanently delete this scholar? This removes their student record, portal login access, credentials, and academic results.
                </p>
                <div className="pt-2 border-t border-rose-200 text-slate-800">
                  <div><strong>Scholar Name:</strong> {studentToDelete.name}</div>
                  <div><strong>Reg Number:</strong> <span className="font-mono">{studentToDelete.regNumber}</span></div>
                  <div><strong>Class:</strong> {studentToDelete.grade}</div>
                  {studentToDelete.parentName && (
                    <div><strong>Parent:</strong> {studentToDelete.parentName} ({studentToDelete.parentPhone})</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={() => setStudentToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={handleConfirmDeleteStudent}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingStudent ? 'Deleting...' : 'Permanently Delete Scholar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Family & Sibling Linkage Modal */}
      <AdminFamilyLinkageModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      {/* Enrolled Student Roster & Fast Sign-In Directory Modal */}
      <StudentRosterDirectoryModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        students={students}
        onSelectStudent={(student) => {
          setShowRosterModal(false);
          localStorage.setItem('stanbax_student_auth', 'true');
          localStorage.setItem('stanbax_student_id', student.id);
          localStorage.setItem('stanbax_active_section', 'student-portal');
          window.location.reload();
        }}
      />

      {/* Download Student Names & Parent Logins Directory Modal */}
      <AdminDownloadStudentLoginsModal
        isOpen={showDownloadLoginsModal}
        onClose={() => setShowDownloadLoginsModal(false)}
      />

      {/* Batch Results Upload & Account Provisioning Modal */}
      <BatchResultsUploadModal
        isOpen={showBatchUploadModal}
        onClose={() => setShowBatchUploadModal(false)}
      />
    </div>
  );
};
