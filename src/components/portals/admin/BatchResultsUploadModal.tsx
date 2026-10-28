import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Search, 
  Zap, 
  UserPlus, 
  KeyRound, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight, 
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet,
  Database,
  Sparkles,
  Info,
  Filter,
  Plus,
  Trash2,
  RefreshCw
} from '../../RealIcons';

interface BatchResultsUploadModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onNavigateToVault?: () => void;
}

type TabType = 'download_db' | 'upload' | 'templates' | 'guide';

interface ParsedRowPreview {
  studentIdOrReg: string;
  name: string;
  email: string;
  gradeLevel: string;
  isExisting: boolean;
  matchedStudentName?: string;
  matchedStudentReg?: string;
  subjectsCount: number;
  calculatedAverage: number;
  subjects: Array<{
    subject: string;
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
  }>;
}

const DEFAULT_CORE_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Social Studies'
];

const COMMON_EXTRA_SUBJECTS = [
  'Computer Studies',
  'Biology',
  'Chemistry',
  'Physics',
  'Civic Education',
  'Agricultural Science',
  'Economics',
  'Literature in English',
  'Yoruba Language'
];

export const BatchResultsUploadModal: React.FC<BatchResultsUploadModalProps> = ({
  isOpen,
  onClose,
  onNavigateToVault
}) => {
  if (isOpen === false) return null;
  const { 
    students, 
    assessmentConfig, 
    batchUpsertStudentResults, 
    calculateGrade, 
    classes,
    schoolInfo 
  } = useSchool();

  // Navigation tab (defaults to download_db so teachers can first download their students database)
  const [activeTab, setActiveTab] = useState<TabType>('download_db');

  // Term & Session settings
  const [selectedTerm, setSelectedTerm] = useState<'1st Term' | '2nd Term' | '3rd Term'>(
    (assessmentConfig.activeTerm as any) || '1st Term'
  );
  const [selectedSession, setSelectedSession] = useState<string>(
    assessmentConfig.activeSession || '2026/2027'
  );
  const [defaultGradeFallback, setDefaultGradeFallback] = useState<string>('SSS 1 Science');

  // =========================================================================
  // TAB 1 STATE: DATABASE DOWNLOAD (Pre-filled CSV for Offline Entry)
  // =========================================================================
  const [dbClassFilter, setDbClassFilter] = useState<string>('all');
  const [dbLayoutMode, setDbLayoutMode] = useState<'single_column' | 'split_tests'>('single_column');
  const [dbSelectedSubjects, setDbSelectedSubjects] = useState<string[]>(DEFAULT_CORE_SUBJECTS);
  const [dbCustomSubjectInput, setDbCustomSubjectInput] = useState<string>('');
  const [dbIncludeCurrentScores, setDbIncludeCurrentScores] = useState<boolean>(false);
  const [dbCopiedToClipboard, setDbCopiedToClipboard] = useState<boolean>(false);

  // Filter students for database export
  const exportStudents = useMemo(() => {
    return students.filter(s => {
      if (!s || s.isUpgradedTutor) return false;
      if (dbClassFilter === 'all') return true;
      return s.grade?.toLowerCase().trim() === dbClassFilter.toLowerCase().trim();
    });
  }, [students, dbClassFilter]);

  // CSV escape helper
  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  // Generate downloadable CSV string for enrolled scholars
  const generatedDatabaseCsv = useMemo(() => {
    const lines: string[] = [];

    if (dbLayoutMode === 'single_column') {
      // Format requested: registration_no,full_name,grade_level,Mathematics,English Language,Basic Science,Social Studies,...
      const headers = ['registration_no', 'full_name', 'grade_level', ...dbSelectedSubjects];
      lines.push(headers.map(escapeCsv).join(','));

      exportStudents.forEach(st => {
        const row = [
          st.regNumber || st.id,
          st.name,
          st.grade || 'SSS 1 Science'
        ];

        dbSelectedSubjects.forEach(sub => {
          if (dbIncludeCurrentScores && Array.isArray(st.grades)) {
            const foundGrade = st.grades.find(g => g.subject?.toLowerCase() === sub.toLowerCase());
            if (foundGrade && (foundGrade.ca1 || foundGrade.ca2)) {
              row.push(`${foundGrade.ca1 || 0}/${foundGrade.ca2 || 0}`);
            } else {
              row.push('');
            }
          } else {
            row.push(''); // Blank cell ready for teacher entry
          }
        });

        lines.push(row.map(escapeCsv).join(','));
      });
    } else {
      // Split test columns format: registration_no,full_name,grade_level,Mathematics (Test 1),Mathematics (Test 2),...
      const headers = ['registration_no', 'full_name', 'grade_level'];
      dbSelectedSubjects.forEach(sub => {
        headers.push(`${sub} (Test 1)`);
        headers.push(`${sub} (Test 2)`);
      });
      lines.push(headers.map(escapeCsv).join(','));

      exportStudents.forEach(st => {
        const row = [
          st.regNumber || st.id,
          st.name,
          st.grade || 'SSS 1 Science'
        ];

        dbSelectedSubjects.forEach(sub => {
          if (dbIncludeCurrentScores && Array.isArray(st.grades)) {
            const foundGrade = st.grades.find(g => g.subject?.toLowerCase() === sub.toLowerCase());
            row.push(foundGrade?.ca1 ? String(foundGrade.ca1) : '');
            row.push(foundGrade?.ca2 ? String(foundGrade.ca2) : '');
          } else {
            row.push('');
            row.push('');
          }
        });

        lines.push(row.map(escapeCsv).join(','));
      });
    }

    return lines.join('\n');
  }, [exportStudents, dbLayoutMode, dbSelectedSubjects, dbIncludeCurrentScores]);

  // Download CSV trigger
  const handleDownloadDatabaseCsv = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const classSlug = dbClassFilter === 'all' ? 'All_Classes' : dbClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `stanbax_student_results_template_${classSlug}_${timestamp}.csv`;
    downloadTextFile(generatedDatabaseCsv, filename, 'text/csv;charset=utf-8;');
  };

  // Copy table to clipboard as TSV for immediate paste into Excel or Google Sheets
  const handleCopyDatabaseTable = () => {
    const tsvLines: string[] = [];
    if (dbLayoutMode === 'single_column') {
      const headers = ['registration_no', 'full_name', 'grade_level', ...dbSelectedSubjects];
      tsvLines.push(headers.join('\t'));
      exportStudents.forEach(st => {
        const row = [st.regNumber || st.id, st.name, st.grade || 'SSS 1 Science'];
        dbSelectedSubjects.forEach(sub => {
          if (dbIncludeCurrentScores && Array.isArray(st.grades)) {
            const foundGrade = st.grades.find(g => g.subject?.toLowerCase() === sub.toLowerCase());
            row.push(foundGrade ? `${foundGrade.ca1 || 0}/${foundGrade.ca2 || 0}` : '');
          } else {
            row.push('');
          }
        });
        tsvLines.push(row.join('\t'));
      });
    } else {
      const headers = ['registration_no', 'full_name', 'grade_level'];
      dbSelectedSubjects.forEach(sub => {
        headers.push(`${sub} (Test 1)`);
        headers.push(`${sub} (Test 2)`);
      });
      tsvLines.push(headers.join('\t'));
      exportStudents.forEach(st => {
        const row = [st.regNumber || st.id, st.name, st.grade || 'SSS 1 Science'];
        dbSelectedSubjects.forEach(sub => {
          if (dbIncludeCurrentScores && Array.isArray(st.grades)) {
            const foundGrade = st.grades.find(g => g.subject?.toLowerCase() === sub.toLowerCase());
            row.push(foundGrade?.ca1 ? String(foundGrade.ca1) : '');
            row.push(foundGrade?.ca2 ? String(foundGrade.ca2) : '');
          } else {
            row.push('');
            row.push('');
          }
        });
        tsvLines.push(row.join('\t'));
      });
    }

    navigator.clipboard.writeText(tsvLines.join('\n'));
    setDbCopiedToClipboard(true);
    setTimeout(() => setDbCopiedToClipboard(false), 2500);
  };

  const handleAddCustomSubject = () => {
    const trimmed = dbCustomSubjectInput.trim();
    if (trimmed && !dbSelectedSubjects.includes(trimmed)) {
      setDbSelectedSubjects(prev => [...prev, trimmed]);
      setDbCustomSubjectInput('');
    }
  };

  const handleToggleSubject = (sub: string) => {
    setDbSelectedSubjects(prev => {
      if (prev.includes(sub)) {
        if (prev.length <= 1) return prev; // Keep at least one subject
        return prev.filter(s => s !== sub);
      }
      return [...prev, sub];
    });
  };

  // =========================================================================
  // TAB 2 STATE: UPLOAD & RECONCILIATION
  // =========================================================================
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [uploadAssessmentScope, setUploadAssessmentScope] = useState<'tests_only' | 'full'>('tests_only');
  const [singleScoreBehavior, setSingleScoreBehavior] = useState<'split' | 'ca1' | 'ca2'>('split');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Result / Audit state
  const [auditResult, setAuditResult] = useState<{
    totalProcessed: number;
    updatedCount: number;
    provisionedCount: number;
    message: string;
    auditLogs: Array<{
      name: string;
      regNumber: string;
      status: string;
      subjectsCount: number;
      termAverage: number;
    }>;
  } | null>(null);

  // Sample data presets
  const loadSampleTestsCSV = () => {
    const existingSample = students[0];
    const sampleId = existingSample ? existingSample.regNumber : 'SBS/2026/001';
    const sampleName = existingSample ? existingSample.name : 'Adebayo Oluwaseun';
    
    const sample = `registration_no,full_name,grade_level,Mathematics,English Language,Basic Science,Social Studies
${sampleId},${sampleName},SSS 1 Science,10/10,9/10,10/9,8/9
SBS/2026/NEW01,Chioma Nwachukwu,SSS 1 Science,9/9,10/10,8/9,9/9
SBS/2026/NEW02,Tunde Bakare,SSS 1 Science,8/7,9/8,7/8,8/8`;
    setInputText(sample);
    setFileName('student_results_tests_wide.csv');
    setUploadAssessmentScope('tests_only');
  };

  const loadSampleSplitTestsCSV = () => {
    const existingSample = students[0];
    const sampleId = existingSample ? existingSample.regNumber : 'SBS/2026/001';
    const sampleName = existingSample ? existingSample.name : 'Adebayo Oluwaseun';

    const sample = `registration_no,full_name,grade_level,Mathematics (Test 1),Mathematics (Test 2),English Language (Test 1),English Language (Test 2),Basic Science (Test 1),Basic Science (Test 2),Social Studies (Test 1),Social Studies (Test 2)
${sampleId},${sampleName},SSS 1 Science,10,10,9,10,10,9,8,9
SBS/2026/NEW01,Chioma Nwachukwu,SSS 1 Science,9,9,10,10,8,9,9,9
SBS/2026/NEW02,Tunde Bakare,SSS 1 Science,8,7,9,8,7,8,8,8`;
    setInputText(sample);
    setFileName('student_results_split_tests.csv');
    setUploadAssessmentScope('tests_only');
  };

  const loadSampleJSON = () => {
    const existingSample = students[0];
    const sampleId = existingSample ? existingSample.regNumber : 'SBS/2026/001';
    const sampleName = existingSample ? existingSample.name : 'Adebayo Oluwaseun';

    const sampleObj = [
      {
        student_id: sampleId,
        full_name: sampleName,
        email: `${sampleName.toLowerCase().replace(/\s+/g, '')}@stanbaxschools.edu.ng`,
        grade_level: "SSS 1 Science",
        results: [
          { subject: "Mathematics", ca1: 10, ca2: 10, score: 20 },
          { subject: "English Language", ca1: 9, ca2: 10, score: 19 },
          { subject: "Basic Science", ca1: 10, ca2: 9, score: 19 },
          { subject: "Social Studies", ca1: 8, ca2: 9, score: 17 }
        ]
      },
      {
        student_id: "SBS/2026/NEW03",
        full_name: "Fatima Aliyu",
        email: "fatima.aliyu@example.com",
        grade_level: "SSS 1 Science",
        parent_name: "Alhaji Ibrahim Aliyu",
        parent_phone: "+234 803 111 2233",
        results: [
          { subject: "Mathematics", ca1: 9, ca2: 9, score: 18 },
          { subject: "English Language", ca1: 9, ca2: 8, score: 17 },
          { subject: "Basic Science", ca1: 10, ca2: 10, score: 20 },
          { subject: "Social Studies", ca1: 8, ca2: 9, score: 17 }
        ]
      }
    ];
    setInputText(JSON.stringify(sampleObj, null, 2));
    setFileName('student_results_tests.json');
    setUploadAssessmentScope('tests_only');
  };

  // Parsing engine: parses CSV, TSV, or JSON into standard raw records
  const rawRecords = useMemo(() => {
    const text = inputText.trim();
    if (!text) return [];

    // Try JSON parsing
    if (text.startsWith('[') || text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') return [parsed];
      } catch {}
    }

    // Try Tabular CSV / TSV parsing
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter: comma, tab, or semicolon
    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.includes('\t')) delimiter = '\t';
    else if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';

    const parseLine = (line: string): string[] => {
      if (delimiter === '\t') return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(headerLine).map(h => h.trim().toLowerCase());

    const idIdx = headers.findIndex(h => h.includes('id') || h.includes('reg') || h.includes('matric') || h.includes('no'));
    const nameIdx = headers.findIndex(h => h.includes('name') || h === 'student');
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const gradeIdx = headers.findIndex(h => h.includes('grade') || h.includes('class') || h.includes('level'));
    const parentNameIdx = headers.findIndex(h => h.includes('parent') && h.includes('name'));
    const parentPhoneIdx = headers.findIndex(h => h.includes('parent') && (h.includes('phone') || h.includes('mobile')));

    // Check if narrow format: contains "subject" and "score" headers
    const subjectIdx = headers.findIndex(h => h === 'subject' || h === 'course');
    const scoreIdx = headers.findIndex(h => h === 'score' || h === 'total' || h === 'total_score' || h === 'mark');
    const ca1Idx = headers.findIndex(h => h === 'ca1' || h === 'test1' || h === 'test 1' || h === 'ca_1' || h === '1st test');
    const ca2Idx = headers.findIndex(h => h === 'ca2' || h === 'test2' || h === 'test 2' || h === 'ca_2' || h === '2nd test');
    const ca3Idx = headers.findIndex(h => h === 'ca3' || h === 'test3' || h === 'test 3' || h === 'ca_3');
    const examIdx = headers.findIndex(h => h === 'exam' || h === 'exam_score');

    if (subjectIdx >= 0 && (scoreIdx >= 0 || ca1Idx >= 0 || examIdx >= 0)) {
      // Narrow format (itemized rows grouped by student)
      const studentMap = new Map<string, any>();
      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        if (cols.length === 0 || cols.every(c => !c)) continue;

        const rawId = idIdx >= 0 ? cols[idIdx] : '';
        const rawName = nameIdx >= 0 ? cols[nameIdx] : '';
        const rawEmail = emailIdx >= 0 ? cols[emailIdx] : '';
        const rawGrade = gradeIdx >= 0 ? cols[gradeIdx] : defaultGradeFallback;
        const subName = cols[subjectIdx] || 'General Subject';
        const ca1 = ca1Idx >= 0 ? Number(cols[ca1Idx]) || 0 : 0;
        const ca2 = ca2Idx >= 0 ? Number(cols[ca2Idx]) || 0 : 0;
        const ca3 = ca3Idx >= 0 ? Number(cols[ca3Idx]) || 0 : 0;
        const exam = examIdx >= 0 ? Number(cols[examIdx]) || 0 : (scoreIdx >= 0 && uploadAssessmentScope === 'full' ? Number(cols[scoreIdx]) : 0);
        const total = (ca1 + ca2 + ca3 + exam) || (scoreIdx >= 0 ? Number(cols[scoreIdx]) || 0 : 0);

        const groupKey = (rawId || rawName || rawEmail || `row_${i}`).toLowerCase();
        let studentEntry = studentMap.get(groupKey);
        if (!studentEntry) {
          studentEntry = {
            student_id: rawId,
            full_name: rawName,
            email: rawEmail,
            grade_level: rawGrade,
            parent_name: parentNameIdx >= 0 ? cols[parentNameIdx] : undefined,
            parent_phone: parentPhoneIdx >= 0 ? cols[parentPhoneIdx] : undefined,
            results: []
          };
          studentMap.set(groupKey, studentEntry);
        }
        studentEntry.results.push({
          subject: subName,
          ca1,
          ca2,
          ca3,
          exam,
          score: total
        });
      }
      return Array.from(studentMap.values());
    }

    // Wide format: parse subject columns
    const metadataIndexes = new Set([idIdx, nameIdx, emailIdx, gradeIdx, parentNameIdx, parentPhoneIdx].filter(i => i >= 0));

    // Inspect each column header: check if it represents a split test or a single subject
    interface SubjectColDef {
      index: number;
      subjectName: string;
      testType: 'ca1' | 'ca2' | 'ca3' | 'exam' | 'composite';
    }

    const colDefs: SubjectColDef[] = [];
    headers.forEach((h, idx) => {
      if (!metadataIndexes.has(idx) && h && !['term', 'session', 'gender', 'remark', 'total', 'average'].includes(h)) {
        let testType: SubjectColDef['testType'] = 'composite';
        let cleanName = h;

        if (/\b(test\s*1|ca\s*1|1st\s*test|t1)\b/i.test(h)) {
          testType = 'ca1';
          cleanName = h.replace(/\b(test\s*1|ca\s*1|1st\s*test|t1)\b/gi, '').replace(/[()_[\]-]/g, ' ').trim();
        } else if (/\b(test\s*2|ca\s*2|2nd\s*test|t2)\b/i.test(h)) {
          testType = 'ca2';
          cleanName = h.replace(/\b(test\s*2|ca\s*2|2nd\s*test|t2)\b/gi, '').replace(/[()_[\]-]/g, ' ').trim();
        } else if (/\b(test\s*3|ca\s*3|3rd\s*test|t3)\b/i.test(h)) {
          testType = 'ca3';
          cleanName = h.replace(/\b(test\s*3|ca\s*3|3rd\s*test|t3)\b/gi, '').replace(/[()_[\]-]/g, ' ').trim();
        } else if (/\b(exam|terminal\s*exam)\b/i.test(h)) {
          testType = 'exam';
          cleanName = h.replace(/\b(exam|terminal\s*exam)\b/gi, '').replace(/[()_[\]-]/g, ' ').trim();
        }

        // Canonical subject name formatting
        let formatted = cleanName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
        if (/^math/i.test(cleanName)) formatted = 'Mathematics';
        else if (/^eng/i.test(cleanName)) formatted = 'English Language';
        else if (/^sci/i.test(cleanName) || /basic\s*sci/i.test(cleanName)) formatted = 'Basic Science';
        else if (/^soc/i.test(cleanName) || /social/i.test(cleanName)) formatted = 'Social Studies';
        else if (/^chem/i.test(cleanName)) formatted = 'Chemistry';
        else if (/^phys/i.test(cleanName)) formatted = 'Physics';
        else if (/^bio/i.test(cleanName)) formatted = 'Biology';
        else if (/^comp/i.test(cleanName)) formatted = 'Computer Studies';
        else if (/^civ/i.test(cleanName)) formatted = 'Civic Education';
        else if (/^agric/i.test(cleanName)) formatted = 'Agricultural Science';
        else if (!formatted) formatted = `Subject ${idx + 1}`;

        colDefs.push({ index: idx, subjectName: formatted, testType });
      }
    });

    // Group columns by subject name
    const subjectGroups = new Map<string, SubjectColDef[]>();
    colDefs.forEach(cd => {
      const existing = subjectGroups.get(cd.subjectName) || [];
      existing.push(cd);
      subjectGroups.set(cd.subjectName, existing);
    });

    const parsedList: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const rawId = idIdx >= 0 ? cols[idIdx] : '';
      const rawName = nameIdx >= 0 ? cols[nameIdx] : '';
      const rawEmail = emailIdx >= 0 ? cols[emailIdx] : '';
      const rawGrade = gradeIdx >= 0 && cols[gradeIdx] ? cols[gradeIdx] : defaultGradeFallback;

      const results: any[] = [];

      // Process each subject for this student row
      subjectGroups.forEach((groupCols, subName) => {
        let ca1 = 0;
        let ca2 = 0;
        let ca3 = 0;
        let exam = 0;
        let hasValues = false;

        const ca1Col = groupCols.find(c => c.testType === 'ca1');
        const ca2Col = groupCols.find(c => c.testType === 'ca2');
        const ca3Col = groupCols.find(c => c.testType === 'ca3');
        const examCol = groupCols.find(c => c.testType === 'exam');
        const compositeCol = groupCols.find(c => c.testType === 'composite');

        if (ca1Col || ca2Col) {
          // Explicit split test columns
          if (ca1Col && cols[ca1Col.index] !== undefined && cols[ca1Col.index] !== '') {
            ca1 = Number(cols[ca1Col.index]) || 0;
            hasValues = true;
          }
          if (ca2Col && cols[ca2Col.index] !== undefined && cols[ca2Col.index] !== '') {
            ca2 = Number(cols[ca2Col.index]) || 0;
            hasValues = true;
          }
          if (ca3Col && cols[ca3Col.index] !== undefined && cols[ca3Col.index] !== '') {
            ca3 = Number(cols[ca3Col.index]) || 0;
            hasValues = true;
          }
          if (examCol && cols[examCol.index] !== undefined && cols[examCol.index] !== '') {
            exam = Number(cols[examCol.index]) || 0;
            hasValues = true;
          }
        } else if (compositeCol) {
          // Single subject column (e.g. Mathematics)
          const valStr = cols[compositeCol.index];
          if (valStr !== undefined && valStr !== '') {
            hasValues = true;
            if (valStr.includes('/') || valStr.includes(',') || valStr.includes('+')) {
              // Format: "10/10", "10,10", or "10/10/50"
              const parts = valStr.split(/[/,+]|\s+/).filter(Boolean).map(p => Number(p.trim()) || 0);
              ca1 = parts[0] || 0;
              ca2 = parts[1] || 0;
              if (parts.length >= 3) {
                exam = parts[2] || 0;
              }
            } else {
              // Single number in cell
              const scoreNum = Number(valStr) || 0;
              if (uploadAssessmentScope === 'tests_only') {
                if (singleScoreBehavior === 'split') {
                  ca1 = Math.round(scoreNum / 2);
                  ca2 = Math.floor(scoreNum / 2);
                } else if (singleScoreBehavior === 'ca1') {
                  ca1 = scoreNum;
                  ca2 = 0;
                } else {
                  ca1 = 0;
                  ca2 = scoreNum;
                }
              } else {
                // Full term composite score
                ca1 = Math.round(scoreNum * 0.2);
                ca2 = Math.round(scoreNum * 0.2);
                exam = Math.round(scoreNum * 0.6);
              }
            }
          }
        }

        if (hasValues) {
          const total = ca1 + ca2 + ca3 + exam;
          results.push({ subject: subName, ca1, ca2, ca3, exam, score: total });
        }
      });

      parsedList.push({
        student_id: rawId,
        full_name: rawName,
        email: rawEmail,
        grade_level: rawGrade,
        parent_name: parentNameIdx >= 0 ? cols[parentNameIdx] : undefined,
        parent_phone: parentPhoneIdx >= 0 ? cols[parentPhoneIdx] : undefined,
        results
      });
    }

    return parsedList;
  }, [inputText, defaultGradeFallback, uploadAssessmentScope, singleScoreBehavior]);

  // Preview models matched against active student records
  const previewRows = useMemo<ParsedRowPreview[]>(() => {
    return rawRecords.map(rec => {
      const rawId = (rec.student_id || rec.regNumber || rec.id || '').toString().trim();
      const rawName = (rec.full_name || rec.name || '').toString().trim();
      const rawEmail = (rec.email || '').toString().trim();

      const cleanRegKey = rawId ? rawId.toLowerCase().replace(/\s+/g, '') : '';
      const cleanNameKey = rawName ? rawName.toLowerCase().trim() : '';
      const cleanEmailKey = rawEmail ? rawEmail.toLowerCase().trim() : '';

      // Match against existing students
      const matched = students.find(s => {
        if (!s) return false;
        if (rawId && (s.id === rawId || s.regNumber.toLowerCase() === rawId.toLowerCase())) return true;
        if (cleanRegKey && s.regNumber && s.regNumber.toLowerCase().replace(/\s+/g, '') === cleanRegKey) return true;
        if (cleanEmailKey && s.email && s.email.toLowerCase().trim() === cleanEmailKey) return true;
        if (cleanNameKey && s.name && s.name.toLowerCase().trim() === cleanNameKey) return true;
        return false;
      });

      const parsedSubs = (rec.results || []).map((sub: any) => {
        const ca1 = Number(sub.ca1 || 0);
        const ca2 = Number(sub.ca2 || 0);
        const ca3 = Number(sub.ca3 || 0);
        const exam = Number(sub.exam || 0);
        const total = (ca1 + ca2 + ca3 + exam) || Number(sub.score || 0);
        const calc = calculateGrade(total);
        return {
          subject: sub.subject,
          ca1,
          ca2,
          ca3,
          exam,
          total,
          grade: sub.grade || calc.grade,
          remark: sub.remark || calc.remark
        };
      });

      const avg = parsedSubs.length > 0
        ? Math.round((parsedSubs.reduce((sum: number, s: any) => sum + s.total, 0) / parsedSubs.length) * 10) / 10
        : 0;

      return {
        studentIdOrReg: rawId || (matched ? matched.regNumber : 'To be assigned'),
        name: rawName || (matched ? matched.name : 'Unknown Scholar'),
        email: rawEmail || (matched ? matched.email : ''),
        gradeLevel: rec.grade_level || (matched ? matched.grade : defaultGradeFallback),
        isExisting: Boolean(matched),
        matchedStudentName: matched?.name,
        matchedStudentReg: matched?.regNumber,
        subjectsCount: parsedSubs.length,
        calculatedAverage: avg,
        subjects: parsedSubs
      };
    });
  }, [rawRecords, students, calculateGrade, defaultGradeFallback]);

  const existingCount = previewRows.filter(r => r.isExisting).length;
  const newCount = previewRows.filter(r => !r.isExisting).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteBatchUpsert = async () => {
    if (rawRecords.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await batchUpsertStudentResults(
        rawRecords,
        selectedTerm,
        selectedSession,
        {
          assessmentMode: uploadAssessmentScope
        }
      );

      setAuditResult(result);
    } catch (err: any) {
      alert(`Batch upload failed: ${err?.message || 'Unexpected error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyTemplateToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(label);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const downloadTextFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Pre-built template strings
  const exactRequestedTemplate = `registration_no,full_name,grade_level,Mathematics,English Language,Basic Science,Social Studies
SBS/2026/001,Alex Morgan,SSS 1 Science,10/10,9/10,10/9,8/9
SBS/2026/002,Samira Khan,SSS 1 Science,9/10,10/10,9/9,9/9
SBS/2026/NEW01,Chioma Nwachukwu,SSS 1 Science,8/9,9/8,10/10,8/8
SBS/2026/NEW02,Tunde Bakare,SSS 1 Commercial,7/8,8/8,7/9,8/8`;

  const splitTestsCsvTemplate = `registration_no,full_name,grade_level,Mathematics (Test 1),Mathematics (Test 2),English Language (Test 1),English Language (Test 2),Basic Science (Test 1),Basic Science (Test 2),Social Studies (Test 1),Social Studies (Test 2)
SBS/2026/001,Alex Morgan,SSS 1 Science,10,10,9,10,10,9,8,9
SBS/2026/002,Samira Khan,SSS 1 Science,9,10,10,10,9,9,9,9
SBS/2026/NEW01,Chioma Nwachukwu,SSS 1 Science,8,9,9,8,10,10,8,8`;

  const jsonTemplate = JSON.stringify([
    {
      student_id: "SBS/2026/001",
      full_name: "Alex Morgan",
      email: "alex.morgan@stanbaxschools.edu.ng",
      grade_level: "SSS 1 Science",
      term: "1st Term",
      results: [
        { subject: "Mathematics", ca1: 10, ca2: 10 },
        { subject: "English Language", ca1: 9, ca2: 10 },
        { subject: "Basic Science", ca1: 10, ca2: 9 },
        { subject: "Social Studies", ca1: 8, ca2: 9 }
      ]
    },
    {
      student_id: "SBS/2026/NEW01",
      full_name: "Chioma Nwachukwu",
      email: "chioma.n@example.com",
      grade_level: "SSS 1 Science",
      parent_name: "Chief Chukwuma Nwachukwu",
      parent_phone: "+234 803 456 7890",
      results: [
        { subject: "Mathematics", ca1: 9, ca2: 9 },
        { subject: "English Language", ca1: 10, ca2: 10 },
        { subject: "Basic Science", ca1: 8, ca2: 9 }
      ]
    }
  ], null, 2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in text-slate-900">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Continuous Assessment &amp; Batch Upsert Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
                  1st &amp; 2nd Tests • CSV • Auto-Provisioning
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-amber-400 shrink-0" />
                <span>Student Results Database Download &amp; Batch Upload</span>
              </h2>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                Download enrolled scholars in your requested tabulated format, enter continuous assessment test scores in Excel or Google Sheets, and upload back. The engine automatically matches existing students, preserves terminal exams, and auto-provisions new accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('download_db')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'download_db'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>1. Download Students CSV</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'download_db' ? 'bg-blue-950 text-white' : 'bg-amber-400 text-blue-950'
              }`}>
                {exportStudents.length} Scholars
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>2. Upload &amp; Sync Results</span>
              {previewRows.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'upload' ? 'bg-blue-950 text-white' : 'bg-amber-400 text-blue-950'
                }`}>
                  {previewRows.length} Parsed
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>3. Sample Formats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>4. Step-by-Step Guide</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* =============================================================== */}
          {/* TAB 1: DOWNLOAD STUDENTS DATABASE AS CSV */}
          {/* =============================================================== */}
          {activeTab === 'download_db' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-900" />
                      <span>Export Enrolled Scholars for 1st &amp; 2nd Tests Entry</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Download the live student roster pre-filled with registration numbers and names. Open in Excel, enter scores, and upload back.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadDatabaseCsv}
                      className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2 active:scale-98"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Download CSV File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyDatabaseTable}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      {dbCopiedToClipboard ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
                      <span>{dbCopiedToClipboard ? 'Copied to Clipboard!' : 'Copy Table'}</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Format Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Class / Department</label>
                    <select
                      value={dbClassFilter}
                      onChange={e => setDbClassFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="all">All Enrolled Classes ({students.length} scholars)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Test Layout Structure</label>
                    <select
                      value={dbLayoutMode}
                      onChange={e => setDbLayoutMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="single_column">Single Subject Column (Format: Test1/Test2)</option>
                      <option value="split_tests">Separate Test Columns (Test 1, Test 2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pre-Fill Existing Test Data</label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dbIncludeCurrentScores}
                        onChange={e => setDbIncludeCurrentScores(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-700 font-medium">Pre-fill current scores if recorded</span>
                    </label>
                  </div>
                </div>

                {/* Subject Selector Checklist */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Subject Columns Included in CSV ({dbSelectedSubjects.length} subjects):
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setDbSelectedSubjects(DEFAULT_CORE_SUBJECTS)}
                        className="text-blue-700 hover:underline cursor-pointer font-bold"
                      >
                        Reset to 4 Core
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setDbSelectedSubjects(Array.from(new Set([...DEFAULT_CORE_SUBJECTS, ...COMMON_EXTRA_SUBJECTS])))}
                        className="text-blue-700 hover:underline cursor-pointer font-bold"
                      >
                        Add All Common
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...DEFAULT_CORE_SUBJECTS, ...COMMON_EXTRA_SUBJECTS, ...dbSelectedSubjects])).map(sub => {
                      const isSelected = dbSelectedSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleToggleSubject(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                          <span>{sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Subject field */}
                  <div className="flex items-center gap-2 max-w-sm pt-2">
                    <input
                      type="text"
                      placeholder="Add custom subject name..."
                      value={dbCustomSubjectInput}
                      onChange={e => setDbCustomSubjectInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSubject(); } }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSubject}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* CSV Format Preview Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>How to Enter Scores in This CSV:</span>
                  </div>
                  {dbLayoutMode === 'single_column' ? (
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Columns generated: <code className="font-mono font-bold bg-amber-100/80 px-1.5 py-0.5 rounded">registration_no,full_name,grade_level,{dbSelectedSubjects.slice(0, 4).join(',')}</code>.
                      In each subject cell, enter scores separated by a slash (e.g. <span className="font-mono font-bold">10/10</span> for Test 1 = 10, Test 2 = 10), comma (<span className="font-mono font-bold">10, 10</span>), or a single test mark.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Columns generated: <code className="font-mono font-bold bg-amber-100/80 px-1.5 py-0.5 rounded">Mathematics (Test 1), Mathematics (Test 2), ...</code>
                      In Excel, enter standard integer marks directly into each individual test column.
                    </p>
                  )}
                </div>
              </div>

              {/* Live Preview Table of Exported Data */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Live Database Preview ({exportStudents.length} Scholars Selected)
                    </h4>
                    <p className="text-xs text-slate-500">
                      This is the tabulated structure that will be downloaded into your CSV file.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Upload Tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Registration No</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Class / Grade</th>
                        {dbLayoutMode === 'single_column' ? (
                          dbSelectedSubjects.map(sub => (
                            <th key={sub} className="py-2.5 px-3 text-blue-900">{sub}</th>
                          ))
                        ) : (
                          dbSelectedSubjects.map(sub => (
                            <React.Fragment key={sub}>
                              <th className="py-2.5 px-3 text-blue-900">{sub} (T1)</th>
                              <th className="py-2.5 px-3 text-indigo-900">{sub} (T2)</th>
                            </React.Fragment>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {exportStudents.slice(0, 10).map((st, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-bold text-slate-800">{st.regNumber}</td>
                          <td className="py-2 px-3 font-sans font-bold text-slate-900">{st.name}</td>
                          <td className="py-2 px-3 font-sans text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                              {st.grade}
                            </span>
                          </td>
                          {dbLayoutMode === 'single_column' ? (
                            dbSelectedSubjects.map(sub => (
                              <td key={sub} className="py-2 px-3 text-slate-400 italic">
                                [Ready for Test 1 / Test 2]
                              </td>
                            ))
                          ) : (
                            dbSelectedSubjects.map(sub => (
                              <React.Fragment key={sub}>
                                <td className="py-2 px-3 text-slate-400 italic">[T1]</td>
                                <td className="py-2 px-3 text-slate-400 italic">[T2]</td>
                              </React.Fragment>
                            ))
                          )}
                        </tr>
                      ))}
                      {exportStudents.length === 0 && (
                        <tr>
                          <td colSpan={3 + dbSelectedSubjects.length} className="text-center py-6 text-slate-400 italic">
                            No scholars found in selected class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {exportStudents.length > 10 && (
                  <p className="text-xs text-slate-500 text-center italic">
                    Showing first 10 of {exportStudents.length} scholars. All scholars will be included in the exported CSV.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: UPLOAD & SYNC RESULTS */}
          {/* =============================================================== */}
          {activeTab === 'upload' && !auditResult && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Target Term & Assessment Scope Banner */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Academic Term</label>
                    <select
                      value={selectedTerm}
                      onChange={e => setSelectedTerm(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="1st Term">1st Term (First Semester)</option>
                      <option value="2nd Term">2nd Term (Second Semester)</option>
                      <option value="3rd Term">3rd Term (Promotional Final)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={selectedSession}
                      onChange={e => setSelectedSession(e.target.value)}
                      placeholder="e.g. 2026/2027"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Ingestion Scope</label>
                    <select
                      value={uploadAssessmentScope}
                      onChange={e => setUploadAssessmentScope(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-400 text-xs font-bold bg-blue-50/60 text-blue-950 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="tests_only">1st &amp; 2nd Tests Only (CA1 + CA2)</option>
                      <option value="full">Full Composite (Tests + Terminal Exam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fallback Class for New Scholars</label>
                    <select
                      value={defaultGradeFallback}
                      onChange={e => setDefaultGradeFallback(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      <option value="SSS 1 Science">SSS 1 Science</option>
                      <option value="SSS 1 Commercial">SSS 1 Commercial</option>
                      <option value="SSS 1 Arts">SSS 1 Arts</option>
                    </select>
                  </div>
                </div>

                {/* Scope Notice */}
                {uploadAssessmentScope === 'tests_only' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong>Tests-Only Mode Active:</strong> Only 1st Test (CA1) and 2nd Test (CA2) will be updated. Existing terminal exams and CA3 are preserved without loss.
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-slate-600">Single cell score:</span>
                      <select
                        value={singleScoreBehavior}
                        onChange={e => setSingleScoreBehavior(e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-emerald-300 text-xs font-bold bg-white text-slate-800"
                      >
                        <option value="split">Split evenly (e.g. 18 to 9 and 9)</option>
                        <option value="ca1">Record into 1st Test (CA1)</option>
                        <option value="ca2">Record into 2nd Test (CA2)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Dropzone or Raw Paste Area */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('file')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        inputMode === 'file' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      File Upload (.csv, .json, .tsv)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        inputMode === 'paste' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Paste Spreadsheet / Text Data
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadSampleTestsCSV}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sample 1st &amp; 2nd Tests CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={loadSampleSplitTestsCSV}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sample Split Tests</span>
                    </button>
                    <button
                      type="button"
                      onClick={loadSampleJSON}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Sample JSON</span>
                    </button>
                  </div>
                </div>

                {inputMode === 'file' ? (
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition group relative">
                    <input
                      type="file"
                      accept=".csv,.tsv,.json,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-3 pointer-events-none">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center group-hover:scale-110 transition">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {fileName ? `Selected File: ${fileName}` : 'Drag & drop your results spreadsheet file here, or click to browse'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supports CSV, TSV, JSON, and Tabulated Text files (UTF-8, up to 10MB)
                        </p>
                      </div>
                      {fileName && (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                          File Loaded Successfully ({rawRecords.length} student records parsed)
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={7}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Paste your CSV, tab-separated columns from Excel/Google Sheets, or JSON array here..."
                      className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-mono bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Tip: You can copy directly from Excel or Google Sheets and paste here.</span>
                      {inputText && (
                        <button
                          type="button"
                          onClick={() => { setInputText(''); setFileName(''); }}
                          className="text-rose-600 hover:underline cursor-pointer font-bold"
                        >
                          Clear Text
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Upload Match & Preview Table */}
              {previewRows.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        <span>Pre-Upload Reconciliation Preview</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review the automatic student matching and provisioning outcomes before executing the upsert.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{existingCount} Existing Updated</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                        <span>{newCount} New Accounts Provisioned</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/80 text-slate-700 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Action &amp; Status</th>
                          <th className="py-3 px-4">Scholar Name</th>
                          <th className="py-3 px-4">Student ID / Reg No</th>
                          <th className="py-3 px-4">Class</th>
                          <th className="py-3 px-4">Parsed Test Scores</th>
                          <th className="py-3 px-4">Average</th>
                          <th className="py-3 px-4">Vault Credentials</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4">
                              {row.isExisting ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Update Existing</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-black">
                                  <UserPlus className="w-3 h-3 text-purple-600" />
                                  <span>Auto-Provision</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {row.name}
                              {row.matchedStudentName && row.matchedStudentName !== row.name && (
                                <span className="block text-[10px] text-slate-500 font-normal">
                                  Matched: {row.matchedStudentName}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                              {row.studentIdOrReg}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                                {row.gradeLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-sm">
                                {row.subjects.map((s, sIdx) => (
                                  <span key={sIdx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                                    {s.subject}: T1={s.ca1}, T2={s.ca2} (Tot: {s.total})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-lg text-[11px] font-black ${
                                row.calculatedAverage >= 70 ? 'bg-emerald-100 text-emerald-900' :
                                row.calculatedAverage >= 50 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                              }`}>
                                {row.calculatedAverage}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              {row.isExisting ? (
                                <span className="text-slate-500">Preserved in Vault</span>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="text-purple-900 font-bold flex items-center gap-1">
                                    <KeyRound className="w-3 h-3 text-purple-600" />
                                    <span>Pass: stanbax2025</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">Created upon upsert</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Execution Bar */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div className="text-xs text-slate-600">
                      Target Term: <strong>{selectedTerm}</strong> • Session: <strong>{selectedSession}</strong> • Scope: <strong>{uploadAssessmentScope === 'tests_only' ? '1st & 2nd Tests Only' : 'Full Composite'}</strong>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleExecuteBatchUpsert}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-indigo-950 text-white font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>{isProcessing ? 'Processing Upsert & Provisioning...' : `Execute Batch Upsert (${previewRows.length} Scholars)`}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =============================================================== */}
          {/* AUDIT SUMMARY REPORT (After Execution) */}
          {/* =============================================================== */}
          {auditResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Batch Upsert &amp; Account Provisioning Complete</h3>
                    <p className="text-xs text-slate-500">{auditResult.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-2xl font-black text-slate-900">{auditResult.totalProcessed}</span>
                    <span className="text-xs font-bold text-slate-500">Total Scholars Processed</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="block text-2xl font-black text-emerald-800">{auditResult.updatedCount}</span>
                    <span className="text-xs font-bold text-emerald-700">Existing Records Updated</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                    <span className="block text-2xl font-black text-purple-800">{auditResult.provisionedCount}</span>
                    <span className="text-xs font-bold text-purple-700">New Accounts Provisioned</span>
                  </div>
                </div>

                {auditResult.provisionedCount > 0 && (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-600" />
                      <span>
                        <strong>{auditResult.provisionedCount} new student login accounts</strong> have been registered in the Credentials Vault with default passcode <span className="font-mono font-bold">stanbax2025</span>.
                      </span>
                    </div>
                    {onNavigateToVault && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToVault();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-900 text-white font-bold text-xs hover:bg-purple-950 cursor-pointer shadow-xs"
                      >
                        Open Credentials Vault
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Transaction Logs Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-900">Transaction Audit Log</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setAuditResult(null);
                      setInputText('');
                      setFileName('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Upload Another File
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Scholar Name</th>
                        <th className="py-2.5 px-3">Registration Number</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Subjects Recorded</th>
                        <th className="py-2.5 px-3">Calculated Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditResult.auditLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{log.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{log.regNumber}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status.includes('Provisioned')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{log.subjectsCount} subjects</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{log.termAverage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: SAMPLE TEMPLATES & FORMATS */}
          {/* =============================================================== */}
          {activeTab === 'templates' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Requested Tabulated Results Template (1st &amp; 2nd Tests)
                    </h3>
                    <p className="text-xs text-slate-500">
                      This is the exact layout you requested: <code className="font-mono font-bold text-blue-900">registration_no,full_name,grade_level,Mathematics,English Language,Basic Science,Social Studies</code>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyTemplateToClipboard(exactRequestedTemplate, 'exact')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedTemplate === 'exact' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTemplate === 'exact' ? 'Copied!' : 'Copy Template'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(exactRequestedTemplate);
                        setFileName('student_results_exact_tests.csv');
                        setUploadAssessmentScope('tests_only');
                        setActiveTab('upload');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load into Uploader</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{exactRequestedTemplate}</pre>
                </div>
              </div>

              {/* Split test columns template */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Alternative: Separate Test Columns in Excel / Google Sheets
                    </h3>
                    <p className="text-xs text-slate-500">
                      Columns are split into <code className="font-mono text-blue-900">Mathematics (Test 1)</code> and <code className="font-mono text-blue-900">Mathematics (Test 2)</code> for entering standard integers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyTemplateToClipboard(splitTestsCsvTemplate, 'split')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedTemplate === 'split' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTemplate === 'split' ? 'Copied!' : 'Copy Template'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(splitTestsCsvTemplate);
                        setFileName('student_results_split_tests.csv');
                        setUploadAssessmentScope('tests_only');
                        setActiveTab('upload');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load into Uploader</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{splitTestsCsvTemplate}</pre>
                </div>
              </div>

              {/* JSON Template */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Structured JSON Array Format</h3>
                    <p className="text-xs text-slate-500">For scripts, automated database pipelines, or integration webhooks.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTemplateToClipboard(jsonTemplate, 'json')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTemplate === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTemplate === 'json' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  <pre>{jsonTemplate}</pre>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: STEP-BY-STEP SCORING GUIDE */}
          {/* =============================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-950 font-black text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Step-by-Step Round-Trip Results Workflow</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Follow this 4-step workflow to export your students, grade them offline, and sync everything back effortlessly:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">Download Students CSV</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Go to the <strong>Download Students CSV</strong> tab. Choose your class and desired subjects (<span className="font-mono">registration_no,full_name,grade_level,Mathematics,English Language,...</span>) and click <strong>Download CSV File</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">Enter Scores in Excel</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Open the downloaded file in Excel, Google Sheets, or Numbers. Enter continuous assessment marks: type <span className="font-mono font-bold">10/10</span> for Test 1 &amp; Test 2, or type separate numbers into the Test 1 and Test 2 columns.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">Upload &amp; Reconcile</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Return to the <strong>Upload &amp; Sync</strong> tab. Drag and drop your completed CSV file. The preview table instantly tags every scholar as <span className="text-emerald-700 font-bold">Update Existing</span> or <span className="text-purple-700 font-bold">Auto-Provision</span>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-xs">
                      4
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">Sync with Confidence</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Click <strong>Execute Batch Upsert</strong>. Existing terminal exams and CA3 are preserved. Any unregistered names are auto-provisioned with fresh student accounts and saved to the Credentials Vault!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Info className="w-4 h-4 text-blue-700" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <p>
                      <strong>Q: Will uploading only 1st and 2nd tests wipe out existing terminal exams?</strong><br />
                      A: No! In "1st &amp; 2nd Tests Only" mode, existing exams and CA3 are preserved completely. The system only updates the CA1 and CA2 continuous assessment marks.
                    </p>
                    <p>
                      <strong>Q: What if I have a new student whose name wasn't in the downloaded CSV?</strong><br />
                      A: Simply add a new row to your Excel spreadsheet! Write their full name, class, and test scores. When you upload, the system automatically registers their account, assigns a registration number, and creates their login password.
                    </p>
                    <p>
                      <strong>Q: Can I copy and paste directly from Excel instead of saving a file?</strong><br />
                      A: Yes! On the Upload tab, switch from "File Upload" to "Paste Spreadsheet / Text Data", select the cells in Excel, copy (Ctrl+C), and paste directly into the box.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 md:px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Enrolled Scholars in Database: <strong className="text-slate-900">{students.length}</strong> • Active Session: <strong className="text-slate-900">{schoolInfo.activeSession || selectedSession}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
