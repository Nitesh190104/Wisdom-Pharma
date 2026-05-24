import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineOfficeBuilding, 
  HiOutlineBadgeCheck, 
  HiOutlineTruck,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineRefresh,
} from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';
import { siteContentService } from '../services';
import toast from 'react-hot-toast';

// ─── Icon registry (non-serialisable, so kept client-side) ────────────────
const ICON_MAP = {
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineClock,
};

// ─── Default content ──────────────────────────────────────────────────────
const DEFAULTS = {
  hero: {
    tagline: '📍 Varanasi, Uttar Pradesh',
    heading: 'About Wisdom Pharma',
    subheading:
      "Varanasi's leading pharmaceutical wholesaler and distributor. Bridging manufacturers and healthcare centers with temperature-controlled, authentic, and fast distribution of life-saving medical supplies.",
  },
  mission: {
    para1: 'Established as a premium pharmaceutical distributor in Varanasi, <strong>Wisdom Pharma</strong> serves both healthcare businesses (B2B) and individual consumers (B2C) by delivering authentic, high-efficacy pharmaceutical medications.',
    para2: 'We specialize in distributing critical life-saving injections, specialty therapeutic tablets, premium surgical dressings (cotton gauze, wadding, bandages), and medical diagnostics equipment directly from verified manufacturers.',
    para3: 'For over 5 years, our partners have trusted us for cold-chain shipping standards, competitive wholesale rates, absolute GST transparency, and verified logistical promptness across Uttar Pradesh and other regions.',
    badge: '5+ Years of Trust',
    badgeSub: 'IndiaMART Verified Distributor',
  },
  banner: {
    heading: 'Cold-Chain Approved & Authentic Supply Chain',
    body: 'We store and ship our injections, insulin vials, and specialty tablets under rigorous cold-chain conditions. Rest assured of authentic medical supply logistics verified directly in Varanasi.',
    pills: '✓ Genuine Drugs Only • ✓ GST Invoice Included • ✓ Prompt Local Logistics',
  },
  specialties: [
    { title: 'Critical & Life-Saving Injections', desc: 'Trusted supplier of high-demand critical injections including Bd Ampho, Xavitaz, Tigecycline, Streptokinase, Insulin, and Bd Dapto injections.', emoji: '💉', color: 'from-blue-500 to-indigo-500' },
    { title: 'Specialty & Therapeutic Tablets', desc: 'Distributing essential oral therapeutic medications such as Posaconazole Gastro-Resistant tablets and Eplerenone tablets.', emoji: '💊', color: 'from-cyan-500 to-teal-500' },
    { title: 'Medical Supplies & Dressing', desc: 'Providing high-quality clinical consumables like cotton gauze, premium cotton wadding, surgical bandages, and wound dressings.', emoji: '🩹', color: 'from-emerald-500 to-green-500' },
    { title: 'Medical & Surgical Instruments', desc: 'Authorized wholesale vendor for medical instruments and precision surgical tools used in hospitals and diagnostic clinics.', emoji: '🔬', color: 'from-purple-500 to-pink-500' },
  ],
  factsheet: [
    { label: 'Nature of Business', value: 'Wholesaler, Distributor & Supplier', iconKey: 'HiOutlineOfficeBuilding' },
    { label: 'Primary Location', value: 'Meera Nagar, Kandawa, Kanchanpur, Chitayipur, Varanasi - 221008', iconKey: 'HiOutlineLocationMarker' },
    { label: 'Industry Presence', value: '5+ Years Verified Trust', iconKey: 'HiOutlineBadgeCheck' },
    { label: 'Logistics Capability', value: 'Prompt UP & Pan-India Cold Chain Delivery', iconKey: 'HiOutlineTruck' },
    { label: 'Quality Standard', value: '100% Genuine & Sourced Authentically', iconKey: 'HiOutlineShieldCheck' },
    { label: 'Support Timeline', value: '24/7 Bulk Inquiry Response', iconKey: 'HiOutlineClock' },
  ],
};

