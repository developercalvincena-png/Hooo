import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Home,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  GraduationCap,
  UserPlus,
  HeartHandshake,
  KeyRound,
  FileText
} from './RealIcons';
import { useSchool } from '../context/SchoolContext';
import { ParentProfile, StudentProfile } from '../types';

interface ParentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess?: (parent: ParentProfile) => void;
}

const PRESET_PARENT_SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first elementary school?",
  "What city was your first child born in?",
  "What was your childhood pet's name?",
  "What is your favorite family vacation location?",
  "Write my own custom question..."
];

export const ParentRegistrationModal: React.FC<ParentRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistrationSuccess
}) => {
  const { students, registerParent, loginParent } = useSchool();

  // Form State
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('Both Parents');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');

  // Ward Linkage State
  const [linkedWardIds, setLinkedWardIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [skipWardLinkage, setSkipWardLinkage] = useState(false);

  // Security Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedQuestionPreset, setSelectedQuestionPreset] = useState(PRESET_PARENT_SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Submission & UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredParent, setRegisteredParent] = useState<ParentProfile | null>(null);
  const [copiedLogin, setCopiedLogin] = useState(false);

  // Active step in modal
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Filter students for ward selection
  const matchingStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return [];
    const query = studentSearchQuery.toLowerCase().trim();
    return students
      .filter(s => !s.isUpgradedTutor)
      .filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.regNumber.toLowerCase().includes(query) ||
        (s.grade && s.grade.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [students, studentSearchQuery]);

  // Selected wards list
  const selectedWards = useMemo(() => {
    return students.filter(s => linkedWardIds.includes(s.id));
  }, [students, linkedWardIds]);

  const handleAddWard = (student: StudentProfile) => {
    if (!linkedWardIds.includes(student.id)) {
      setLinkedWardIds(prev => [...prev, student.id]);
    }
    setStudentSearchQuery('');
  };

  const handleRemoveWard = (studentId: string) => {
    setLinkedWardIds(prev => prev.filter(id => id !== studentId));
  };

  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter the Parent or Guardian full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your WhatsApp or Mobile phone number for portal notifications.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setActiveStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    const finalQuestion = selectedQuestionPreset === 'Write my own custom question...'
      ? customQuestion.trim()
      : selectedQuestionPreset;

    if (!finalQuestion) {
      setErrorMessage('Please select or specify a security question for account recovery.');
      return;
    }
    if (!securityAnswer.trim()) {
      setErrorMessage('Please provide an answer to your security recovery question.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerParent({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship,
        address: address.trim() || undefined,
        occupation: occupation.trim() || undefined,
        password: password.trim(),
        securityQuestion: finalQuestion,
        securityAnswer: securityAnswer.trim(),
        studentIds: skipWardLinkage ? [] : linkedWardIds,
        wardIds: skipWardLinkage ? [] : linkedWardIds,
        wardNames: selectedWards.map(w => w.name)
      });

      if (res.success && res.parent) {
        setRegisteredParent(res.parent);
        if (onRegistrationSuccess) {
          onRegistrationSuccess(res.parent);
        }
      } else {
        setErrorMessage(res.message || 'Registration failed. Please check details and retry.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPortal = async () => {
    if (registeredParent) {
      const identifier = registeredParent.phone || registeredParent.email || registeredParent.id;
      await loginParent(identifier, registeredParent.password || password);
      onClose();
    }
  };

  const handleCopyCredentials = () => {
    if (!registeredParent) return;
    const text = `Stanbax Schools Parent Portal Credentials:
Name: ${registeredParent.fullName}
Primary Login: ${registeredParent.phone}
Password: ${registeredParent.password || password}
Portal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedLogin(true);
    setTimeout(() => setCopiedLogin(false), 2500);
  };

  const handleResetForm = () => {
    setRegisteredParent(null);
    setFullName('');
    setRelationship('Both Parents');
    setPhone('');
    setEmail('');
    setAddress('');
    setOccupation('');
    setLinkedWardIds([]);
    setStudentSearchQuery('');
    setSkipWardLinkage(false);
    setPassword('');
    setConfirmPassword('');
    setCustomQuestion('');
    setSecurityAnswer('');
    setActiveStep(1);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white relative flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner text-amber-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold tracking-wider uppercase border border-amber-300/30 mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Institutional Gateway</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Register as a Parent / Guardian
                </h2>
                <p className="text-xs text-red-100 font-medium">
                  Stanbax Schools Ibadan • Family & Ward Portal Synchronization
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                handleResetForm();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator (when not completed) */}
          {!registeredParent && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-2 transition cursor-pointer ${
                  activeStep === 1 ? 'text-amber-300' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  activeStep === 1 ? 'bg-amber-400 text-red-950 font-black' : 'bg-white/20 text-white'
                }`}>1</span>
                <span>Personal & Contact Info</span>
              </button>

              <div className="flex-1 mx-3 h-0.5 bg-white/20 relative">
                <div 
                  className={`h-full bg-amber-400 transition-all duration-300 ${activeStep === 2 ? 'w-full' : 'w-0'}`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (fullName && phone) setActiveStep(2);
                }}
                className={`flex items-center gap-2 transition ${
                  activeStep === 2 ? 'text-amber-300' : 'text-white/70'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  activeStep === 2 ? 'bg-amber-400 text-red-950 font-black' : 'bg-white/20 text-white'
                }`}>2</span>
                <span>Ward Linkage & Password</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {registeredParent ? (
            <div className="space-y-5 py-2 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Parent Registration Successful!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Your parent profile has been saved and synchronized across Stanbax Schools database systems. You can now access your dashboard and your scholar’s records.
                </p>
              </div>

              {/* Official Credential Slip */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-sans font-black text-slate-700 text-xs uppercase tracking-wider">Official Access Slip</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-[10px]">
                    ● Synced to Database
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Parent / Guardian Name:</span>
                    <span className="font-bold">{registeredParent.fullName}</span>
                  </div>

                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Primary Login Identifier:</span>
                    <span className="font-bold text-red-700">{registeredParent.phone}</span>
                  </div>

                  {registeredParent.email && (
                    <div>
                      <span className="font-sans text-[11px] text-slate-500 block">Registered Email:</span>
                      <span className="font-bold">{registeredParent.email}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Assigned Password:</span>
                    <span className="font-bold">{registeredParent.password || password}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="font-sans text-[11px] text-slate-500 block">Linked Scholar(s) / Ward(s):</span>
                    {selectedWards.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedWards.map(w => (
                          <span key={w.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-sans font-bold text-[11px] border border-amber-200">
                            <GraduationCap className="w-3 h-3 text-red-700" />
                            {w.name} ({w.grade}) • {w.regNumber}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-sans italic text-slate-500 text-xs">No scholar linked yet (can be linked anytime via Admin or Student lookup).</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleProceedToPortal}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-red-600 active:scale-98"
                >
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>Proceed to Parent Portal</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 active:scale-98"
                >
                  {copiedLogin ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copy Login Details</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : activeStep === 1 ? (
            /* STEP 1: Personal & Contact Details */
            <form onSubmit={handleValidateStep1} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Parent / Guardian Full Name</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chief & Mrs. Adebayo Adeleke / Dr. Tunde Bakare"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                    <span>Relationship to Scholar</span>
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white outline-none transition"
                  >
                    <option value="Both Parents">Both Parents (Father & Mother)</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Sponsor">Sponsor / Relative</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>WhatsApp / Mobile Phone</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 445 6789"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-500">
                    Used as your institutional login identifier and for school SMS / WhatsApp alerts.
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. adeleke.family@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Occupation / Organization</span>
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Architect, Civil Service, Business Owner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                {/* Residential Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    <span>Residential Address</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bodija Estate, Oluyole Extension, or Jericho, Ibadan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Next Step Button */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Step 1 of 2: Personal Information
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer border border-red-600 active:scale-98"
                >
                  <span>Continue to Ward & Password</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Scholar Linkage & Password Setup */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Ward Linkage Section */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-red-700" />
                    <span>Link Enrolled Scholar(s) / Ward(s)</span>
                  </label>
                  <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipWardLinkage}
                      onChange={(e) => setSkipWardLinkage(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Child applying / link later</span>
                  </label>
                </div>

                {!skipWardLinkage && (
                  <>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Search by child’s name or Registration Number (e.g., STX/...) to automatically connect their report cards to your parent portal.
                    </p>

                    {/* Search student input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="Type student name (e.g. Tiwa, Babatunde) or Reg No..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-amber-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                      />
                    </div>

                    {/* Matching Students Autocomplete List */}
                    {matchingStudents.length > 0 && (
                      <div className="bg-white rounded-xl border border-amber-200 shadow-md divide-y divide-slate-100 max-h-40 overflow-y-auto">
                        {matchingStudents.map(st => {
                          const isAlreadyLinked = linkedWardIds.includes(st.id);
                          return (
                            <div key={st.id} className="p-2 sm:p-2.5 flex items-center justify-between hover:bg-amber-50/50 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-amber-100 text-red-800 font-bold flex items-center justify-center text-xs">
                                  {st.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{st.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{st.regNumber} • {st.grade}</div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddWard(st)}
                                disabled={isAlreadyLinked}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  isAlreadyLinked 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                                }`}
                              >
                                {isAlreadyLinked ? 'Linked ✓' : '+ Add Ward'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Selected Wards Chips */}
                    {selectedWards.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-700 block">Linked Scholars:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedWards.map(w => (
                            <div key={w.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-white border border-amber-300 shadow-xs text-xs font-bold text-slate-800">
                              <GraduationCap className="w-3.5 h-3.5 text-red-700" />
                              <span>{w.name} ({w.grade})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveWard(w.id)}
                                className="w-4 h-4 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 flex items-center justify-center text-[10px] transition cursor-pointer"
                                title="Remove scholar"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] italic text-slate-500">
                        No scholar selected yet. You can search above or link anytime after registration.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Password & Security PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Portal Password</span>
                      <span className="text-red-600">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Confirm Password</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>

                {/* Security Question */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Password Recovery Security Question</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedQuestionPreset}
                    onChange={(e) => setSelectedQuestionPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white outline-none transition"
                  >
                    {PRESET_PARENT_SECURITY_QUESTIONS.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Question if chosen */}
                {selectedQuestionPreset === 'Write my own custom question...' && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Write Your Custom Question</label>
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="e.g. What was my first car model?"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                    />
                  </div>
                )}

                {/* Security Answer */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Secret Security Answer</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Enter confidential answer for password reset"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-500">
                    If you ever forget your password, answering this question will allow you to reset it immediately without administrative delay.
                  </p>
                </div>
              </div>

              {/* Navigation & Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  ← Back to Step 1
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer border border-emerald-500 disabled:bg-emerald-400 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering & Synchronizing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>Complete Parent Registration</span>
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
