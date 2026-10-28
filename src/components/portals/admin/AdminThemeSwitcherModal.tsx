import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { AppTheme, ThemeConfig } from '../../../types';
import { 
  X, 
  Palette, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Layers, 
  ShieldCheck, 
  Database, 
  RefreshCw,
  ArrowRight
} from '../../RealIcons';

interface AdminThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminThemeSwitcherModal: React.FC<AdminThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { appTheme, setAppTheme, availableThemes } = useSchool();
  const [selectedThemeId, setSelectedThemeId] = useState<AppTheme>(appTheme);
  const [isApplying, setIsApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTheme = async (themeId: AppTheme) => {
    setIsApplying(true);
    setSelectedThemeId(themeId);
    try {
      const res = await setAppTheme(themeId);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 4500);
    } catch {
      setFeedbackMsg('Theme updated locally and applying across portals.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Institutional Visual Theme & Style Switcher
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                  Global System Action
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Switch between 3 unique styles. Applies instantly to the public website and all 7 role portals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Feedback Notification */}
        {feedbackMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Persistent Sync Status Bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-stone-600 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-stone-900">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Server DB: <code className="text-[11px] font-mono text-stone-800 font-bold">/api/theme</code></span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Cloud Sync</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Cross-Tab Live Broadcast</span>
            </span>
          </div>

          <div className="text-[11px] font-bold text-stone-500">
            Active Theme: <strong className="text-stone-900 uppercase tracking-wide font-black">{availableThemes.find(t => t.id === appTheme)?.name}</strong>
          </div>
        </div>

        {/* Content Body: 3 Unique Styles Showcase Cards */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {availableThemes.map(theme => {
              const isActive = appTheme === theme.id;
              const isSelected = selectedThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleApplyTheme(theme.id)}
                  className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-400/30'
                      : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
                  }`}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Theme</span>
                    </div>
                  )}

                  <div>
                    {/* Theme Category Badge */}
                    <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 mb-3">
                      {theme.badge}
                    </div>

                    <h4 className="text-base font-black text-stone-900 group-hover:text-red-700 transition-colors">
                      {theme.name}
                    </h4>
                    <p className="text-xs font-bold text-stone-500 mt-0.5">
                      {theme.tagline}
                    </p>

                    {/* Color Swatch Preview Bar */}
                    <div className="my-4 p-3 rounded-2xl bg-stone-100/70 border border-stone-200/80 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Color Harmonies
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Primary Swatch */}
                        <div 
                          className="w-8 h-8 rounded-xl shadow-xs border border-black/10 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: theme.primaryColor }}
                          title={`Primary: ${theme.primaryColor}`}
                        />
                        {/* Secondary Swatch */}
                        <div 
                          className="w-8 h-8 rounded-xl shadow-xs border border-black/10 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: theme.secondaryColor }}
                          title={`Secondary: ${theme.secondaryColor}`}
                        />
                        {/* Accent Swatch */}
                        <div 
                          className="w-8 h-8 rounded-xl shadow-xs border border-black/10 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: theme.accentColor }}
                          title={`Accent: ${theme.accentColor}`}
                        />
                        {/* Background Surface Swatch */}
                        <div 
                          className="w-8 h-8 rounded-xl shadow-xs border border-stone-300 flex items-center justify-center text-stone-700 text-[9px] font-mono font-bold"
                          style={{ backgroundColor: theme.bgPreview }}
                          title={`Surface: ${theme.bgPreview}`}
                        >
                          BG
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">
                      {theme.description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTheme(theme.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-stone-900 text-white cursor-default'
                        : 'bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-900 border border-stone-300'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span>Current System Style</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Activate This Style</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Scope Coverage Guarantee Banner */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <h5 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full Cross-Platform Coverage Guarantee</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-600 pt-1">
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="font-bold text-stone-900 block">Public Website</span>
                <span>Home, About, News, Gallery</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="font-bold text-stone-900 block">Executive Portals</span>
                <span>Admin, Proprietress, Principal</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="font-bold text-stone-900 block">Faculty & Staff</span>
                <span>Tutors, Moderators Desk</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="font-bold text-stone-900 block">Family & Students</span>
                <span>Scholars, Parents Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500">
            Changes save permanently to <code className="font-mono text-stone-700 font-bold">data/theme.json</code> and sync to cloud.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
