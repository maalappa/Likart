import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  Percent,
  Clock,
  Check,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QuickCommerceItem, QuickCommerceCategory, QuickCommerceVariant } from '../../../types';
import { QUICK_COMMERCE_ITEMS, QUICK_COMMERCE_CATEGORIES } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';

interface MartProductsTabProps {
  products: QuickCommerceItem[];
  setProducts: React.Dispatch<React.SetStateAction<QuickCommerceItem[]>>;
  categories: QuickCommerceCategory[];
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartProductsTab: React.FC<MartProductsTabProps> = ({
  products,
  setProducts,
  categories,
  onLogAudit,
}) => {
  const { addNotification } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outstock'>('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    product?: QuickCommerceItem | null;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('dairy_breakfast');
  const [unit, setUnit] = useState('500 ml');
  const [price, setPrice] = useState(50);
  const [originalPrice, setOriginalPrice] = useState(60);
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [stockCount, setStockCount] = useState(50);
  const [deliveryTimeMins, setDeliveryTimeMins] = useState(10);
  const [description, setDescription] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);

  // Product Variants State
  const [enableVariants, setEnableVariants] = useState<boolean>(false);
  const [variants, setVariants] = useState<QuickCommerceVariant[]>([]);

  const handleAddVariant = () => {
    const currentPrice = Number(price) || 50;
    const currentMRP = Number(originalPrice) || 60;
    const newVar: QuickCommerceVariant = {
      id: `var-${Date.now().toString().slice(-5)}`,
      unit: unit ? `${unit} (Option ${variants.length + 1})` : `Pack ${variants.length + 1}`,
      label: '',
      price: currentPrice,
      originalPrice: currentMRP,
      discountPercent: currentMRP > currentPrice ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) : 0,
      inStock: true,
      stockCount: 40,
      isDefault: variants.length === 0,
    };
    setVariants((prev) => [...prev, newVar]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => {
      const filtered = prev.filter((v) => v.id !== id);
      if (filtered.length > 0 && !filtered.some((v) => v.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleVariantChange = (id: string, field: keyof QuickCommerceVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, [field]: val };
        if (field === 'price' || field === 'originalPrice') {
          const p = field === 'price' ? Number(val) : updated.price;
          const op = field === 'originalPrice' ? Number(val) : (updated.originalPrice || 0);
          if (op && op > p) {
            updated.discountPercent = Math.round(((op - p) / op) * 100);
          } else {
            updated.discountPercent = 0;
          }
        }
        return updated;
      })
    );
  };

  const handleSetDefaultVariant = (id: string) => {
    setVariants((prev) =>
      prev.map((v) => ({ ...v, isDefault: v.id === id }))
    );
  };

  const applyVariantPreset = (type: 'weights' | 'volumes' | 'packs') => {
    const baseP = Number(price) || 50;
    const baseMRP = Number(originalPrice) || 60;
    let presetList: QuickCommerceVariant[] = [];

    if (type === 'weights') {
      presetList = [
        { id: `var-250g-${Date.now().toString().slice(-4)}`, unit: '250 g', label: 'Small Pack', price: Math.round(baseP * 0.55), originalPrice: Math.round(baseMRP * 0.55), discountPercent: 10, inStock: true, stockCount: 30 },
        { id: `var-500g-${Date.now().toString().slice(-4)}`, unit: '500 g', label: 'Standard Pack', price: baseP, originalPrice: baseMRP, discountPercent: 12, inStock: true, stockCount: 50, isDefault: true },
        { id: `var-1kg-${Date.now().toString().slice(-4)}`, unit: '1 kg', label: 'Family Saver', price: Math.round(baseP * 1.85), originalPrice: Math.round(baseMRP * 1.95), discountPercent: 15, inStock: true, stockCount: 25 },
      ];
    } else if (type === 'volumes') {
      presetList = [
        { id: `var-250ml-${Date.now().toString().slice(-4)}`, unit: '250 ml', label: 'Single Serve', price: Math.round(baseP * 0.6), originalPrice: Math.round(baseMRP * 0.6), discountPercent: 5, inStock: true, stockCount: 40 },
        { id: `var-500ml-${Date.now().toString().slice(-4)}`, unit: '500 ml', label: 'Standard Bottle', price: baseP, originalPrice: baseMRP, discountPercent: 10, inStock: true, stockCount: 60, isDefault: true },
        { id: `var-1l-${Date.now().toString().slice(-4)}`, unit: '1 Litre', label: 'Value Pack', price: Math.round(baseP * 1.8), originalPrice: Math.round(baseMRP * 1.9), discountPercent: 15, inStock: true, stockCount: 30 },
      ];
    } else {
      presetList = [
        { id: `var-p1-${Date.now().toString().slice(-4)}`, unit: 'Single Pack (1 pc)', label: 'Standard', price: baseP, originalPrice: baseMRP, discountPercent: 5, inStock: true, stockCount: 50, isDefault: true },
        { id: `var-p2-${Date.now().toString().slice(-4)}`, unit: 'Pack of 2', label: 'Twin Pack (Save More)', price: Math.round(baseP * 1.9), originalPrice: Math.round(baseMRP * 2), discountPercent: 10, inStock: true, stockCount: 35 },
        { id: `var-p4-${Date.now().toString().slice(-4)}`, unit: 'Pack of 4', label: 'Mega Value Bundle', price: Math.round(baseP * 3.6), originalPrice: Math.round(baseMRP * 4), discountPercent: 15, inStock: true, stockCount: 20 },
      ];
    }
    setVariants(presetList);
    setEnableVariants(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.variants && p.variants.some((v) => v.unit.toLowerCase().includes(q) || v.label?.toLowerCase().includes(q)));
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'instock' && p.inStock) ||
        (stockFilter === 'outstock' && !p.inStock);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const openAddModal = () => {
    setName('');
    setBrand('Likart Mart');
    setCategory(categories[1]?.id || 'dairy_breakfast');
    setUnit('500g');
    setPrice(65);
    setOriginalPrice(80);
    setImage('');
    setIsVeg(true);
    setInStock(true);
    setStockCount(60);
    setDeliveryTimeMins(10);
    setDescription('High quality quick commerce essential with 10-minute dispatch SLA.');
    setIsBestseller(false);
    setEnableVariants(false);
    setVariants([]);
    setModalState({ isOpen: true, mode: 'add', product: null });
  };

