import React, { useState } from 'react';
import { 
  Key, 
  Crown, 
  BookOpen, 
  Plus, 
  Copy, 
  Check, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Search, 
  Filter, 
  Zap, 
  X,
  ShieldCheck,
  Calendar,
  XCircle,
  GraduationCap,
  Send,
  SendHorizontal,
  Users,
  CheckSquare,
  Square,
  Bell,
  MessageSquare,
  HeartHandshake,
  Target,
  TrendingDown,
  Edit3
} from 'lucide-react';
import { useSchool } from '../../../context/SchoolContext';
import { CalvinToken, StudentProfile } from '../../../types';

export const AdminCalvinTokensTab: React.FC = () => {
  const { 
    calvinTokens, 
    createCalvinTokens, 
    revokeCalvinToken, 
    grantDirectCalvinAccess,
    sendTokenActivationPrompt,
    setStudentIntensiveCalvinSupport,
    students,
    schoolInfo,
    classes,
    subjects
  } = useSchool();

  // Sub-tab selection: 'tokens' vs 'intervention'
  const [activeSubTab, setActiveSubTab] = useState<'tokens' | 'intervention'>('tokens');

  // Intervention Workspace State
  const [interventionSearch, setInterventionSearch] = useState('');
  const [interventionClassFilter, setInterventionClassFilter] = useState('all');
  const [interventionStatusFilter, setInterventionStatusFilter] = useState<'all' | 'flagged' | 'not_flagged' | 'struggling' | 'has_access' | 'needs_access'>('all');
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState<StudentProfile | null>(null);
  const [modalInterventionNotes, setModalInterventionNotes] = useState('');
  const [modalInterventionSubjects, setModalInterventionSubjects] = useState<string[]>([]);
  const [modalInterventionLevel, setModalInterventionLevel] = useState<'urgent' | 'moderate' | 'foundation_rebuild'>('urgent');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [interventionFeedback, setInterventionFeedback] = useState<string | null>(null);

  // Generator form state
  const [selectedTier, setSelectedTier] = useState<'regular' | 'premium'>('premium');
  const [durationPreset, setDurationPreset] = useState<string>('720'); // 30 days default
  const [customHours, setCustomHours] = useState<number>(24);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [priceNgn, setPriceNgn] = useState<number>(4500);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);

  // Direct Grant form state
  const [showDirectGrantModal, setShowDirectGrantModal] = useState(false);
  const [directStudentId, setDirectStudentId] = useState<string>(students[0]?.id || '');
  const [directTier, setDirectTier] = useState<'regular' | 'premium'>('premium');
  const [directDurationHours, setDirectDurationHours] = useState<number>(720);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  // Send Token Activation Prompt Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptSelectedStudentIds, setPromptSelectedStudentIds] = useState<string[]>([]);
  const [promptClassFilter, setPromptClassFilter] = useState<string>('all');
  const [promptStudentSearch, setPromptStudentSearch] = useState<string>('');
  const [promptStatusFilter, setPromptStatusFilter] = useState<'all' | 'without_token' | 'with_token'>('without_token');
  const [promptMode, setPromptMode] = useState<'auto_mint' | 'pick_unused' | 'reminder_only'>('auto_mint');
  const [promptTier, setPromptTier] = useState<'regular' | 'premium'>('premium');
  const [promptDurationHours, setPromptDurationHours] = useState<number>(720);
  const [promptSelectedTokenCode, setPromptSelectedTokenCode] = useState<string>('');
  const [promptCustomMessage, setPromptCustomMessage] = useState<string>('');
  const [promptFeedback, setPromptFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'used' | 'expired'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'regular' | 'premium'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Print voucher modal state
  const [voucherToPrint, setVoucherToPrint] = useState<CalvinToken | null>(null);

  const durationOptions = [
    { label: '24 Hours Flash Pass', hours: 24, defaultPriceReg: 500, defaultPricePrem: 1000 },
    { label: '7 Days Study Pass', hours: 168, defaultPriceReg: 1500, defaultPricePrem: 2500 },
    { label: '30 Days Access (1 Month)', hours: 720, defaultPriceReg: 3500, defaultPricePrem: 4500 },
    { label: '90 Days Access (1 Full Term)', hours: 2160, defaultPriceReg: 7000, defaultPricePrem: 10000 },
    { label: '365 Days Access (1 Academic Year)', hours: 8760, defaultPriceReg: 18000, defaultPricePrem: 25000 },
    { label: 'Custom Hours Duration', hours: -1, defaultPriceReg: 1000, defaultPricePrem: 2000 }
  ];

  const handleDurationPresetChange = (val: string) => {
    setDurationPreset(val);
    const hrs = parseInt(val, 10);
    const match = durationOptions.find(o => o.hours === hrs);
    if (match) {
      setPriceNgn(selectedTier === 'premium' ? match.defaultPricePrem : match.defaultPriceReg);
    }
  };

  const handleTierChange = (tier: 'regular' | 'premium') => {
    setSelectedTier(tier);
    const hrs = parseInt(durationPreset, 10);
    const match = durationOptions.find(o => o.hours === hrs);
    if (match) {
      setPriceNgn(tier === 'premium' ? match.defaultPricePrem : match.defaultPriceReg);
    }
  };

  const handleGenerateTokens = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHours = durationPreset === '-1' ? customHours : parseInt(durationPreset, 10);
    if (!finalHours || finalHours <= 0) {
      alert('Please enter a valid duration in hours.');
      return;
    }

    const created = createCalvinTokens(selectedTier, finalHours, batchCount, priceNgn);
    setCreationSuccess(`Generated ${created.length} new ${selectedTier.toUpperCase()} tokens successfully!`);
    setTimeout(() => setCreationSuccess(null), 4000);
  };

  const handleDirectGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directStudentId) {
      alert('Please select a student.');
      return;
    }
    const student = students.find(s => s.id === directStudentId);
    grantDirectCalvinAccess(directStudentId, directTier, directDurationHours);
    setDirectSuccess(`Granted ${directTier === 'premium' ? 'Premium' : 'Regular'} Calvin AI access directly to ${student?.name || 'student'}!`);
    setTimeout(() => {
      setDirectSuccess(null);
      setShowDirectGrantModal(false);
    }, 2500);
  };

  const handleCopyCode = (tokenId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(tokenId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Unique classes from students list
  const availableClasses = Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort();

  // Filtered students for the prompt modal
  const filteredPromptStudents = students.filter(s => {
    const matchesClass = promptClassFilter === 'all' || s.grade === promptClassFilter;
    const matchesSearch = !promptStudentSearch.trim() || 
      s.name.toLowerCase().includes(promptStudentSearch.toLowerCase()) || 
      (s.regNumber && s.regNumber.toLowerCase().includes(promptStudentSearch.toLowerCase()));
    const hasActiveToken = s.calvinAiAccess?.active && (!s.calvinAiAccess.expiresAt || new Date(s.calvinAiAccess.expiresAt) > new Date());
    const matchesStatus = promptStatusFilter === 'all' || 
      (promptStatusFilter === 'without_token' && !hasActiveToken) || 
      (promptStatusFilter === 'with_token' && hasActiveToken);
    return matchesClass && matchesSearch && matchesStatus;
  });

  const toggleSelectStudent = (id: string) => {
    setPromptSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const selectAllFilteredStudents = () => {
    const ids = filteredPromptStudents.map(s => s.id);
    setPromptSelectedStudentIds(Array.from(new Set([...promptSelectedStudentIds, ...ids])));
  };

  const clearSelectedStudents = () => {
    setPromptSelectedStudentIds([]);
  };

  const handleOpenPromptModal = () => {
    setPromptMode('auto_mint');
    setPromptSelectedTokenCode('');
    setPromptFeedback(null);
    setShowPromptModal(true);
  };

  const handleOpenPromptModalWithToken = (tok: CalvinToken) => {
    setPromptMode('pick_unused');
    setPromptSelectedTokenCode(tok.code);
    setPromptTier(tok.tier);
    setPromptDurationHours(tok.durationHours);
    setPromptSelectedStudentIds([]);
    setPromptFeedback(null);
    setShowPromptModal(true);
  };

  const handleSendPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptSelectedStudentIds.length === 0) {
      setPromptFeedback({ type: 'error', message: 'Please select at least one scholar recipient.' });
      return;
    }

    setIsSendingPrompt(true);
    setPromptFeedback(null);

    try {
      const res = sendTokenActivationPrompt(promptSelectedStudentIds, {
        autoAllocateToken: promptMode === 'auto_mint',
        tokenCode: promptMode === 'pick_unused' ? promptSelectedTokenCode : undefined,
        tier: promptTier,
        durationHours: promptDurationHours,
        customMessage: promptCustomMessage.trim() || undefined
      });

      if (res.success) {
        setPromptFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setShowPromptModal(false);
          setPromptSelectedStudentIds([]);
          setPromptCustomMessage('');
        }, 1800);
      } else {
        setPromptFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setPromptFeedback({ type: 'error', message: err.message || 'Failed to send prompt.' });
    } finally {
      setIsSendingPrompt(false);
    }
  };

  const scholarsWithPrompts = students.filter(s => s.tokenPrompt);

  const filteredTokens = calvinTokens.filter(t => {
    const matchesSearch = t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.usedByStudentName && t.usedByStudentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.durationLabel && t.durationLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesTier = tierFilter === 'all' || t.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const unusedCount = calvinTokens.filter(t => t.status === 'unused').length;
  const usedCount = calvinTokens.filter(t => t.status === 'used').length;
  const premiumCount = calvinTokens.filter(t => t.tier === 'premium').length;

  const flaggedCount = students.filter(s => s.calvinAiAccess?.intensiveSupport).length;
  const withAccessCount = students.filter(s => s.calvinAiAccess?.active).length;
  const strugglingCount = students.filter(s => (s.cumulativeAverage || 0) < 50 || (s.cumulativeAnnualAverage || 0) < 50).length;

  const filteredInterventionStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(interventionSearch.toLowerCase()) ||
      student.regNumber.toLowerCase().includes(interventionSearch.toLowerCase());
    const matchesClass = interventionClassFilter === 'all' || student.grade === interventionClassFilter;
    
    const isFlagged = !!student.calvinAiAccess?.intensiveSupport;
    const hasAccess = !!student.calvinAiAccess?.active;
    const isStruggling = (student.cumulativeAverage || 0) < 50 || (student.cumulativeAnnualAverage || 0) < 50;

    let matchesStatus = true;
    if (interventionStatusFilter === 'flagged') matchesStatus = isFlagged;
    else if (interventionStatusFilter === 'struggling') matchesStatus = isStruggling;
    else if (interventionStatusFilter === 'has_access') matchesStatus = hasAccess;
    else if (interventionStatusFilter === 'needs_access') matchesStatus = !hasAccess;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const openInterventionModal = (student: StudentProfile) => {
    setSelectedStudentForIntervention(student);
    setModalInterventionNotes(student.calvinAiAccess?.interventionNotes || '');
    setModalInterventionSubjects(
      student.calvinAiAccess?.interventionSubjects && student.calvinAiAccess.interventionSubjects.length > 0 
        ? student.calvinAiAccess.interventionSubjects 
        : ['Mathematics', 'English']
    );
    setModalInterventionLevel((student.calvinAiAccess?.interventionLevel as any) || 'urgent');
  };

  const handleSaveIntervention = (studentId: string) => {
    setStudentIntensiveCalvinSupport(studentId, true, {
      interventionNotes: modalInterventionNotes,
      interventionSubjects: modalInterventionSubjects,
      interventionLevel: modalInterventionLevel
    });
    setInterventionFeedback(`Intensive Calvin AI Academic Support activated for scholar.`);
    setSelectedStudentForIntervention(null);
    setTimeout(() => setInterventionFeedback(null), 3500);
  };

  const handleToggleInterventionQuick = (student: StudentProfile) => {
    const isCurrentlyActive = !!student.calvinAiAccess?.intensiveSupport;
    if (!student.calvinAiAccess?.active) {
      alert("This scholar does not currently have active Calvin AI access. Please grant access first before enrolling in intensive support.");
      return;
    }
    setStudentIntensiveCalvinSupport(student.id, !isCurrentlyActive);
    setInterventionFeedback(
      !isCurrentlyActive 
        ? `Enrolled ${student.name} in Intensive Academic Attention.` 
        : `Removed ${student.name} from Intensive Support.`
    );
    setTimeout(() => setInterventionFeedback(null), 3500);
  };

  const handleGrantAndEnroll = (student: StudentProfile) => {
    grantDirectCalvinAccess(student.id, 'premium', 720);
    setStudentIntensiveCalvinSupport(student.id, true, {
      interventionNotes: 'Enrolled by administration for intensive academic intervention.',
      interventionSubjects: ['Mathematics', 'English'],
      interventionLevel: 'urgent'
    });
    setInterventionFeedback(`Granted Premium Calvin AI Access and enrolled ${student.name} into Intensive Support.`);
    setTimeout(() => setInterventionFeedback(null), 3500);
  };

  return (
    <div className="space-y-8 font-['Nunito',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Super Admin Token Minting</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black">
                Single-Use Strict Enforcement
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Calvin AI Token Authority
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Mint, sell, and manage one-time access tokens for students to unlock Calvin AI. 
              Send direct token activation prompts to specific scholars, configure durations, 
              and monitor scholar activations in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleOpenPromptModal}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Send Token Activation Prompt</span>
            </button>

            <button
              onClick={() => setShowDirectGrantModal(true)}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Grant Direct Scholar Access</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total Minted</span>
            <span className="text-xl font-black text-white">{calvinTokens.length}</span>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <span className="text-emerald-300 block text-[11px]">Available (Unused)</span>
            <span className="text-xl font-black text-emerald-400">{unusedCount}</span>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <span className="text-blue-300 block text-[11px]">Redeemed & Active</span>
            <span className="text-xl font-black text-blue-400">{usedCount}</span>
          </div>
          <div className="bg-amber-400/10 rounded-xl p-3 border border-amber-400/20">
            <span className="text-amber-300 block text-[11px]">Premium Masterclass</span>
            <span className="text-xl font-black text-amber-400">{premiumCount}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher: Tokens vs Intensive Scholar Support */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('tokens')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'tokens'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Token Minting & Inventory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('intervention')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'intervention'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            <span>Intensive Scholar Academic Attention</span>
            {flaggedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>

        {activeSubTab === 'tokens' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectGrantModal(true)}
              className="px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Direct Grant to Scholar</span>
            </button>
            <button
              onClick={handleOpenPromptModal}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4 text-indigo-200" />
              <span>Send Activation Prompt</span>
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK TOAST */}
      {interventionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{interventionFeedback}</span>
        </div>
      )}

      {/* VIEW 1: TOKENS GENERATION & INVENTORY */}
      {activeSubTab === 'tokens' && (
        <>
          {/* Main Workspace: Generator Form & Token List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Token Generator Card (1 col) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Mint New Vouchers</h2>
              <p className="text-xs text-slate-500">Generate serialized single-use token vouchers</p>
            </div>
          </div>

          <form onSubmit={handleGenerateTokens} className="space-y-5 text-xs">
            {/* Tier Select */}
            <div>
              <label className="font-bold text-slate-700 block mb-2">Token Tier / Quality Level</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTierChange('regular')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedTier === 'regular'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-blue-700 mb-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Regular</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Standard syllabus clarity</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTierChange('premium')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedTier === 'premium'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-purple-700 mb-0.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Premium</span>
                  </div>
                  <span className="text-[11px] text-slate-500">High-depth & WAEC secrets</span>
                </button>
              </div>
            </div>

            {/* Duration Preset */}
            <div>
              <label className="font-bold text-slate-700 block mb-2">Duration of Token Usage</label>
              <select
                value={durationPreset}
                onChange={e => handleDurationPresetChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {durationOptions.map(opt => (
                  <option key={opt.hours} value={opt.hours}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Hours Input */}
            {durationPreset === '-1' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Hours</label>
                <input
                  type="number"
                  min="1"
                  max="17520"
                  value={customHours}
                  onChange={e => setCustomHours(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            )}

            {/* Quantity to Mint */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Batch Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchCount}
                  onChange={e => setBatchCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Tokens to create</span>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={priceNgn}
                  onChange={e => setPriceNgn(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Charged at Bursary</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Mint {batchCount} {selectedTier.toUpperCase()} Token Voucher{batchCount > 1 ? 's' : ''}</span>
            </button>

            {creationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{creationSuccess}</span>
              </div>
            )}
          </form>

          {/* Policy Reminder */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-[11px] text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Token Security Policy</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>No token can ever be used more than once.</li>
              <li>Once redeemed, access is locked exclusively to that scholar.</li>
              <li>Expiration is calculated from the exact minute of redemption.</li>
            </ul>
          </div>
        </div>

        {/* Token Inventory Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Token Inventory</h2>
              <p className="text-xs text-slate-500">Search, monitor redemptions, and print voucher slips</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code or student..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="unused">Unused Vouchers</option>
                <option value="used">Redeemed / In Use</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Tokens List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Voucher Code</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Status / Assigned Scholar</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No tokens match your current search/filter.
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map(tok => {
                    const isUnused = tok.status === 'unused';
                    const isUsed = tok.status === 'used';
                    const isExpired = tok.status === 'expired';

                    return (
                      <tr key={tok.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 text-xs">
                              {tok.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(tok.id, tok.code)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Copy code"
                            >
                              {copiedId === tok.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400">Created: {tok.createdAt}</span>
                        </td>

                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tok.tier === 'premium'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {tok.tier === 'premium' ? <Crown className="w-3 h-3 text-amber-500" /> : <BookOpen className="w-3 h-3 text-blue-600" />}
                            {tok.tier.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 font-medium text-slate-700">
                          {tok.durationLabel || `${tok.durationHours}h`}
                        </td>

                        <td className="py-3 font-bold text-slate-800">
                          ₦{tok.priceNgn?.toLocaleString() || '0'}
                        </td>

                        <td className="py-3">
                          {isUnused && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              UNUSED / READY
                            </span>
                          )}
                          {isUsed && (
                            <div>
                              <span className="font-bold text-indigo-950 block">
                                {tok.usedByStudentName || 'Student'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Activated: {tok.activatedAt || 'Recently'}
                              </span>
                            </div>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                              EXPIRED
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-right pr-2 space-x-1">
                          {isUnused && (
                            <button
                              onClick={() => setVoucherToPrint(tok)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Print voucher slip"
                            >
                              <Printer className="w-3 h-3 inline mr-1" />
                              Slip
                            </button>
                          )}
                          {!isExpired && (
                            <button
                              onClick={() => revokeCalvinToken(tok.id)}
                              className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Revoke / Expire Token"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Prompts Monitoring Panel */}
      {scholarsWithPrompts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Active Token Activation Prompts ({scholarsWithPrompts.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Live status of prompt notifications delivered to scholars
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
              {scholarsWithPrompts.filter(s => s.tokenPrompt?.status === 'pending').length} Pending Activation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scholarsWithPrompts.map(scholar => {
              const prompt = scholar.tokenPrompt!;
              const isPending = prompt.status === 'pending';
              const isActivated = prompt.status === 'activated';
              return (
                <div 
                  key={scholar.id} 
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                    isPending 
                      ? 'border-indigo-200 bg-indigo-50/40' 
                      : isActivated 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 truncate">{scholar.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      isPending ? 'bg-amber-100 text-amber-900' : isActivated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {prompt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">{scholar.grade}</span>
                    <span>•</span>
                    <span className="font-mono">{scholar.regNumber}</span>
                  </div>
                  {prompt.tokenCode && (
                    <div className="text-[11px] flex items-center gap-1.5">
                      <span className="text-slate-500">Token:</span>
                      <code className="font-mono font-black text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                        {prompt.tokenCode}
                      </code>
                    </div>
                  )}
                  {prompt.message && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{prompt.message}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}

      {/* VIEW 2: TARGETED SCHOLAR ACADEMIC ATTENTION & INTERVENTION */}
      {activeSubTab === 'intervention' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Policy & Explanation Directive Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 rounded-3xl p-6 border border-amber-300/40 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Intensive Scholar Academic Attention & Clinical Intervention
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                    High Attention Mode
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                  Flag scholars who need extra attention and help from Calvin AI. When flagged, Calvin AI shifts from standard answering to <strong>Deep Diagnostic Breakdown Mode</strong>: identifying foundational prerequisites, breaking calculations into numbered micro-steps, diagnosing common examination traps, providing relatable Nigerian analogies, and offering uplifting encouragement.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs font-bold flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    STRICT SYSTEM RULE: Intensive academic attention applies exclusively to scholars with active Calvin AI access. For scholars without access, use "Grant Access & Enroll" to provision both in one click.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Enrolled in Intensive Support</span>
                  <span className="text-2xl font-black text-rose-600">{flaggedCount}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Struggling Scholars (&lt;50% Avg)</span>
                  <span className="text-2xl font-black text-amber-600">{strugglingCount}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Scholars with Calvin AI Access</span>
                  <span className="text-2xl font-black text-indigo-600">{withAccessCount}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Search Controls */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search scholar by full name or admission registration number..."
                value={interventionSearch}
                onChange={e => setInterventionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={interventionClassFilter}
                onChange={e => setInterventionClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">All Class Levels</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={interventionStatusFilter}
                onChange={e => setInterventionStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">All Scholars</option>
                <option value="flagged">Intensive Attention Active ({flaggedCount})</option>
                <option value="struggling">Struggling Scholars (&lt;50% Avg) ({strugglingCount})</option>
                <option value="has_access">Has Active Calvin Access ({withAccessCount})</option>
                <option value="needs_access">Needs Calvin Access</option>
              </select>
            </div>
          </div>

          {/* Scholars Intervention Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Scholars Academic Attention Roster ({filteredInterventionStudents.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Manage academic intervention directives for Calvin AI
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase font-black text-[10px] tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Scholar Details</th>
                    <th className="py-3.5 px-3">Class</th>
                    <th className="py-3.5 px-3 text-center">Academic Standing</th>
                    <th className="py-3.5 px-3 text-center">Calvin AI Access</th>
                    <th className="py-3.5 px-3">Intensive Support Status</th>
                    <th className="py-3.5 px-4 text-right">Intervention Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInterventionStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No scholars match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInterventionStudents.map(student => {
                      const hasAccess = !!student.calvinAiAccess?.active;
                      const isFlagged = !!student.calvinAiAccess?.intensiveSupport;
                      const avg = student.cumulativeAverage || student.cumulativeAnnualAverage || 0;
                      const isStruggling = avg < 50;

                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isFlagged ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.passportPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                                alt={student.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                  <span>{student.name}</span>
                                  {isFlagged && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-extrabold text-[9px] uppercase">
                                      Flagged
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[10px] text-slate-500">
                                  {student.regNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-slate-700">
                            {student.grade}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black font-mono text-xs text-slate-900">
                                {avg > 0 ? `${avg}%` : 'N/A'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isStruggling
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isStruggling ? 'Needs Help' : 'Good Standing'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {hasAccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                                <Key className="w-3 h-3 text-indigo-600" />
                                <span>{student.calvinAiAccess?.tier?.toUpperCase()} ACCESS</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                <span>Access Required</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {isFlagged ? (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-300">
                                  <Zap className="w-3 h-3 text-amber-600" />
                                  <span>{student.calvinAiAccess?.interventionLevel?.replace('_', ' ').toUpperCase() || 'URGENT'} INTERVENTION</span>
                                </div>
                                {student.calvinAiAccess?.interventionSubjects && student.calvinAiAccess.interventionSubjects.length > 0 && (
                                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-1">
                                    {student.calvinAiAccess.interventionSubjects.map((sub, i) => (
                                      <span key={i} className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-medium">
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {student.calvinAiAccess?.interventionNotes && (
                                  <p className="text-[10px] text-slate-500 italic line-clamp-1">
                                    "{student.calvinAiAccess.interventionNotes}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Standard Learning Mode
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {hasAccess ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openInterventionModal(student)}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Configure specific difficulty subjects and tutor notes"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Configure</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleInterventionQuick(student)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                                      isFlagged
                                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                    }`}
                                  >
                                    {isFlagged ? 'Remove' : 'Enable Support'}
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleGrantAndEnroll(student)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  title="Grants Calvin AI access and automatically enables intensive academic intervention"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                                  <span>Grant Access & Enroll</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHOLAR INTERVENTION CONFIGURATION MODAL */}
      {selectedStudentForIntervention && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Configure Academic Attention for {selectedStudentForIntervention.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentForIntervention.grade} • Reg: {selectedStudentForIntervention.regNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForIntervention(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Intervention Severity Level */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Intervention Intensity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'urgent', label: 'Urgent Intervention', desc: 'Highest scaffolding & diagnostic depth' },
                    { id: 'foundation_rebuild', label: 'Foundation Rebuild', desc: 'Focus on prerequisite elementary concepts' },
                    { id: 'moderate', label: 'Moderate Reinforcement', desc: 'Guided practice & step verification' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setModalInterventionLevel(lvl.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        modalInterventionLevel === lvl.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="font-black text-[11px] mb-0.5">{lvl.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Subjects */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Target Difficulty Subjects (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Civic Education'].map(subj => {
                    const isSelected = modalInterventionSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setModalInterventionSubjects(prev =>
                            isSelected ? prev.filter(s => s !== subj) : [...prev, subj]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical / Pedagogical Notes for Calvin AI */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrator & Tutor Clinical Guidance for Calvin AI
                </label>
                <textarea
                  rows={3}
                  value={modalInterventionNotes}
                  onChange={e => setModalInterventionNotes(e.target.value)}
                  placeholder="Example: Scholar struggles with algebra word problems and fractions. Please provide extra patient step-by-step explanations, relatable market shopping analogies, and encourage effort."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForIntervention(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveIntervention(selectedStudentForIntervention.id)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Intervention Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT ACCESS GRANT MODAL */}
      {showDirectGrantModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Direct Calvin Access Grant</h3>
                  <p className="text-xs text-slate-500">Bypass voucher code for specific scholar</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectGrantModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectGrantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Scholar</label>
                <select
                  value={directStudentId}
                  onChange={e => setDirectStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} • {s.regNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grant Tier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectTier('regular')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                      directTier === 'regular'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Regular Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectTier('premium')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                      directTier === 'premium'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Premium Tier
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Duration</label>
                <select
                  value={directDurationHours}
                  onChange={e => setDirectDurationHours(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={24}>24 Hours Pass</option>
                  <option value={168}>7 Days Access</option>
                  <option value={720}>30 Days Access (1 Month)</option>
                  <option value={2160}>90 Days Access (1 Full Academic Term)</option>
                  <option value={8760}>365 Days Access (1 Academic Year)</option>
                </select>
              </div>

              {directSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{directSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDirectGrantModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE VOUCHER SLIP MODAL */}
      {voucherToPrint && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            {/* Printable Slip Design */}
            <div className="p-5 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50/40 text-slate-800 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Key className="w-6 h-6 text-indigo-600" />
                <span className="font-black text-sm tracking-tight text-slate-900">
                  {schoolInfo.name}
                </span>
              </div>
              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest">
                Official Calvin AI Study Voucher
              </div>

              <div className="py-3 px-4 bg-white rounded-xl shadow-xs border border-indigo-200 font-mono font-black text-base tracking-widest text-indigo-950">
                {voucherToPrint.code}
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Tier:</span>
                  <span className="font-bold uppercase text-indigo-900">
                    {voucherToPrint.tier === 'premium' ? 'Premium Masterclass' : 'Regular'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-800">{voucherToPrint.durationLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Fee:</span>
                  <span className="font-bold text-slate-800">₦{voucherToPrint.priceNgn?.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 pt-2 border-t border-indigo-200/60">
                To activate: Login to your Student Portal, select <strong>Calvin AI</strong> tab, enter code above. Valid for one scholar only.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVoucherToPrint(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