// ─── Inline editable text component ──────────────────────────────────────
function InlineEdit({ value, onChange, isAdmin, multiline = false, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (!isAdmin) {
    return multiline
      ? <span className={className} dangerouslySetInnerHTML={{ __html: value }} />
      : <span className={className}>{value}</span>;
  }

  if (!editing) {
    return (
      <span className={`${className} group cursor-pointer`} onClick={() => { setDraft(value); setEditing(true); }}>
        {value || <em className="text-slate-400 text-xs">Click to edit</em>}
        <HiOutlinePencil className="inline ml-1.5 w-3 h-3 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    );
  }

  return (
    <span className="relative inline-block w-full">
      {multiline ? (
        <textarea className="w-full border-2 border-primary-400 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none bg-white shadow-sm" value={draft} rows={3}
          onChange={(e) => setDraft(e.target.value)} autoFocus />
      ) : (
        <input className="border-2 border-primary-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none bg-white shadow-sm w-full"
          value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
      )}
      <span className="flex gap-2 mt-1.5">
        <button onClick={() => { onChange(draft); setEditing(false); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
          <HiOutlineCheck className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={() => setEditing(false)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium">
          <HiOutlineX className="w-3.5 h-3.5" /> Cancel
        </button>
      </span>
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function About() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [content, setContent] = useState(DEFAULTS);
  const [loadingContent, setLoadingContent] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce ref — save 800ms after last change
  const saveTimer = useRef(null);

  // ── Fetch from DB on mount ────────────────────────────────────────────
  useEffect(() => {
    siteContentService.get('about')
      .then(res => {
        if (res.data.data) {
          setContent(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {}) // silently fall back to defaults
      .finally(() => setLoadingContent(false));
  }, []);

  // ── Debounced save to DB ──────────────────────────────────────────────
  const persistToDB = useCallback((updated) => {
    if (!isAdmin) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await siteContentService.update('about', updated);
        toast.success('Changes saved to database ✓', { id: 'about-save', duration: 2000 });
      } catch {
        toast.error('Failed to save changes');
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [isAdmin]);

  // ── Section updaters ─────────────────────────────────────────────────
  const updateSection = (section, key, val) => {
    const updated = { ...content, [section]: { ...content[section], [key]: val } };
    setContent(updated);
    persistToDB(updated);
  };

  const updateSpec = (i, key, val) => {
    const specialties = content.specialties.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    const updated = { ...content, specialties };
    setContent(updated);
    persistToDB(updated);
  };

  const addSpec = () => {
    const specialties = [...content.specialties, { title: 'New Specialty', desc: 'Describe this specialty here.', emoji: '🏥', color: 'from-slate-500 to-slate-700' }];
    const updated = { ...content, specialties };
    setContent(updated);
    persistToDB(updated);
  };

  const removeSpec = (i) => {
    const specialties = content.specialties.filter((_, idx) => idx !== i);
    const updated = { ...content, specialties };
    setContent(updated);
    persistToDB(updated);
  };

  const updateFact = (i, key, val) => {
    const factsheet = content.factsheet.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
    const updated = { ...content, factsheet };
    setContent(updated);
    persistToDB(updated);
  };

  const { hero, mission, banner, specialties, factsheet } = content;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Admin editing banner ── */}
      {isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800 font-medium flex items-center justify-center gap-2">
          <HiOutlinePencil className="w-4 h-4" />
          Admin Mode — click any text to edit. Changes save to the database automatically.
          {saving && (
            <span className="flex items-center gap-1 ml-3 text-xs text-amber-600 font-semibold animate-pulse">
              <HiOutlineRefresh className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
        </div>
      )}

      {/* ── Loading state ── */}
      {loadingContent && (
        <div className="flex justify-center items-center py-20">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loadingContent && (
        <>
          {/* ── Hero ── */}
          <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 py-24 md:py-32 overflow-hidden text-white">
            <div className="absolute inset-0">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20">
                  <InlineEdit value={hero.tagline} onChange={(v) => updateSection('hero', 'tagline', v)} isAdmin={isAdmin} className="text-white" />
                </span>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
                  <InlineEdit value={hero.heading} onChange={(v) => updateSection('hero', 'heading', v)} isAdmin={isAdmin} className="text-white" />
                </h1>
                <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                  <InlineEdit value={hero.subheading} onChange={(v) => updateSection('hero', 'subheading', v)} isAdmin={isAdmin} multiline className="text-primary-100" />
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── Mission & Overview ── */}
          <section className="py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6 relative">
                    Who We Are
                    <span className="absolute bottom-[-10px] left-0 w-16 h-1 bg-primary-600 rounded-full" />
                  </h2>
                  <div className="text-slate-600 mb-4 leading-relaxed text-base">
                    {isAdmin
                      ? <InlineEdit value={mission.para1} onChange={(v) => updateSection('mission', 'para1', v)} isAdmin multiline className="text-slate-600" />
                      : <span dangerouslySetInnerHTML={{ __html: mission.para1 }} />
                    }
                  </div>
                  <div className="text-slate-600 mb-4 leading-relaxed text-base">
                    <InlineEdit value={mission.para2} onChange={(v) => updateSection('mission', 'para2', v)} isAdmin={isAdmin} multiline className="text-slate-600" />
                  </div>
                  <div className="text-slate-600 leading-relaxed text-base">
                    <InlineEdit value={mission.para3} onChange={(v) => updateSection('mission', 'para3', v)} isAdmin={isAdmin} multiline className="text-slate-600" />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="relative p-12 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl border border-primary-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full -mr-10 -mt-10 blur-xl opacity-50" />
                  <div className="text-center relative z-10">
                    <div className="text-8xl mb-6 drop-shadow-md">🏥</div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      <InlineEdit value={mission.badge} onChange={(v) => updateSection('mission', 'badge', v)} isAdmin={isAdmin} className="text-slate-800" />
                    </h3>
                    <p className="text-primary-700 font-semibold text-sm mt-1">
                      <InlineEdit value={mission.badgeSub} onChange={(v) => updateSection('mission', 'badgeSub', v)} isAdmin={isAdmin} className="text-primary-700" />
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Specialties ── */}
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Core Specialties</h2>
                <p className="text-slate-500 max-w-xl mx-auto text-base">We cater to diverse clinical requirements, specializing in heavy-duty pharmaceutical distribution.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {specialties.map((spec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex gap-6 p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group hover:border-primary-200 relative">
                    {isAdmin && (
                      <button onClick={() => removeSpec(i)}
                        className="absolute top-3 right-3 p-1 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                    <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${spec.color} text-white flex items-center justify-center text-3xl shadow-md`}>
                      <InlineEdit value={spec.emoji} onChange={(v) => updateSpec(i, 'emoji', v)} isAdmin={isAdmin} className="text-3xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        <InlineEdit value={spec.title} onChange={(v) => updateSpec(i, 'title', v)} isAdmin={isAdmin} className="text-slate-800" />
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        <InlineEdit value={spec.desc} onChange={(v) => updateSpec(i, 'desc', v)} isAdmin={isAdmin} multiline className="text-slate-500" />
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isAdmin && (
                  <button onClick={addSpec}
                    className="flex items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50/30 text-slate-400 hover:text-primary-600 transition-all">
                    <HiOutlinePlus className="w-6 h-6" />
                    <span className="font-medium">Add Specialty</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── Company Factsheet ── */}
          <section className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Company Factsheet</h2>
                <p className="text-slate-500 max-w-xl mx-auto text-base">Key registry and corporate profile information for Wisdom Pharma Varanasi.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {factsheet.map((fact, i) => {
                  const Icon = ICON_MAP[fact.iconKey] || HiOutlineOfficeBuilding;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="flex gap-4 p-6 bg-slate-50 border border-slate-200/80 rounded-2xl hover:bg-primary-50/30 hover:border-primary-200 transition-colors">
                      <div className="w-12 h-12 bg-white text-primary-600 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          <InlineEdit value={fact.label} onChange={(v) => updateFact(i, 'label', v)} isAdmin={isAdmin} className="text-xs text-slate-400" />
                        </p>
                        <p className="text-sm text-slate-800 font-bold mt-1 leading-snug">
                          <InlineEdit value={fact.value} onChange={(v) => updateFact(i, 'value', v)} isAdmin={isAdmin} className="text-slate-800" />
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Trust Banner ── */}
          <section className="py-16 bg-primary-900 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <InlineEdit value={banner.heading} onChange={(v) => updateSection('banner', 'heading', v)} isAdmin={isAdmin} className="text-white" />
              </h2>
              <p className="text-primary-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6">
                <InlineEdit value={banner.body} onChange={(v) => updateSection('banner', 'body', v)} isAdmin={isAdmin} multiline className="text-primary-100/90" />
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-primary-200 font-semibold bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <InlineEdit value={banner.pills} onChange={(v) => updateSection('banner', 'pills', v)} isAdmin={isAdmin} className="text-primary-200" />
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
