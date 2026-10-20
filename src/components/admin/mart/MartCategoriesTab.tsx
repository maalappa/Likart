import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  AlertTriangle,
  X,
  Package,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QuickCommerceCategory, QuickCommerceItem } from '../../../types';
import { safeStorage } from '../../../utils/storageUtils';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';
import { VideoUploadInput } from '../../common/VideoUploadInput';

interface MartCategoriesTabProps {
  categories: QuickCommerceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<QuickCommerceCategory[]>>;
  products: QuickCommerceItem[];
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartCategoriesTab: React.FC<MartCategoriesTabProps> = ({
  categories,
  setCategories,
  products,
  onLogAudit,
}) => {
  const { addNotification } = useApp();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    category?: QuickCommerceCategory | null;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [badge, setBadge] = useState('FRESH');

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = search.toLowerCase().trim();
      return !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [categories, search]);

  const openAddModal = () => {
    setId(`cat_${Date.now().toString().slice(-4)}`);
    setName('');
    setIcon('🛒');
    setImage('');
    setVideoUrl('');
    setBadge('10 MINS');
    setModalState({ isOpen: true, mode: 'add', category: null });
  };

  const openEditModal = (c: QuickCommerceCategory) => {
    setId(c.id);
    setName(c.name);
    setIcon(c.icon);
    setImage(c.image);
    setVideoUrl(c.videoUrl || '');
    setBadge(c.badge || '');
    setModalState({ isOpen: true, mode: 'edit', category: c });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalState.mode === 'add') {
      const newCat: QuickCommerceCategory = {
        id: id.trim().toLowerCase().replace(/\s+/g, '_'),
        name: name.trim(),
        icon: icon.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        videoUrl: videoUrl.trim() || undefined,
        badge: badge.trim() || undefined,
      };

      setCategories((prev) => {
        const updated = [...prev, newCat];
        safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
        return updated;
      });

      addNotification('Aisle Created', `Category "${newCat.name}" is now live.`, 'system');
      onLogAudit('CREATE', 'Categories', newCat.id, `Created quick commerce category: ${newCat.name}`);
    } else if (modalState.category) {
      setCategories((prev) => {
        const updated = prev.map((c) =>
          c.id === modalState.category!.id
            ? {
                ...c,
                name: name.trim(),
                icon: icon.trim(),
                image: image.trim(),
                videoUrl: videoUrl.trim() || undefined,
                badge: badge.trim() || undefined,
              }
            : c
        );
        safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
        return updated;
      });

      addNotification('Aisle Updated', `Updated category "${name.trim()}".`, 'system');
      onLogAudit('UPDATE', 'Categories', modalState.category.id, `Modified category: ${name.trim()}`);
    }

    setModalState({ isOpen: false, mode: 'add', category: null });
  };

  const handleDelete = (catId: string, catName: string) => {
    if (catId === 'all') {
      addNotification('Protected Category', '"All Aisles" cannot be deleted.', 'warning');
      setDeleteConfirmId(null);
      return;
    }

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
      return updated;
    });

    addNotification('Aisle Deleted', `Category "${catName}" has been removed.`, 'warning');
    onLogAudit('DELETE', 'Categories', catId, `Deleted category ${catName}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Aisles / Categories</span>
          <p className="text-2xl font-black font-heading text-slate-900">{categories.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Live shopping taxonomy</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active SKUs Covered</span>
          <p className="text-2xl font-black font-heading text-purple-600">{products.length} SKUs</p>
          <span className="text-xs text-slate-500 font-medium block">Across all pods</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Promoted Badges</span>
          <p className="text-2xl font-black font-heading text-amber-500">
            {categories.filter((c) => c.badge).length} Aisles
          </p>
          <span className="text-xs text-slate-500 font-medium block">Special 10m tags</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search aisle name or slug..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category Aisle</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;

          return (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
            >
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-100 border border-slate-100">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs">
                    <span>{c.icon}</span>
                    <span className="font-mono text-[10px] text-slate-600 uppercase">{c.id}</span>
                  </div>

                  {c.badge && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-xs">
                      {c.badge}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 leading-tight">{c.name}</h4>
                  <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                    {count} catalog items linked
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {c.id !== 'all' && (
                    <>
                      {deleteConfirmId === c.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-500"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add New Category Aisle' : 'Edit Category Aisle'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', category: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Aisle / Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dairy, Bread & Eggs"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🥛"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-base"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promo Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. FRESH, 10 MINS"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold"
                  />
                </div>
              </div>

              <PhotoUploadInput
                label="Category Cover Photo"
                value={image}
                onChange={(photoUrl) => setImage(photoUrl)}
                categoryMode={true}
                martMode={true}
                helperText="Upload category cover photo (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, BMP) from device or select from aisle library."
                required
              />

              <VideoUploadInput
                label="Category Video Clip / Motion Reel (Optional)"
                value={videoUrl}
                onChange={setVideoUrl}
                categoryMode={true}
                martMode={true}
                helperText="Upload category motion clip or pick sample fresh food reel. Auto-plays in customer mart category aisles."
              />

              {modalState.mode === 'add' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Slug ID</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. dairy_breakfast"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', category: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
