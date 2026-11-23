import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, FolderOpen, FolderGit2, Download, FileText, Video, 
  Link as LinkIcon, Search, Eye, Filter, ArrowUpDown, Clock, 
  ExternalLink, X, FileCode
} from 'lucide-react';
import { formatPhDate } from '../../utils/dateUtils';

// Helper for human-readable file sizes
function formatFileSize(sizeInKb) {
  if (!sizeInKb || sizeInKb === 0) return '1.2 MB';
  if (sizeInKb >= 1024) {
    return `${(sizeInKb / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(sizeInKb)} KB`;
}

// Helper for type metadata (icons, colors, badges)
function getDocTypeMeta(type) {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return {
        icon: FileText,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200/60',
        badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
        label: 'PDF'
      };
    case 'doc':
    case 'docx':
    case 'text':
      return {
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200/60',
        badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
        label: 'DOC'
      };
    case 'video':
      return {
        icon: Video,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200/60',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
        label: 'VIDEO'
      };
    case 'code':
      return {
        icon: FileCode,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200/60',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        label: 'CODE'
      };
    case 'link':
    default:
      return {
        icon: LinkIcon,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200/60',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
        label: 'LINK'
      };
  }
}

// Preset color themes for course folder cards
const FOLDER_THEMES = [
  { iconBg: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { iconBg: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
  { iconBg: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { iconBg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  { iconBg: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  { iconBg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' }
];

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search & Sort
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const [matRes, cRes] = await Promise.all([
          fetch('/api/materials', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (matRes.ok) setMaterials(await matRes.json());
        if (cRes.ok) setCourses(await cRes.json());
      } catch (err) {
        console.error('Failed to load materials data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Folder Metrics (Count and Storage size per course)
  const folderMetrics = useMemo(() => {
    const metrics = {};
    materials.forEach((m) => {
      const cId = String(m.course_id);
      if (!metrics[cId]) {
        metrics[cId] = { count: 0, totalKb: 0 };
      }
      metrics[cId].count += 1;
      metrics[cId].totalKb += (m.file_size || 1024);
    });
    return metrics;
  }, [materials]);

  // Filtered & Sorted Materials
  const filteredMaterials = useMemo(() => {
    let result = materials.filter((m) => {
      const matchesCourse = !selectedCourseFilter || String(m.course_id) === String(selectedCourseFilter);
      const matchesType = selectedTypeFilter === 'all' || (m.file_type || 'pdf').toLowerCase() === selectedTypeFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        m.title.toLowerCase().includes(q) || 
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.course_title && m.course_title.toLowerCase().includes(q)) ||
        (m.uploader_name && m.uploader_name.toLowerCase().includes(q));

      return matchesCourse && matchesType && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'size-desc') return (b.file_size || 0) - (a.file_size || 0);
      return 0;
    });

    return result;
  }, [materials, selectedCourseFilter, selectedTypeFilter, searchQuery, sortBy]);

  // Recent Documents (top 4 latest items)
  const recentDocuments = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [materials]);

  return (
    <div className="space-y-6">

      {/* =========================================================================
          A. PAGE HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Course Repository
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                • Documents & Learning Library
              </span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
              Documents
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Explore and download lecture notes, architectural templates, study guides, and reading references provided by your instructors.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            <span className="text-blue-600 font-bold">{materials.length}</span> Documents Available
          </div>
        </div>

        {/* Subtle Divider below heading per Section 2.A */}
        <hr className="mt-5 border-slate-100" />
      </div>

      {/* =========================================================================
          B. ACTION TOOLBAR
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search documents by title, keyword, or instructor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Filters & Sort By */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Course Folder Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Folder:</span>
            <select 
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="">All Course Folders</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Type:</span>
            <select 
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF Documents</option>
              <option value="doc">Word / Documents</option>
              <option value="video">Video Lectures</option>
              <option value="code">Code Assets</option>
              <option value="link">Web References</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Size (Largest)</option>
            </select>
          </div>

          {/* Active filter reset */}
          {(selectedCourseFilter || selectedTypeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCourseFilter('');
                setSelectedTypeFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* =========================================================================
          C. FOLDERS SECTION
      ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <h2 className="font-heading font-bold text-sm text-slate-900 tracking-tight">
              Course Folders
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              ({courses.length} folders)
            </span>
          </div>

          {selectedCourseFilter && (
            <button 
              onClick={() => setSelectedCourseFilter('')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View all folders</span>
            </button>
          )}
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {courses.map((course, idx) => {
            const isSelected = String(selectedCourseFilter) === String(course.id);
            const theme = FOLDER_THEMES[idx % FOLDER_THEMES.length];
            const metrics = folderMetrics[String(course.id)] || { count: 0, totalKb: 0 };

            return (
              <div 
                key={course.id}
                onClick={() => {
                  setSelectedCourseFilter(isSelected ? '' : String(course.id));
                }}
                className={`
                  bg-white rounded-2xl p-4 border transition-all cursor-pointer relative group
                  hover:-translate-y-0.5 hover:shadow-md
                  ${isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs' 
                    : 'border-slate-100 hover:border-slate-200 shadow-xs'}
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`p-2.5 rounded-xl ${theme.iconBg} transition-transform group-hover:scale-105`}>
                    <Folder className="w-5 h-5" />
                  </div>
                  
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-50">
                  <span className="font-medium text-slate-500">
                    {metrics.count} {metrics.count === 1 ? 'file' : 'files'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {formatFileSize(metrics.totalKb)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          D. RECENT DOCUMENTS
      ========================================================================= */}
      {recentDocuments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="font-heading font-bold text-sm text-slate-900 tracking-tight">
                Recent Documents
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                (Latest additions)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentDocuments.map((doc) => {
              const meta = getDocTypeMeta(doc.file_type);
              const DocIcon = meta.icon;

              return (
                <div 
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${meta.bg} ${meta.color} shrink-0 group-hover:scale-105 transition-transform`}>
                      <DocIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-bold text-xs text-slate-800 truncate group-hover:text-blue-600 transition-colors" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {doc.course_title || 'General Curriculum'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                    <span>{formatPhDate(doc.created_at)}</span>
                    <span className="font-mono font-medium text-slate-500">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          E. ALL FILES SECTION (DOCUMENT TABLE)
      ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table Header Section */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 tracking-tight">
              All Files
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Showing {filteredMaterials.length} of {materials.length} total documents
              {selectedCourseFilter && ' (Filtered by folder)'}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Active view: <span className="font-bold text-slate-800">{sortBy.toUpperCase()}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading document library...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No files match your current filters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Document Name</th>
                  <th className="py-3 px-4">Folder / Course</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Size</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredMaterials.map((doc) => {
                  const meta = getDocTypeMeta(doc.file_type);
                  const DocIcon = meta.icon;

                  return (
                    <tr 
                      key={doc.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Document Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${meta.bg} ${meta.color} shrink-0`}>
                            <DocIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="font-heading font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors text-left truncate cursor-pointer hover:underline"
                              >
                                {doc.title}
                              </button>
                              <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </div>
                            {doc.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Folder / Course */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 font-medium text-[11px] max-w-[200px] truncate">
                          <Folder className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.course_title}</span>
                        </span>
                      </td>

                      {/* Uploaded By */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px]">
                            {doc.uploader_name ? doc.uploader_name.charAt(0) : 'T'}
                          </div>
                          <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">
                            {doc.uploader_name || 'Faculty Instructor'}
                          </span>
                        </div>
                      </td>

                      {/* Date Added */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                        {formatPhDate(doc.created_at)}
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
                        {formatFileSize(doc.file_size)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Interactive Preview */}
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Interactive Document Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Open / Download */}
                          <a
                            href={doc.external_url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Open / Download Source File"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* =========================================================================
          INTERACTIVE DOCUMENT PREVIEW MODAL
      ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl ${getDocTypeMeta(previewDoc.file_type).bg} ${getDocTypeMeta(previewDoc.file_type).color}`}>
                  {React.createElement(getDocTypeMeta(previewDoc.file_type).icon, { className: 'w-5 h-5' })}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 truncate">
                    {previewDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{previewDoc.course_title}</span>
                    <span>•</span>
                    <span className="font-mono">{formatFileSize(previewDoc.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded by {previewDoc.uploader_name || 'Faculty'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={previewDoc.external_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Interactive Preview Frame */}
            <div className="flex-1 bg-slate-900/5 p-4 sm:p-6 overflow-y-auto min-h-[350px] flex flex-col justify-center items-center">
              {previewDoc.file_type === 'pdf' || (previewDoc.external_url && previewDoc.external_url.endsWith('.pdf')) ? (
                <div className="w-full h-full min-h-[420px] bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      Interactive Document Reader
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">PDF Reader Frame</span>
                  </div>
                  <iframe 
                    src={previewDoc.external_url} 
                    title={previewDoc.title}
                    className="w-full flex-1 min-h-[380px] border-none"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    {React.createElement(getDocTypeMeta(previewDoc.file_type).icon, { className: 'w-7 h-7' })}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-900">{previewDoc.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {previewDoc.description || 'This course material is hosted online or in the course repository.'}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <a
                      href={previewDoc.external_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Open External Resource</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>Date Added: {formatPhDate(previewDoc.created_at)}</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