  const openEditModal = (p: QuickCommerceItem) => {
    setName(p.name);
    setBrand(p.brand || 'Likart');
    setCategory(p.category);
    setUnit(p.unit || 'Pack');
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setImage(p.image);
    setIsVeg(p.isVeg);
    setInStock(p.inStock);
    setStockCount(p.stockCount ?? 45);
    setDeliveryTimeMins(p.deliveryTimeMins || 10);
    setDescription(p.description || '');
    setIsBestseller(!!p.isBestseller);
    const hasVars = Array.isArray(p.variants) && p.variants.length > 0;
    setEnableVariants(hasVars);
    setVariants(hasVars ? p.variants!.map((v) => ({ ...v })) : []);
    setModalState({ isOpen: true, mode: 'edit', product: p });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalPrice = Number(price);
    let finalOriginalPrice = Number(originalPrice);
    let finalUnit = unit.trim();
    let cleanedVariants: QuickCommerceVariant[] | undefined = undefined;

    if (enableVariants && variants.length > 0) {
      cleanedVariants = variants
        .filter((v) => v.unit.trim().length > 0)
        .map((v, idx) => {
          const vPrice = Number(v.price) || 1;
          const vMRP = Number(v.originalPrice) || vPrice;
          const vDiscount = vMRP > vPrice ? Math.round(((vMRP - vPrice) / vMRP) * 100) : 0;
          return {
            ...v,
            id: v.id || `var-${idx}-${Date.now().toString().slice(-4)}`,
            unit: v.unit.trim(),
            label: v.label?.trim() || undefined,
            price: vPrice,
            originalPrice: vMRP,
            discountPercent: vDiscount,
            stockCount: Number(v.stockCount ?? 40),
            inStock: v.inStock !== false,
            isDefault: !!v.isDefault,
          };
        });

      if (cleanedVariants.length > 0) {
        if (!cleanedVariants.some((v) => v.isDefault)) {
          cleanedVariants[0].isDefault = true;
        }
        const defaultVar = cleanedVariants.find((v) => v.isDefault) || cleanedVariants[0];
        finalPrice = defaultVar.price;
        finalOriginalPrice = defaultVar.originalPrice || defaultVar.price;
        finalUnit = defaultVar.unit;
      } else {
        cleanedVariants = undefined;
      }
    }

    const discountPercent =
      finalOriginalPrice > finalPrice
        ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
        : 0;

    if (modalState.mode === 'add') {
      const newId = `qc-${Date.now().toString().slice(-6)}`;
      const newProduct: QuickCommerceItem = {
        id: newId,
        name: name.trim(),
        brand: brand.trim(),
        category,
        unit: finalUnit,
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercent,
        image: image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        isVeg,
        inStock,
        stockCount: Number(stockCount),
        rating: 4.8,
        deliveryTimeMins: Number(deliveryTimeMins),
        description: description.trim(),
        isBestseller,
        variants: cleanedVariants,
      };

      setProducts((prev) => {
        const updated = [newProduct, ...prev];
        safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
        return updated;
      });

      addNotification(
        'Product Added',
        `${newProduct.name} ${cleanedVariants ? `(${cleanedVariants.length} variants)` : ''} added to Likart Mart catalog.`,
        'system'
      );
      onLogAudit(
        'CREATE',
        'Products',
        newId,
        `Added SKU ${newProduct.name} (${cleanedVariants ? `${cleanedVariants.length} variants` : `₹${finalPrice}, ${finalUnit}`})`
      );
    } else if (modalState.product) {
      setProducts((prev) => {
        const updated = prev.map((p) =>
          p.id === modalState.product!.id
            ? {
                ...p,
                name: name.trim(),
                brand: brand.trim(),
                category,
                unit: finalUnit,
                price: finalPrice,
                originalPrice: finalOriginalPrice,
                discountPercent,
                image: image.trim(),
                isVeg,
                inStock,
                stockCount: Number(stockCount),
                deliveryTimeMins: Number(deliveryTimeMins),
                description: description.trim(),
                isBestseller,
                variants: cleanedVariants,
              }
            : p
        );
        safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
        return updated;
      });

      addNotification(
        'Product Updated',
        `Changes saved for ${name.trim()} ${cleanedVariants ? `(${cleanedVariants.length} variants)` : ''}.`,
        'system'
      );
      onLogAudit(
        'UPDATE',
        'Products',
        modalState.product.id,
        `Updated details, pricing & variants for ${name.trim()}`
      );
    }

    setModalState({ isOpen: false, mode: 'add', product: null });
  };

