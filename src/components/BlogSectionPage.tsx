import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  Tag,
  User,
  Edit3,
  Trash2,
  Plus,
  MessageCircle,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';
import { BlogArticle, StoreConfig } from '../types/product';
import { createHeroLookbookSvg } from '../utils/bagStudioSvg';

interface BlogSectionPageProps {
  articles: BlogArticle[];
  selectedArticle: BlogArticle | null;
  onSelectArticle: (article: BlogArticle | null) => void;
  onBackToCatalog: () => void;
  storeConfig: StoreConfig;
  isAdminMode: boolean;
  onOpenAdminArticleManager: (articleToEdit?: BlogArticle) => void;
  onDeleteArticle: (articleId: string) => void;
}

export const BlogSectionPage: React.FC<BlogSectionPageProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  onBackToCatalog,
  storeConfig,
  isAdminMode,
  onOpenAdminArticleManager,
  onDeleteArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(articles.map((a) => a.category.trim()).filter(Boolean))
    );
    return ['Semua', ...unique];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory =
        selectedCategory === 'Semua' || art.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Rich content block parser supporting Paragraphs, Subheadings (## ), Bullet lists (- / • / *), and Numbered points
  const renderFormattedContent = (rawContent: string) => {
    const blocks = rawContent
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map((block, index) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // Subheading block (starts with ## or ###)
      if (
        lines.length === 1 &&
        (lines[0].startsWith('## ') || lines[0].startsWith('### '))
      ) {
        const headingText = lines[0].replace(/^#{2,3}\s+/, '');
        return (
          <h2
            key={index}
            className="text-lg sm:text-xl font-black text-stone-900 tracking-tight pt-3 pb-1 border-l-4 border-amber-500 pl-3.5"
          >
            {headingText}
          </h2>
        );
      }

      // Check if lines are bullet points
      const isBulletList =
        lines.length > 0 &&
        lines.every((l) => /^([-•*])\s+/.test(l));

      if (isBulletList) {
        return (
          <ul
            key={index}
            className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-3 my-2"
          >
            {lines.map((line, lineIdx) => {
              const cleanText = line.replace(/^([-•*])\s+/, '');
              const colonIdx = cleanText.indexOf(':');
              const hasBoldPrefix = colonIdx > 0 && colonIdx < 45;

              return (
                <li
                  key={lineIdx}
                  className="flex items-start gap-3 text-sm sm:text-base text-stone-700 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    {hasBoldPrefix ? (
                      <>
                        <strong className="font-bold text-stone-900">
                          {cleanText.slice(0, colonIdx + 1)}
                        </strong>
                        {cleanText.slice(colonIdx + 1)}
                      </>
                    ) : (
                      cleanText
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Check if lines are numbered list
      const isNumberedList =
        lines.length > 0 &&
        lines.every((l) => /^\d+[.)]\s+/.test(l));

      if (isNumberedList) {
        return (
          <ol
            key={index}
            className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3 my-2"
          >
            {lines.map((line, lineIdx) => {
              const cleanText = line.replace(/^\d+[.)]\s+/, '');
              return (
                <li
                  key={lineIdx}
                  className="flex items-start gap-3 text-sm sm:text-base text-stone-700 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-lg bg-stone-900 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {lineIdx + 1}
                  </span>
                  <span>{cleanText}</span>
                </li>
              );
            })}
          </ol>
        );
      }

      // Mixed block where first line might be a heading and following lines are paragraph/bullets
      if (lines[0]?.startsWith('## ')) {
        const headingText = lines[0].replace(/^#{2,3}\s+/, '');
        const restLines = lines.slice(1);
        return (
          <div key={index} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight pt-2 border-l-4 border-amber-500 pl-3.5">
              {headingText}
            </h2>
            {restLines.map((rl, rIdx) => (
              <p
                key={rIdx}
                className="text-stone-700 text-sm sm:text-base leading-relaxed"
              >
                {rl.replace(/^([-•*])\s+/, '• ')}
              </p>
            ))}
          </div>
        );
      }

      // Standard paragraph
      return (
        <p
          key={index}
          className="text-stone-700 text-sm sm:text-[16px] leading-relaxed"
        >
          {lines.join(' ')}
        </p>
      );
    });
  };

  // DETAIL ARTICLE VIEW (Halaman Baca Artikel)
  if (selectedArticle) {
    const relatedArticles = articles
      .filter((a) => a.id !== selectedArticle.id)
      .slice(0, 3);

    const handleShareArticle = () => {
      try {
        navigator.clipboard.writeText(
          `${selectedArticle.title} - ${storeConfig.storeName} (${window.location.href})`
        );
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch {
        // ignore
      }
    };

    const handleConsultWa = () => {
      const cleanPhone = storeConfig.whatsappNumber.replace(/\D/g, '');
      const text = encodeURIComponent(
        `Halo Admin ${storeConfig.storeName}, saya baru membaca artikel *"${selectedArticle.title}"* dan ingin berkonsultasi mengenai program Reseller / Grosir Tas Import.`
      );
      window.open(
        `https://wa.me/${cleanPhone}?text=${text}`,
        '_blank',
        'noopener,noreferrer'
      );
    };

    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectArticle(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-900 text-stone-800 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              Kembali ke Daftar Artikel
            </button>
            <button
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Katalog Produk
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareArticle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Tautan Disalin
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  Bagikan Artikel
                </>
              )}
            </button>

            {isAdminMode && (
              <button
                onClick={() => onOpenAdminArticleManager(selectedArticle)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Artikel Ini
              </button>
            )}
          </div>
        </div>

        {/* Main Article Card Container */}
        <article className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden">
          {/* Article Header Banner Image */}
          <div className="relative h-64 sm:h-88 md:h-96 bg-stone-900 overflow-hidden">
            <img
              src={selectedArticle.imageUrl || createHeroLookbookSvg(0)}
              alt={selectedArticle.title}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = createHeroLookbookSvg(0);
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
                  <Tag className="w-3 h-3" />
                  {selectedArticle.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-stone-200 text-xs font-medium border border-white/15">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {selectedArticle.publishedAt}
                </span>
                {selectedArticle.readTime && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-stone-200 text-xs font-medium border border-white/15">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {selectedArticle.readTime}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-2 mt-4 text-xs text-stone-300">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Ditulis oleh{' '}
                  <strong className="text-white font-semibold">
                    {selectedArticle.author || 'Tim Edukasi Bisnis TGI'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 sm:p-8 md:p-12 space-y-6">
            {/* Highlighted Excerpt / Ringkasan */}
            {selectedArticle.excerpt && (
              <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-2xl p-4 sm:p-5">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-1">
                  Ringkasan Artikel
                </p>
                <p className="text-sm sm:text-base font-semibold text-stone-800 leading-relaxed">
                  {selectedArticle.excerpt}
                </p>
              </div>
            )}

            {/* Formatted Article Content */}
            <div className="space-y-4">
              {renderFormattedContent(selectedArticle.content)}
            </div>

            {/* Bottom B2B Reseller Consultation Callout */}
            <div className="mt-10 pt-8 border-t border-stone-200">
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-6 sm:p-7 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mulai Kulakan Tas Import Tangan Pertama
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Siap Praktekkan Strategi Ini di Toko Anda?
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                    Dapatkan harga grosir pabrik mulai 6 pcs (bebas campur model
                    & warna) atau konsultasikan ongkir kargo karungan langsung
                    bersama tim admin gudang TGI.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={onBackToCatalog}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Lihat Katalog Produk
                  </button>
                  <button
                    onClick={handleConsultWa}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition-all shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Konsultasi WA Reseller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                Artikel & Tips Bisnis Lainnya
              </h3>
              <button
                onClick={() => onSelectArticle(null)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua ({articles.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectArticle(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl border border-stone-200/80 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-36 bg-stone-900 overflow-hidden relative">
                    <img
                      src={rel.imageUrl || createHeroLookbookSvg(1)}
                      alt={rel.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = createHeroLookbookSvg(1);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-stone-400 mb-1">
                        {rel.publishedAt}
                      </p>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-3">
                      Baca Selengkapnya
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // BLOG LIST VIEW (Halaman Daftar Artikel)
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb & Back to Catalog */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-900 text-stone-800 font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
            Kembali ke Katalog Produk
          </button>
          <span className="text-stone-300">/</span>
          <span className="font-bold text-stone-800">
            Artikel & Tips Bisnis Grosir Tas
          </span>
        </div>

        {isAdminMode && (
          <button
            onClick={() => onOpenAdminArticleManager()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah / Kelola Artikel SEO
          </button>
        )}
      </div>

      {/* Blog SEO Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white p-6 sm:p-10 mb-8 overflow-hidden border border-stone-800 shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            PUSAT EDUKASI RESELLER & BLOG SEO TAS GROSIR IMPORT
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Artikel & Tips Bisnis Tas Import Tangan Pertama
          </h1>
          <p className="text-stone-300 text-xs sm:text-base leading-relaxed">
            Panduan strategi kulakan grosir, tips memilih ekspedisi kargo
            karungan termurah, hingga riset model tas wanita paling laris untuk
            mitra reseller dan pemilik toko di seluruh Indonesia.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik artikel atau tips..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Article Cards Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-stone-900 mb-1">
            Belum Ada Artikel yang Sesuai
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Coba kata kunci pencarian lain atau tambahkan artikel baru melalui
            Master Panel Admin.
          </p>
          {isAdminMode && (
            <button
              onClick={() => onOpenAdminArticleManager()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Artikel Baru
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Image */}
              <div
                onClick={() => {
                  onSelectArticle(article);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative h-52 bg-stone-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={
                    article.imageUrl ||
                    createHeroLookbookSvg((idx % 3) as 0 | 1 | 2)
                  }
                  alt={article.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = createHeroLookbookSvg((idx % 3) as 0 | 1 | 2);
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {article.category}
                  </span>
                </div>

                {article.readTime && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {article.readTime}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {article.publishedAt}
                    </span>
                    {article.author && (
                      <>
                        <span>•</span>
                        <span className="truncate">{article.author}</span>
                      </>
                    )}
                  </div>

                  <h2
                    onClick={() => {
                      onSelectArticle(article);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-base sm:text-lg font-black text-stone-900 group-hover:text-amber-700 transition-colors leading-snug mb-2.5 cursor-pointer line-clamp-2"
                  >
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <button
                    onClick={() => {
                      onSelectArticle(article);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Admin Quick Controls */}
                  {isAdminMode && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onOpenAdminArticleManager(article)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Artikel
                      </button>

                      {confirmDeleteId === article.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteArticle(article.id);
                              setConfirmDeleteId(null);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="py-1.5 px-2 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(article.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
