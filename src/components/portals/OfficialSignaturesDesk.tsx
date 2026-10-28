import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Award,
  RotateCcw,
  Check,
  AlertCircle,
  Edit3,
  FileSignature,
  Stamp,
  UserCheck,
  Eye
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ReportSheetSignatureMode, ReportSheetSecondarySignature } from '../../types';

interface OfficialSignaturesDeskProps {
  roleFilter?: 'all' | 'headmistress' | 'principal_admin' | 'principal_academics';
  title?: string;
  description?: string;
}

type DeskRoleKey = 'headmistress' | 'principal_admin' | 'principal_academics' | 'proprietress' | 'custom';

export const OfficialSignaturesDesk: React.FC<OfficialSignaturesDeskProps> = ({
  roleFilter = 'all',
  title = 'Official Institutional Signatures & Report Sheet Endorsement Desk',
  description = 'Decide which official signature(s) appear on student report sheets and manage digital signatures for the Headmistress, Principals, Proprietress, and authorized signatories.'
}) => {
  const {
    officialSignatures,
    updateOfficialSignatures,
    resolveReportSheetSignatures,
    schoolInfo,
    tutors
  } = useSchool();

  const [selectedRole, setSelectedRole] = useState<DeskRoleKey>(
    roleFilter === 'all' ? 'principal_admin' : roleFilter
  );

  const [headmistressName, setHeadmistressName] = useState(
    officialSignatures.headmistressName || schoolInfo.headmistressName || 'Mrs. Adediran O. (Headmistress)'
  );
  const [headmistressTitle, setHeadmistressTitle] = useState(
    officialSignatures.headmistressTitle || schoolInfo.headmistressTitle || 'Headmistress, Primary & Early Childhood'
  );
  const [headmistressSig, setHeadmistressSig] = useState(
    officialSignatures.headmistressSignature || schoolInfo.headmistressSignature || ''
  );

  const [principalAdminName, setPrincipalAdminName] = useState(
    officialSignatures.principalAdminName || schoolInfo.principalName || 'Dr. Babatunde Ogunlesi (Principal)'
  );
  const [principalAdminTitle, setPrincipalAdminTitle] = useState(
    officialSignatures.principalAdminTitle || schoolInfo.principalTitle || 'Principal (Administration) & Executive Director'
  );
  const [principalAdminSig, setPrincipalAdminSig] = useState(
    officialSignatures.principalAdminSignature || schoolInfo.principalSignature || ''
  );

  const [principalAcademicsName, setPrincipalAcademicsName] = useState(
    officialSignatures.principalAcademicsName || schoolInfo.academicsName || 'Engr. Olumide Ogunleye (Dean of Academics)'
  );
  const [principalAcademicsTitle, setPrincipalAcademicsTitle] = useState(
    officialSignatures.principalAcademicsTitle || schoolInfo.academicsTitle || 'Principal (Academics) & Examination Controller'
  );
  const [principalAcademicsSig, setPrincipalAcademicsSig] = useState(
    officialSignatures.principalAcademicsSignature || schoolInfo.academicsSignature || ''
  );

  const [proprietressName, setProprietressName] = useState(
    officialSignatures.proprietressName || 'Mrs. Adebisi Folashade Bello'
  );
  const [proprietressTitle, setProprietressTitle] = useState(
    officialSignatures.proprietressTitle || 'Proprietress & Chair, Governing Board'
  );
  const [proprietressSig, setProprietressSig] = useState(
    officialSignatures.proprietressSignature || ''
  );

  const [customName, setCustomName] = useState(
    officialSignatures.customSignatoryName || 'Authorized Signatory'
  );
  const [customTitle, setCustomTitle] = useState(
    officialSignatures.customSignatoryTitle || 'School Management / Examination Officer'
  );
  const [customSig, setCustomSig] = useState(
    officialSignatures.customSignatorySignature || ''
  );

  const [previewSampleGrade, setPreviewSampleGrade] = useState<'JSS 2' | 'Primary 4'>('JSS 2');
  const [inputMode, setInputMode] = useState<'upload' | 'draw'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHeadmistressName(officialSignatures.headmistressName || schoolInfo.headmistressName || 'Mrs. Adediran O. (Headmistress)');
    setHeadmistressTitle(officialSignatures.headmistressTitle || schoolInfo.headmistressTitle || 'Headmistress, Primary & Early Childhood');
    setHeadmistressSig(officialSignatures.headmistressSignature || schoolInfo.headmistressSignature || '');

    setPrincipalAdminName(officialSignatures.principalAdminName || schoolInfo.principalName || 'Dr. Babatunde Ogunlesi (Principal)');
    setPrincipalAdminTitle(officialSignatures.principalAdminTitle || schoolInfo.principalTitle || 'Principal (Administration) & Executive Director');
    setPrincipalAdminSig(officialSignatures.principalAdminSignature || schoolInfo.principalSignature || '');

    setPrincipalAcademicsName(officialSignatures.principalAcademicsName || schoolInfo.academicsName || 'Engr. Olumide Ogunleye (Dean of Academics)');
    setPrincipalAcademicsTitle(officialSignatures.principalAcademicsTitle || schoolInfo.academicsTitle || 'Principal (Academics) & Examination Controller');
    setPrincipalAcademicsSig(officialSignatures.principalAcademicsSignature || schoolInfo.academicsSignature || '');

    setProprietressName(officialSignatures.proprietressName || 'Mrs. Adebisi Folashade Bello');
    setProprietressTitle(officialSignatures.proprietressTitle || 'Proprietress & Chair, Governing Board');
    setProprietressSig(officialSignatures.proprietressSignature || '');

    setCustomName(officialSignatures.customSignatoryName || 'Authorized Signatory');
    setCustomTitle(officialSignatures.customSignatoryTitle || 'School Management / Examination Officer');
    setCustomSig(officialSignatures.customSignatorySignature || '');
  }, [officialSignatures, schoolInfo]);

  useEffect(() => {
    if (inputMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F2557';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [inputMode, selectedRole]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveRoleSignature = (dataUrl: string) => {
    if (selectedRole === 'headmistress') {
      setHeadmistressSig(dataUrl);
      updateOfficialSignatures({
        headmistressSignature: dataUrl,
        headmistressName: headmistressName.trim(),
        headmistressTitle: headmistressTitle.trim()
      });
    } else if (selectedRole === 'principal_admin') {
      setPrincipalAdminSig(dataUrl);
      updateOfficialSignatures({
        principalAdminSignature: dataUrl,
        principalAdminName: principalAdminName.trim(),
        principalAdminTitle: principalAdminTitle.trim()
      });
    } else if (selectedRole === 'principal_academics') {
      setPrincipalAcademicsSig(dataUrl);
      updateOfficialSignatures({
        principalAcademicsSignature: dataUrl,
        principalAcademicsName: principalAcademicsName.trim(),
        principalAcademicsTitle: principalAcademicsTitle.trim()
      });
    } else if (selectedRole === 'proprietress') {
      setProprietressSig(dataUrl);
      updateOfficialSignatures({
        proprietressSignature: dataUrl,
        proprietressName: proprietressName.trim(),
        proprietressTitle: proprietressTitle.trim()
      });
    } else if (selectedRole === 'custom') {
      setCustomSig(dataUrl);
      updateOfficialSignatures({
        customSignatorySignature: dataUrl,
        customSignatoryName: customName.trim(),
        customSignatoryTitle: customTitle.trim()
      });
    }
    setFeedbackMsg({
      type: 'success',
      text: 'Official digital signature saved and deployed across report sheets!'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const applyDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setFeedbackMsg({ type: 'error', text: 'Please draw a signature on the pad first before applying.' });
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    saveRoleSignature(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: 'Signature image must be under 2.5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      saveRoleSignature(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    if (selectedRole === 'headmistress') {
      setHeadmistressSig('');
      updateOfficialSignatures({ headmistressSignature: '' });
    } else if (selectedRole === 'principal_admin') {
      setPrincipalAdminSig('');
      updateOfficialSignatures({ principalAdminSignature: '' });
    } else if (selectedRole === 'principal_academics') {
      setPrincipalAcademicsSig('');
      updateOfficialSignatures({ principalAcademicsSignature: '' });
    } else if (selectedRole === 'proprietress') {
      setProprietressSig('');
      updateOfficialSignatures({ proprietressSignature: '' });
    } else if (selectedRole === 'custom') {
      setCustomSig('');
      updateOfficialSignatures({ customSignatorySignature: '' });
    }
    clearCanvas();
    setFeedbackMsg({ type: 'success', text: 'Signature cleared from this signatory slot.' });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSaveTextDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'headmistress') {
      updateOfficialSignatures({
        headmistressName: headmistressName.trim(),
        headmistressTitle: headmistressTitle.trim(),
        headmistressSignature: headmistressSig
      });
      setFeedbackMsg({ type: 'success', text: 'Headmistress name and designation saved.' });
    } else if (selectedRole === 'principal_admin') {
      updateOfficialSignatures({
        principalAdminName: principalAdminName.trim(),
        principalAdminTitle: principalAdminTitle.trim(),
        principalAdminSignature: principalAdminSig
      });
      setFeedbackMsg({ type: 'success', text: 'Principal Administrator name and designation saved.' });
    } else if (selectedRole === 'principal_academics') {
      updateOfficialSignatures({
        principalAcademicsName: principalAcademicsName.trim(),
        principalAcademicsTitle: principalAcademicsTitle.trim(),
        principalAcademicsSignature: principalAcademicsSig
      });
      setFeedbackMsg({ type: 'success', text: 'Principal Academics name and designation saved.' });
    } else if (selectedRole === 'proprietress') {
      updateOfficialSignatures({
        proprietressName: proprietressName.trim(),
        proprietressTitle: proprietressTitle.trim(),
        proprietressSignature: proprietressSig
      });
      setFeedbackMsg({ type: 'success', text: 'Proprietress name and designation saved.' });
    } else if (selectedRole === 'custom') {
      updateOfficialSignatures({
        customSignatoryName: customName.trim(),
        customSignatoryTitle: customTitle.trim(),
        customSignatorySignature: customSig
      });
      setFeedbackMsg({ type: 'success', text: 'Custom signatory name and designation saved.' });
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const currentSig =
    selectedRole === 'headmistress'
      ? headmistressSig
      : selectedRole === 'principal_admin'
      ? principalAdminSig
      : selectedRole === 'principal_academics'
      ? principalAcademicsSig
      : selectedRole === 'proprietress'
      ? proprietressSig
      : customSig;

  const currentName =
    selectedRole === 'headmistress'
      ? headmistressName
      : selectedRole === 'principal_admin'
      ? principalAdminName
      : selectedRole === 'principal_academics'
      ? principalAcademicsName
      : selectedRole === 'proprietress'
      ? proprietressName
      : customName;

  const currentTitle =
    selectedRole === 'headmistress'
      ? headmistressTitle
      : selectedRole === 'principal_admin'
      ? principalAdminTitle
      : selectedRole === 'principal_academics'
      ? principalAcademicsTitle
      : selectedRole === 'proprietress'
      ? proprietressTitle
      : customTitle;

  const targetLevelLabel =
    selectedRole === 'headmistress'
      ? 'Primary & Early Years (Nursery, Reception, Basic 1–6)'
      : selectedRole === 'principal_admin'
      ? 'Secondary & Executive (JSS 1–3, SSS 1–3, General)'
      : selectedRole === 'principal_academics'
      ? 'Academics & Examination Controller (JSS 1–3, SSS 1–3 Results)'
      : selectedRole === 'proprietress'
      ? 'Executive Governing Board & Institutional Endorsement'
      : 'Custom / Delegated Signatory for Report Cards';

  const activeMode: ReportSheetSignatureMode = officialSignatures.reportSheetSignatureMode || 'auto_by_level';
  const activeSecondary: ReportSheetSecondarySignature | '' = officialSignatures.reportSheetSecondarySignature || '';
  const resolvedPreview = resolveReportSheetSignatures(previewSampleGrade);

  const signatureModeOptions: {
    id: ReportSheetSignatureMode;
    label: string;
    subtitle: string;
    badge: string;
  }[] = [
    {
      id: 'auto_by_level',
      label: 'Automatic by School Section',
      subtitle: 'Headmistress signs Nursery/Primary; Principal Academics & Principal Admin sign Secondary',
      badge: 'Smart Default'
    },
    {
      id: 'principal_admin',
      label: 'Principal (Administration) Only',
      subtitle: `${principalAdminName} endorses all report sheets across all classes`,
      badge: 'Single Principal'
    },
    {
      id: 'principal_academics',
      label: 'Principal (Academics) Only',
      subtitle: `${principalAcademicsName} endorses all report sheets across all classes`,
      badge: 'Dean / Academics'
    },
    {
      id: 'headmistress',
      label: 'Headmistress Signature',
      subtitle: `${headmistressName} endorses all report sheets`,
      badge: 'Headmistress'
    },
    {
      id: 'dual_principals',
      label: 'Dual Principals (Academics + Admin)',
      subtitle: 'Both Principal Academics and Principal Administration sign every report sheet',
      badge: 'Dual Endorsement'
    },
    {
      id: 'proprietress',
      label: 'Proprietress Executive Signature',
      subtitle: `${proprietressName} endorses report sheets with executive seal`,
      badge: 'Executive'
    },
    {
      id: 'custom',
      label: 'Custom / Selected Staff Signatory',
      subtitle: 'Pick a specific faculty member or custom signatory for report sheets',
      badge: 'Custom Choice'
    }
  ];

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-950">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official Endorsement Active</span>
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ADMIN REPORT SHEET SIGNATURE DECISION CONTROL */}
      {roleFilter === 'all' && (
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-blue-800/60 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-2">
                <FileSignature className="w-3.5 h-3.5" />
                Report Sheet Signature Decision Engine
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Decide Which Signature(s) Appear on Student Report Sheets
              </h3>
              <p className="text-xs text-blue-200/80 mt-1">
                Your selection immediately controls the official signature(s), name(s), and designation(s) displayed on all Scholar & Parent Portal report cards and downloaded/printed terminal result sheets.
              </p>
            </div>

            <label className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-2xl border border-white/15 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={officialSignatures.showSignaturesOnPortalReport !== false}
                onChange={(e) => {
                  updateOfficialSignatures({ showSignaturesOnPortalReport: e.target.checked });
                  setFeedbackMsg({
                    type: 'success',
                    text: e.target.checked
                      ? 'Digital signatures enabled on portal on-screen report cards & downloads.'
                      : 'Digital signatures hidden on on-screen portal view (shown on printed/downloaded sheets only).'
                  });
                  setTimeout(() => setFeedbackMsg(null), 3500);
                }}
                className="w-4 h-4 rounded accent-amber-400"
              />
              <span className="text-xs font-bold text-white">
                Show Signature on Portal On-Screen Results
              </span>
            </label>
          </div>

          {/* Primary Signatory Mode Cards */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-3">
              1. Choose Primary Signatory Mode for Report Sheets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {signatureModeOptions.map((opt) => {
                const isSelected = activeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateOfficialSignatures({ reportSheetSignatureMode: opt.id });
                      if (
                        opt.id === 'headmistress' ||
                        opt.id === 'principal_admin' ||
                        opt.id === 'principal_academics' ||
                        opt.id === 'proprietress' ||
                        opt.id === 'custom'
                      ) {
                        setSelectedRole(opt.id);
                      }
                      setFeedbackMsg({
                        type: 'success',
                        text: `Report sheet signature mode updated to: ${opt.label}`
                      });
                      setTimeout(() => setFeedbackMsg(null), 3500);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-300/50'
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-slate-950 text-amber-300'
                              : 'bg-white/10 text-blue-200'
                          }`}
                        >
                          {opt.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
                      </div>
                      <div className="font-black text-sm">{opt.label}</div>
                      <p
                        className={`text-[11px] mt-1 leading-snug ${
                          isSelected ? 'text-slate-800 font-semibold' : 'text-blue-200/80'
                        }`}
                      >
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Co-Signatory & Staff Picker Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-1.5">
                2. Second Endorsement Slot on Report Sheets (Co-Signatory / Seal):
              </label>
              <select
                value={activeSecondary}
                onChange={(e) => {
                  const val = e.target.value as ReportSheetSecondarySignature | '';
                  updateOfficialSignatures({
                    reportSheetSecondarySignature: val ? (val as ReportSheetSecondarySignature) : undefined
                  });
                  setFeedbackMsg({
                    type: 'success',
                    text: 'Report sheet secondary endorsement slot updated.'
                  });
                  setTimeout(() => setFeedbackMsg(null), 3500);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="">Default for Selected Mode (Recommended)</option>
                <option value="none">Single Signature Only (Hide Second Slot)</option>
                <option value="official_seal">Official School Registry Stamp & Seal</option>
                <option value="principal_admin">Principal (Administration) — {principalAdminName}</option>
                <option value="principal_academics">Principal (Academics) — {principalAcademicsName}</option>
                <option value="headmistress">Headmistress — {headmistressName}</option>
                <option value="proprietress">Proprietress — {proprietressName}</option>
                <option value="class_teacher">Class Teacher / Form Master Signature</option>
                <option value="custom">Custom Signatory — {customName}</option>
              </select>
              <p className="text-[11px] text-blue-200/70 mt-1">
                Choose whether a second signature, class teacher signature, or official school seal appears alongside the primary signature.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-1.5">
                Optional: Link Faculty / Staff Member as Custom Signatory:
              </label>
              <select
                value={officialSignatures.selectedStaffSignatoryTutorId || ''}
                onChange={(e) => {
                  const tutorId = e.target.value;
                  const found = tutors.find((t) => t.id === tutorId);
                  if (found) {
                    setCustomName(found.name);
                    setCustomTitle(found.role || 'Authorized Faculty Signatory');
                    if (found.signatureUrl) setCustomSig(found.signatureUrl);
                    updateOfficialSignatures({
                      selectedStaffSignatoryTutorId: tutorId,
                      customSignatoryName: found.name,
                      customSignatoryTitle: found.role || 'Authorized Faculty Signatory',
                      ...(found.signatureUrl ? { customSignatorySignature: found.signatureUrl } : {})
                    });
                    setFeedbackMsg({
                      type: 'success',
                      text: `Linked ${found.name} as custom report sheet signatory.`
                    });
                    setTimeout(() => setFeedbackMsg(null), 3500);
                  } else {
                    updateOfficialSignatures({ selectedStaffSignatoryTutorId: '' });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="">-- Manual Custom Signatory (Or Select Staff Below) --</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.role || t.department}) {t.signatureUrl ? '✓ Has Signature' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-blue-200/70 mt-1">
                When "Custom / Selected Staff Signatory" is active, this staff member’s name, title, and signature are used.
              </p>
            </div>
          </div>

          {/* Live Report Sheet Footer Preview */}
          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-inner space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                  Live Report Sheet Signature Footer Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewSampleGrade('Primary 4')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    previewSampleGrade === 'Primary 4'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Preview Primary (Primary 4)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSampleGrade('JSS 2')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    previewSampleGrade === 'JSS 2'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Preview Secondary (JSS 2)
                </button>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 ${
                resolvedPreview.secondary ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-md mx-auto'
              } gap-6 pt-2`}
            >
              {/* Primary Signatory Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-2">
                  {resolvedPreview.primary.label}
                </div>
                <div className="h-16 flex items-center justify-center my-1">
                  {resolvedPreview.primary.signatureUrl ? (
                    <img
                      src={resolvedPreview.primary.signatureUrl}
                      alt={resolvedPreview.primary.name}
                      className="max-h-14 max-w-[200px] object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      [No signature image uploaded yet — select card below to sign]
                    </span>
                  )}
                </div>
                <div className="border-t-2 border-slate-800 pt-2 mt-2">
                  <div className="text-xs font-black text-slate-900">{resolvedPreview.primary.name}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {resolvedPreview.primary.title}
                  </div>
                </div>
              </div>

              {/* Secondary Signatory / Seal Preview */}
              {resolvedPreview.secondary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-2">
                    {resolvedPreview.secondary.label}
                  </div>
                  <div className="h-16 flex items-center justify-center my-1">
                    {resolvedPreview.secondary.isOfficialSeal ? (
                      <div className="px-4 py-1.5 rounded-full border-2 border-double border-blue-900 text-blue-900 font-black text-[10px] uppercase tracking-widest">
                        ★ {schoolInfo.name} • VERIFIED ★
                      </div>
                    ) : resolvedPreview.secondary.signatureUrl ? (
                      <img
                        src={resolvedPreview.secondary.signatureUrl}
                        alt={resolvedPreview.secondary.name}
                        className="max-h-14 max-w-[200px] object-contain"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        [Signature line on report sheet]
                      </span>
                    )}
                  </div>
                  <div className="border-t-2 border-slate-800 pt-2 mt-2">
                    <div className="text-xs font-black text-slate-900">{resolvedPreview.secondary.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {resolvedPreview.secondary.title}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Tabs Selector for Uploading/Drawing Signatures */}
      {roleFilter === 'all' && (
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Select Signatory Profile Below to Draw or Upload Digital Signature Image:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('headmistress')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRole === 'headmistress'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-700/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Primary Head</span>
                {headmistressSig ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-500 text-[9px] font-extrabold">
                    Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[9px] font-extrabold">
                    No Sig
                  </span>
                )}
              </div>
              <div className="font-black text-xs mt-1">Head Mistress</div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">{headmistressName}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('principal_admin')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRole === 'principal_admin'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-700/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Admin Principal</span>
                {principalAdminSig ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-500 text-[9px] font-extrabold">
                    Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[9px] font-extrabold">
                    No Sig
                  </span>
                )}
              </div>
              <div className="font-black text-xs mt-1">Principal (Admin)</div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">{principalAdminName}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('principal_academics')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRole === 'principal_academics'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-700/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Acad Principal</span>
                {principalAcademicsSig ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-500 text-[9px] font-extrabold">
                    Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[9px] font-extrabold">
                    No Sig
                  </span>
                )}
              </div>
              <div className="font-black text-xs mt-1">Principal (Academics)</div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">{principalAcademicsName}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('proprietress')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRole === 'proprietress'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-700/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Executive Board</span>
                {proprietressSig ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-500 text-[9px] font-extrabold">
                    Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[9px] font-extrabold">
                    No Sig
                  </span>
                )}
              </div>
              <div className="font-black text-xs mt-1">Proprietress</div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">{proprietressName}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('custom')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRole === 'custom'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-700/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Custom / Staff</span>
                {customSig ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-500 text-[9px] font-extrabold">
                    Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[9px] font-extrabold">
                    No Sig
                  </span>
                )}
              </div>
              <div className="font-black text-xs mt-1">Custom Signatory</div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">{customName}</div>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Signature Upload & Drawing Pad */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-900" />
                <span>
                  {selectedRole === 'headmistress'
                    ? 'Headmistress Digital Signature'
                    : selectedRole === 'principal_admin'
                    ? 'Principal Administrator Digital Signature'
                    : selectedRole === 'principal_academics'
                    ? 'Principal Academics Digital Signature'
                    : selectedRole === 'proprietress'
                    ? 'Proprietress Digital Signature'
                    : 'Custom / Delegated Signatory Digital Signature'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Documents: <strong className="text-blue-900">{targetLevelLabel}</strong>
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setInputMode('draw')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  inputMode === 'draw' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign on Canvas
              </button>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  inputMode === 'upload' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {/* Draw Mode */}
          {inputMode === 'draw' ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs text-blue-950 flex items-center justify-between">
                <span>Sign using your mouse, touchpad, or stylus touchscreen below:</span>
                <span className="text-[10px] font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Blue Official Ink
                </span>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-[#FBFDFF] relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={170}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 bg-white rounded-xl shadow-inner cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Touch or click to sign here...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>

                <button
                  type="button"
                  onClick={applyDrawnSignature}
                  disabled={!hasDrawn}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deploy Drawn Signature</span>
                </button>
              </div>
            </div>
          ) : (
            /* Upload Mode */
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 text-center transition cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-blue-900 flex items-center justify-center mx-auto border border-slate-200 font-black">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Click to select digital signature image
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Supports PNG with transparent background, JPG, or WEBP (Max 2.5MB)
                  </span>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold shadow-xs pointer-events-none inline-flex items-center gap-1.5"
                >
                  <span>Select Image File</span>
                </button>
              </div>
            </div>
          )}

          {/* Designation & Name Inputs */}
          <form onSubmit={handleSaveTextDetails} className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Official Signatory Credentials & Designation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Signatory Full Name:</label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => {
                    if (selectedRole === 'headmistress') setHeadmistressName(e.target.value);
                    else if (selectedRole === 'principal_admin') setPrincipalAdminName(e.target.value);
                    else if (selectedRole === 'principal_academics') setPrincipalAcademicsName(e.target.value);
                    else if (selectedRole === 'proprietress') setProprietressName(e.target.value);
                    else setCustomName(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Designation Title:</label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => {
                    if (selectedRole === 'headmistress') setHeadmistressTitle(e.target.value);
                    else if (selectedRole === 'principal_admin') setPrincipalAdminTitle(e.target.value);
                    else if (selectedRole === 'principal_academics') setPrincipalAcademicsTitle(e.target.value);
                    else if (selectedRole === 'proprietress') setProprietressTitle(e.target.value);
                    else setCustomTitle(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {roleFilter === 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    updateOfficialSignatures({ reportSheetSignatureMode: selectedRole });
                    setFeedbackMsg({
                      type: 'success',
                      text: `${currentName} is now set as the active Primary Report Sheet Signatory!`
                    });
                    setTimeout(() => setFeedbackMsg(null), 4000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer border border-amber-300"
                >
                  <FileSignature className="w-3.5 h-3.5 text-amber-700" />
                  <span>Use This Signature on All Report Sheets</span>
                </button>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Signatory Titles</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Document Preview */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Selected Signatory Stamp Preview</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
                Report Card Seal
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              This preview illustrates how the currently selected signatory card appears when rendered on terminal report sheets:
            </p>

            {/* Official Endorsement Card Box */}
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {schoolInfo.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  {currentSig ? 'AUTHENTICATED' : 'UNENDORSED'}
                </span>
              </div>

              {/* Signature Display Container */}
              <div className="h-24 bg-[#FCFDFE] rounded-xl border border-slate-200/80 flex items-center justify-center p-2 relative overflow-hidden">
                {currentSig ? (
                  <img
                    src={currentSig}
                    alt={`${currentName} signature`}
                    className="max-h-20 max-w-full object-contain filter drop-shadow-xs"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <span className="text-[11px] text-slate-400 italic block">
                      No digital signature uploaded yet
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      [Signature placeholder line will be shown]
                    </span>
                  </div>
                )}
              </div>

              {/* Signatory Text Footer */}
              <div className="border-t-2 border-slate-900 pt-2 text-center space-y-0.5">
                <div className="text-xs font-black text-slate-900">{currentName}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {currentTitle}
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                  {selectedRole === 'headmistress'
                    ? 'Primary & Early Years School Directorate'
                    : 'Executive Directorate of Academics & Registry'}
                </div>
              </div>
            </div>
          </div>

          {/* Remove / Reset Actions */}
          {currentSig && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Ready for report sheet deployment</span>
              </span>

              <button
                type="button"
                onClick={handleRemoveSignature}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Signature</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