  const handleDelete = (id: string, prodName: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
      return updated;
    });
    addNotification('Product Deleted', `${prodName} removed from catalog.`, 'warning');
    onLogAudit('DELETE', 'Products', id, `Deleted SKU ${prodName}`);
    setDeleteConfirmId(null);
  };

  const handleToggleStock = (id: string, currentStock: boolean) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, inStock: !currentStock } : p));
      safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
      return updated;
    });
    onLogAudit('UPDATE', 'Products', id, `Toggled in-stock status to ${!currentStock}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total SKUs in Catalog</span>
          <p className="text-2xl font-black font-heading text-slate-900">{products.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Quick-commerce inventory</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">In Stock Ready</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {products.filter((p) => p.inStock).length} SKUs
          </p>
          <span className="text-xs text-slate-500 font-medium block">Live for customer checkout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Out of Stock Alert</span>
          <p className="text-2xl font-black font-heading text-rose-600">
            {products.filter((p) => !p.inStock).length} SKUs
          </p>
          <span className="text-xs text-rose-500 font-bold block">Requires restocking</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bestseller Badges</span>
          <p className="text-2xl font-black font-heading text-amber-500">
            {products.filter((p) => p.isBestseller).length} Items
          </p>
          <span className="text-xs text-slate-500 font-medium block">Promoted on homepage</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, brand..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Aisles ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'instock', 'outstock'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStockFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  stockFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s === 'instock' ? 'In Stock' : s === 'outstock' ? 'Out of Stock' : 'All'}
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
          <span>Add New Product SKU</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Aisle / Category</th>
                <th className="py-3 px-4">Price & MRP</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Veg / Non-Veg</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No products found</p>
                    <p className="text-xs">Try selecting a different aisle or add a product</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.category);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              {p.isBestseller && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                  Top
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {p.brand} • {p.unit}
                            </span>
                            {p.variants && p.variants.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-black uppercase flex items-center gap-0.5">
                                  <Layers className="w-2.5 h-2.5" />
                                  <span>{p.variants.length} Variants</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                                  ({p.variants.map((v) => v.unit).join(', ')})
                                </span>
                              </div>
                            )}
                            <span className="text-[9px] text-emerald-600 font-semibold block font-mono mt-0.5">
                              ID: {p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <span>{cat?.icon || '📦'}</span>
                          <span>{cat?.name || p.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {p.variants && p.variants.length > 1 ? (
                          <div>
                            <div className="flex items-baseline gap-1 font-mono font-black text-slate-900 text-sm">
                              <span>₹{Math.min(...p.variants.map((v) => v.price))} - ₹{Math.max(...p.variants.map((v) => v.price))}</span>
                            </div>
                            <span className="text-[10px] text-purple-700 font-bold block">
                              {p.variants.length} Pack Sizes
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-slate-900 text-sm font-mono">₹{p.price}</span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[11px] text-slate-400 line-through font-mono">
                                ₹{p.originalPrice}
                              </span>
                            )}
                            {p.discountPercent ? (
                              <span className="text-[10px] text-emerald-600 font-bold">
                                ({p.discountPercent}% OFF)
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.variants && p.variants.length > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-xs text-slate-800 block">
                              {p.variants.reduce((acc, v) => acc + (v.stockCount ?? 0), 0)} units total
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              across {p.variants.length} pack options
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`font-mono font-bold text-xs ${
                              (p.stockCount ?? 0) <= 10 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {p.stockCount ?? 45} units
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            p.isVeg ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          {p.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(p.id, p.inStock)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition ${
                            p.inStock
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {p.inStock ? '● In Stock' : '○ Out of Stock'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit SKU"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id, p.name)}
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
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete SKU"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Package className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add New Product SKU' : 'Edit Product SKU'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', product: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amul Salted Butter"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Amul"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aisle / Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit / Pack Size</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. 500g, 1 Litre"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP / Original (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* PRODUCT VARIANTS / PACK SIZES MANAGEMENT SECTION              */}
              {/* ============================================================== */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-xl bg-purple-200/80 text-purple-900 font-bold">
                      <Layers className="w-4 h-4 text-purple-700" />
                    </span>
                    <div>
                      <span className="font-heading font-black text-slate-900 block text-xs">
                        Product Pack Sizes &amp; Variants
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Offer multiple weight, volume, or multipack options (e.g. 500g, 1kg, 2kg or 500ml, 1L)
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVariants}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEnableVariants(checked);
                        if (checked && variants.length === 0) {
                          setVariants([
                            {
                              id: `var-1-${Date.now().toString().slice(-4)}`,
                              unit: unit || '500 g',
                              label: 'Standard Pack',
                              price: Number(price) || 50,
                              originalPrice: Number(originalPrice) || 60,
                              discountPercent:
                                originalPrice > price
                                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                                  : 0,
                              inStock: true,
                              stockCount: Number(stockCount) || 50,
                              isDefault: true,
                            },
                          ]);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {enableVariants && (
                  <div className="space-y-3 pt-2.5 border-t border-purple-200/60 animate-in fade-in">
                    {/* Quick Presets Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-500">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => applyVariantPreset('weights')}
                          className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 font-bold rounded-lg transition"
                        >
                          + 250g, 500g, 1kg
                        </button>
                        <button
                          type="button"
                          onClick={() => applyVariantPreset('volumes')}
                          className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 font-bold rounded-lg transition"
                        >
                          + 250ml, 500ml, 1L
                        </button>
                        <button
                          type="button"
                          onClick={() => applyVariantPreset('packs')}
                          className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 font-bold rounded-lg transition"
                        >
                          + Multipack (1, 2, 4)
                        </button>
                      </div>

                      <span className="text-[10px] text-purple-700 font-bold">
                        {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'} active
                      </span>
                    </div>

                    {/* Variants list */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {variants.map((v, index) => (
                        <div
                          key={v.id}
                          className={`p-2.5 rounded-xl border text-xs transition space-y-2 ${
                            v.isDefault
                              ? 'bg-white border-purple-400 shadow-2xs ring-1 ring-purple-300'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center justify-center">
                                {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSetDefaultVariant(v.id)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black transition ${
                                  v.isDefault
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {v.isDefault ? '✓ Default Variant' : 'Set as Default'}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.id)}
                              disabled={variants.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 transition"
                              title="Delete variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Unit / Pack *
                              </label>
                              <input
                                type="text"
                                required
                                value={v.unit}
                                onChange={(e) => handleVariantChange(v.id, 'unit', e.target.value)}
                                placeholder="e.g. 1 kg or 500 ml"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Label / Badge
                              </label>
                              <input
                                type="text"
                                value={v.label || ''}
                                onChange={(e) => handleVariantChange(v.id, 'label', e.target.value)}
                                placeholder="e.g. Family Saver"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Selling Price (₹) *
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                value={v.price}
                                onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)}
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                MRP / Original (₹)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={v.originalPrice || v.price}
                                onChange={(e) =>
                                  handleVariantChange(v.id, 'originalPrice', e.target.value)
                                }
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold">Stock:</span>
                              <input
                                type="number"
                                min="0"
                                value={v.stockCount ?? 40}
                                onChange={(e) =>
                                  handleVariantChange(v.id, 'stockCount', Number(e.target.value))
                                }
                                className="w-16 p-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs"
                              />
                              <label className="flex items-center gap-1 cursor-pointer font-bold ml-1 text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={v.inStock !== false}
                                  onChange={(e) => handleVariantChange(v.id, 'inStock', e.target.checked)}
                                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                                />
                                <span>In Stock</span>
                              </label>
                            </div>

                            {v.discountPercent ? (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                                {v.discountPercent}% OFF
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-full py-2 bg-white hover:bg-purple-100/70 text-purple-700 font-bold text-xs rounded-xl border border-dashed border-purple-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Pack Size / Variant</span>
                    </button>
                  </div>
                )}
              </div>

              <PhotoUploadInput
                label="Product Photo"
                value={image}
                onChange={(photoUrl) => setImage(photoUrl)}
                martMode={true}
                helperText="Upload product image (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, BMP) from device, snap camera photo, or select from grocery library."
                required
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for customer product page..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Vegetarian Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Mark as In-Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Bestseller Tag</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', product: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Save Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
