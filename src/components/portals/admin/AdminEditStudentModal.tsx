import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Home, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Award,
  Trash2,
  Camera,
  Upload
} from 'lucide-react';
import type { StudentProfile, SchoolClass, HouseStanding } from '../../../types';

interface AdminEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  classes: SchoolClass[];
  houseStandings: HouseStanding[];
  onSave: (id: string, updates: Partial<StudentProfile>) => void;
  onDelete?: (id: string) => void;
}

export const AdminEditStudentModal: React.FC<AdminEditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  houseStandings,
  onSave,
  onDelete,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [classId, setClassId] = useState('');
  const [house, setHouse] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('stanbax2025');
  const [feeStatus, setFeeStatus] = useState<'Fully Paid' | 'Partially Paid' | 'Outstanding'>('Fully Paid');
  const [promotionStatus, setPromotionStatus] = useState<'Promoted' | 'Repeat' | 'Pending'>('Promoted');
  const [passportPhoto, setPassportPhoto] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate age helper
  const calculateAgeFromDob = (dobString: string): number | '' => {
    if (!dobString) return '';
    const b = new Date(dobString);
    if (isNaN(b.getTime())) return '';
    const now = new Date();
    let calculatedAge = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : '';
  };

  // Sync state when student prop changes
  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setRegNumber(student.regNumber || '');
      setGrade(student.grade || '');
      setClassId(student.classId || '');
      setHouse(student.house || 'Sapphire (Blue House)');
      const dob = student.dateOfBirth || '2015-01-01';
      setDateOfBirth(dob);
      setAge(calculateAgeFromDob(dob));
      setGender(student.gender || 'Male');
      setParentName(student.parentName || '');
      setParentPhone(student.parentPhone || '');
      setParentEmail(student.parentEmail || '');
      setPassword(student.password || 'stanbax2025');
      setFeeStatus(student.feeStatus || 'Fully Paid');
      setPromotionStatus(student.promotionStatus || 'Promoted');
      setPassportPhoto(student.passportPhoto || '');
      setSaveSuccess(false);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // Handle DOB change -> recalculate age
  const handleDobChange = (newDob: string) => {
    setDateOfBirth(newDob);
    const calculated = calculateAgeFromDob(newDob);
    setAge(calculated);
  };

  // Handle Age change -> update DOB year
  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    if (newAge > 0 && newAge < 50) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - newAge;
      // Preserve existing month and day if valid, or default to 01-01
      let month = '01';
      let day = '01';
      if (dateOfBirth && dateOfBirth.includes('-')) {
        const parts = dateOfBirth.split('-');
        if (parts[1]) month = parts[1];
        if (parts[2]) day = parts[2];
      }
      setDateOfBirth(`${birthYear}-${month}-${day}`);
    }
  };

  // Handle Class change -> also update classId and recommended tuition
  const handleClassChange = (selectedGradeName: string) => {
    setGrade(selectedGradeName);
    const matchedClass = classes.find(c => 
      c.name.toLowerCase() === selectedGradeName.toLowerCase() ||
      c.id.toLowerCase() === selectedGradeName.toLowerCase()
    );
    if (matchedClass) {
      setClassId(matchedClass.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updates: Partial<StudentProfile> = {
      name: name.trim(),
      regNumber: regNumber.trim(),
      grade: grade.trim(),
      classId: classId || undefined,
      house: house.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      password: password.trim() || 'stanbax2025',
      feeStatus,
      promotionStatus,
      passportPhoto,
      promotedToGrade: promotionStatus === 'Promoted' ? grade : undefined
    };

    onSave(student.id, updates);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in text-slate-900">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/15">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Reassign Scholar Profile & Records</span>
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Update Class, House, Date of Birth, Age & Portal Credentials for {student.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Scholar profile and class assignment updated successfully!</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 1: Basic Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
              <User className="w-4 h-4 text-blue-700" />
              <span>Scholar Identity, Passport Photo & Registration</span>
            </div>

            {/* Passport Photograph Upload Row */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
                {passportPhoto ? (
                  <img src={passportPhoto} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-7 h-7 text-amber-700" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-xs font-extrabold text-slate-800">Official Passport Photograph</p>
                <p className="text-[11px] text-slate-500">Displayed on Scholar Portal, ID Card, WAEC slip, and Official Report Cards.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{passportPhoto ? 'Change Passport Photo' : 'Upload Passport Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !file.type.startsWith('image/') || file.size > 2.5 * 1024 * 1024) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === 'string') {
                            setPassportPhoto(ev.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {passportPhoto && (
                    <button
                      type="button"
                      onClick={() => setPassportPhoto('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="e.g. David Abayomi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-blue-900 bg-slate-50 focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="e.g. SBS/2026/KG2/001"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Class & House Reassignment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
              <Home className="w-4 h-4 text-amber-600" />
              <span>Class Enrolment & Inter-House Assignment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Class Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrolled Class / Grade <span className="text-red-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-800 outline-none cursor-pointer"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                  {/* Common aliases if not in list */}
                  {!classes.some(c => c.name.toLowerCase() === 'kg 2') && (
                    <option value="Kg 2">Kg 2 (Early Years)</option>
                  )}
                  {!classes.some(c => c.name.toLowerCase().includes('primary 1')) && (
                    <option value="Primary 1">Primary 1 (Primary)</option>
                  )}
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Reassigning class updates gradebook, lesson materials & report cards.
                </span>
              </div>

              {/* House Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inter-House Sports Team <span className="text-red-500">*</span>
                </label>
                <select
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-800 outline-none cursor-pointer"
                >
                  <option value="">-- Select House --</option>
                  {houseStandings.map(h => (
                    <option key={h.name} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                  <option value="Sapphire (Blue House)">Sapphire (Blue House)</option>
                  <option value="Ruby (Red House)">Ruby (Red House)</option>
                  <option value="Emerald (Green House)">Emerald (Green House)</option>
                  <option value="Topaz (Yellow House)">Topaz (Yellow House)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Assigns athlete to sports events, house points, and relays.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Date of Birth, Age & Gender */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Demographics, Date of Birth & Age</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* DOB */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-800 outline-none bg-white"
                />
              </div>

              {/* Synchronized Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Age (Years)</span>
                  <span className="text-[10px] font-normal text-slate-500">Auto-synced</span>
                </label>
                <input
                  type="number"
                  min="2"
                  max="35"
                  value={age}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-800 outline-none bg-slate-50"
                  placeholder="e.g. 6"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      gender === 'Male'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      gender === 'Female'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Parent / Guardian & Portal Login */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Parent Details & Scholar Portal Password</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="Mr. & Mrs. Abayomi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Email Address
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="parent@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Sign-In Password / PIN
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-blue-900 bg-slate-50 focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="stanbax2025"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Default: <code>stanbax2025</code> or scholar's surname.
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Academic & Fee Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Academic Progression & Tuition Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Promotion Status
                </label>
                <select
                  value={promotionStatus}
                  onChange={(e) => setPromotionStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-800 outline-none cursor-pointer"
                >
                  <option value="Promoted">Promoted to Next Class</option>
                  <option value="Repeat">Repeat Current Class</option>
                  <option value="Pending">Promotion Decision Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tuition Fee Status
                </label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-800 outline-none cursor-pointer"
                >
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Outstanding">Outstanding</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
            >
              Cancel
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently delete scholar ${student.name} (${student.regNumber})? This action cannot be undone.`)) {
                    onDelete(student.id);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                title="Permanently remove this scholar"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Scholar</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Save & Apply Reassignments</span>
          </button>
        </div>
      </div>
    </div>
  );
};
