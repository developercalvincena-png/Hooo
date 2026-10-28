import JSZip from 'jszip';
import { WaecRegistration } from '../types';

function extractBase64Payload(dataUrl: string): { mime: string; ext: string; base64: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  return { mime, ext, base64 };
}

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function downloadWaecPackageZip(
  registrations: WaecRegistration[],
  options?: { schoolName?: string; session?: string }
): Promise<{ success: boolean; count: number; filename: string }> {
  const zip = new JSZip();
  const photosFolder = zip.folder('candidate_passports');

  const csvHeaders = [
    'Candidate_ID',
    'Registration_Number',
    'WAEC_Index_Number',
    'Surname',
    'First_Name',
    'Middle_Name',
    'Date_Of_Birth',
    'Gender',
    'State_Of_Origin',
    'LGA',
    'Religion',
    'NIN',
    'Phone',
    'Email',
    'Home_Address',
    'Department',
    'Exam_Type',
    'Class',
    'Status',
    'Passport_File',
    'Subjects_Count',
    'Registered_9_Subjects'
  ];

  const csvRows: string[] = [csvHeaders.join(',')];

  for (const reg of registrations) {
    const cleanRegNo = (reg.regNumber || reg.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanSurname = (reg.surname || 'CANDIDATE').replace(/[^a-zA-Z0-9_-]/g, '_');
    let photoFilename = reg.passportFilename || `${cleanRegNo}_${cleanSurname}_passport.jpg`;

    if (reg.passportPhoto && photosFolder) {
      const parsed = extractBase64Payload(reg.passportPhoto);
      if (parsed) {
        photoFilename = `${cleanRegNo}_${cleanSurname}.${parsed.ext}`;
        photosFolder.file(photoFilename, parsed.base64, { base64: true });
      }
    }

    const row = [
      reg.id,
      reg.regNumber,
      reg.candidateNumber || 'UNASSIGNED',
      reg.surname,
      reg.firstName,
      reg.middleName || '',
      reg.dateOfBirth,
      reg.gender,
      reg.stateOfOrigin,
      reg.lga,
      reg.religion,
      reg.nin,
      reg.phone,
      reg.email,
      reg.homeAddress,
      reg.department,
      reg.examType,
      reg.targetClass,
      reg.status,
      photoFilename,
      (reg.subjects || []).length,
      (reg.subjects || []).join(' | ')
    ].map(escapeCsvCell);

    csvRows.push(row.join(','));
  }

  const manifestPayload = {
    exportedAt: new Date().toISOString(),
    schoolName: options?.schoolName || 'Stanbax Schools Ibadan',
    session: options?.session || '2025/2026 Academic Session',
    totalCandidates: registrations.length,
    registrations
  };

  zip.file('waec_candidates_manifest.json', JSON.stringify(manifestPayload, null, 2));
  zip.file('waec_candidates_broadsheet.csv', csvRows.join('\n'));

  const blob = await zip.generateAsync({ type: 'blob' });
  const dateTag = new Date().toISOString().slice(0, 10);
  const filename = `WAEC_Candidates_Package_${dateTag}.zip`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    count: registrations.length,
    filename
  };
}

export async function downloadSingleStudentWaecZip(
  registration: WaecRegistration,
  candidateLabel?: string
): Promise<{ success: boolean; filename: string }> {
  const zip = new JSZip();
  const cleanLabel = (candidateLabel || `${registration.surname}_${registration.firstName}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  if (registration.passportPhoto) {
    const parsed = extractBase64Payload(registration.passportPhoto);
    if (parsed) {
      zip.file(`${cleanLabel}_passport.${parsed.ext}`, parsed.base64, { base64: true });
    }
  }

  const manifestPayload = {
    exportedAt: new Date().toISOString(),
    totalCandidates: 1,
    registrations: [registration]
  };

  zip.file('waec_candidates_manifest.json', JSON.stringify(manifestPayload, null, 2));

  const summarySlipText = [
    '============================================================',
    '        OFFICIAL WAEC / WASSCE CANDIDATE BIO-DATA SLIP      ',
    '============================================================',
    `Candidate Name   : ${registration.surname}, ${registration.firstName} ${registration.middleName || ''}`.trim(),
    `Registration No  : ${registration.regNumber}`,
    `WAEC Index No    : ${registration.candidateNumber || 'PENDING OFFICIAL ALLOCATION'}`,
    `Date of Birth    : ${registration.dateOfBirth}`,
    `Gender           : ${registration.gender}`,
    `State / LGA      : ${registration.stateOfOrigin} State / ${registration.lga}`,
    `Religion         : ${registration.religion}`,
    `National NIN     : ${registration.nin}`,
    `Phone / Email    : ${registration.phone} | ${registration.email}`,
    `Home Address     : ${registration.homeAddress}`,
    `Department       : ${registration.department} (${registration.targetClass})`,
    `Exam Diet        : ${registration.examType}`,
    `Verification     : ${registration.status.toUpperCase()}`,
    '------------------------------------------------------------',
    `REGISTERED 9 SUBJECTS (${(registration.subjects || []).length}):`,
    ...(registration.subjects || []).map((s, idx) => `  ${idx + 1}. ${s}`),
    '============================================================'
  ].join('\n');

  zip.file(`${cleanLabel}_WAEC_Slip.txt`, summarySlipText);

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `WAEC_${cleanLabel}_Package.zip`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename
  };
}

export async function importWaecPackageZip(
  file: File
): Promise<{
  success: boolean;
  registrations: WaecRegistration[];
  extractedPhotosCount: number;
  message?: string;
}> {
  const zip = await JSZip.loadAsync(file);

  const manifestFile =
    zip.file('waec_candidates_manifest.json') ||
    Object.values(zip.files).find(f => !f.dir && f.name.endsWith('.json'));

  if (!manifestFile) {
    return {
      success: false,
      registrations: [],
      extractedPhotosCount: 0,
      message: 'No waec_candidates_manifest.json found inside the uploaded ZIP archive.'
    };
  }

  const rawJson = await manifestFile.async('string');
  const parsed = JSON.parse(rawJson);
  const registrations: WaecRegistration[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.registrations)
    ? parsed.registrations
    : [];

  let extractedPhotosCount = 0;
  for (const reg of registrations) {
    if (reg.passportPhoto && reg.passportPhoto.startsWith('data:')) {
      extractedPhotosCount++;
    }
  }

  return {
    success: registrations.length > 0,
    registrations,
    extractedPhotosCount,
    message: registrations.length > 0 ? undefined : 'No candidate records found in manifest.'
  };
}
