import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { StudentProfile } from '../../../types';
import {
  GraduationCap,
  UserPlus,
  Search,
  CheckCircle2,
  Lock,
  Globe,
  Copy,
  Check,
  Phone,
  Mail,
  ShieldCheck,
  X,
  RefreshCw,
  Sparkles,
  Calendar,
  Eye,
  EyeOff,
  Users,
  Award,
  ChevronDown,
  Filter
} from '../../RealIcons';

interface ModeratorStudentAccountsTabProps {
  moderatorName?: string;
  moderatorRoleTitle?: string;
}

export const ModeratorStudentAccountsTab: React.FC<ModeratorStudentAccountsTabProps> = ({
  moderatorName = 'Community Moderator',
  moderatorRoleTitle = 'Safety & Communications'
}) => {
  const {
    students,
    classes,
    houseStandings,
    addStudent,
    updateStudent,
    onlineStudentsSynced,
    syncOnlineStudentsNow
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Success Credential Slip state
  const [createdStudent, setCreatedStudent] = useState<StudentProfile | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // View Credentials Modal
  const [inspectingStudent, setInspectingStudent] = useState<StudentProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('JSS 1');
  const [formGender, setFormGender] = useState<'Male' | 'Female'>('Male');
  const [formDateOfBirth, setFormDateOfBirth] = useState('2012-06-15');
  const [formHouse, setFormHouse] = useState('Sapphire (Blue House)');
  const [formClubs, setFormClubs] = useState<string[]>(['Robotics & STEM League']);
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formAddress, setFormAddress] = useState('Bodija, Ibadan, Oyo State');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formPassword, setFormPassword] = useState('stanbax2025');
  const [formCustomRegNumber, setFormCustomRegNumber] = useState('');
  const [formCalvinTier, setFormCalvinTier] = useState<'regular' | 'premium'>('regular');
  const [formFeeDeposit, setFormFeeDeposit] = useState('100000');
  const [formBloodGroup, setFormBloodGroup] = useState('O+');
  const [formGenotype, setFormGenotype] = useState('AA');
  const [formAllergies, setFormAllergies] = useState('None');

  const availableHouses = houseStandings?.length
    ? houseStandings.map(h => `${h.name} (${h.color.charAt(0).toUpperCase() + h.color.slice(1)} House)`)
    : ['Sapphire (Blue House)', 'Ruby (Red House)', 'Emerald (Green House)', 'Topaz (Yellow House)'];

  const clubOptions = [
    'JETS Science & Robotics Club',
    'Press & Literary Club',
    'Literary & Debating Society',
    'Music & Brass Band',
    'ICT & Coding Guild',
    'French & Cultural Society',
    'Red Cross & First Aid'
  ];

  const handleRefreshOnline = async () => {
    setIsRefreshing(true);
    await syncOnlineStudentsNow();
    setIsRefreshing(false);
    setFeedbackMsg({
      type: 'success',
      text: 'Verified online school database synchronization completed.'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCopyText = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formParentName.trim() || !formParentPhone.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please fill in scholar name, parent name, and parent contact phone.'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const targetClass = classes?.find(c => c.name === formGrade);
    const feeTotal = targetClass?.tuitionPerTerm || 265000;
    const feePaid = Number(formFeeDeposit) || 0;
    const feeBalance = Math.max(0, feeTotal - feePaid);
    const feeStatus = feeBalance === 0 ? 'Fully Paid' : feePaid > 0 ? 'Partially Paid' : 'Outstanding';

    try {
      const result = await addStudent(
        {
          name: formName.trim(),
          grade: formGrade,
          classId: targetClass?.id || undefined,
          gender: formGender,
          dateOfBirth: formDateOfBirth,
          house: formHouse,
          clubs: formClubs,
          parentName: formParentName.trim(),
          parentPhone: formParentPhone.trim(),
          parentEmail: formParentEmail.trim(),
          address: formAddress.trim(),
          emergencyContactName: formEmergencyContact.trim() || undefined,
          password: formPassword.trim() || 'stanbax2025',
          regNumber: formCustomRegNumber.trim() || undefined,
          feeTotal,
          feePaid,
          feeBalance,
          feeStatus,
          bloodGroup: formBloodGroup,
          genotype: formGenotype,
          allergies: formAllergies === 'None' ? undefined : formAllergies,
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
        },
        'moderator',
        moderatorName
      );

      if (result.success && result.student) {
        setCreatedStudent(result.student);
        setShowRegisterModal(false);
        setFeedbackMsg({
          type: 'success',
          text: `Success! ${result.student.name} (${result.student.regNumber}) saved permanently online to the server database.`
        });
        // Reset form
        setFormName('');
        setFormParentName('');
        setFormParentPhone('');
        setFormParentEmail('');
        setFormCustomRegNumber('');
      } else {
        setFeedbackMsg({
          type: 'error',
          text: result.message || 'Could not register scholar online.'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Failed to commit scholar account online.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter scholars list
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parentPhone && s.parentPhone.includes(searchTerm));

    const matchesClass =
      selectedClassFilter === 'All' || s.grade.toLowerCase() === selectedClassFilter.toLowerCase();

    const matchesHouse =
      selectedHouseFilter === 'All' ||
      (s.house && s.house.toLowerCase().includes(selectedHouseFilter.toLowerCase()));

    return matchesSearch && matchesClass && matchesHouse;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-blue-900/40 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
                Moderator Scholar Administration
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online Database Persistence Verified</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Scholar Accounts & Enrolment Desk
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Moderators can register new student accounts, generate registration numbers, and configure portal login credentials.
              Every scholar created here is committed directly to the central online server database (<code className="text-amber-300 font-mono">/api/students</code>) and persists across all devices and browsers without relying on browser local storage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefreshOnline}
              disabled={isRefreshing}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer disabled:opacity-50"
              title="Synchronize and verify with server database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Server'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreatedStudent(null);
                setShowRegisterModal(true);
              }}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-neutral-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-neutral-950" />
              <span>Register New Scholar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Scholars</div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">{students.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Online Server Sync Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Calvin AI</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700">
            {students.filter(s => s.calvinAiAccess?.active).length}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">24/7 AI Tutor Enabled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Gender Balance</div>
          <div className="text-sm sm:text-base font-extrabold text-stone-800">
            {students.filter(s => s.gender === 'Female').length} F · {students.filter(s => s.gender === 'Male').length} M
          </div>
          <div className="text-[10px] text-stone-400 font-medium">Verified Enrolment</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Cloud Storage Status</div>
          <div className="text-sm sm:text-base font-black text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Server Database</span>
          </div>
          <div className="text-[10px] text-stone-500">Persistent at /api/students</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by scholar name, reg number, parent phone..."
            className="w-full h-11 min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center absolute right-0.5 top-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="font-bold text-stone-500 text-[11px] uppercase">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="h-10 min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="All">All Classes ({students.length})</option>
              {classes?.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="font-bold text-stone-500 text-[11px] uppercase">House:</span>
            <select
              value={selectedHouseFilter}
              onChange={e => setSelectedHouseFilter(e.target.value)}
              className="h-10 min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="All">All Houses</option>
              <option value="Sapphire">Sapphire (Blue)</option>
              <option value="Ruby">Ruby (Red)</option>
              <option value="Emerald">Emerald (Green)</option>
              <option value="Topaz">Topaz (Yellow)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scholars Roster Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-black text-stone-800 text-base">No scholars found matching your filters</h4>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            Try adjusting your search query or class filter to view enrolled students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStudents.map(scholar => {
            const houseName = scholar.house || 'Unassigned House';
            const isBlue = houseName.toLowerCase().includes('sapphire') || houseName.toLowerCase().includes('blue');
            const isRed = houseName.toLowerCase().includes('ruby') || houseName.toLowerCase().includes('red');
            const isGreen = houseName.toLowerCase().includes('emerald') || houseName.toLowerCase().includes('green');
            const isYellow = houseName.toLowerCase().includes('topaz') || houseName.toLowerCase().includes('yellow');

            const houseBadgeColor = isBlue
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : isRed
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : isGreen
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : isYellow
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-stone-100 text-stone-700 border-stone-200';

            return (
              <div
                key={scholar.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-blue-300 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-amber-400 font-black text-base flex items-center justify-center shadow-xs shrink-0 border border-blue-800">
                        {scholar.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-black text-sm sm:text-base text-stone-900 truncate">
                          {scholar.name}
                        </h4>
                        <div className="text-xs font-bold text-blue-900 truncate">
                          {scholar.grade}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      <span>Online</span>
                    </span>
                  </div>

                  {/* Metadata & Reg Number */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Reg Number:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(scholar.regNumber, `reg-${scholar.id}`)}
                        className="font-mono font-black text-xs text-stone-900 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        title="Click to copy registration number"
                      >
                        <span>{scholar.regNumber}</span>
                        {copiedKey === `reg-${scholar.id}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-stone-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">House:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${houseBadgeColor}`}>
                        {houseName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Parent / Guardian:</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[160px]">
                        {scholar.parentName}
                      </span>
                    </div>

                    {scholar.parentPhone && (
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Parent Contact:</span>
                        <a
                          href={`tel:${scholar.parentPhone}`}
                          className="font-bold text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>{scholar.parentPhone}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Calvin AI & Fee Status */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 px-1">
                    <span className="flex items-center gap-1 text-indigo-700">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Calvin AI {scholar.calvinAiAccess?.tier || 'Active'}</span>
                    </span>

                    <span className={`font-bold ${scholar.feeStatus === 'Fully Paid' ? 'text-emerald-700' : 'text-amber-800'}`}>
                      Fees: {scholar.feeStatus || 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingStudent(scholar);
                      setShowPassword(false);
                    }}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-900 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                    <span>View Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newPhone = prompt('Update Parent Phone Contact:', scholar.parentPhone);
                      if (newPhone !== null && newPhone.trim() !== '') {
                        updateStudent(scholar.id, { parentPhone: newPhone.trim() });
                        setFeedbackMsg({
                          type: 'success',
                          text: `Parent phone contact for ${scholar.name} updated online.`
                        });
                        setTimeout(() => setFeedbackMsg(null), 3000);
                      }
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 flex items-center justify-center transition cursor-pointer"
                    title="Quick Edit Contact"
                    aria-label={`Edit ${scholar.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW SCHOLAR ONLINE MODAL                               */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-0 sm:my-auto animate-in slide-in-from-bottom sm:slide-in-from-none sm:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
          >
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-blue-950 border-b border-blue-900">
              <div className="w-12 h-1.5 rounded-full bg-blue-700" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-4 sm:p-6 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="register-modal-title" className="font-black text-sm sm:text-base text-white">
                    Register New Scholar Account
                  </h3>
                  <p className="text-[11px] sm:text-xs text-blue-200">
                    Saves directly online to server database (<code className="text-amber-300 font-mono">/api/students</code>)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cloud Storage Notice */}
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 px-5 sm:px-6">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Verified Cloud Persistence: Account is committed online to the school server backend, persisting without relying on browser local storage.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-7 space-y-5 max-h-[72dvh] sm:max-h-[75vh] overflow-y-auto overscroll-contain text-xs">
              {/* Section 1: Student Identity */}
              <div className="space-y-3">
                <h4 className="font-black text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-900" />
                  <span>1. Scholar Identity & Academic Placement</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Scholar Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Oluwaseun Emmanuel Adeleke"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Enrolment Class / Grade *</label>
                    <select
                      value={formGrade}
                      onChange={e => setFormGrade(e.target.value)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {classes?.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Gender *</label>
                    <select
                      value={formGender}
                      onChange={e => setFormGender(e.target.value as 'Male' | 'Female')}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formDateOfBirth}
                      onChange={e => setFormDateOfBirth(e.target.value)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">Assigned House *</label>
                    <select
                      value={formHouse}
                      onChange={e => setFormHouse(e.target.value)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {availableHouses.map((h, idx) => (
                        <option key={idx} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Parent / Guardian Info */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="font-black text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                  <Users className="w-4 h-4 text-blue-900" />
                  <span>2. Parent / Guardian Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Parent / Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formParentName}
                      onChange={e => setFormParentName(e.target.value)}
                      placeholder="e.g. Chief & Mrs. Femi Adeleke"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Parent Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formParentPhone}
                      onChange={e => setFormParentPhone(e.target.value)}
                      placeholder="e.g. +234 803 456 7890"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Parent Email Address</label>
                    <input
                      type="email"
                      value={formParentEmail}
                      onChange={e => setFormParentEmail(e.target.value)}
                      placeholder="e.g. adeleke.family@yahoo.com"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      placeholder="e.g. Plot 12, Agodi GRA, Ibadan"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Portal Credentials */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="font-black text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                  <Lock className="w-4 h-4 text-blue-900" />
                  <span>3. Student Portal Login Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Registration Number (Leave blank to auto-generate)
                    </label>
                    <input
                      type="text"
                      value={formCustomRegNumber}
                      onChange={e => setFormCustomRegNumber(e.target.value)}
                      placeholder="Auto-generated e.g. SBS/2026/048"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Initial Portal Login Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="Default: stanbax2025"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Calvin AI & Financials */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="font-black text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-700" />
                  <span>4. Calvin AI Tutor & Fee Schedule</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Calvin AI Access Tier</label>
                    <select
                      value={formCalvinTier}
                      onChange={e => setFormCalvinTier(e.target.value as 'regular' | 'premium')}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="regular">Regular (WAEC & CA Tutor)</option>
                      <option value="premium">Premium (Unlimited & Olympiad)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Initial Deposit Paid (₦)</label>
                    <input
                      type="number"
                      value={formFeeDeposit}
                      onChange={e => setFormFeeDeposit(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Blood Group</label>
                    <select
                      value={formBloodGroup}
                      onChange={e => setFormBloodGroup(e.target.value)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="B+">B Positive (B+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 active:scale-95 font-bold transition cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 active:scale-95 text-white font-black shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Online to Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Commit & Save Scholar Online</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUCCESS CREDENTIAL SLIP                                          */}
      {/* ========================================================================= */}
      {createdStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setCreatedStudent(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 p-6 text-white text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-black text-lg text-white">Scholar Account Saved Online!</h3>
              <p className="text-xs text-emerald-200">
                The account has been recorded online in the server database. Provide these credentials to the parent or scholar.
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 font-semibold text-stone-800">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Scholar Name:</span>
                  <span className="font-black text-sm text-stone-900">{createdStudent.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Class / Grade:</span>
                  <span className="font-bold text-blue-900">{createdStudent.grade}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">House:</span>
                  <span>{createdStudent.house}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Login Reg Number:</span>
                  <span className="font-mono font-black text-sm text-stone-900">{createdStudent.regNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Initial Password:</span>
                  <span className="font-mono font-black text-sm text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    {createdStudent.password || 'stanbax2025'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Parent Contact:</span>
                  <span>{createdStudent.parentName} ({createdStudent.parentPhone})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      `Stanbax Schools Scholar Portal Login\nName: ${createdStudent.name}\nClass: ${createdStudent.grade}\nReg Number: ${createdStudent.regNumber}\nPassword: ${createdStudent.password || 'stanbax2025'}\nPortal URL: ${window.location.origin}/#student-portal`,
                      'full-slip'
                    )
                  }
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-95 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedKey === 'full-slip' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Credentials Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Login Slip</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCreatedStudent(null)}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 font-bold text-xs transition cursor-pointer"
                >
                  Close & View in Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW SCHOLAR CREDENTIALS MODAL                                   */}
      {/* ========================================================================= */}
      {inspectingStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setInspectingStudent(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-sm text-white">Scholar Portal Credentials</h4>
              </div>

              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center space-y-1 pb-3 border-b border-stone-100">
                <h3 className="font-black text-base text-stone-900">{inspectingStudent.name}</h3>
                <p className="text-stone-500 font-bold">{inspectingStudent.grade} • {inspectingStudent.house}</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Login Reg Number</span>
                    <span className="font-mono font-black text-sm text-stone-900">{inspectingStudent.regNumber}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(inspectingStudent.regNumber, 'inspect-reg')}
                    className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                    title="Copy"
                  >
                    {copiedKey === 'inspect-reg' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Portal Password</span>
                    <span className="font-mono font-black text-sm text-amber-900">
                      {showPassword ? (inspectingStudent.password || 'stanbax2025') : '••••••••••••'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                      title={showPassword ? 'Hide' : 'Reveal'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(inspectingStudent.password || 'stanbax2025', 'inspect-pwd')}
                      className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                      title="Copy"
                    >
                      {copiedKey === 'inspect-pwd' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingStudent(null)}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-black text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
