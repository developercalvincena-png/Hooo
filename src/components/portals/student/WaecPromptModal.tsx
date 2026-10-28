import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  HelpCircle, 
  ShieldCheck, 
  UserCheck, 
  X 
} from 'lucide-react';
import { StudentProfile, WaecPromptBroadcast } from '../../../types';

interface WaecPromptModalProps {
  student: StudentProfile;
  prompt: WaecPromptBroadcast;
  onOpenRegistration: () => void;
  onDismiss: () => void;
}

export const WaecPromptModal: React.FC<WaecPromptModalProps> = ({
  student,
  prompt,
  onOpenRegistration,
  onDismiss,
}) => {
  const isRegistered = !!student.waecRegistration;
  const registrationStatus = student.waecRegistration?.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200/80 overflow-hidden my-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header with Nigerian & WAEC insignia flair */}
        <div className="bg-linear-to-r from-emerald-800 via-emerald-900 to-amber-950 px-6 py-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                <Award className="w-7 h-7 text-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    Official WAEC Portal Notice
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                    {student.grade || 'SS 2 / SS 3 Candidate'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1 leading-tight tracking-tight">
                  {prompt.title || 'Mandatory WAEC Bio-Data & Subject Registration'}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Close Notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {prompt.deadline && (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-200 bg-amber-500/20 rounded-xl px-3 py-1.5 w-fit border border-amber-400/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Submission Deadline: <strong>{new Date(prompt.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alert if already submitted or draft */}
          {isRegistered && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              registrationStatus === 'verified'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : registrationStatus === 'submitted'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm">
                  {registrationStatus === 'verified' && 'Your WAEC bio-data has been officially verified!'}
                  {registrationStatus === 'submitted' && 'Your WAEC bio-data is submitted and awaiting admin verification.'}
                  {registrationStatus === 'draft' && 'You have an uncompleted draft WAEC registration.'}
                </p>
                <p className="mt-0.5 text-stone-600">
                  You can review your details, update your photo, or download your official registration slip and ZIP archive package.
                </p>
              </div>
            </div>
          )}

          {/* Admin message note */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 text-stone-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-extrabold text-stone-900">Message from the Examination Office:</span>
                  <span className="text-[11px] font-semibold text-stone-500">
                    By {prompt.sentBy || 'Admin Desk'}
                  </span>
                </div>
                <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                  {prompt.message || 'All SS 2 and SS 3 students are required to supply complete bio-data, verified National Identification Number (NIN), and select 9 approved WAEC subjects.'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Requirements Checklist Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Information Needed for Official WAEC Registration:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="font-black text-stone-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  1. Candidate Bio-Data
                </div>
                <ul className="text-stone-600 space-y-1 pl-5 list-disc text-[11px]">
                  <li><strong>Surname</strong>, <strong>First Name</strong> & <strong>Middle Name</strong></li>
                  <li><strong>Date of Birth</strong> & <strong>Gender</strong></li>
                  <li><strong>State of Origin</strong> & <strong>Local Govt (LGA)</strong></li>
                  <li><strong>Religion</strong> & <strong>Home Address</strong></li>
                  <li><strong>Phone Number</strong> & <strong>Email Address</strong></li>
                  <li><strong>National Identity Number (NIN)</strong> (11 digits)</li>
                  <li><strong>Academic Department</strong> (Science / Arts / Commercial)</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="font-black text-stone-800 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  2. Official 9 Subjects Selection
                </div>
                <div className="text-[11px] text-stone-600 space-y-1">
                  <div className="p-1.5 bg-emerald-100/60 rounded-md text-emerald-900 font-semibold">
                    <span className="font-bold">Compulsory (3 Core):</span>
                    <ol className="list-decimal pl-4 mt-0.5 font-normal">
                      <li>English Language</li>
                      <li>Mathematics</li>
                      <li>Civic Education</li>
                    </ol>
                  </div>
                  <p className="pt-1 text-stone-700">
                    <strong>+ Supply other 5 to 6 Subjects</strong> from Sciences, Arts, Commercial or Trade to reach <strong>9 subjects altogether</strong>.
                  </p>
                  <p className="text-[10px] text-stone-500 italic">
                    * White-background passport photo upload & ZIP data download included.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions pill */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              Once completed, you can instantly download your registration card and export your entire candidate data and photos in an encrypted <strong>ZIP file</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition"
          >
            Remind Me Later
          </button>

          <button
            type="button"
            onClick={onOpenRegistration}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
          >
            <span>{isRegistered ? 'View & Edit WAEC Registration' : 'Fill WAEC Bio-Data Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
