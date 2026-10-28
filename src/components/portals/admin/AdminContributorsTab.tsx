import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { Contributor } from '../../../types';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Check, 
  X, 
  RotateCcw, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from '../../RealIcons';

export const AdminContributorsTab: React.FC = () => {
  const { 
    contributors, 
    addContributor, 
    updateContributor, 
    deleteContributor, 
    resetContributorsToDefault 
  } = useSchool();

  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<Contributor['category']>('Core Engineering');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [order, setOrder] = useState<number>(contributors.length + 1);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setRole('');
    setCategory('Core Engineering');
    setBio('');
    setAvatarUrl('');
    setBadge('');
    setHighlight(false);
    setOrder(contributors.length + 1);
    setGithub('');
    setLinkedin('');
    setEmail('');
    setWebsite('');
    setIsActive(true);
    setEditingContributor(null);
  };

  const handleOpenEdit = (contributor: Contributor) => {
    setEditingContributor(contributor);
    setName(contributor.name);
    setRole(contributor.role);
    setCategory(contributor.category || 'Core Engineering');
    setBio(contributor.bio);
    setAvatarUrl(contributor.avatarUrl || '');
    setBadge(contributor.badge || '');
    setHighlight(Boolean(contributor.highlight));
    setOrder(contributor.order || 1);
    setGithub(contributor.links?.github || '');
    setLinkedin(contributor.links?.linkedin || '');
    setEmail(contributor.links?.email || '');
    setWebsite(contributor.links?.website || '');
    setIsActive(contributor.isActive !== false);
    setIsCreateModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !bio.trim()) {
      setFeedback({ type: 'error', message: 'Name, Role, and Bio are required fields.' });
      return;
    }

    const links: Contributor['links'] = {};
    if (github.trim()) links.github = github.trim();
    if (linkedin.trim()) links.linkedin = linkedin.trim();
    if (email.trim()) links.email = email.trim();
    if (website.trim()) links.website = website.trim();

    if (editingContributor) {
      updateContributor(editingContributor.id, {
        name: name.trim(),
        role: role.trim(),
        category,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        badge: badge.trim() || undefined,
        highlight,
        order: Number(order) || 1,
        links,
        isActive
      });
      setFeedback({ type: 'success', message: `Updated contributor "${name}" successfully.` });
    } else {
      addContributor({
        name: name.trim(),
        role: role.trim(),
        category,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        badge: badge.trim() || undefined,
        highlight,
        order: Number(order) || contributors.length + 1,
        links,
        isActive
      });
      setFeedback({ type: 'success', message: `Added new contributor "${name}" to landing page.` });
    }

    setIsCreateModalOpen(false);
    resetForm();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (id: string, contribName: string) => {
    deleteContributor(id);
    setDeleteConfirmId(null);
    setFeedback({ type: 'success', message: `Removed "${contribName}" from contributors.` });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleMoveOrder = (id: string, currentOrder: number, direction: 'up' | 'down') => {
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    updateContributor(id, { order: targetOrder });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider">
              Landing Page CMS
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {contributors.length} Total Contributors
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Website Production Contributors & Credits</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the software engineers, sponsors, academic directors, and scholars honored on the public website homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset contributors back to institutional default team credits?')) {
                resetContributorsToDefault();
                setFeedback({ type: 'success', message: 'Reset contributors list to default.' });
                setTimeout(() => setFeedback(null), 4000);
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            title="Reset to default contributors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Contributor</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-xs ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-950 border border-emerald-300' 
            : 'bg-rose-50 text-rose-950 border border-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Contributors Table / List */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs font-black uppercase text-slate-500 tracking-wider">
          <span>Active Contributors Roster</span>
          <span>Order & Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {contributors.map((c, idx) => (
            <div 
              key={c.id} 
              className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:bg-slate-50/80 ${
                c.isActive === false ? 'opacity-60 bg-slate-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar / Photo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-100 p-0.5 border border-slate-200 shadow-xs">
                  {c.avatarUrl ? (
                    <img 
                      src={c.avatarUrl} 
                      alt={c.name} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-base">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-slate-900 text-base">
                      {c.name}
                    </h4>
                    {c.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase">
                        {c.badge}
                      </span>
                    )}
                    {c.highlight && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    {c.isActive === false ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                        Hidden
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Visible on Landing Page
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-blue-700">
                    {c.role} {c.category ? `• ${c.category}` : ''}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mt-1">
                    {c.bio}
                  </p>

                  {/* Links display */}
                  {c.links && Object.keys(c.links).length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      {c.links.github && <span className="text-slate-600 font-mono">GitHub</span>}
                      {c.links.linkedin && <span className="text-blue-600 font-mono">LinkedIn</span>}
                      {c.links.email && <span className="text-amber-700 font-mono">Email</span>}
                      {c.links.website && <span className="text-emerald-700 font-mono">Web</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Order Up / Down */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleMoveOrder(c.id, c.order, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                    title="Move higher"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(c.id, c.order, 'down')}
                    disabled={idx === contributors.length - 1}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                    title="Move lower"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visibility Toggle */}
                <button
                  onClick={() => updateContributor(c.id, { isActive: c.isActive === false ? true : false })}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    c.isActive === false
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title={c.isActive === false ? 'Show on homepage' : 'Hide from homepage'}
                >
                  {c.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition cursor-pointer"
                  title="Edit Contributor"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete */}
                {deleteConfirmId === c.id ? (
                  <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Contributor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {editingContributor ? 'Edit Contributor Credit' : 'Add New Contributor Credit'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Display honored project contributors on Stanbax Schools homepage.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Justin Decalvin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Project Architect & AI Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Category / Department
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  >
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Academic Leadership">Academic Leadership</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Patron & Sponsor">Patron & Sponsor</option>
                    <option value="Student Contributor">Student Contributor</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Visual Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Creator & Lead Architect"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                  Avatar / Photo URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or direct image link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                  Contribution Bio / Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detail their specific contributions to the Stanbax website, architecture, curriculum, or systems..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              {/* Social / Portfolio Links */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                  Contributor Links (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="GitHub URL (https://...)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL (https://...)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contact Email"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Portfolio / Website URL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlight}
                    onChange={(e) => setHighlight(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Feature as Highlighted Contributor</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Visible on Public Homepage</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black shadow-md cursor-pointer"
                >
                  {editingContributor ? 'Save Changes' : 'Publish Contributor Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
