import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SYSTEMS, SYSTEM_KEYS, getBaseW, getBaseInYear, getBasePracW, setLocal, clearLocal, baseWeightSum, exportJson } from './config';
import { num, fmt, buzz } from './calc';
import { Logo, Backdrop, soft } from './ui';
import ConfirmModal from './ConfirmModal';
import { fetchAnalytics } from './analytics';

// Şifre: AkdenizSpace2026! (SHA-256 özeti)
const HASH = '515a8eb66dc972319cdf060dd242e7f6df2ba71e150077f57cf1f099849ec173';
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
  .map(b => b.toString(16).padStart(2, '0')).join('');

function WInput({ t, k, pracItem, pracId }) {
  const [, force] = useState(0);
  const value = k === '_inYear'
    ? getBaseInYear(t)
    : pracId
      ? getBasePracW(t, pracItem, pracId)
      : getBaseW(t, SYSTEMS[t].items.find(i => i.id === k));
  return (
    <div className="relative w-24">
      <input className="field !h-10 !rounded-xl pr-8 text-right !text-[15px]" type="text" inputMode="decimal"
        value={value}
        onChange={e => {
          let v = e.target.value.replace(/[^0-9.,]/g, '');
          if (num(v) > 100) v = '100';
          setLocal(t, k, v === '' ? 0 : num(v));
          force(x => x + 1);
          window.dispatchEvent(new Event('atn-weights'));
        }} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('atn_admin'));
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(0);
  const [, tick] = useState(0);
  const [toast, setToast] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const say = m => { setToast(m); setTimeout(() => setToast(''), 2000); };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAnalytics();
      setStats(data);
    } catch (e) {}
    setLoadingStats(false);
  };

  useEffect(() => {
    if (authed) {
      loadStats();
      const interval = setInterval(loadStats, 20000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  // JSON paneli ve toplamlar için dinleyici
  useEffect(() => {
    const h = () => tick(x => x + 1);
    window.addEventListener('atn-weights', h);
    return () => window.removeEventListener('atn-weights', h);
  }, []);

  const login = async e => {
    e.preventDefault();
    if (!(window.crypto && crypto.subtle)) return setErr('Güvenli bağlantı (https) gerekli.');
    if ((await sha(pw)) === HASH) { sessionStorage.setItem('atn_admin', pw); setAuthed(true); }
    else { setErr('Şifre yanlış.'); setPw(''); setShake(s => s + 1); buzz(30); }
  };

  const handleResetConfirmed = () => {
    clearLocal();
    tick(x => x + 1);
    setConfirmOpen(false);
    say('Değişiklikler sıfırlandı');
    setTimeout(() => window.location.reload(), 500);
  };

  const publish = async () => {
    try {
      const r = await fetch('/api/weights', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: sessionStorage.getItem('atn_admin'), weights: JSON.parse(exportJson()) }) });
      if (!r.ok) return say(r.status === 401 ? 'Yetki hatası: çıkış yapıp tekrar gir' : 'Yayınlanamadı');
      clearLocal();
      say('Herkese yayınlandı');
      setTimeout(() => window.location.reload(), 700);
    } catch { say('Sunucuya ulaşılamadı'); }
  };

  return (
    <div className="mx-auto max-w-[520px] px-6 pb-16 pt-[calc(env(safe-area-inset-top,0px)+20px)]">
      <Backdrop />
      <header className="flex items-center justify-between pb-6 pt-2">
        <Logo />
        <a href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">← Geri</a>
      </header>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Yönetici Paneli</h1>

      <AnimatePresence mode="wait">
        {!authed ? (
          <motion.form key="login" onSubmit={login} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={soft}
            className="card-surface rounded-3xl p-5">
            <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
              <input type="password" autoFocus placeholder="Şifre" className="field" value={pw} autoComplete="current-password"
                onChange={e => { setPw(e.target.value); setErr(''); }} />
            </motion.div>
            <p className="mt-2 min-h-5 text-[13px] text-rose-600 dark:text-rose-400">{err}</p>
            <button type="submit" className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-b from-[#F7EBBF] to-[#E5CD82] font-semibold text-zinc-900 shadow-md shadow-[#E5CD82]/20 transition active:scale-[.98]">Giriş yap</button>
          </motion.form>
        ) : (
          <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Canlı Ziyaretçi & Trafik Analitiği */}
            <section className="card-surface mb-6 rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    Ziyaretçi & Trafik Analitiği
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={loadStats}
                  disabled={loadingStats}
                  className="flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition active:scale-95 disabled:opacity-50 dark:bg-white/10 dark:text-zinc-200"
                >
                  <span className={loadingStats ? 'inline-block animate-spin' : ''}>↻</span>
                  <span>{loadingStats ? 'Yenileniyor...' : 'Yenile'}</span>
                </button>
              </div>

              {/* 4 Ana Metrik Kartı */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* 1. Bugünkü giriş (gerçek anlık sayı için sunucu tarafı nabız gerekir) */}
                <div className="rounded-2xl bg-zinc-900/[.03] p-3.5 dark:bg-white/[.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Bugün Giriş</span>
                    <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {stats ? stats.todayEntries : '...'}
                  </div>
                  <span className="text-[10px] text-zinc-400">Sayfa açılışları</span>
                </div>

                {/* 2. Tekil Ziyaretçi */}
                <div className="rounded-2xl bg-zinc-900/[.03] p-3.5 dark:bg-white/[.04]">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tekil Ziyaretçi</span>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats ? stats.uniqueVisitors : '...'}
                  </div>
                  <span className="text-[10px] text-zinc-400">Farklı cihaz/öğrenci</span>
                </div>

                {/* 3. Toplam Giren */}
                <div className="rounded-2xl bg-zinc-900/[.03] p-3.5 dark:bg-white/[.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Toplam Giren</span>
                    <span className="text-emerald-500 text-xs font-bold">↓ Giriş</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats ? stats.totalEntries : '...'}
                  </div>
                  <span className="text-[10px] text-zinc-400">Tüm oturumlar</span>
                </div>

                {/* 4. Toplam Çıkan */}
                <div className="rounded-2xl bg-zinc-900/[.03] p-3.5 dark:bg-white/[.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Siteden Çıkan</span>
                    <span className="text-zinc-400 text-xs font-bold">↑ Çıkış</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats ? stats.totalExits : '...'}
                  </div>
                  <span className="text-[10px] text-zinc-400">Kapatılan seans</span>
                </div>
              </div>

              {/* Günlük İstatistikler Satırı */}
              <div className="mt-3 rounded-2xl border border-zinc-900/6 p-3.5 dark:border-white/10">
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Bugünün Akışı (Giren / Çıkan)
                </div>
                <div className="flex items-center justify-between py-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300">Bugün Giren Kişi</span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{stats ? stats.todayEntries : '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 text-sm border-t border-zinc-900/4 dark:border-white/5">
                  <span className="text-zinc-600 dark:text-zinc-300">Bugün Çıkan Kişi</span>
                  <span className="font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                    -{stats ? stats.todayExits : '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 text-sm border-t border-zinc-900/4 dark:border-white/5">
                  <span className="text-zinc-600 dark:text-zinc-300">Son Güncelleme</span>
                  <span className="text-xs text-zinc-400">
                    {stats ? stats.updatedAt : 'Yükleniyor...'} · 20sn otomatik
                  </span>
                </div>
              </div>
            </section>

            <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
              Değişiklikler bu cihazda anında önizlenir. Herkese göstermek için en alttaki "Herkese yayınla" düğmesine bas.
            </p>
            {SYSTEM_KEYS.map(t => {
              const sys = SYSTEMS[t];
              const sum = baseWeightSum(t), ok = Math.abs(sum - 100) < 0.001;
              return (
                <section key={t} className="card-surface mb-5 rounded-3xl p-5">
                  <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{sys.name} · {sys.statusLabel}</h2>
                  {sys.items.map(i => (
                    <div key={i.id} className="py-1">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm">{i.label}</span>
                        <WInput t={t} k={i.id} />
                      </div>
                      {i.prac && (
                        <div className="ml-3 space-y-1 border-l-2 border-[#E5CD82]/40 pl-3 py-1">
                          {i.prac.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-0.5">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">↳ {p.label} payı</span>
                              <WInput t={t} k={`${i.id}_${p.id}`} pracItem={i.id} pracId={p.id} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-1.5"><span className="text-sm">Yıl içi payı</span><WInput t={t} k="_inYear" /></div>
                  <div className="mt-2 flex justify-between border-t border-zinc-900/8 pt-3 text-sm font-medium dark:border-white/10">
                    <span>Komite toplamı</span>
                    <span className={ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>%{fmt(sum)}{ok ? ' ✓' : ' · 100 olmalı'}</span>
                  </div>
                </section>
              );
            })}

            <section className="card-surface mb-5 rounded-3xl p-5">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">weights.json</h2>
              <pre className="max-h-56 overflow-auto rounded-2xl bg-zinc-100 p-3 font-mono text-[11.5px] leading-relaxed select-text dark:bg-white/6">{exportJson()}</pre>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button className="h-11 rounded-2xl bg-zinc-100 font-medium transition active:scale-[.97] dark:bg-white/10"
                  onClick={async () => { try { await navigator.clipboard.writeText(exportJson()); say('Kopyalandı'); } catch { say('Metni elle kopyala'); } }}>Kopyala</button>
                <button className="h-11 rounded-2xl bg-zinc-100 font-medium transition active:scale-[.97] dark:bg-white/10"
                  onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' })); a.download = 'weights.json'; a.click(); URL.revokeObjectURL(a.href); }}>İndir</button>
              </div>
              <button className="mt-3 h-12 w-full rounded-2xl bg-gradient-to-b from-[#F7EBBF] to-[#E5CD82] font-semibold text-zinc-900 shadow-md shadow-[#E5CD82]/20 transition active:scale-[.98]"
                onClick={publish}>Herkese yayınla</button>
              <button className="mt-2.5 h-11 w-full rounded-2xl text-sm font-medium text-rose-600 transition active:scale-[.98] dark:text-rose-400"
                onClick={() => setConfirmOpen(true)}>Bu cihazdaki değişiklikleri sıfırla</button>
            </section>
            <button className="h-11 w-full text-sm text-zinc-500 dark:text-zinc-400" onClick={() => { sessionStorage.removeItem('atn_admin'); setAuthed(false); setPw(''); }}>Çıkış yap</button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Değişiklikleri Sıfırla"
        message="Bu cihazda yaptığınız tüm ağırlık özelleştirmeleri silinecek ve varsayılan ayarlara dönülecektir."
        confirmText="Sıfırla"
        onConfirm={handleResetConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -70, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.94 }}
            transition={soft}
            className="glass fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+16px)] z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/90 px-5 py-2.5 text-xs font-semibold text-zinc-800 shadow-xl dark:border-white/10 dark:bg-zinc-900/90 dark:text-white"
          >
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
