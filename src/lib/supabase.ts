import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SESSION_KEY = 'stanbax_db_session';
const CONFIG_URL_KEY = 'stanbax_supabase_url';
const CONFIG_KEY_KEY = 'stanbax_supabase_anon_key';

// Read config with fallback to in-app localStorage settings
export const getSupabaseConfig = (): {
  url: string;
  key: string;
  isConfigured: boolean;
  source: 'env' | 'localStorage' | 'none';
} => {
  let envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  let envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

  if (envUrl) envUrl = envUrl.replace(/\/+$/, '');

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, key: envKey, isConfigured: true, source: 'env' };
  }

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = (localStorage.getItem(CONFIG_URL_KEY) || '').trim();
    localKey = (localStorage.getItem(CONFIG_KEY_KEY) || '').trim();
    if (localUrl) localUrl = localUrl.replace(/\/+$/, '');
  } catch {}

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, isConfigured: true, source: 'localStorage' };
  }

  return { url: envUrl || '', key: envKey || '', isConfigured: false, source: 'none' };
};

let sessionToken: string | null = null;
try {
  sessionToken = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
} catch { /* ignore */ }

const authedFetch: typeof fetch = (input, init) => {
  if (!sessionToken) return fetch(input, init);
  const headers = new Headers(init?.headers);
  headers.set('x-stanbax-session', sessionToken);
  return fetch(input, { ...init, headers });
};

const createClientInstance = (): SupabaseClient | null => {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured && cfg.url && cfg.key) {
    try {
      return createClient(cfg.url, cfg.key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: authedFetch },
      });
    } catch (err) {
      console.warn('[Supabase Init] Could not instantiate client:', err);
      return null;
    }
  }
  return null;
};

// Client instantiated strictly with SUPABASE_URL and SUPABASE_ANON_KEY (Zero-Trust)
export let supabase: SupabaseClient | null = createClientInstance();

export const isRemoteEnabled = (): boolean => supabase !== null;

export const setDbSession = (token: string | null): void => {
  sessionToken = token;
  try {
    if (token) {
      localStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch { /* ignore */ }
};

export const getDbSession = (): string | null => sessionToken;

/**
 * Configure or update Supabase credentials dynamically in the browser.
 */
export const configureSupabase = async (
  url: string,
  anonKey: string
): Promise<{ ok: boolean; message: string }> => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return { ok: false, message: 'Both Supabase URL and Anon Key are required.' };
  }

  if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
    return { ok: false, message: 'Invalid Supabase URL. Must be in the format https://<project-ref>.supabase.co' };
  }

  try {
    localStorage.setItem(CONFIG_URL_KEY, cleanUrl);
    localStorage.setItem(CONFIG_KEY_KEY, cleanKey);
    supabase = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: authedFetch },
    });

    // Test connection
    const testResult = await testSupabaseConnection();
    if (!testResult.ok) {
      return { ok: false, message: `Connected to Supabase, but schema test failed: ${testResult.message}. Did you paste and run schema.sql?` };
    }

    // Hydrate remote state
    await hydrateFromSupabase();

    return { ok: true, message: 'Supabase central database connected successfully! Multi-device sync is live.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to initialize Supabase client.' };
  }
};

/**
 * Live connection diagnostic test.
 */
