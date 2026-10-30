import React from 'react';
import {
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Plus,
  X,
  Database,
} from 'lucide-react';
import { ProductCategory } from '../types/product';

interface NavbarProps {
  storeName?: string;
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenAddProduct: () => void;
  onOpenStoreSettings: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Semua',
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

export const Navbar: React.FC<NavbarProps> = ({
  storeName = 'TAS GROSIR IMPORT',
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  isAdminMode,
  onToggleAdminMode,
  onOpenAddProduct,
  onOpenStoreSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row: 3 Balanced Zones */}
        <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
          {/* Left Zone: Desktop Category Navigation */}
          <nav
            aria-label="Kategori Produk"
            className="hidden lg:flex items-center gap-5 flex-1 min-w-0"
          >
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className={`relative py-1 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {category}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Center Zone: Prominent Centered Brand Wordmark */}
          <div className="flex items-center justify-start lg:justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('Semua');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group text-left lg:text-center focus:outline-none cursor-pointer"
            >
              <span className="block font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 uppercase">
                {storeName || 'TAS GROSIR IMPORT'}
              </span>
            </button>
          </div>

          {/* Right Zone: Search Input, Admin Mode Button & Shopping Cart Icon */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative w-36 sm:w-52 xl:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nama / SKU..."
                aria-label="Cari produk atau kode SKU"
                className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white text-zinc-900 placeholder:text-zinc-500 rounded-lg border border-transparent focus:border-zinc-900 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Admin Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleAdminMode}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isAdminMode
                  ? 'bg-amber-400 text-zinc-950 shadow-sm ring-2 ring-zinc-950'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
              }`}
              title="Aktifkan atau nonaktifkan Panel Admin untuk tambah/edit/hapus produk"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>{isAdminMode ? 'Admin Aktif' : 'Admin Mode'}</span>
            </button>

            {/* Quick Add Product Button when Admin Mode is ON */}
            {isAdminMode && (
              <>
                <button
                  type="button"
                  onClick={onOpenAddProduct}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Produk Baru</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenStoreSettings}
                  className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Koneksi Database Supabase"
                >
                  <Database className="w-4 h-4" />
                  <span>Supabase</span>
                </button>
              </>
            )}

            {/* Shopping Cart Button with Item Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Keranjang Belanja (${cartCount} item)`}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center border-2 border-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Category Strip */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto py-2 border-t border-zinc-100 no-scrollbar">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
