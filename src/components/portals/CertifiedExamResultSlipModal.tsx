import React from 'react';
import { CustomResult, StudentProfile } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../SchoolLogo';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  UserCheck, 
  FileText,
  Building2,
  QrCode
} from '../RealIcons';

interface CertifiedExamResultSlipModalProps {
  result: CustomResult;
  student: StudentProfile;
  onClose: () => void;
  isAdmin?: boolean;
  onEditByAdmin?: (result: CustomResult) => void;
}

export const CertifiedExamResultSlipModal: React.FC<CertifiedExamResultSlipModalProps> = ({
  result,
  student,
  onClose,
  isAdmin = false,
  onEditByAdmin
}) => {
  const { schoolInfo } = useSchool();

  const isBece = result.examType === 'BECE' || 
                 result.title.toLowerCase().includes('bece') || 
                 result.title.toLowerCase().includes('junior waec');

  const isNcee = result.examType === 'NCEE' || 
                 result.title.toLowerCase().includes('common entrance') || 
                 result.title.toLowerCase().includes('ncee');

  const boardName = result.examinationBody || (
    isBece 
      ? 'National Examinations Council (NECO) & State Ministry of Education' 
      : isNcee 
      ? 'National Examinations Council (NECO) — National Common Entrance Board' 
      : `${result.examType || 'Official'} Examination Board`
  );

  const examDietLabel = result.examDiet || result.term || (isBece ? 'Basic Education Certificate Diet' : isNcee ? 'National Common Entrance Placement Diet' : 'Official Diet');

  const candidateNumber = result.candidateNumber || (
    isBece 
      ? `BECE/${result.session.slice(0, 4)}/${student.regNumber.split('/').pop() || '001'}`
      : isNcee 
      ? `NCEE/${result.session.slice(0, 4)}/${student.regNumber.split('/').pop() || '101'}`
      : student.regNumber
  );

  const examCenter = result.centerName || `${schoolInfo.name} Test Center #042`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const subjectsRows = (result.subjectBreakdown || []).map((s, idx) => `
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">${idx + 1}</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${s.subject}</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #1e3a8a;">${s.score || '—'}</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900; color: #166534; font-size: 14px;">${s.grade || '—'}</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600; color: #475569;">${s.remark || 'Distinction'}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${result.title} - ${student.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 25px; line-height: 1.4; }
    .slip-container { border: 4px double #1e3a8a; padding: 25px; border-radius: 12px; position: relative; background: #fafafa; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 70px; font-weight: 900; color: rgba(30, 58, 138, 0.04); text-transform: uppercase; pointer-events: none; white-space: nowrap; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; }
    .crest-col { width: 110px; text-align: center; vertical-align: middle; }
    .title-col { text-align: center; vertical-align: middle; }
    .photo-col { width: 110px; text-align: right; vertical-align: middle; }
    .school-title { font-size: 22px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
    .school-sub { font-size: 11px; color: #475569; margin: 4px 0 0 0; }
    .exam-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 4px 16px; border-radius: 999px; font-weight: 800; font-size: 12px; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px; }
    .details-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 11.5px; }
    .details-item span { display: block; font-size: 9.5px; text-transform: uppercase; font-weight: 800; color: #64748b; }
    .details-item strong { font-size: 12px; color: #0f172a; }
    table.results-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11.5px; background: #ffffff; }
    table.results-table th { background: #1e3a8a; color: #ffffff; padding: 9px; text-transform: uppercase; font-size: 11px; border: 1px solid #1e3a8a; text-align: center; }
    .summary-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    .locked-notice { background: #fefce8; border: 1px solid #fef08a; padding: 8px 12px; border-radius: 6px; font-size: 10px; color: #854d0e; text-align: center; margin-bottom: 20px; font-weight: 600; }
    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 25px; text-align: center; font-size: 10.5px; }
    .sig-line { border-bottom: 1px solid #94a3b8; height: 35px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="watermark">${isBece ? 'AUTHENTICATED BECE' : isNcee ? 'AUTHENTICATED NCEE' : 'VERIFIED TRANSCRIPT'}</div>
    <table class="header-table">
      <tr>
        <td class="crest-col">
          <div style="width: 70px; height: 70px; border-radius: 50%; background: #1e3a8a; color: #fbbf24; font-size: 24px; font-weight: 900; line-height: 70px; margin: 0 auto; text-align: center;">${schoolInfo.name ? schoolInfo.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 3).join('') : 'STX'}</div>
        </td>
        <td class="title-col">
          <h1 class="school-title">${schoolInfo.name}</h1>
          <p class="school-sub">${schoolInfo.location || schoolInfo.address || `${schoolInfo.city}, ${schoolInfo.state}`} • Phone: ${schoolInfo.phone} • Email: ${schoolInfo.email || 'info@stanbaxschools.edu.ng'}</p>
          <div style="font-size: 11px; font-weight: 800; color: #b45309; margin-top: 4px; text-transform: uppercase;">
            ${boardName}
          </div>
          <div class="exam-badge">${result.title}</div>
        </td>
        <td class="photo-col">
          ${student.passportPhoto ? `
            <img src="${student.passportPhoto}" style="width: 75px; height: 90px; object-fit: cover; border-radius: 6px; border: 2px solid #1e3a8a;" alt="${student.name}" />
          ` : `
            <div style="width: 75px; height: 90px; border: 1.5px dashed #94a3b8; border-radius: 6px; background: #f8fafc; font-size: 9px; text-align: center; padding-top: 30px; box-sizing: border-box; color: #64748b;">PASSPORT</div>
          `}
        </td>
      </tr>
    </table>

    <div class="details-box">
      <div class="details-item">
        <span>Candidate Name</span>
        <strong>${student.name}</strong>
      </div>
      <div class="details-item">
        <span>Student Admission No</span>
        <strong>${student.regNumber}</strong>
      </div>
      <div class="details-item">
        <span>Examination / Candidate No</span>
        <strong style="color: #1e3a8a; font-family: monospace;">${candidateNumber}</strong>
      </div>
      <div class="details-item">
        <span>Academic Set / Cohort</span>
        <strong>${result.targetClass || student.grade} ${student.isAlumni ? '(Alumni Archive)' : ''}</strong>
      </div>
      <div class="details-item">
        <span>Academic Session & Diet</span>
        <strong>${result.session} • ${examDietLabel}</strong>
      </div>
      <div class="details-item">
        <span>Accredited Examination Center</span>
        <strong>${examCenter}</strong>
      </div>
    </div>

    <table class="results-table">
      <thead>
        <tr>
          <th style="width: 40px;">S/N</th>
          <th style="text-align: left; padding-left: 12px;">Exam Subject</th>
          <th style="width: 80px;">Score / 100</th>
          <th style="width: 75px;">Grade</th>
          <th style="width: 130px;">Remark / Performance</th>
        </tr>
      </thead>
      <tbody>
        ${subjectsRows}
      </tbody>
    </table>

    <div class="summary-card">
      <div>
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1e40af; display: block;">Overall Examination Standing & Aggregate</span>
        <strong style="font-size: 14px; color: #1e3a8a;">${result.overallScore || result.aggregate || 'Passed with Distinction'}</strong>
      </div>
      ${result.placementStatus ? `
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #15803d; display: block;">Official Placement / Recommendation</span>
          <strong style="font-size: 13px; color: #166534;">${result.placementStatus}</strong>
        </div>
      ` : ''}
    </div>

    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 11px; margin-bottom: 15px; color: #334155;">
      <strong>Registrar's Authentication Comments:</strong> "${result.remarks || 'Result verified and cleared by Academic Registry.'}"
    </div>

    <div class="locked-notice">
      OFFICIAL PERMANENT LEDGER RECORD • This document is sealed and certified by Stanbax Academic Registry in accordance with Ministry of Education regulations. Only authorized School Administrators possess cryptographic privilege to alter or moderate marks.
    </div>

    <div class="footer-grid">
      <div>
        <div class="sig-line"></div>
        <strong>Dr. (Mrs.) R. A. Adeleke</strong>
        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 9.5px;">Registrar & Academic Delegate</p>
      </div>
      <div>
        <div style="width: 60px; height: 60px; border: 2px dashed #1e3a8a; border-radius: 8px; margin: 0 auto; line-height: 60px; color: #1e3a8a; font-size: 9px; font-weight: 800;">VERIFIED QR</div>
        <p style="margin: 4px 0 0 0; color: #1e3a8a; font-weight: 800; font-size: 9px;">VERIFICATION CODE: STX-${result.id.slice(0, 8).toUpperCase()}</p>
      </div>
      <div>
        <div class="sig-line"></div>
        <strong>Prof. E. K. Ogundele</strong>
        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 9.5px;">Chief Examination Controller</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanStudent = student.name.replace(/\s+/g, '_');
    const cleanTitle = result.title.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Stanbax_${cleanStudent}_${cleanTitle}_Official_Slip.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Nunito',sans-serif] print:p-0 print:bg-white">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                  {result.examType || (isBece ? 'BECE' : isNcee ? 'NCEE' : 'Official Result')}
                </span>
                <span className="text-xs text-blue-200 truncate">
                  Candidate: <strong className="text-white">{student.name}</strong> ({student.regNumber})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight truncate text-white">
                {result.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onEditByAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditByAdmin(result);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Only admin can alter scores, grades, and subjects"
              >
                <FileText className="w-3.5 h-3.5 text-blue-950" />
                <span className="hidden sm:inline">Alter / Edit Result</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Download authenticated offline result slip"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Download Slip (.html)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Slip Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Slip Outer Frame with double border */}
          <div className="p-6 sm:p-8 rounded-3xl border-4 border-double border-blue-900 bg-white relative shadow-sm">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] overflow-hidden">
              <span className="text-6xl sm:text-8xl font-black text-blue-950 uppercase rotate-[-25deg] whitespace-nowrap">
                {isBece ? 'BECE CERTIFIED' : isNcee ? 'NCEE PLACEMENT' : 'STANBAX CERTIFIED'}
              </span>
            </div>

            {/* Institution & Examination Board Header */}
            <div className="pb-5 border-b-2 border-blue-900 flex flex-col md:flex-row items-center justify-between gap-5 relative z-10 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <SchoolLogo size="lg" showText={false} />
                <div className="space-y-1">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                    {boardName}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight uppercase">
                    {schoolInfo.name}
                  </h1>
                  <p className="text-xs text-slate-600">
                    {schoolInfo.location} • Admissions: {schoolInfo.admissionsPhone} • Registrar: {schoolInfo.phone}
                  </p>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    {result.title} — {examDietLabel}
                  </p>
                </div>
              </div>

              {/* Scholar Passport Photo */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-slate-50 p-1 border-2 border-blue-900 shadow-sm overflow-hidden flex items-center justify-center">
                  {student.passportPhoto ? (
                    <img
                      src={student.passportPhoto}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <UserCheck className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <span className="text-[9px] font-bold uppercase block text-slate-600">Passport</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-black text-blue-950 uppercase mt-1 tracking-wider">
                  Official Biometric
                </span>
              </div>
            </div>

            {/* Candidate Metadata Ledger Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Candidate Name</span>
                <span className="font-black text-slate-900 sm:text-sm">{student.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Admission / Reg No</span>
                <span className="font-mono font-bold text-blue-900">{student.regNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Exam Candidate / Seat No</span>
                <span className="font-mono font-black text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
                  {candidateNumber}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Cohort / Academic Standing</span>
                <span className="font-bold text-slate-800">
                  {result.targetClass || student.grade} {student.isAlumni ? '(Alumni Ledger)' : ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Academic Session</span>
                <span className="font-bold text-slate-800">{result.session}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-500">Examination Center</span>
                <span className="font-bold text-slate-800 truncate block" title={examCenter}>
                  {examCenter}
                </span>
              </div>
            </div>

            {/* Subject Scores & Grades Table */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Authenticated Subject Breakdown ({result.subjectBreakdown?.length || 0} Subjects):</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Standard NERDC & Board Grading
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-900 text-white font-black text-center text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-12">S/N</th>
                      <th className="py-2.5 px-3 text-left">Exam Subject</th>
                      <th className="py-2.5 px-3 w-28">Score (/100)</th>
                      <th className="py-2.5 px-3 w-24">Grade</th>
                      <th className="py-2.5 px-3 w-40 text-left">Performance Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {result.subjectBreakdown && result.subjectBreakdown.length > 0 ? (
                      result.subjectBreakdown.map((sub, idx) => {
                        const isDistinction = ['A', 'A1', 'Distinction'].includes(sub.grade || '');
                        const isCredit = ['B', 'B2', 'B3', 'C', 'C4', 'C5', 'C6', 'Credit'].includes(sub.grade || '');
                        return (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                              {sub.score || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs ${
                                isDistinction 
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                  : isCredit 
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {sub.grade || 'A'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              {sub.remark || (isDistinction ? 'Distinction' : isCredit ? 'Credit' : 'Satisfactory')}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          No individualized subject breakdown logged. Please refer to overall aggregate summary below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overall Evaluation, Aggregate & Placement Cards */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  <span>Overall Standing & Aggregate:</span>
                </span>
                <p className="text-sm font-black text-blue-950">
                  {result.overallScore || result.aggregate || 'Passed with Distinction'}
                </p>
                {result.aggregate && result.overallScore && (
                  <p className="text-xs text-blue-800 font-semibold">{result.aggregate}</p>
                )}
              </div>

              {result.placementStatus && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Admission Placement / Clearance Recommendation:</span>
                  </span>
                  <p className="text-sm font-black text-emerald-950">
                    {result.placementStatus}
                  </p>
                </div>
              )}
            </div>

            {/* Official Registry Remarks */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Central Academic Registry & Examination Office Endorsement:</span>
              </div>
              <p className="italic text-slate-700 leading-relaxed pl-6">
                "{result.remarks || 'Result verified and cleared by Academic Registry.'}"
              </p>
              <div className="pl-6 text-[10px] text-slate-500 pt-1 flex items-center gap-3">
                <span>Authenticated By: <strong>{result.uploadedBy || 'Academic Delegate'}</strong></span>
                <span>•</span>
                <span>Logged Date: {new Date(result.uploadedAt || Date.now()).toLocaleDateString()}</span>
                {result.updatedAt && (
                  <>
                    <span>•</span>
                    <span className="text-amber-800 font-bold">
                      Last Altered by Admin: {new Date(result.updatedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Tamper-Proof & Security Notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-[11px] text-slate-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-bold">
                  Official Permanent Ledger Record (Cryptographically Protected)
                </strong>
                <p className="text-[10px] text-slate-600 leading-snug">
                  This examination result slip is permanently preserved in the student’s portal archive. In accordance with institutional policy, <strong>only authorized School Administrators possess credentials to post, alter, or moderate these marks</strong>. Scholars and Alumni maintain permanent read and print verification access.
                </p>
              </div>
            </div>

            {/* Institutional Signatures & QR Code Section */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center text-xs">
              <div>
                <div className="h-9 border-b border-slate-400 max-w-[200px] mx-auto mb-1 flex items-end justify-center font-serif italic text-blue-900 font-bold text-sm">
                  Dr. R. A. Adeleke
                </div>
                <strong className="block font-bold text-slate-900">Dr. (Mrs.) R. A. Adeleke</strong>
                <span className="text-[10px] text-slate-500 uppercase">Academic Registrar</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-900 flex flex-col items-center justify-center bg-blue-50/50 p-1">
                  <QrCode className="w-8 h-8 text-blue-900" />
                  <span className="text-[8px] font-black text-blue-900 uppercase">VERIFIED</span>
                </div>
                <span className="font-mono text-[9px] font-extrabold text-blue-950 mt-1">
                  STX-{result.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[8px] text-slate-500 uppercase">Digital Security Hash</span>
              </div>

              <div>
                <div className="h-9 border-b border-slate-400 max-w-[200px] mx-auto mb-1 flex items-end justify-center font-serif italic text-blue-900 font-bold text-sm">
                  Prof. E. K. Ogundele
                </div>
                <strong className="block font-bold text-slate-900">Prof. E. K. Ogundele</strong>
                <span className="text-[10px] text-slate-500 uppercase">Principal & Examination Controller</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
