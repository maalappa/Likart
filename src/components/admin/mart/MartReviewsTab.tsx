import React, { useState, useMemo } from 'react';
import {
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MessageSquare,
  Eye,
  EyeOff,
  Store,
  Phone,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MartReview } from '../../../types';
import { INITIAL_MART_REVIEWS } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';

interface MartReviewsTabProps {
  reviews: MartReview[];
  setReviews: React.Dispatch<React.SetStateAction<MartReview[]>>;
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartReviewsTab: React.FC<MartReviewsTabProps> = ({
  reviews,
  setReviews,
  onLogAudit,
}) => {
  const { addNotification, darkStores } = useApp();

  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    review?: MartReview | null;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [podStoreName, setPodStoreName] = useState(darkStores[0]?.name || 'Central Pod Hub #01');
  const [orderId, setOrderId] = useState(`ORD-MART-${Math.floor(1000 + Math.random() * 9000)}`);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<MartReview['status']>('published');

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q);
      const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const openAddModal = () => {
    setCustomerName('');
    setCustomerPhone('+91 ');
    setRating(5);
    setComment('');
    setPodStoreName(darkStores[0]?.name || 'Central Pod Hub #01');
    setOrderId(`ORD-MART-${Math.floor(1000 + Math.random() * 9000)}`);
    setReply('');
    setStatus('published');
    setModalState({ isOpen: true, mode: 'add', review: null });
  };

  const openEditModal = (r: MartReview) => {
    setCustomerName(r.customerName);
    setCustomerPhone(r.customerPhone || '');
    setRating(r.rating);
    setComment(r.comment);
    setPodStoreName(r.podStoreName || darkStores[0]?.name || 'Central Pod Hub');
    setOrderId(r.orderId);
    setReply(r.reply || '');
    setStatus(r.status);
    setModalState({ isOpen: true, mode: 'edit', review: r });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    if (modalState.mode === 'add') {
      const newId = `rev-${Date.now().toString().slice(-4)}`;
      const newReview: MartReview = {
        id: newId,
        orderId: orderId.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        podStoreName: podStoreName.trim(),
        reply: reply.trim() || undefined,
        status,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setReviews((prev) => {
        const updated = [newReview, ...prev];
        safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
        return updated;
      });

      addNotification('Review Added', `Customer review recorded for order ${orderId}.`, 'system');
      onLogAudit('CREATE', 'Reviews', newId, `Added review from ${customerName} (${rating} stars)`);
    } else if (modalState.review) {
      setReviews((prev) => {
        const updated = prev.map((r) =>
          r.id === modalState.review!.id
            ? {
                ...r,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                rating: Number(rating),
                comment: comment.trim(),
                podStoreName: podStoreName.trim(),
                reply: reply.trim() || undefined,
                status,
              }
            : r
        );
        safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
        return updated;
      });

      addNotification('Review Updated', 'Review and official reply updated.', 'system');
      onLogAudit('UPDATE', 'Reviews', modalState.review.id, `Updated review status & reply for ${customerName}`);
    }

    setModalState({ isOpen: false, mode: 'add', review: null });
  };

  const handleDelete = (id: string, reviewer: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
      return updated;
    });

    addNotification('Review Deleted', `Review by ${reviewer} removed.`, 'warning');
    onLogAudit('DELETE', 'Reviews', id, `Deleted review by ${reviewer}`);
    setDeleteConfirmId(null);
  };

  const handleTogglePublish = (id: string, currentStatus: MartReview['status']) => {
    const nextStatus: MartReview['status'] = currentStatus === 'published' ? 'hidden' : 'published';
    setReviews((prev) => {
      const updated: MartReview[] = prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r));
      safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
      return updated;
    });
    onLogAudit('UPDATE', 'Reviews', id, `Toggled review visibility to ${nextStatus}`);
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / Math.max(1, reviews.length)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Store Rating</span>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black font-heading text-amber-500">{avgRating} ★</p>
            <span className="text-xs text-slate-400 font-bold">({reviews.length} ratings)</span>
          </div>
          <span className="text-xs text-emerald-600 font-bold block">10-minute grocery service</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Published Live</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {reviews.filter((r) => r.status === 'published').length} Verified
          </p>
          <span className="text-xs text-slate-500 font-medium block">Visible to customers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Replied by Ops</span>
          <p className="text-2xl font-black font-heading text-blue-600">
            {reviews.filter((r) => r.reply).length} Replied
          </p>
          <span className="text-xs text-slate-500 font-medium block">Customer feedback addressed</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviewer or comment..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', '5', '4', '3'] as const).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingFilter(star as any)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  ratingFilter === star ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {star === 'all' ? 'All Stars' : `${star} ★`}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer Review</span>
        </button>
      </div>

      {/* List of Reviews */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="font-bold text-sm">No reviews found</p>
            <p className="text-xs">Adjust filter or add a customer review</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs border border-amber-200 uppercase">
                      {rev.customerName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rev.customerName}</span>
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Order #{rev.orderId} • {rev.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(rev.id, rev.status)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition ${
                        rev.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rev.status === 'published' ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(rev)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit review"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === rev.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id, rev.customerName)}
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
                        onClick={() => setDeleteConfirmId(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  "{rev.comment}"
                </p>

                {rev.reply && (
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[11px] text-emerald-900 block">
                        Official Pod Response:
                      </span>
                      <p className="text-xs text-emerald-800">{rev.reply}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
                  <Star className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add Verified Customer Review' : 'Edit Review & Post Reply'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', review: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ananya Iyer"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Star Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-600"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Feedback on 10-minute grocery delivery..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Management Reply</label>
                <textarea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Thank you for your order! We are glad the groceries arrived fresh..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', review: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
