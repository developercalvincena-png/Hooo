import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload, 
  FileArchive, 
  FileText, 
  Printer, 
  Camera, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Calendar, 
  Hash, 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { StudentProfile, WaecDepartment, WaecRegistration } from '../../../types';
import { useSchool } from '../../../context/SchoolContext';
import { NIGERIAN_STATES } from '../../../data/nigeriaStatesLga';
import { WaecCatalogSubject } from '../../../data/waecSubjects';
import { 
  downloadSingleStudentWaecZip, 
  importWaecPackageZip 
} from '../../../utils/waecZipManager';

interface StudentWaecRegistrationTabProps {
  student: StudentProfile;
}

export const StudentWaecRegistrationTab: React.FC<StudentWaecRegistrationTabProps> = ({
  student
}) => {
  const { 
    schoolInfo, 
    waecRegistrations, 
    saveWaecRegistration, 
    waecPromptBroadcast,
    waecSubjects,
    waecDepartmentRecommendations
  } = useSchool();

  // Find existing registration for this scholar
  const existingReg = useMemo(() => {
    return (
      waecRegistrations.find(r => r.studentId === student.id || r.regNumber === student.regNumber) ||
      student.waecRegistration
    );
  }, [waecRegistrations, student]);

  // Form states initialized with existing registration or parsed student bio-data
  const [surname, setSurname] = useState(existingReg?.surname || '');
  const [firstName, setFirstName] = useState(existingReg?.firstName || '');
  const [middleName, setMiddleName] = useState(existingReg?.middleName || '');
  const [dateOfBirth, setDateOfBirth] = useState(existingReg?.dateOfBirth || '2008-05-12');
  const [gender, setGender] = useState<'Male' | 'Female'>(existingReg?.gender || (student.gender === 'Female' ? 'Female' : 'Male'));
  const [stateOfOrigin, setStateOfOrigin] = useState(existingReg?.stateOfOrigin || 'Lagos');
  const [lga, setLga] = useState(existingReg?.lga || '');
  const [religion, setReligion] = useState<'Christianity' | 'Islam' | 'Others'>(existingReg?.religion || 'Christianity');
  const [phone, setPhone] = useState(existingReg?.phone || student.parentPhone || '+234 803 000 0000');
  const [nin, setNin] = useState(existingReg?.nin || '');
  const [homeAddress, setHomeAddress] = useState(existingReg?.homeAddress || student.address || 'Lagos, Nigeria');
  const [email, setEmail] = useState(existingReg?.email || `${student.regNumber?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'scholar'}@stanbaxschools.edu.ng`);
  
  // Department detection from student grade / existing registration
  const defaultDept: WaecDepartment = useMemo(() => {
    if (existingReg?.department) return existingReg.department;
    const g = (student.grade || '').toLowerCase();
    if (g.includes('science')) return 'Science';
    if (g.includes('art')) return 'Arts';
    if (g.includes('commercial')) return 'Commercial';
    return 'Science';
  }, [existingReg, student.grade]);

  const [department, setDepartment] = useState<WaecDepartment>(defaultDept);
  const [examType, setExamType] = useState<'WASSCE (May/June)' | 'GCE (Nov/Dec)' | 'Mock WAEC'>(
    existingReg?.examType || 'WASSCE (May/June)'
  );

  // Passport photo (Base64)
  const [passportPhoto, setPassportPhoto] = useState<string>(
    existingReg?.passportPhoto || student.passportPhoto || ''
  );
  const [passportFilename, setPassportFilename] = useState<string>(
    existingReg?.passportFilename || `${student.regNumber}_passport.jpg`
  );

  // Dynamic Compulsory Core Subjects from active WAEC catalog
  const compulsorySubjects = useMemo(() => {
    return (waecSubjects || []).filter(s => s.category === 'core');
  }, [waecSubjects]);

  const compulsoryNames = useMemo(() => {
    return compulsorySubjects.map(s => s.name);
  }, [compulsorySubjects]);

  const electiveSubjects = useMemo(() => {
    return (waecSubjects || []).filter(s => s.category !== 'core');
  }, [waecSubjects]);

  // Subjects selection: compulsory core always included
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    if (existingReg?.subjects && existingReg.subjects.length > 0) {
      // Ensure compulsory are in
      const combined = Array.from(new Set([...compulsoryNames, ...existingReg.subjects]));
      return combined;
    }
    // Default: compulsory + recommended for department
    const recs = waecDepartmentRecommendations?.[defaultDept] || [];
    return Array.from(new Set([...compulsoryNames, ...recs])).slice(0, 9);
  });

  // UI feedback states
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'all' | 'science' | 'arts' | 'commercial' | 'trade'>('all');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isImportingZip, setIsImportingZip] = useState(false);
  const [showSlipPreview, setShowSlipPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipUploadRef = useRef<HTMLInputElement | null>(null);

  // Parse name from student full name if blank
  useEffect(() => {
    if (!existingReg && student.name) {
      const parts = student.name.trim().split(/\s+/);
      if (parts.length === 1) {
        setFirstName(parts[0]);
      } else if (parts.length === 2) {
        setSurname(parts[0].toUpperCase());
        setFirstName(parts[1]);
      } else if (parts.length >= 3) {
        setSurname(parts[0].toUpperCase());
        setFirstName(parts[1]);
        setMiddleName(parts.slice(2).join(' '));
      }
    }
  }, [student, existingReg]);

  // Available LGAs for selected state
  const availableLgas = useMemo(() => {
    const foundState = NIGERIAN_STATES.find(
      s => s.state.toLowerCase() === stateOfOrigin.toLowerCase()
    );
    return foundState ? foundState.lgas : [];
  }, [stateOfOrigin]);

  // Auto-set first LGA if current LGA is not valid for new state
  useEffect(() => {
    if (availableLgas.length > 0 && (!lga || !availableLgas.includes(lga))) {
      setLga(availableLgas[0]);
    }
  }, [availableLgas, lga]);

  // Elective catalog filtered
  const filteredElectives = useMemo(() => {
    return electiveSubjects.filter(s => {
      const matchCat = subjectCategoryFilter === 'all' || s.category === subjectCategoryFilter;
      const matchSearch = !subjectSearch || 
        s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || 
        s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(subjectSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [electiveSubjects, subjectCategoryFilter, subjectSearch]);

  // Toggle subject selection
  const handleToggleSubject = (subjectName: string) => {
    if (compulsoryNames.includes(subjectName)) {
      return; // Compulsory cannot be toggled off
    }
    if (selectedSubjects.includes(subjectName)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subjectName));
    } else {
      if (selectedSubjects.length >= 9) {
        setValidationErrors([
          'WAEC maximum of 9 subjects reached! Please unselect another elective subject before adding this one.'
        ]);
        setTimeout(() => setValidationErrors([]), 4000);
        return;
      }
      setSelectedSubjects(prev => [...prev, subjectName]);
    }
  };

  // Quick preset apply for department
  const handleApplyDepartmentPreset = (dept: WaecDepartment) => {
    setDepartment(dept);
    const recs = waecDepartmentRecommendations?.[dept] || [];
    const newSubjects = Array.from(new Set([...compulsoryNames, ...recs])).slice(0, 9);
    setSelectedSubjects(newSubjects);
    setSaveSuccessMsg(`Applied standard WAEC ${dept} subject combination (9 subjects).`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Passport photo file handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(['Please choose a valid JPG or PNG image file for your passport photograph.']);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setValidationErrors(['Passport photo size should not exceed 2MB.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPassportPhoto(base64);
        setPassportFilename(`${student.regNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${surname}_passport.jpg`);
        setSaveSuccessMsg('Passport photograph uploaded successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!surname.trim()) errors.push('Surname is required (official WAEC format).');
    if (!firstName.trim()) errors.push('First Name is required.');
    if (!dateOfBirth) errors.push('Date of Birth is required.');
    if (!stateOfOrigin) errors.push('State of Origin is required.');
    if (!lga) errors.push('Local Government Area (LGA) is required.');
    if (!homeAddress.trim()) errors.push('Home Address is required.');
    if (!phone.trim()) errors.push('Phone Number is required.');
    
    // NIN validation (11 digits required by WAEC & NIMC)
    const cleanNin = nin.replace(/\s+/g, '');
    if (!cleanNin) {
      errors.push('11-Digit National Identification Number (NIN) is compulsory for WAEC registration.');
    } else if (!/^\d{11}$/.test(cleanNin)) {
      errors.push(`NIN must be exactly 11 digits (current length: ${cleanNin.length}).`);
    }

    // Subjects validation (must have all compulsory core subjects and exactly 9 total)
    const missingCompulsory = compulsoryNames.filter(c => !selectedSubjects.includes(c));
    if (missingCompulsory.length > 0) {
      errors.push(`The compulsory core subjects (${missingCompulsory.join(', ')}) must be selected.`);
    }

    if (selectedSubjects.length !== 9) {
      errors.push(`WAEC requires exactly 9 subjects altogether (you currently have ${selectedSubjects.length} selected).`);
    }

    if (!passportPhoto) {
      errors.push('Passport photograph with plain white background is required for WAEC verification.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Save handler (draft or final submit)
  const handleSave = (status: 'draft' | 'submitted') => {
    setValidationErrors([]);
    if (status === 'submitted') {
      const isValid = validateForm();
      if (!isValid) return;
    }

    setIsSubmitting(true);
    try {
      const saved = saveWaecRegistration({
        id: existingReg?.id,
        studentId: student.id,
        regNumber: student.regNumber,
        candidateNumber: existingReg?.candidateNumber,
        surname: surname.trim().toUpperCase(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        dateOfBirth,
        gender,
        stateOfOrigin,
        lga,
        religion,
        phone: phone.trim(),
        nin: nin.trim().replace(/\s+/g, ''),
        homeAddress: homeAddress.trim(),
        email: email.trim(),
        department,
        examType,
        targetClass: student.grade || 'SSS 2',
        passportPhoto,
        passportFilename,
        subjects: selectedSubjects,
        status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : existingReg?.submittedAt,
        verifiedAt: existingReg?.verifiedAt,
        verifiedBy: existingReg?.verifiedBy,
        adminRemarks: existingReg?.adminRemarks
      });

      setSaveSuccessMsg(
        status === 'submitted'
          ? 'Official WAEC Bio-Data and 9 Subjects submitted successfully! Your submission is now awaiting final administrative clearance.'
          : 'Draft registration details saved to your local profile.'
      );
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error saving WAEC registration:', err);
      setValidationErrors(['An unexpected error occurred while saving. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download personal student ZIP file
  const handleDownloadPersonalZip = async () => {
    if (!existingReg) {
      // First save as draft so we have an entity
      handleSave('draft');
    }
    setIsDownloadingZip(true);
    try {
      const tempReg: WaecRegistration = {
        id: existingReg?.id || 'temp-id',
        studentId: student.id,
        regNumber: student.regNumber,
        candidateNumber: existingReg?.candidateNumber,
        surname: surname.toUpperCase(),
        firstName,
        middleName,
        dateOfBirth,
        gender,
        stateOfOrigin,
        lga,
        religion,
        phone,
        nin,
        homeAddress,
        email,
        department,
        examType,
        targetClass: student.grade || 'SSS 2',
        passportPhoto,
        passportFilename,
        subjects: selectedSubjects,
        status: existingReg?.status || 'draft',
        updatedAt: new Date().toISOString()
      };

      const result = await downloadSingleStudentWaecZip(tempReg, `${surname}_${firstName}`);
      if (result.success) {
        setSaveSuccessMsg(`Personal WAEC Package archive downloaded: ${result.filename}`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error downloading student ZIP:', err);
      setValidationErrors(['Failed to generate personal ZIP package. Please try again.']);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Upload and restore from ZIP
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingZip(true);
    setValidationErrors([]);
    try {
      const res = await importWaecPackageZip(file);
      if (res.success && res.registrations.length > 0) {
        // Find matching registration or take the first one
        const match = res.registrations.find(
          r => r.studentId === student.id || r.regNumber === student.regNumber
        ) || res.registrations[0];

        if (match) {
          if (match.surname) setSurname(match.surname);
          if (match.firstName) setFirstName(match.firstName);
          if (match.middleName) setMiddleName(match.middleName);
          if (match.dateOfBirth) setDateOfBirth(match.dateOfBirth);
          if (match.gender) setGender(match.gender);
          if (match.stateOfOrigin) setStateOfOrigin(match.stateOfOrigin);
          if (match.lga) setLga(match.lga);
          if (match.religion) setReligion(match.religion);
          if (match.phone) setPhone(match.phone);
          if (match.nin) setNin(match.nin);
          if (match.homeAddress) setHomeAddress(match.homeAddress);
          if (match.email) setEmail(match.email);
          if (match.department) setDepartment(match.department);
          if (match.passportPhoto) setPassportPhoto(match.passportPhoto);
          if (match.subjects && match.subjects.length > 0) setSelectedSubjects(match.subjects);

          setSaveSuccessMsg(`Successfully restored WAEC candidate bio-data and photo from ZIP package!`);
          setTimeout(() => setSaveSuccessMsg(null), 5000);
        } else {
          setValidationErrors(['No candidate records matching your registration found in the ZIP archive.']);
        }
      } else {
        setValidationErrors([res.message || 'Could not parse candidate information from the uploaded ZIP archive.']);
      }
    } catch (err) {
      console.error('Error uploading ZIP:', err);
      setValidationErrors(['Failed to extract ZIP archive. Please ensure it is a valid WAEC candidate ZIP file.']);
    } finally {
      setIsImportingZip(false);
      if (zipUploadRef.current) zipUploadRef.current.value = '';
    }
  };

  const currentStatus = existingReg?.status || 'draft';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Award className="w-80 h-80 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-900 shadow-xs">
                Official Examination Registry
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                {student.grade || 'SS 2 / SS 3'} Candidate
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                currentStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : currentStatus === 'submitted'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  : currentStatus === 'queried'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Status: {currentStatus.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              WAEC & WASSCE Bio-Data & 9-Subject Registration
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              Mandatory electronic enrolment for all Senior Secondary (SS 2 & SS 3) candidates. Provide accurate bio-data, verified National Identification Number (NIN), plain white-background passport photograph, and your official 9 subjects.
            </p>
          </div>

          {/* Quick ZIP Actions */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPersonalZip}
              disabled={isDownloadingZip}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2"
              title="Download your registration JSON, CSV slip, and passport picture in a ZIP archive"
            >
              {isDownloadingZip ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileArchive className="w-4 h-4" />
              )}
              <span>Download ZIP Package</span>
            </button>

            <button
              type="button"
              onClick={() => zipUploadRef.current?.click()}
              disabled={isImportingZip}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
              title="Upload previous WAEC ZIP archive to restore your details"
            >
              {isImportingZip ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload / Restore ZIP</span>
            </button>
            <input
              ref={zipUploadRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleZipUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Admin Broadcast Prompt Notice if Active */}
      {waecPromptBroadcast && waecPromptBroadcast.isActive && (
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-stone-950" />
            </div>
            <div className="space-y-1 text-sm flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-black text-stone-900 text-base">
                  {waecPromptBroadcast.title}
                </h4>
                {waecPromptBroadcast.deadline && (
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-lg">
                    Deadline: {new Date(waecPromptBroadcast.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                {waecPromptBroadcast.message}
              </p>
              <div className="text-[11px] font-semibold text-stone-500 pt-1">
                Announced by: <strong>{waecPromptBroadcast.sentBy}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queried Notice if Admin left remarks */}
      {currentStatus === 'queried' && existingReg?.adminRemarks && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Action Required: Registration Queried by Examination Desk</p>
            <p className="text-rose-800 font-medium">{existingReg.adminRemarks}</p>
            <p className="text-[11px] text-rose-600">Please make the requested adjustments below and re-submit.</p>
          </div>
        </div>
      )}

      {/* Success / Error Banners */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{saveSuccessMsg}</p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-black text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Please complete all required WAEC fields:</span>
          </div>
          <ul className="text-xs list-disc pl-5 space-y-1 font-semibold text-rose-800">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio-Data Form & Passport */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Candidate Bio-Data */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Personal Bio-Data</h3>
                  <p className="text-xs text-stone-500">Official candidate details as registered on National Identity Card (NIN)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                WAEC Form A
              </span>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Surname */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Surname (Family Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value.toUpperCase())}
                  placeholder="e.g. ADELEKE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-bold uppercase text-stone-900"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Tiwa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Oluwaseun"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-bold text-stone-900"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl font-bold border transition text-center ${
                        gender === g
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Religion */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Religion <span className="text-rose-500">*</span>
                </label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900 bg-white"
                >
                  <option value="Christianity">Christianity</option>
                  <option value="Islam">Islam</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* State of Origin */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  State of Origin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={stateOfOrigin}
                  onChange={(e) => setStateOfOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900 bg-white"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state} State ({s.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Local Govt (LGA) */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Local Govt Area (LGA) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900 bg-white"
                >
                  {availableLgas.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* NIN (11 digits) */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  National ID Number (NIN) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                    placeholder="11 digits (e.g. 72849103847)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-mono font-bold tracking-wider text-stone-900"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-stone-400">
                    {nin.length}/11
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Candidate / Guardian Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@stanbaxschools.edu.ng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-semibold text-stone-900"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Science', 'Arts', 'Commercial'] as WaecDepartment[]).map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleApplyDepartmentPreset(dept)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black border transition text-center ${
                        department === dept
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Home Address (Spans 2 columns) */}
              <div className="sm:col-span-2">
                <label className="block font-black text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  Residential Home Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Permanent residential address, Street, City, State"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-medium text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: WAEC Subjects (Compulsory 3 + 6 Electives = 9 altogether) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Official 9 WAEC Subjects Enrolment
                  </h3>
                  <p className="text-xs text-stone-500">
                    {compulsoryNames.map((c, i) => `${i + 1}. ${c}`).join(' • ')} are compulsory. Supply {Math.max(0, 9 - compulsoryNames.length)} other subjects to make 9 altogether.
                  </p>
                </div>
              </div>

              {/* Counter Pill */}
              <div className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 border self-start sm:self-auto ${
                selectedSubjects.length === 9
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {selectedSubjects.length === 9 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>Subjects: {selectedSubjects.length} / 9</span>
              </div>
            </div>

            {/* Currently Selected 9 Subjects List */}
            <div className="space-y-3 bg-stone-50/80 rounded-2xl p-4 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                  Your Current WAEC Examination Subjects ({selectedSubjects.length})
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  Click elective to remove or customize
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subName, index) => {
                  const isCompulsory = compulsoryNames.includes(subName);
                  return (
                    <div
                      key={subName}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        isCompulsory
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-stone-800 border-stone-200 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] opacity-80 font-mono">#{index + 1}</span>
                      <span>{subName}</span>
                      {isCompulsory ? (
                        <span className="text-[10px] uppercase tracking-wider bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-200">
                          Core
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleSubject(subName)}
                          className="hover:text-rose-600 p-0.5 text-stone-400 transition"
                          title="Remove subject"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Quick Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-stone-600">Quick Department Presets:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyDepartmentPreset('Science')}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                >
                  Science Combination (9)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDepartmentPreset('Arts')}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                >
                  Arts Combination (9)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDepartmentPreset('Commercial')}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                >
                  Commercial Combination (9)
                </button>
              </div>
            </div>

            {/* Filter & Elective Subject Picker */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search elective subject (e.g. Further Maths, Physics, Government)..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 font-medium"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {(['all', 'science', 'arts', 'commercial', 'trade'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSubjectCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap border transition ${
                        subjectCategoryFilter === cat
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Electives Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {filteredElectives.map((s) => {
                  const isSelected = selectedSubjects.includes(s.name);
                  return (
                    <div
                      key={s.code}
                      onClick={() => handleToggleSubject(s.name)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-stone-900">{s.name}</span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">({s.code})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{s.description}</p>
                      </div>

                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-stone-300 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Passport Photo Upload & Submission Card */}
        <div className="space-y-6">
          {/* Passport Photo Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-700">
                Candidate Passport Photo
              </h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                White Background
              </span>
            </div>

            <div className="relative mx-auto w-40 h-48 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 overflow-hidden flex flex-col items-center justify-center group shadow-xs">
              {passportPhoto ? (
                <>
                  <img
                    src={passportPhoto}
                    alt="Candidate WAEC Passport"
                    className="w-full h-full object-cover"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Change Photo</span>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 cursor-pointer text-stone-400 hover:text-stone-600"
                >
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold text-stone-700">Upload Photo</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">JPG / PNG (Max 2MB)</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-700 transition"
            >
              {passportPhoto ? 'Replace Passport Photograph' : 'Choose Passport File'}
            </button>
            <p className="text-[11px] text-stone-500 leading-tight">
              Standard WAEC specification: Frontal view, neutral expression, white backdrop, ears visible.
            </p>
          </div>

          {/* Submission Action Box */}
          <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black">Official WAEC Filing</h4>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Candidate: <strong>{surname || student.name}</strong> ({student.regNumber})
              </p>
            </div>

            {existingReg?.candidateNumber && (
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  WAEC Candidate / Index Number:
                </span>
                <span className="font-mono text-base font-black text-white">
                  {existingReg.candidateNumber}
                </span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleSave('submitted')}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Submit Official WAEC Registration</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs border border-white/10 transition"
              >
                Save Draft Bio-Data
              </button>

              <button
                type="button"
                onClick={() => setShowSlipPreview(!showSlipPreview)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs border border-amber-400/30 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{showSlipPreview ? 'Hide Registration Photocard' : 'Preview WAEC Photocard'}</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400 text-center pt-2">
              All details will be validated by the Principal & West African Examinations Council.
            </div>
          </div>
        </div>
      </div>

      {/* Official WAEC Registration Slip / Photocard Print Preview */}
      {showSlipPreview && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-800 shadow-2xl space-y-6 print:m-0 print:border-none">
          {/* Slip Header */}
          <div className="border-b-2 border-stone-800 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Official Examination Slip
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {schoolInfo.name}
              </h2>
              <p className="text-xs text-stone-600 font-bold">
                Government Approved WAEC / WASSCE Examination Centre No: 421098
              </p>
            </div>

            {passportPhoto && (
              <img
                src={passportPhoto}
                alt="Photocard Passport"
                className="w-24 h-28 object-cover rounded-xl border-2 border-stone-800 shadow-md"
              />
            )}
          </div>

          {/* Candidate Bio-Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Candidate Full Name:</span>
              <p className="font-black text-stone-900 text-sm">{surname} {firstName} {middleName}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Registration No:</span>
              <p className="font-mono font-black text-stone-900 text-sm">{student.regNumber}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Candidate WAEC No:</span>
              <p className="font-mono font-black text-emerald-800 text-sm">{existingReg?.candidateNumber || 'Pending Allocation'}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Department & Class:</span>
              <p className="font-bold text-stone-900 text-sm">{department} ({student.grade})</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Date of Birth:</span>
              <p className="font-bold text-stone-900">{dateOfBirth} ({gender})</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">State of Origin & LGA:</span>
              <p className="font-bold text-stone-900">{stateOfOrigin} State &bull; {lga} LGA</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">NIN (National ID):</span>
              <p className="font-mono font-bold text-stone-900">{nin || 'Not Provided'}</p>
            </div>
            <div>
              <span className="font-bold text-stone-500 uppercase text-[10px]">Exam Type:</span>
              <p className="font-bold text-stone-900">{examType}</p>
            </div>
          </div>

          {/* Subjects Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-2">
              Registered 9 WAEC Examination Subjects:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedSubjects.map((sub, i) => (
                <div key={sub} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-bold text-stone-900">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slip Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-black text-xs hover:bg-stone-800 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
