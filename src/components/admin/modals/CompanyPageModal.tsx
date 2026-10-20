import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Plus } from 'lucide-react';
import { CustomCompanyPage } from '../../../types';

interface CompanyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  page?: CustomCompanyPage | null;
}

export const CompanyPageModal: React.FC<CompanyPageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  page,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'company' | 'legal' | 'support' | 'compliance'>('legal');
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState('October 2026');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (page && mode === 'edit') {
      setTitle(page.title);
      setSlug(page.slug);
      setSubtitle(page.subtitle || '');
      setCategory(page.category || 'legal');
      setContent(page.content);
      setLastUpdated(page.lastUpdated || 'October 2026');
      setEnabled(page.enabled !== false);
    } else {
      setTitle('');
      setSlug('');
      setSubtitle('');
      setCategory('legal');
      setContent('');
      setLastUpdated(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      setEnabled(true);
    }
  }, [page, mode, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (mode === 'add') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSlug = (slug.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      .replace(/^-+|-+$/g, '');

    onSave({
      ...(page?.id ? { id: page.id } : {}),
      title: title.trim(),
      slug: finalSlug,
      subtitle: subtitle.trim(),
      category,
      content: content.trim(),
      lastUpdated: lastUpdated.trim() || 'October 2026',
      enabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">
                {mode === 'add' ? 'Create New Company Document / Policy' : 'Edit Company Page'}
              </h3>
              <p className="text-xs text-slate-500">
                Published to customer footer links and viewable on the public portal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Grievance Officer & Legal Notice"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                URL Identifier / Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. grievance-policy"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
              >
                <option value="legal">Legal & Statutory</option>
                <option value="company">Company & Corporate</option>
                <option value="support">Customer Support & Grievance</option>
                <option value="compliance">Compliance & Food Safety</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Last Updated Date</label>
              <input
                type="text"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Subtitle / Summary</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief description or purpose of this document"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Full Policy / Page Content <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write or paste full policy terms, statutory disclosures, addresses, or details here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 font-sans leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-bold text-slate-800">
                  Publish to Customer Footer (Active)
                </span>
                <span className="text-slate-400 text-[11px] ml-auto">
                  {enabled ? 'Visible to public' : 'Draft / Hidden from public'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Create & Add Page' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
