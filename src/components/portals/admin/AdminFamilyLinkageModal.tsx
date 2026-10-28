import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  X, 
  Users, 
  Check, 
  CheckCircle2, 
  Search, 
  Plus, 
  UserPlus, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight,
  Key,
  Download
} from '../../RealIcons';
import { AdminDownloadStudentLoginsModal } from './AdminDownloadStudentLoginsModal';

interface AdminFamilyLinkageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParentId?: string;
}

type LinkageTab = 'families' | 'assign' | 'merge' | 'create_parent';

export const AdminFamilyLinkageModal: React.FC<AdminFamilyLinkageModalProps> = ({
  isOpen,
  onClose,
  initialParentId
}) => {
  const { 
    parents, 
    students, 
    deleteParent,
    assignSiblingsToParent, 
    unlinkChildFromParent, 
    quickCreateParentWithSiblings, 
    mergeParentAccounts 
  } = useSchool();

  const [activeTab, setActiveTab] = useState<LinkageTab>(initialParentId ? 'assign' : 'families');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDownloadLoginsModal, setShowDownloadLoginsModal] = useState(false);

  // Tab 2: Assign Siblings state
  const [assignParentId, setAssignParentId] = useState<string>(initialParentId || (parents[0]?.id || ''));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Tab 3: Merge Parents state
  const [primaryParentId, setPrimaryParentId] = useState<string>(parents[0]?.id || '');
  const [secondaryParentIds, setSecondaryParentIds] = useState<string[]>([]);

  // Tab 4: Create Parent state
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('parent2025');
  const [newParentAddress, setNewParentAddress] = useState('');
  const [newParentChildrenIds, setNewParentChildrenIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Filtered students for assign tab
  const availableStudentsForAssign = useMemo(() => {
    const term = studentSearchTerm.toLowerCase().trim();
    if (!term) return students.slice(0, 30);
    return students.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.regNumber.toLowerCase().includes(term) ||
      s.grade.toLowerCase().includes(term) ||
      (s.parentName && s.parentName.toLowerCase().includes(term))
    );
  }, [students, studentSearchTerm]);

  // Selected parent object in Assign tab
  const currentAssignParent = parents.find(p => p.id === assignParentId);

  // Handle assigning siblings
  const handleAssignSiblings = async () => {
    if (!assignParentId) {
      showNotification('Please select a parent profile.', true);
      return;
    }
    if (selectedStudentIds.length === 0) {
      showNotification('Please select at least one scholar to assign.', true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await assignSiblingsToParent(assignParentId, selectedStudentIds);
      if (res.success) {
        showNotification(res.message);
        setSelectedStudentIds([]);
      } else {
        showNotification(res.message, true);
      }
    } catch (err: any) {
      showNotification(err?.message || 'Failed to assign siblings.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle unlinking single child
  const handleUnlink = async (parentId: string, studentId: string) => {
    setIsProcessing(true);
    try {
      const res = await unlinkChildFromParent(parentId, studentId);
      if (res.success) {
        showNotification(res.message);
      }
    } catch (err: any) {
      showNotification(err?.message || 'Error unlinking scholar.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deleting parent account
  const handleDeleteParent = (parentId: string, parentName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the parent account for "${parentName}"? Their portal credentials and login access will be removed.`)) {
      return;
    }
    setIsProcessing(true);
    try {
      deleteParent(parentId);
      showNotification(`Parent profile for ${parentName} removed successfully.`);
    } catch (err: any) {
      showNotification(err?.message || 'Error deleting parent account.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle merging parent accounts
  const handleMergeParents = async () => {
    if (!primaryParentId) {
      showNotification('Select a Primary Parent account.', true);
      return;
    }
    if (secondaryParentIds.length === 0) {
      showNotification('Select at least one duplicate parent to merge into the primary account.', true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await mergeParentAccounts(primaryParentId, secondaryParentIds);
      if (res.success) {
        showNotification(res.message);
        setSecondaryParentIds([]);
        setActiveTab('families');
      } else {
        showNotification(res.message, true);
      }
    } catch (err: any) {
      showNotification(err?.message || 'Failed to merge accounts.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Quick Create Parent
  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName.trim() || !newParentPhone.trim()) {
      showNotification('Parent name and phone number are required.', true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await quickCreateParentWithSiblings(
        {
          fullName: newParentName.trim(),
          phone: newParentPhone.trim(),
          email: newParentEmail.trim(),
          password: newParentPassword || 'parent2025',
          address: newParentAddress.trim()
        },
        newParentChildrenIds
      );

      if (res.success) {
        showNotification(res.message);
        setNewParentName('');
        setNewParentPhone('');
        setNewParentEmail('');
        setNewParentChildrenIds([]);
        setActiveTab('families');
      } else {
        showNotification(res.message, true);
      }
    } catch (err: any) {
      showNotification(err?.message || 'Error creating parent in Supabase.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered families list
  const filteredParents = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return parents;
    return parents.filter(p => 
      p.fullName.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.childrenIds || []).some(cid => {
        const student = students.find(s => s.id === cid);
        return student && student.name.toLowerCase().includes(term);
      })
    );
  }, [parents, students, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                Family & Sibling Linkage Manager
              </h3>
              <p className="text-xs text-amber-200/80">
                Supabase Online Sync • Parent Logins • Sibling Consolidation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDownloadLoginsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition cursor-pointer shadow-xs active:scale-98"
              title="Download tabulated student and parent logins grouped by family and siblings"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>Download Tabulated Logins</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-stone-200 bg-stone-50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('families')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'families'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px]">
              {parents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assign')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'assign'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Assign Siblings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('merge')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'merge'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Merge Parent Accounts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create_parent')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'create_parent'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>+ Quick Create Parent</span>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: FAMILY ROSTER */}
          {activeTab === 'families' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search parent name, phone, email, or scholar name..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('assign')}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Siblings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create_parent')}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ New Parent</span>
                  </button>
                </div>
              </div>

              {filteredParents.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-500">No parent profiles match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredParents.map(parent => {
                    const children = (parent.childrenIds || [])
                      .map(cid => students.find(s => s.id === cid))
                      .filter(Boolean);

                    return (
                      <div
                        key={parent.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-black text-stone-900">
                              {parent.fullName}
                            </h4>
                            <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{parent.phone}</span>
                              {parent.email && <span>• {parent.email}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignParentId(parent.id);
                                setActiveTab('assign');
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
                            >
                              + Link Sibling
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParent(parent.id, parent.fullName)}
                              disabled={isProcessing}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-rose-200"
                              title="Delete parent account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Linked Scholars */}
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Linked Scholars ({children.length})
                          </div>
                          {children.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">No scholars attached yet.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {children.map(child => (
                                <div
                                  key={child!.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-800"
                                >
                                  <span className="font-bold">{child!.name}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-white text-[10px] font-bold text-red-700 border border-stone-200">
                                    {child!.grade}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUnlink(parent.id, child!.id)}
                                    title="Unlink scholar from this parent"
                                    className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGN SIBLINGS */}
          {activeTab === 'assign' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5">
                  Step 1: Choose Parent / Guardian
                </label>
                <select
                  value={assignParentId}
                  onChange={e => setAssignParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600/30"
                >
                  <option value="">-- Select Parent Profile --</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.phone}) — {p.childrenIds?.length || 0} scholar(s) currently linked
                    </option>
                  ))}
                </select>

                {currentAssignParent && (
                  <div className="mt-2 text-xs text-amber-900">
                    <span className="font-bold">Currently linked: </span>
                    {(currentAssignParent.childrenIds || [])
                      .map(cid => students.find(s => s.id === cid)?.name)
                      .filter(Boolean)
                      .join(', ') || 'None'}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-stone-800 uppercase tracking-wider">
                    Step 2: Select Scholar(s) to Link as Siblings
                  </label>
                  <span className="text-xs font-bold text-red-700">
                    {selectedStudentIds.length} scholar(s) selected
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={e => setStudentSearchTerm(e.target.value)}
                    placeholder="Search scholars by name or reg number..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                {/* Scholars selector list */}
                <div className="max-h-64 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100">
                  {availableStudentsForAssign.map(student => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isAlreadyLinked = (currentAssignParent?.childrenIds || []).includes(student.id);

                    return (
                      <div
                        key={student.id}
                        onClick={() => {
                          if (isAlreadyLinked) return;
                          setSelectedStudentIds(prev => 
                            prev.includes(student.id) 
                              ? prev.filter(id => id !== student.id)
                              : [...prev, student.id]
                          );
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isAlreadyLinked 
                            ? 'bg-stone-50 opacity-60 cursor-not-allowed'
                            : isSelected 
                              ? 'bg-red-50/70 border-l-4 border-l-red-600' 
                              : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected || isAlreadyLinked}
                            disabled={isAlreadyLinked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-black text-stone-900">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {student.grade} • {student.regNumber} • {student.house || 'Unassigned House'}
                            </div>
                          </div>
                        </div>

                        {isAlreadyLinked ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Already Linked
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">
                            Current Parent: {student.parentName || 'None'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Syncs immediately to Supabase database <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[10px]">school_state</code>.
                </span>

                <button
                  type="button"
                  disabled={isProcessing || selectedStudentIds.length === 0}
                  onClick={handleAssignSiblings}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span>Syncing Database...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link {selectedStudentIds.length} Scholar(s) to Parent</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MERGE PARENT ACCOUNTS */}
          {activeTab === 'merge' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider mb-1">
                  Merge Duplicate or Sibling Parent Profiles
                </h4>
                <p className="text-xs text-amber-900">
                  If siblings were accidentally registered under separate parent profiles, this will consolidate all children under the <strong>Primary Parent</strong> account and remove duplicate parent entries from Supabase.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Parent */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                    1. Primary Parent Account (Keep this)
                  </label>
                  <select
                    value={primaryParentId}
                    onChange={e => setPrimaryParentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                  >
                    <option value="">-- Choose Primary Parent --</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone}) • {p.childrenIds?.length || 0} scholar(s)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duplicate parents to merge */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                    2. Secondary Accounts to Merge & Remove
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 p-1">
                    {parents
                      .filter(p => p.id !== primaryParentId)
                      .map(p => {
                        const isChecked = secondaryParentIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`p-2 flex items-center justify-between text-xs cursor-pointer rounded-lg ${
                              isChecked ? 'bg-red-50 text-red-950 font-bold' : 'hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSecondaryParentIds(prev => [...prev, p.id]);
                                  } else {
                                    setSecondaryParentIds(prev => prev.filter(id => id !== p.id));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-red-600 rounded"
                              />
                              <span>{p.fullName} ({p.phone})</span>
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {p.childrenIds?.length || 0} child(ren)
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isProcessing || !primaryParentId || secondaryParentIds.length === 0}
                  onClick={handleMergeParents}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-stone-900 hover:bg-stone-800 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Merge {secondaryParentIds.length} Account(s) into Primary</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK CREATE PARENT */}
          {activeTab === 'create_parent' && (
            <form onSubmit={handleCreateParent} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">
                  Provision New Parent Account in Supabase Database
                </h4>
                <p className="text-xs text-emerald-800">
                  Creates an authorized parent login profile with immediate access to the Parent Portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-full">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Parent Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newParentName}
                    onChange={e => setNewParentName(e.target.value)}
                    placeholder="e.g. Mrs. Funke Adeola"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Phone Number (Login Identifier) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newParentPhone}
                    onChange={e => setNewParentPhone(e.target.value)}
                    placeholder="e.g. 08034567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newParentEmail}
                    onChange={e => setNewParentEmail(e.target.value)}
                    placeholder="e.g. funke.adeola@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    value={newParentPassword}
                    onChange={e => setNewParentPassword(e.target.value)}
                    placeholder="parent2025"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Residential Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={newParentAddress}
                    onChange={e => setNewParentAddress(e.target.value)}
                    placeholder="e.g. 14 Ring Road, Ibadan"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Attach scholars right away */}
              <div className="pt-3 border-t border-stone-100">
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
                  Attach Scholar(s) to this Parent Profile
                </label>
                <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 p-1">
                  {students.slice(0, 40).map(s => {
                    const isChecked = newParentChildrenIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`p-2 flex items-center justify-between text-xs cursor-pointer rounded-lg ${
                          isChecked ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewParentChildrenIds(prev => [...prev, s.id]);
                              } else {
                                setNewParentChildrenIds(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            className="w-3.5 h-3.5 text-emerald-600 rounded"
                          />
                          <span>{s.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {s.grade} • {s.regNumber}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('families')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Parent & Save to Supabase</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Download Student Names & Parent Logins Directory Modal */}
      <AdminDownloadStudentLoginsModal
        isOpen={showDownloadLoginsModal}
        onClose={() => setShowDownloadLoginsModal(false)}
        initialGrouping="parent"
      />
    </div>
  );
};