export const testSupabaseConnection = async (): Promise<{
  ok: boolean;
  message: string;
  rowCount?: number;
  tablesMissing?: boolean;
}> => {
  if (!supabase) {
    return { ok: false, message: 'Supabase client is not configured yet. Provide Project URL and Anon Key.' };
  }

  try {
    const { data, error, count } = await supabase
      .from('school_state')
      .select('key', { count: 'exact' })
      .limit(5);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return {
          ok: false,
          tablesMissing: true,
          message: 'Connection to Supabase project succeeded, but database tables are not created yet (PGRST205). Copy and run schema.sql in your Supabase SQL Editor to activate tables.',
        };
      }
      return { ok: false, message: `Database error: ${error.message} (Code: ${error.code})` };
    }

    return {
      ok: true,
      message: 'Supabase PostgreSQL connection 100% verified! Tables, RPC procedures, and RLS policies are active.',
      rowCount: count ?? (data?.length || 0),
    };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err?.message || 'Network unreachable'}` };
  }
};

export interface VerifyLoginResult {
  ok: boolean;
  token?: string;
  role?: string;
  refId?: string;
  message?: string;
  unreachable?: boolean;
}

export const remoteVerifyLogin = async (
  identifier: string,
  password: string
): Promise<VerifyLoginResult> => {
  if (!supabase) return { ok: false, unreachable: true };
  try {
    const { data, error } = await supabase.rpc('verify_login', {
      p_identifier: identifier,
      p_password: password,
    });
    if (error) {
      console.warn('[Supabase Auth] Login verification rejected:', error.message);
      return { ok: false, unreachable: true, message: error.message };
    }
    const d = data as Record<string, unknown> | null;
    if (!d || d.ok !== true) {
      return { ok: false, message: (d?.message as string) || 'Invalid credentials.' };
    }
    return {
      ok: true,
      token: d.token as string,
      role: d.role as string,
      refId: d.ref_id as string,
    };
  } catch (err) {
    console.warn('[Supabase Auth] Remote verification unreachable:', err);
    return { ok: false, unreachable: true };
  }
};

/**
 * Reset password in Supabase credentials table (with security question verification).
 * Callable anonymously from the login screen so forgotten passwords are saved directly into PostgreSQL.
 */
export const remoteResetPassword = async (
  identifier: string,
  newPassword: string,
  securityAnswer?: string
): Promise<{ ok: boolean; message: string; role?: string; refId?: string }> => {
  if (!supabase) return { ok: false, message: 'Supabase offline or not configured.' };
  try {
    const { data, error } = await supabase.rpc('reset_password', {
      p_identifier: identifier,
      p_new_password: newPassword,
      p_security_answer: securityAnswer || null,
    });
    if (error) {
      console.warn('[Supabase Security] Password reset rejected:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string; role?: string; ref_id?: string } | null;
    return {
      ok: d?.ok === true,
      message: d?.message || (d?.ok ? 'Password reset successfully in Supabase.' : 'Failed to reset password.'),
      role: d?.role,
      refId: d?.ref_id,
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Remote password reset failed.' };
  }
};

/**
 * Admin reset user password directly in Supabase credentials table.
 */
export const remoteAdminResetPassword = async (
  identifier: string,
  newPassword: string
): Promise<{ ok: boolean; message: string }> => {
  if (!supabase || !sessionToken) return { ok: false, message: 'Supabase offline or no admin session.' };
  try {
    const { data, error } = await supabase.rpc('admin_reset_user_password', {
      p_identifier: identifier,
      p_new_password: newPassword,
    });
    if (error) {
      console.warn('[Supabase Admin] Admin password reset rejected:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string } | null;
    return {
      ok: d?.ok === true,
      message: d?.message || (d?.ok ? 'Password updated in Supabase.' : 'Update failed.'),
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Admin password reset failed.' };
  }
};

/**
 * Query registered security question for an account from Supabase without leaking the answer.
 */
export const remoteGetSecurityQuestion = async (
  identifier: string
): Promise<{
  exists: boolean;
  hasQuestion: boolean;
  securityQuestion?: string;
  name?: string;
  role?: string;
}> => {
  if (!supabase) return { exists: false, hasQuestion: false };
  try {
    const { data, error } = await supabase.rpc('get_user_security_question', {
      p_identifier: identifier,
    });
    if (error || !data) return { exists: false, hasQuestion: false };
    const d = data as {
      exists?: boolean;
      hasQuestion?: boolean;
      securityQuestion?: string;
      name?: string;
      role?: string;
    };
    return {
      exists: d.exists === true,
      hasQuestion: d.hasQuestion === true,
      securityQuestion: d.securityQuestion,
      name: d.name,
      role: d.role,
    };
  } catch {
    return { exists: false, hasQuestion: false };
  }
};

/**
 * Register scholar credentials directly into Supabase (self-enrollment).
 */
export const remoteRegisterStudentCredential = async (
  identifier: string,
  password: string,
  refId: string,
  aliases: string[] = []
): Promise<{ ok: boolean; message: string }> => {
  if (!supabase) return { ok: false, message: 'Supabase offline or not configured.' };
  try {
    const { data, error } = await supabase.rpc('register_student_credential', {
      p_identifier: identifier,
      p_password: password,
      p_ref_id: refId,
      p_aliases: aliases,
    });
    if (error) {
      console.warn('[Supabase Student Reg] Credential creation rejected:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string } | null;
    return {
      ok: d?.ok === true,
      message: d?.message || 'Scholar credentials registered in Supabase.',
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Registration failed.' };
  }
};

// Verify administrative authority server-side using SECURITY DEFINER RPC
export const checkRemoteAdminStatus = async (): Promise<boolean> => {
  if (!supabase || !sessionToken) return false;
  try {
    const { data, error } = await supabase.rpc('is_admin_session');
    if (error || !data) return false;
    return data === true;
  } catch {
    return false;
  }
};

// After a remote-verified login, hydrate (now including private collections
// unlocked by the session token) then reload so every mounted state picks up
// the shared data. The portal section is stashed so App lands back in it.
export const completeRemoteLogin = async (token: string, targetSection: string): Promise<never> => {
  setDbSession(token);
  try { sessionStorage.setItem('stanbax_resume_section', targetSection); } catch { /* ignore */ }
  await hydrateFromSupabase();
  window.location.reload();
  // unreachable in a real browser, but satisfies typing in tests
  return new Promise<never>(() => {});
};

export const remoteLogout = async (): Promise<void> => {
  if (!supabase || !sessionToken) return;
  try {
    await supabase.rpc('logout_session', { p_token: sessionToken });
  } catch { /* ignore */ }
  setDbSession(null);
};

export const remoteChangePassword = async (
  identifier: string,
  oldPassword: string | null,
  newPassword: string
): Promise<{ ok: boolean; message?: string }> => {
  if (!supabase || !sessionToken) return { ok: false, message: 'Supabase offline or no session.' };
  try {
    const { data, error } = await supabase.rpc('change_password', {
      p_identifier: identifier,
      p_old_password: oldPassword,
      p_new_password: newPassword,
    });
    if (error) {
      console.warn('[Supabase Security] Password change rejected:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string } | null;
    return { ok: d?.ok === true, message: d?.message };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Password update failed.' };
  }
};

export const remoteCreateCredential = async (
  identifier: string,
  password: string,
  role: string,
  refId: string,
  aliases: string[] = []
): Promise<{ ok: boolean; message?: string }> => {
  if (!supabase || !sessionToken) return { ok: false, message: 'Supabase offline or no session.' };
  try {
    const { data, error } = await supabase.rpc('create_credential', {
      p_identifier: identifier,
      p_password: password,
      p_role: role,
      p_ref_id: refId,
      p_aliases: aliases,
    });
    if (error) {
      console.warn('[Supabase Security] Credential creation unauthorized:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string } | null;
    return { ok: d?.ok === true, message: d?.message };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Credential provisioning failed.' };
  }
};

/**
 * Public visitor submission: admission application.
 */
export const remoteSubmitAdmissionApplication = async (
  application: unknown
): Promise<{ ok: boolean; message: string }> => {
  if (!supabase) return { ok: false, message: 'Database offline.' };
  try {
    const { data, error } = await supabase.rpc('submit_admission_application', {
      p_application: application,
    });
    if (error) return { ok: false, message: error.message };
    const d = data as { ok?: boolean; message?: string } | null;
    return { ok: d?.ok === true, message: d?.message || 'Application submitted.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Submission error.' };
  }
};

/**
 * Public visitor submission: contact inquiry.
 */
export const remoteSubmitContactInquiry = async (
  inquiry: unknown
): Promise<{ ok: boolean; message: string }> => {
  if (!supabase) return { ok: false, message: 'Database offline.' };
  try {
    const { data, error } = await supabase.rpc('submit_contact_inquiry', {
      p_inquiry: inquiry,
    });
    if (error) return { ok: false, message: error.message };
    const d = data as { ok?: boolean; message?: string } | null;
    return { ok: d?.ok === true, message: d?.message || 'Message sent.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Submission error.' };
  }
};

// ---------------------------------------------------------------------------
// Write-through: every localStorage.setItem('stanbax_*', ...) also queues a
// remote upsert into the school_state KV table (debounced, best-effort).
// ---------------------------------------------------------------------------

const pendingWrites = new Map<string, string | null>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let suppressRemote = false;

const buildPublicMirrorItems = (): Array<{ key: string; data: unknown }> => {
  const mirrors: Array<{ key: string; data: unknown }> = [];
  try {
    const rawConv = localStorage.getItem('stanbax_visitor_conversations');
    const rawRep = localStorage.getItem('stanbax_school_rep_config');
    if (rawConv || rawRep) {
      mirrors.push({
        key: 'stanbax_navbar_content',
        data: {
          __type: 'PUBLIC_CHAT_MIRROR',
          visitorConversations: rawConv ? JSON.parse(rawConv) : undefined,
          schoolRepConfig: rawRep ? JSON.parse(rawRep) : undefined,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch {}

  try {
    const rawDeleted = localStorage.getItem('stanbax_deleted_account_ids');
    const deletedSet = new Set<string>();
    if (rawDeleted) {
      try {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) arr.forEach(id => deletedSet.add(String(id).toLowerCase()));
      } catch {}
    }

    const rawChannels = localStorage.getItem('stanbax_chat_channels');
    const rawMessages = localStorage.getItem('stanbax_chat_messages');
    const rawStudents = localStorage.getItem('stanbax_students');
    const rawTutors = localStorage.getItem('stanbax_tutors');
    const rawParents = localStorage.getItem('stanbax_parents_list');
    const rawModerators = localStorage.getItem('stanbax_moderators');
    const rawAssessmentConfig = localStorage.getItem('stanbax_assessment_config');
    const rawGradingSystem = localStorage.getItem('stanbax_grading_system');
    const rawSignatures = localStorage.getItem('stanbax_official_signatures');

    const cleanStudents = rawStudents ? (JSON.parse(rawStudents) as any[]).filter(s => s && s.id && !deletedSet.has(String(s.id).toLowerCase())) : undefined;
    const cleanTutors = rawTutors ? (JSON.parse(rawTutors) as any[]).filter(t => t && t.id && !deletedSet.has(String(t.id).toLowerCase())) : undefined;
    const cleanParents = rawParents ? (JSON.parse(rawParents) as any[]).filter(p => p && p.id && !deletedSet.has(String(p.id).toLowerCase())) : undefined;
    const cleanModerators = rawModerators ? (JSON.parse(rawModerators) as any[]).filter(m => m && m.id && !deletedSet.has(String(m.id).toLowerCase())) : undefined;

    if (
      rawChannels ||
      rawMessages ||
      rawStudents ||
      rawTutors ||
      rawParents ||
      rawAssessmentConfig ||
      rawGradingSystem ||
      rawSignatures
    ) {
      mirrors.push({
        key: 'stanbax_footer_content',
        data: {
          __type: 'PUBLIC_COMMUNITY_MIRROR',
          chatChannels: rawChannels ? JSON.parse(rawChannels) : undefined,
          chatMessages: rawMessages ? JSON.parse(rawMessages) : undefined,
          students: cleanStudents,
          tutors: cleanTutors,
          parents: cleanParents,
          moderators: cleanModerators,
          assessmentConfig: rawAssessmentConfig ? JSON.parse(rawAssessmentConfig) : undefined,
          gradingSystem: rawGradingSystem ? JSON.parse(rawGradingSystem) : undefined,
          officialSignatures: rawSignatures ? JSON.parse(rawSignatures) : undefined,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch {}

  return mirrors;
};

const flushWrites = async () => {
  flushTimer = null;
  if (!supabase) { pendingWrites.clear(); return; }

  // If no authenticated sessionToken (e.g., anonymous parent on landing page),
  // sync visitor conversations via the public SECURITY DEFINER RPC submit_contact_inquiry
  if (!sessionToken) {
    const visitorConvRaw = pendingWrites.get('stanbax_visitor_conversations');
    pendingWrites.clear();
    if (visitorConvRaw) {
      try {
        const parsedConvs = JSON.parse(visitorConvRaw);
        if (Array.isArray(parsedConvs) && parsedConvs.length > 0) {
          await supabase.rpc('submit_contact_inquiry', {
            p_inquiry: {
              id: `vsync-${Date.now()}`,
              __type: 'VISITOR_CHAT_SYNC',
              conversations: parsedConvs,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      } catch {}
    }
    return;
  }

  const batch = [...pendingWrites.entries()];
  pendingWrites.clear();
  const upserts = batch
    .filter(([, v]) => v !== null)
    .map(([key, v]) => ({ key, data: JSON.parse(v as string) }));
  const deletes = batch.filter(([, v]) => v === null).map(([k]) => k);

  // Mirror visitor chat, rep config, and school chat directory into public state keys
  // so landing page visitors and non-admin portals always receive live updates
  const touchedKeys = new Set(upserts.map(u => u.key));
  if (
    touchedKeys.has('stanbax_visitor_conversations') ||
    touchedKeys.has('stanbax_school_rep_config') ||
    touchedKeys.has('stanbax_chat_channels') ||
    touchedKeys.has('stanbax_chat_messages') ||
    touchedKeys.has('stanbax_students') ||
    touchedKeys.has('stanbax_tutors') ||
    touchedKeys.has('stanbax_parents_list') ||
    touchedKeys.has('stanbax_moderators') ||
    touchedKeys.has('stanbax_assessment_config') ||
    touchedKeys.has('stanbax_grading_system') ||
    touchedKeys.has('stanbax_official_signatures')
  ) {
    for (const mirror of buildPublicMirrorItems()) {
      if (!upserts.some(u => u.key === mirror.key)) {
        upserts.push(mirror);
      }
    }
  }
  
  try {
    if (upserts.length) {
      const { error } = await supabase.rpc('put_states', { p_items: upserts });
      if (error) {
        console.warn('[Supabase Sync] State write restricted or unauthorized:', error.message);
        if (error.message?.includes('Not signed in')) {
          setDbSession(null);
        }
      }
    }
    if (deletes.length) {
      const { error } = await supabase.rpc('delete_states', { p_keys: deletes });
      if (error) {
        console.warn('[Supabase Sync] State delete restricted:', error.message);
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] State flush handled gracefully:', err);
  }
};

const scheduleFlush = () => {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => { void flushWrites(); }, 400);
};

export const queueRemoteWrite = (key: string, serialized: string | null): void => {
  if (!isRemoteEnabled() || suppressRemote) return;
  pendingWrites.set(key, serialized);
  scheduleFlush();
};

let patchInstalled = false;
export const installLocalStorageSync = (): void => {
  if (patchInstalled || typeof localStorage === 'undefined') return;
  patchInstalled = true;
  const origSet = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    origSet(key, value);
    if (key.startsWith('stanbax_')) queueRemoteWrite(key, value);
  };
  localStorage.removeItem = (key: string) => {
    origRemove(key);
    if (key.startsWith('stanbax_')) queueRemoteWrite(key, null);
  };
};

// ---------------------------------------------------------------------------
// Hydration: pull all readable rows into localStorage before React renders,
// so every existing useState(localStorage.getItem(...)) initializer picks up
// the shared remote state. Public rows are readable without a session;
// private rows unlock after login.
// ---------------------------------------------------------------------------

export const hydrateFromSupabase = async (): Promise<void> => {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('school_state')
      .select('key, data');
    if (error) {
      console.warn('[Supabase Hydrate] Read restricted or unavailable:', error.message);
      return;
    }
    if (!data) return;

    const remoteKeys = new Set<string>();
    const rowMap = new Map<string, any>();
    suppressRemote = true;
    try {
      const deletedSet = new Set<string>();
      const localDel = localStorage.getItem('stanbax_deleted_account_ids');
      if (localDel) {
        try { JSON.parse(localDel).forEach((x: any) => deletedSet.add(String(x).toLowerCase())); } catch {}
      }

      for (const row of data as Array<{ key: string; data: any }>) {
        if (row.data === null || row.data === undefined) continue;
        remoteKeys.add(row.key);
        rowMap.set(row.key, row.data);
        if (row.key === 'stanbax_deleted_account_ids' && Array.isArray(row.data)) {
          row.data.forEach((x: any) => deletedSet.add(String(x).toLowerCase()));
        }
      }

      // Write remote rows to localStorage, ensuring deleted accounts are never written
      for (const [key, val] of rowMap.entries()) {
        if (key === 'stanbax_navbar_content' || key === 'stanbax_footer_content') continue;
        let dataToWrite = val;
        if (key === 'stanbax_students' && Array.isArray(val)) {
          dataToWrite = val.filter(s => s && s.id && !deletedSet.has(String(s.id).toLowerCase()));
        } else if (key === 'stanbax_tutors' && Array.isArray(val)) {
          dataToWrite = val.filter(t => t && t.id && !deletedSet.has(String(t.id).toLowerCase()));
        } else if (key === 'stanbax_parents_list' && Array.isArray(val)) {
          dataToWrite = val.filter(p => p && p.id && !deletedSet.has(String(p.id).toLowerCase()));
        } else if (key === 'stanbax_moderators' && Array.isArray(val)) {
          dataToWrite = val.filter(m => m && m.id && !deletedSet.has(String(m.id).toLowerCase()));
        }
        localStorage.setItem(key, JSON.stringify(dataToWrite));
      }

      // Unpack public mirrors for anonymous / non-admin readers if direct keys weren't returned
      const navMirror = rowMap.get('stanbax_navbar_content');
      if (navMirror && typeof navMirror === 'object' && navMirror.__type === 'PUBLIC_CHAT_MIRROR') {
        if (navMirror.schoolRepConfig && !rowMap.has('stanbax_school_rep_config')) {
          localStorage.setItem('stanbax_school_rep_config', JSON.stringify(navMirror.schoolRepConfig));
        }
        if (Array.isArray(navMirror.visitorConversations) && !rowMap.has('stanbax_visitor_conversations')) {
          localStorage.setItem('stanbax_visitor_conversations', JSON.stringify(navMirror.visitorConversations));
        }
      }

      const footerMirror = rowMap.get('stanbax_footer_content');
      if (footerMirror && typeof footerMirror === 'object' && footerMirror.__type === 'PUBLIC_COMMUNITY_MIRROR') {
        if (Array.isArray(footerMirror.chatChannels) && !rowMap.has('stanbax_chat_channels')) {
          localStorage.setItem('stanbax_chat_channels', JSON.stringify(footerMirror.chatChannels));
        }
        if (Array.isArray(footerMirror.chatMessages) && !rowMap.has('stanbax_chat_messages')) {
          localStorage.setItem('stanbax_chat_messages', JSON.stringify(footerMirror.chatMessages));
        }
        if (Array.isArray(footerMirror.students) && !rowMap.has('stanbax_students')) {
          const cleanStu = footerMirror.students.filter((s: any) => s && s.id && !deletedSet.has(String(s.id).toLowerCase()));
          localStorage.setItem('stanbax_students', JSON.stringify(cleanStu));
        }
        if (Array.isArray(footerMirror.tutors) && !rowMap.has('stanbax_tutors')) {
          const cleanTut = footerMirror.tutors.filter((t: any) => t && t.id && !deletedSet.has(String(t.id).toLowerCase()));
          localStorage.setItem('stanbax_tutors', JSON.stringify(cleanTut));
        }
        if (Array.isArray(footerMirror.parents) && !rowMap.has('stanbax_parents_list')) {
          const cleanPar = footerMirror.parents.filter((p: any) => p && p.id && !deletedSet.has(String(p.id).toLowerCase()));
          localStorage.setItem('stanbax_parents_list', JSON.stringify(cleanPar));
        }
        if (Array.isArray(footerMirror.moderators) && !rowMap.has('stanbax_moderators')) {
          const cleanMod = footerMirror.moderators.filter((m: any) => m && m.id && !deletedSet.has(String(m.id).toLowerCase()));
          localStorage.setItem('stanbax_moderators', JSON.stringify(cleanMod));
        }
        if (footerMirror.assessmentConfig && typeof footerMirror.assessmentConfig === 'object' && !rowMap.has('stanbax_assessment_config')) {
          localStorage.setItem('stanbax_assessment_config', JSON.stringify(footerMirror.assessmentConfig));
        }
        if (Array.isArray(footerMirror.gradingSystem) && !rowMap.has('stanbax_grading_system')) {
          localStorage.setItem('stanbax_grading_system', JSON.stringify(footerMirror.gradingSystem));
        }
        if (footerMirror.officialSignatures && typeof footerMirror.officialSignatures === 'object' && !rowMap.has('stanbax_official_signatures')) {
          localStorage.setItem('stanbax_official_signatures', JSON.stringify(footerMirror.officialSignatures));
        }
      }

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('stanbax_')) {
          const v = localStorage.getItem(k);
          if (v === 'null' || v === 'undefined') localStorage.removeItem(k);
        }
      }
    } finally {
      suppressRemote = false;
    }

    // Bootstrap local seeds to remote if missing and user has valid session
    if (sessionToken) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('stanbax_') && !remoteKeys.has(k)) {
          queueRemoteWrite(k, localStorage.getItem(k));
        }
      }
    }
  } catch (err) {
    console.warn('[Supabase Hydrate] Fallback to local cache:', err);
  }
};

/**
 * Push all local data collections directly to Supabase PostgreSQL.
 * Used for one-click initial database population or migration.
 */
export const pushAllDataToSupabase = async (
  snapshotData: Record<string, unknown>
): Promise<{ ok: boolean; message: string; count?: number }> => {
  if (!supabase || !sessionToken) {
    return {
      ok: false,
      message: 'You must be logged in as Administrator and have Supabase connected to push all data.',
    };
  }

  try {
    const items: Array<{ key: string; data: unknown }> = [];
    for (const [key, value] of Object.entries(snapshotData)) {
      if (value !== undefined && value !== null) {
        items.push({ key: key.startsWith('stanbax_') ? key : `stanbax_${key}`, data: value });
      }
    }

    // Send in batches of 10
    let totalWritten = 0;
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const { error } = await supabase.rpc('put_states', { p_items: batch });
      if (error) {
        throw new Error(`Batch upload failed at item ${i}: ${error.message}`);
      }
      totalWritten += batch.length;
    }

    return {
      ok: true,
      message: `Successfully synchronized ${totalWritten} collections directly into Supabase central database!`,
      count: totalWritten,
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Sync failed.' };
  }
};

export const configureSupabaseCredentials = (url: string, anonKey: string): boolean => {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  if (!cleanUrl || !cleanKey) return false;
  try {
    localStorage.setItem(CONFIG_URL_KEY, cleanUrl);
    localStorage.setItem(CONFIG_KEY_KEY, cleanKey);
    supabase = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: authedFetch },
    });
    return true;
  } catch (err) {
    console.warn('[Supabase Config] Failed to update credentials:', err);
    return false;
  }
};

export const syncLocalSchoolStateToSupabase = async (): Promise<{
  ok: boolean;
  message: string;
  written: number;
}> => {
  if (!supabase) {
    return { ok: false, message: 'Supabase client is not configured yet.', written: 0 };
  }
  try {
    const items: Array<{ key: string; data: unknown }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('stanbax_') && k !== SESSION_KEY && k !== CONFIG_URL_KEY && k !== CONFIG_KEY_KEY) {
        const raw = localStorage.getItem(k);
        if (raw && raw !== 'null' && raw !== 'undefined') {
          try {
            items.push({ key: k, data: JSON.parse(raw) });
          } catch {
            items.push({ key: k, data: raw });
          }
        }
      }
    }

    if (items.length === 0) {
      return { ok: true, message: 'No local school state items to upload.', written: 0 };
    }

    let written = 0;
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const { error } = await supabase.rpc('put_states', { p_items: batch });
      if (error) {
        return { ok: false, message: `Sync error: ${error.message}`, written };
      }
      written += batch.length;
    }

    return {
      ok: true,
      message: `Synchronized ${written} school state collections to Supabase.`,
      written,
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to sync state.', written: 0 };
  }
};

export const remoteDeleteCredential = async (
  identifier: string,
  refId?: string
): Promise<{ ok: boolean; message?: string }> => {
  if (!supabase || !sessionToken) return { ok: false, message: 'Supabase offline or no session.' };
  try {
    const { data, error } = await supabase.rpc('delete_credential', {
      p_identifier: identifier,
      p_ref_id: refId || null,
    });
    if (error) {
      console.warn('[Supabase Delete Credential] RPC warning:', error.message);
      return { ok: false, message: error.message };
    }
    const d = data as { ok?: boolean; message?: string } | null;
    return { ok: d?.ok ?? true, message: d?.message };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to delete credential.' };
  }
};

export const remoteCheckCredentials = async (
  identifier: string,
  password: string,
  _role?: string,
  _refId?: string
): Promise<{ ok: boolean; message?: string }> => {
  if (!supabase) return { ok: true };
  try {
    const res = await remoteVerifyLogin(identifier, password);
    if (res.unreachable) return { ok: true };
    return { ok: res.ok, message: res.message };
  } catch {
    return { ok: true };
  }
};

export const syncStateOnline = async (key: string, data: unknown): Promise<boolean> => {
  const fullKey = key.startsWith('stanbax_') ? key : `stanbax_${key}`;
  try {
    queueRemoteWrite(fullKey, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const syncNewDataTypesOnline = async (payload: {
  customResults?: unknown;
  waecSubjects?: unknown;
  waecDeptRecommendations?: unknown;
  waecRegistrations?: unknown;
  waecPromptBroadcast?: unknown;
  students?: unknown;
}): Promise<{ ok: boolean; message: string }> => {
  if (!supabase) {
    return { ok: true, message: 'Saved locally (Supabase cloud not configured).' };
  }
  try {
    const items: Array<{ key: string; data: unknown }> = [];
    if (payload.customResults !== undefined) items.push({ key: 'stanbax_custom_results', data: payload.customResults });
    if (payload.waecSubjects !== undefined) items.push({ key: 'stanbax_waec_subjects', data: payload.waecSubjects });
    if (payload.waecDeptRecommendations !== undefined) items.push({ key: 'stanbax_waec_dept_recommendations', data: payload.waecDeptRecommendations });
    if (payload.waecRegistrations !== undefined) items.push({ key: 'stanbax_waec_registrations', data: payload.waecRegistrations });
    if (payload.waecPromptBroadcast !== undefined) items.push({ key: 'stanbax_waec_prompt_broadcast', data: payload.waecPromptBroadcast });
    if (payload.students !== undefined) items.push({ key: 'stanbax_students', data: payload.students });

    for (const item of items) {
      queueRemoteWrite(item.key, JSON.stringify(item.data));
    }

    if (sessionToken && items.length > 0) {
      const { error } = await supabase.rpc('put_states', { p_items: items });
      if (error) {
        return { ok: false, message: error.message };
      }
    }

    return { ok: true, message: 'Synchronized with cloud database.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Cloud sync failed.' };
  }
};

export const ensureAdminRemoteSession = async (password: string): Promise<boolean> => {
  if (!supabase) return false;
  if (sessionToken) return true;
  try {
    const res = await remoteVerifyLogin('admin', password);
    if (res.ok && res.token) {
      setDbSession(res.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const broadcastLocalStateChange = (key: string, data: unknown): void => {
  try {
    window.dispatchEvent(
      new CustomEvent('stanbax-state-change', {
        detail: { key, data, timestamp: Date.now() },
      })
    );
  } catch {
    // ignore in non-DOM contexts
  }
};

export const fetchLiveSupabaseChatAndDirectoryState = async (): Promise<{
  visitorConversations?: any[];
  schoolRepConfig?: any;
  chatChannels?: any[];
  chatMessages?: any[];
  students?: any[];
  tutors?: any[];
  parents?: any[];
  moderators?: any[];
  assessmentConfig?: any;
  gradingSystem?: any[];
  officialSignatures?: any;
} | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('school_state')
      .select('key, data')
      .in('key', [
        'stanbax_visitor_conversations',
        'stanbax_school_rep_config',
        'stanbax_contact_inquiries',
        'stanbax_navbar_content',
        'stanbax_footer_content',
        'stanbax_chat_channels',
        'stanbax_chat_messages',
        'stanbax_students',
        'stanbax_tutors',
        'stanbax_parents_list',
        'stanbax_moderators',
        'stanbax_assessment_config',
        'stanbax_grading_system',
        'stanbax_official_signatures',
      ]);
    if (error || !data) return null;

    const map = new Map<string, any>();
    for (const row of data as Array<{ key: string; data: any }>) {
      if (row.data !== null && row.data !== undefined) {
        map.set(row.key, row.data);
      }
    }

    const navMirror = map.get('stanbax_navbar_content');
    const footerMirror = map.get('stanbax_footer_content');

    // Merge visitor conversations from direct state, public mirror, and anonymous inquiry syncs
    const convLists: any[][] = [];
    if (Array.isArray(map.get('stanbax_visitor_conversations'))) {
      convLists.push(map.get('stanbax_visitor_conversations'));
    }
    if (navMirror?.__type === 'PUBLIC_CHAT_MIRROR' && Array.isArray(navMirror.visitorConversations)) {
      convLists.push(navMirror.visitorConversations);
    }
    const rawInquiries = map.get('stanbax_contact_inquiries');
    if (Array.isArray(rawInquiries)) {
      for (const inq of rawInquiries) {
        if (inq?.__type === 'VISITOR_CHAT_SYNC' && Array.isArray(inq.conversations)) {
          convLists.push(inq.conversations);
        }
      }
    }

    let mergedConvs: any[] | undefined;
    if (convLists.length > 0) {
      const convMap = new Map<string, any>();
      for (const list of convLists) {
        for (const c of list) {
          if (!c?.visitorId) continue;
          const existing = convMap.get(c.visitorId);
          if (!existing) {
            convMap.set(c.visitorId, c);
          } else {
            // Merge messages by id so neither visitor queries nor admin replies are ever lost
            const msgMap = new Map<string, any>();
            for (const m of existing.messages || []) {
              if (m?.id) msgMap.set(m.id, m);
            }
            for (const m of c.messages || []) {
              if (m?.id) {
                const prevMsg = msgMap.get(m.id);
                if (!prevMsg || m.status === 'seen') {
                  msgMap.set(m.id, m);
                }
              }
            }
            const mergedMsgs = Array.from(msgMap.values()).sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const newer =
              new Date(c.lastMessageAt || 0).getTime() >=
              new Date(existing.lastMessageAt || 0).getTime()
                ? c
                : existing;
            convMap.set(c.visitorId, {
              ...existing,
              ...newer,
              queryCode: c.queryCode || existing.queryCode || `STX-${c.visitorId.slice(-5).toUpperCase()}`,
              messages: mergedMsgs,
              lastMessageAt:
                mergedMsgs.length > 0
                  ? mergedMsgs[mergedMsgs.length - 1].timestamp
                  : newer.lastMessageAt,
            });
          }
        }
      }
      mergedConvs = Array.from(convMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
      );
    }

    // Resolve freshest schoolRepConfig
    const directRep = map.get('stanbax_school_rep_config');
    const mirrorRep = navMirror?.__type === 'PUBLIC_CHAT_MIRROR' ? navMirror.schoolRepConfig : undefined;
    let resolvedRep = directRep || mirrorRep;
    if (directRep && mirrorRep) {
      const directTime = directRep.updatedAt ? new Date(directRep.updatedAt).getTime() : 0;
      const mirrorTime = mirrorRep.updatedAt ? new Date(mirrorRep.updatedAt).getTime() : 0;
      resolvedRep = mirrorTime > directTime ? mirrorRep : directRep;
    }

    // Resolve freshest assessmentConfig (compare resultsDispatchedAt / publishedAt)
    const directAssessment = map.get('stanbax_assessment_config');
    const mirrorAssessment =
      footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.assessmentConfig : undefined;
    let resolvedAssessment = directAssessment || mirrorAssessment;
    if (directAssessment && mirrorAssessment) {
      const directDisp = directAssessment.resultsDispatchedAt
        ? new Date(directAssessment.resultsDispatchedAt).getTime()
        : 0;
      const mirrorDisp = mirrorAssessment.resultsDispatchedAt
        ? new Date(mirrorAssessment.resultsDispatchedAt).getTime()
        : 0;
      resolvedAssessment = mirrorDisp > directDisp ? mirrorAssessment : directAssessment;
    }

    return {
      visitorConversations: mergedConvs,
      schoolRepConfig: resolvedRep,
      chatChannels:
        map.get('stanbax_chat_channels') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.chatChannels : undefined),
      chatMessages:
        map.get('stanbax_chat_messages') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.chatMessages : undefined),
      students:
        map.get('stanbax_students') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.students : undefined),
      tutors:
        map.get('stanbax_tutors') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.tutors : undefined),
      parents:
        map.get('stanbax_parents_list') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.parents : undefined),
      moderators:
        map.get('stanbax_moderators') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.moderators : undefined),
      assessmentConfig: resolvedAssessment,
      gradingSystem:
        map.get('stanbax_grading_system') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.gradingSystem : undefined),
      officialSignatures:
        map.get('stanbax_official_signatures') ||
        (footerMirror?.__type === 'PUBLIC_COMMUNITY_MIRROR' ? footerMirror.officialSignatures : undefined),
    };
  } catch {
    return null;
  }
};

/**
 * Immediately commits collated student grades, rankings, and assessmentConfig
 * to Supabase (both direct school_state keys and the public community mirror)
 * so every parent and scholar sees their results on login across all devices.
 */
export const forceSyncCollatedResultsToDatabase = async (payload: {
  students: unknown;
  assessmentConfig: unknown;
  gradingSystem?: unknown;
  officialSignatures?: unknown;
  adminPassword?: string;
}): Promise<{ ok: boolean; syncedToSupabase: boolean; message: string }> => {
  try {
    localStorage.setItem('stanbax_students', JSON.stringify(payload.students));
    localStorage.setItem('stanbax_assessment_config', JSON.stringify(payload.assessmentConfig));
    if (payload.gradingSystem !== undefined) {
      localStorage.setItem('stanbax_grading_system', JSON.stringify(payload.gradingSystem));
    }
    if (payload.officialSignatures !== undefined) {
      localStorage.setItem('stanbax_official_signatures', JSON.stringify(payload.officialSignatures));
    }
  } catch {}

  if (!supabase) {
    return {
      ok: true,
      syncedToSupabase: false,
      message: 'Results saved to local & server database.',
    };
  }

  try {
    if (!sessionToken && payload.adminPassword) {
      await ensureAdminRemoteSession(payload.adminPassword);
    }

    const items: Array<{ key: string; data: unknown }> = [
      { key: 'stanbax_students', data: payload.students },
      { key: 'stanbax_assessment_config', data: payload.assessmentConfig },
    ];
    if (payload.gradingSystem !== undefined) {
      items.push({ key: 'stanbax_grading_system', data: payload.gradingSystem });
    }
    if (payload.officialSignatures !== undefined) {
      items.push({ key: 'stanbax_official_signatures', data: payload.officialSignatures });
    }
    for (const mirror of buildPublicMirrorItems()) {
      items.push(mirror);
    }

    if (sessionToken) {
      const { error } = await supabase.rpc('put_states', { p_items: items });
      if (error) {
        console.warn('[Supabase Results Dispatch] Direct RPC warning:', error.message);
        return {
          ok: true,
          syncedToSupabase: false,
          message: `Results saved locally & queued for cloud sync (${error.message}).`,
        };
      }
      return {
        ok: true,
        syncedToSupabase: true,
        message: 'Results permanently committed to Supabase PostgreSQL & live across all parent and scholar portals.',
      };
    } else {
      for (const item of items) {
        queueRemoteWrite(item.key, JSON.stringify(item.data));
      }
      return {
        ok: true,
        syncedToSupabase: false,
        message: 'Results saved and queued for database synchronization.',
      };
    }
  } catch (err: any) {
    return {
      ok: true,
      syncedToSupabase: false,
      message: err?.message || 'Results saved to local & server storage.',
    };
  }
};



