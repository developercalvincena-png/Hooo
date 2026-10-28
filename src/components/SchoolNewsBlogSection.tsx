import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolNewsArticle, SchoolNewsCategory } from '../types';
import { 
  Newspaper, 
  Search, 
  Clock, 
  Heart, 
  Share2, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ExternalLink, 
  RefreshCw, 
  Award, 
  Users, 
  Crown, 
  Bookmark, 
  Eye, 
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from './RealIcons';

interface SchoolNewsBlogSectionProps {
  onOpenAdmissions?: () => void;
}

const CATEGORIES: SchoolNewsCategory[] = [
  'All',
  'Campus News',
  'Academic Honors',
  'Sports Desk',
  'Arts & Culture',
  'STEM & Innovation',
  'Executive Bulletin'
];

export const SchoolNewsBlogSection: React.FC<SchoolNewsBlogSectionProps> = ({ onOpenAdmissions }) => {
  const { 
    newsArticles, 
    addNewsArticle, 
    updateNewsArticle, 
    deleteNewsArticle, 
    likeNewsArticle,
    students,
    pressClubPresidentStudentId,
    pressClubEditorStudentIds,
    assignPressClubPresident,
    nominatePressClubEditor,
    removePressClubEditor
  } = useSchool();

  const [activeCategory, setActiveCategory] = useState<SchoolNewsCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<SchoolNewsArticle | null>(null);
  const [showEditorialModal, setShowEditorialModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);

  // New Article Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<SchoolNewsCategory, 'All'>>('Campus News');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formAuthorRole, setFormAuthorRole] = useState<'Press Club President' | 'Press Club Editor' | 'Staff Patron' | 'Principal Administrator'>('Press Club President');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Appointed President student
  const presidentStudent = students.find(s => s.id === pressClubPresidentStudentId) || students[0];

  // Nominated Editor students
  const editorStudents = students.filter(s => pressClubEditorStudentIds.includes(s.id));

  // Fetch recent external education wire updates from API
  const handleFetchExternalNews = async () => {
    setIsFetchingApi(true);
    setApiFeedback(null);
    try {
      const res = await fetch('/api/school-news');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        data.articles.forEach((art: SchoolNewsArticle) => {
          const exists = newsArticles.some(a => a.id === art.id || a.title === art.title);
          if (!exists) {
            addNewsArticle(art);
          }
        });
        setApiFeedback('Latest educational wire dispatch synchronized successfully!');
      } else {
        setApiFeedback('Editorial feed is up to date with verified Stanbax archives.');
      }
    } catch {
      setApiFeedback('Connected to verified offline school archives.');
    } finally {
      setIsFetchingApi(false);
      setTimeout(() => setApiFeedback(null), 3500);
    }
  };

  // Filtered articles
  const filteredArticles = newsArticles.filter(art => {
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  const handleOpenEdit = (article: SchoolNewsArticle) => {
    setEditingArticleId(article.id);
    setFormTitle(article.title);
    setFormCategory(article.category);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormCoverImage(article.coverImage);
    setFormTags(article.tags.join(', '));
    setFormIsFeatured(!!article.isFeatured);
    setFormAuthorName(article.author.name);
    setFormAuthorRole(article.author.role);
    setShowEditorialModal(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const parsedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingArticleId) {
      updateNewsArticle(editingArticleId, {
        title: formTitle.trim(),
        category: formCategory,
        excerpt: formExcerpt.trim() || formContent.slice(0, 140) + '...',
        content: formContent.trim(),
        coverImage: formCoverImage.trim() || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
        tags: parsedTags.length > 0 ? parsedTags : ['Stanbax Gazette'],
        isFeatured: formIsFeatured,
        author: {
          id: presidentStudent?.id || 'stu-1',
          name: formAuthorName.trim() || presidentStudent?.name || 'Press Club Desk',
          role: formAuthorRole,
          gradeOrTitle: presidentStudent?.grade || 'Senior Press Guild'
        }
      });
    } else {
      addNewsArticle({
        title: formTitle.trim(),
        slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        category: formCategory,
        excerpt: formExcerpt.trim() || formContent.slice(0, 140) + '...',
        content: formContent.trim(),
        coverImage: formCoverImage.trim() || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
        readTime: `${Math.max(2, Math.round(formContent.split(' ').length / 180))} min read`,
        tags: parsedTags.length > 0 ? parsedTags : ['Stanbax Gazette'],
        isFeatured: formIsFeatured,
        author: {
          id: presidentStudent?.id || 'stu-1',
          name: formAuthorName.trim() || presidentStudent?.name || 'Press Club Desk',
          role: formAuthorRole,
          gradeOrTitle: presidentStudent?.grade || 'Senior Press Guild'
        },
        likesCount: 0,
        viewsCount: 1
      });
    }

    // Reset Form
    setEditingArticleId(null);
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverImage('');
    setFormTags('');
    setFormIsFeatured(false);
    setShowEditorialModal(false);
  };

  const handleShare = (article: SchoolNewsArticle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#news-blog`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section id="news-blog" className="py-12 sm:py-16 lg:py-20 bg-[#FCFBF8] border-b border-[#EAE2CE] overflow-hidden font-['Nunito',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-stone-200">
          <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-black uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-red-700" />
              <span>The Stanbax Gazette • Official Campus Dispatch</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              School News & Journalistic Blog
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed">
              Curated by the appointed <strong>Press Club President</strong> and nominated student editors. Live reports covering STEM breakthroughs, academic distinctions, inter-house athletics, and institutional bulletins.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleFetchExternalNews}
              disabled={isFetchingApi}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              title="Fetch recent updates from external education feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isFetchingApi ? 'animate-spin' : ''}`} />
              <span>{isFetchingApi ? 'Fetching...' : 'Sync Wire'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingArticleId(null);
                setFormTitle('');
                setFormExcerpt('');
                setFormContent('');
                setFormCoverImage('');
                setFormTags('');
                setFormIsFeatured(false);
                setFormAuthorName(presidentStudent?.name || '');
                setFormAuthorRole('Press Club President');
                setShowEditorialModal(true);
              }}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Press Room & Editorial Desk</span>
            </button>
          </div>
        </div>

        {/* API Feedback Alert */}
        {apiFeedback && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{apiFeedback}</span>
          </div>
        )}

        {/* Masthead Banner: Current Press Leadership */}
        <div className="my-6 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
              <Crown className="w-5 h-5 text-amber-700 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  Appointed Press Club President
                </span>
                <span className="text-xs font-black text-stone-900">{presidentStudent?.name || 'Tiwa Adeleke'}</span>
                <span className="text-[11px] text-stone-500">({presidentStudent?.grade || 'SSS 2 Science'})</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Nominated Editors: {editorStudents.length > 0 ? editorStudents.map(e => e.name).join(', ') : 'Babatunde Akindele, Chinedu Eze'} • Patron: Dr. Chukwuemeka Obi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-stone-400 font-bold hidden md:inline">Editorial Verification:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peer Audited Journal</span>
            </span>
          </div>
        </div>

        {/* Category Filters and Search Input */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills with touch momentum scroll and 44px touch targets */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 scrollbar-none snap-x touch-pan-x text-xs font-bold">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`min-h-[44px] px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 snap-start flex items-center justify-center ${
                    activeCategory === cat
                      ? 'bg-red-700 text-white shadow-xs font-black'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Keyword Search - Touch Friendly 44px Height & Clear Button */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic..."
                className="w-full h-11 min-h-[44px] pl-10 pr-10 py-2.5 rounded-full bg-white border border-stone-200 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center absolute right-0 top-0 text-stone-400 hover:text-stone-700 active:scale-95 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* No Articles Found State */}
        {filteredArticles.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-black text-stone-800 text-base">No articles found in this category</h4>
            <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
              Try selecting a different category or clear your search term to view published articles.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Featured Headline Article - Responsive Touch Card */}
            {featuredArticle && (
              <div 
                role="button"
                tabIndex={0}
                onClick={() => setSelectedArticle(featuredArticle)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle(featuredArticle);
                  }
                }}
                className="group bg-white rounded-3xl border border-stone-200 hover:border-red-300 overflow-hidden shadow-xs hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 focus-visible:outline-2 focus-visible:outline-red-600 touch-manipulation select-none"
                aria-label={`Read featured report: ${featuredArticle.title}`}
              >
                {/* Image side */}
                <div className="lg:col-span-7 relative h-56 sm:h-72 lg:h-full min-h-[220px] overflow-hidden bg-stone-900">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                      Featured Report • {featuredArticle.category}
                    </span>
                  </div>

                  {/* Mobile Tap Cue */}
                  <div className="absolute bottom-3 right-3 sm:hidden px-2.5 py-1 rounded-full bg-stone-950/85 text-amber-300 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-amber-400/30">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tap to Read</span>
                  </div>
                </div>

                {/* Content side */}
                <div className="lg:col-span-5 p-4 sm:p-7 lg:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                      <span>{new Date(featuredArticle.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredArticle.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-black text-stone-900 leading-snug group-hover:text-red-700 transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  {/* Author & Footer Controls with Generous Touch-Friendly Targets */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {featuredArticle.author.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-stone-900 truncate block">
                          {featuredArticle.author.name}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold truncate block">
                          {featuredArticle.author.role}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          likeNewsArticle(featuredArticle.id);
                        }}
                        className="w-full sm:w-auto min-h-[46px] min-w-[46px] px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 flex items-center justify-center gap-1.5 transition text-xs font-black cursor-pointer shadow-2xs"
                        title="Applaud article"
                        aria-label={`Like article, current count: ${featuredArticle.likesCount || 0}`}
                      >
                        <Heart className="w-4 h-4 fill-rose-600" />
                        <span>{featuredArticle.likesCount || 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(featuredArticle);
                        }}
                        className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <span>Read Report</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Articles Grid: 1 col mobile, 2 col tablet (640px+), 3 col desktop (1024px+) */}
            {regularArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {regularArticles.map(article => (
                  <article
                    key={article.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedArticle(article)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedArticle(article);
                      }
                    }}
                    className="group bg-white rounded-3xl border border-stone-200 hover:border-red-300 overflow-hidden shadow-2xs hover:shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600 touch-manipulation select-none"
                    aria-label={`Read article: ${article.title}`}
                  >
                    <div>
                      {/* Image Container with Responsive Aspect Ratio */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-900">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-900/90 text-white backdrop-blur-xs">
                            {article.category}
                          </span>
                        </div>

                        {/* Mobile Tap Cue Badge */}
                        <div className="absolute bottom-3 right-3 sm:hidden px-2.5 py-0.5 rounded-full bg-stone-950/85 text-amber-300 text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 border border-amber-400/30">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>Tap to Read</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                          <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>

                        <h4 className="text-base font-black text-stone-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
                          {article.title}
                        </h4>

                        <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Touch-Friendly Card Footer */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-stone-800 truncate block">
                          {article.author.name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium truncate block">
                          {article.author.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeNewsArticle(article.id);
                          }}
                          className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-stone-600 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold"
                          title="Like article"
                          aria-label={`Like article, current count: ${article.likesCount || 0}`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{article.likesCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArticle(article);
                          }}
                          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-900 sm:bg-stone-100 hover:bg-stone-200 text-white sm:text-stone-900 active:scale-95 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400 sm:text-red-700" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FULL ARTICLE READER MODAL (RESPONSIVE BOTTOM-SHEET ON MOBILE)    */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-stone-200 my-0 sm:my-auto animate-in slide-in-from-bottom sm:slide-in-from-none sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-article-title"
          >
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-stone-50/70 border-b border-stone-100">
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>

            {/* Reader Header Bar */}
            <div className="p-3.5 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-red-900 border border-red-200">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-stone-500 font-medium truncate">
                  {new Date(selectedArticle.publishedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShare(selectedArticle)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-200 active:scale-95 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-700 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Body */}
            <div className="p-4 sm:p-7 lg:p-8 space-y-5 max-h-[70dvh] sm:max-h-[72vh] overflow-y-auto overscroll-contain">
              <h2 id="reader-article-title" className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 leading-snug">
                {selectedArticle.title}
              </h2>

              {/* Author Masthead Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {selectedArticle.author.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-stone-900">{selectedArticle.author.name}</h5>
                    <p className="text-[11px] text-amber-800 font-bold">
                      {selectedArticle.author.role} • {selectedArticle.author.gradeOrTitle || 'Stanbax Press Guild'}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-stone-500 font-semibold hidden sm:block">
                  <div>{selectedArticle.readTime}</div>
                  <div className="text-[11px] text-stone-400">Verified Press Release</div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-2xl overflow-hidden bg-stone-900 max-h-80 sm:max-h-96">
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Excerpt Lead */}
              <p className="text-sm sm:text-base font-bold text-stone-700 leading-relaxed italic border-l-4 border-red-600 pl-3.5">
                "{selectedArticle.excerpt}"
              </p>

              {/* Full Content */}
              <div className="prose prose-stone max-w-none text-stone-800 text-xs sm:text-sm sm:text-base leading-relaxed space-y-3.5">
                {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
                ))}
              </div>

              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-stone-200 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-500">Filed under:</span>
                  {selectedArticle.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reader Footer Bar - Responsive and Touch-Friendly */}
            <div className="p-3.5 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => likeNewsArticle(selectedArticle.id)}
                className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
              >
                <Heart className="w-4 h-4 fill-rose-600" />
                <span>Applaud Report ({selectedArticle.likesCount || 0})</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedArticle)}
                  className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit in Press Room</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-black cursor-pointer text-center"
                >
                  Close Reader
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRESS ROOM & EDITORIAL DESK MODAL (RESPONSIVE BOTTOM-SHEET ON MOBILE) */}
      {/* ========================================================================= */}
      {showEditorialModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowEditorialModal(false)}
        >
          <div 
            className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-0 sm:my-auto animate-in slide-in-from-bottom sm:slide-in-from-none sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="editorial-modal-title"
          >
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-stone-900 border-b border-stone-800">
              <div className="w-12 h-1.5 rounded-full bg-stone-600" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-red-950 p-4 sm:p-6 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h4 id="editorial-modal-title" className="font-black text-sm sm:text-base text-white">Press Room & Editorial Desk</h4>
                  <p className="text-[11px] sm:text-xs text-stone-300">
                    Managed by Press Club President ({presidentStudent?.name || 'Tiwa Adeleke'}) & Nominated Editors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorialModal(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 flex items-center justify-center transition cursor-pointer"
                aria-label="Close editorial desk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
              
              {/* Press Leadership & Editor Nomination Manager */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <h5 className="font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Press Club Leadership & Editorial Appointments</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Appoint Press Club President (Admin Authority) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Press Club President (Admin Appointment)
                    </label>
                    <select
                      value={pressClubPresidentStudentId || ''}
                      onChange={(e) => assignPressClubPresident(e.target.value || undefined)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>

                  {/* Nominate Editors */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nominate New Club Editor (President Privileges)
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          nominatePressClubEditor(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">+ Nominate Student Editor...</option>
                      {students
                        .filter(s => s.id !== pressClubPresidentStudentId && !pressClubEditorStudentIds.includes(s.id))
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Nominated Editors List */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-[11px] font-bold text-stone-500">Active Editorial Board:</span>
                  <span className="min-h-[36px] px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{presidentStudent?.name || 'Tiwa Adeleke'} (President)</span>
                  </span>
                  {editorStudents.map(e => (
                    <span 
                      key={e.id}
                      className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-800 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3 h-3 text-stone-600 shrink-0" />
                      <span>{e.name}</span>
                      <button
                        type="button"
                        onClick={() => removePressClubEditor(e.id)}
                        className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full hover:bg-stone-300 active:scale-95 text-stone-500 hover:text-red-600 font-black cursor-pointer flex items-center justify-center ml-0.5 touch-manipulation"
                        title="Remove editor"
                        aria-label={`Remove editor ${e.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Article Publishing Form */}
              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h5 className="font-black text-sm text-stone-900">
                    {editingArticleId ? 'Edit Article Dispatch' : 'Draft New Article Dispatch'}
                  </h5>
                  {editingArticleId && (
                    <button
                      type="button"
                      onClick={() => setEditingArticleId(null)}
                      className="min-h-[44px] px-3 py-2 text-xs text-red-600 font-bold hover:underline flex items-center cursor-pointer"
                    >
                      Cancel editing
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Article Headline *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Stanbax Scholars Triumph at National Mathematics Olympiad"
                    className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Desk / Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Author Byline & Role</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formAuthorName}
                        onChange={(e) => setFormAuthorName(e.target.value)}
                        placeholder="Author Name"
                        className="w-full h-11 min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <select
                        value={formAuthorRole}
                        onChange={(e) => setFormAuthorRole(e.target.value as any)}
                        className="w-full h-11 min-h-[44px] px-2.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="Press Club President">Press President</option>
                        <option value="Press Club Editor">Press Editor</option>
                        <option value="Staff Patron">Staff Patron</option>
                        <option value="Principal Administrator">Principal</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Cover Image URL</label>
                  <input
                    type="url"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Executive Summary / Excerpt</label>
                  <textarea
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence lead paragraph..."
                    className="w-full p-3.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Full Article Report Body *</label>
                  <textarea
                    rows={6}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Full article journalistic narrative. Separate paragraphs with double enter..."
                    className="w-full p-3.5 rounded-xl border border-stone-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="e.g. Science, WAEC, Championship"
                      className="w-full h-11 min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="chk-featured"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-5 h-5 rounded text-red-600 cursor-pointer"
                    />
                    <label htmlFor="chk-featured" className="text-xs font-bold text-stone-800 cursor-pointer select-none">
                      Feature as Main Headline Article
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditorialModal(false)}
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 active:scale-95 transition cursor-pointer flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 active:scale-95 text-white text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center"
                  >
                    {editingArticleId ? 'Update Article' : 'Publish Article to Gazette'}
                  </button>
                </div>
              </form>

              {/* Published Articles Management Table */}
              <div className="pt-6 border-t border-stone-200 space-y-3">
                <h5 className="font-black text-xs text-stone-900 uppercase tracking-wider">
                  Published Dispatch Archive ({newsArticles.length})
                </h5>

                <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto border border-stone-200 rounded-2xl bg-white">
                  {newsArticles.map(a => (
                    <div key={a.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-stone-900 truncate block text-xs sm:text-sm">{a.title}</span>
                        <span className="text-[10px] sm:text-xs text-stone-500">{a.category} • {a.author.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(a)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 flex items-center justify-center transition cursor-pointer touch-manipulation"
                          title="Edit"
                          aria-label={`Edit ${a.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${a.title}" from the news blog?`)) {
                              deleteNewsArticle(a.id);
                            }
                          }}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 flex items-center justify-center transition cursor-pointer touch-manipulation"
                          title="Delete"
                          aria-label={`Delete ${a.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditorialModal(false)}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-black transition cursor-pointer flex items-center justify-center"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
