import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  X, 
  GraduationCap, 
  Check, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Phone, 
  Mail, 
  Key, 
  AlertCircle 
} from '../../RealIcons';

interface AdminQuickAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentName: string, regNumber: string) => void;
}

export const AdminQuickAddStudentModal: React.FC<AdminQuickAddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    classes, 
    houseStandings, 
    parents, 
    addStudent, 
    assignSiblingsToParent, 
    quickCreateParentWithSiblings 
  } = useSchool();

  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState(() => classes[0]?.name || 'JSS 1');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('11');
  const [dob, setDob] = useState('');
  const [house, setHouse] = useState('Blue House');
  const [password, setPassword] = useState('stanbax2025');

  // Parent linkage mode: 'existing' | 'new' | 'none'
  const [parentMode, setParentMode] = useState<'existing' | 'new' | 'none'>('new');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    name: string;
    regNumber: string;
    grade: string;
    house: string;
    loginId: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Scholar full name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Find or establish parent details
      let resolvedParentName = parentName.trim();
      let resolvedParentPhone = parentPhone.trim();
      let resolvedParentEmail = parentEmail.trim();

      if (parentMode === 'existing' && selectedParentId) {
        const found = parents.find(p => p.id === selectedParentId);
        if (found) {
          resolvedParentName = found.fullName;
          resolvedParentPhone = found.phone;
          resolvedParentEmail = found.email || '';
        }
      }

      const res = await addStudent(
        {
          name: fullName.trim(),
          grade,
          gender,
          house,
          dateOfBirth: dob || (age ? `${2026 - parseInt(age, 10)}-01-01` : undefined),
          parentName: resolvedParentName || 'Parent / Guardian',
          parentPhone: resolvedParentPhone || '+234 800 000 0000',
          parentEmail: resolvedParentEmail || undefined,
          password: password || 'stanbax2025',
          attendancePercent: 100,
          termAverage: 0
        },
        'admin',
        'System Administrator'
      );

      if (res.success && res.student) {
        const newStudent = res.student;

        // If parent linkage selected, sync parent-child relationship in Supabase
        if (parentMode === 'existing' && selectedParentId) {
          await assignSiblingsToParent(selectedParentId, [newStudent.id]);
        } else if (parentMode === 'new' && resolvedParentName && resolvedParentPhone) {
          await quickCreateParentWithSiblings(
            {
              fullName: resolvedParentName,
              phone: resolvedParentPhone,
              email: resolvedParentEmail,
              password: 'parent2025'
            },
            [newStudent.id]
          );
        }

        setCreatedResult({
          name: newStudent.name,
          regNumber: newStudent.regNumber,
          grade: newStudent.grade,
          house: newStudent.house || house,
          loginId: newStudent.regNumber
        });

        if (onSuccess) {
          onSuccess(newStudent.name, newStudent.regNumber);
        }
      } else {
        throw new Error(res.message || 'Failed to register scholar online.');
      }
    } catch (err: any) {
      console.error('[Quick Add Scholar Error]', err);
      setErrorMsg(err?.message || 'Failed to create student account in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndAddAnother = () => {
    setFullName('');
    setCreatedResult(null);
    setErrorMsg(null);
    setDob('');
    if (parentMode === 'new') {
      // keep parent info for quick siblings entry!
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                Quick Add Scholar to Database
              </h3>
              <p className="text-xs text-stone-300">
                Direct Supabase Cloud Sync • Auto-Generated Reg & Login
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {createdResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-1">
                  Database & Supabase Synced
                </span>
                <h4 className="text-xl font-black text-stone-900">
                  {createdResult.name}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Enrolled into <span className="font-bold text-stone-800">{createdResult.grade}</span> • {createdResult.house}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left max-w-sm mx-auto space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-bold">Registration Number:</span>
                  <span className="font-mono font-black text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {createdResult.regNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-bold">Portal Login Password:</span>
                  <span className="font-mono font-black text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {password || 'stanbax2025'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-bold">Supabase Database:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online & Persisted
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleResetAndAddAnother}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
                >
                  + Add Another Scholar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Scholar Bio Data */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider">
                  1. Scholar Identification
                </label>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Full Name (Surname First or Regular) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. David Abayomi or Abayomi David"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Class / Grade *
                    </label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Gender *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGender('Male')}
                        className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                          gender === 'Male' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Female')}
                        className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                          gender === 'Female' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 11"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      House
                    </label>
                    <select
                      value={house}
                      onChange={e => setHouse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
                    >
                      {houseStandings.map(h => (
                        <option key={h.name} value={h.name}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent & Family Linkage */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    2. Parent / Family Linkage
                  </label>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setParentMode('new')}
                      className={`px-2 py-0.5 rounded-md ${parentMode === 'new' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'}`}
                    >
                      New Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentMode('existing')}
                      className={`px-2 py-0.5 rounded-md ${parentMode === 'existing' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'}`}
                    >
                      Link Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentMode('none')}
                      className={`px-2 py-0.5 rounded-md ${parentMode === 'none' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'}`}
                    >
                      Skip
                    </button>
                  </div>
                </div>

                {parentMode === 'existing' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Select Existing Parent / Family
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={e => setSelectedParentId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold"
                    >
                      <option value="">-- Choose Parent Profile --</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.phone}) • {p.childrenIds?.length || 0} child(ren)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {parentMode === 'new' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                    <div className="col-span-full">
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Parent Full Name
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        placeholder="e.g. Mr. Kolawole Abayomi"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Parent Phone (Acts as Login ID)
                      </label>
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={e => setParentPhone(e.target.value)}
                        placeholder="e.g. 08023456789"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Parent Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        placeholder="e.g. kola.abayomi@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-600">
                    Scholar Initial Password
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Default: stanbax2025
                  </span>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="stanbax2025"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Writing to Database...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Commit Scholar to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
