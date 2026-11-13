import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SYSTEMS, getSystemKey } from './config';
import { compute, itemScore, buzz } from './calc';
import { Logo, Backdrop, CelestialDeco, soft, spring } from './ui';
import Calc from './CalcScreen';
import Dock from './Dock';
import Install from './Install';
import ConfirmModal from './ConfirmModal';
import { How, Settings } from './Pages';
import { useTheme } from './theme';

export const KEY = 'akdeniz_tip_v2';
const SCREENS = ['calc', 'how', 'settings'];

const empty = () => ({
  d1_normal: {},
  d1_repeat: {},
  d2_normal: {},
  d2_repeat: {},
  d3_normal: {},
  d3_repeat: {},
});

export function loadState() {
  const base = {
    period: 'd1',
    isRepeat: false,
    screen: 'calc',
    theme: 'auto',
    scores: empty(),
  };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw) {
      const scores = { ...empty(), ...raw.scores };
      // Eski sürümden geçiş (d1 -> d1_normal, d2 -> d1_repeat)
      if (raw.scores?.d1 && !raw.scores?.d1_normal) scores.d1_normal = raw.scores.d1;
      if (raw.scores?.d2 && !raw.scores?.d1_repeat) scores.d1_repeat = raw.scores.d2;
      if (scores.d2_normal?.tdp !== undefined && scores.d2_normal?.ocm === undefined) {
        scores.d2_normal.ocm = scores.d2_normal.tdp;
      }
      if (scores.d2_repeat?.tdp !== undefined && scores.d2_repeat?.ocm === undefined) {
        scores.d2_repeat.ocm = scores.d2_repeat.tdp;
      }
      return {
        ...base,
        ...raw,
        period: raw.period || (raw.term === 'd2' || raw.term === 'd3' ? raw.term : 'd1'),
        isRepeat: typeof raw.isRepeat === 'boolean' ? raw.isRepeat : false,
        scores,
      };
    }
    return base;
  } catch {
    return base;
  }
}

const icons = {
  calc: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M9 8h6M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01" /></>,
  how: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.6M12 17h.01" /></>,
  settings: <><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></>,
};
const labels = { calc: 'Hesapla', how: 'Nasıl?', settings: 'Ayarlar' };

export default function App() {
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const sysKey = getSystemKey(state.period, state.isRepeat);
  const sys = SYSTEMS[sysKey] || SYSTEMS.d1_normal;

  // Tamamlanmış komiteler açılışta kapalı gelir; kullanıcı açıp kapatabilir.
  const [collapsed, setCollapsed] = useState(() => {
    const c = {}, st = loadState();
    Object.keys(SYSTEMS).forEach(k => {
      SYSTEMS[k].items.forEach(i => {
        if (itemScore(i, st.scores[k], k) !== null) c[`${k}.${i.id}`] = true;
      });
    });
    return c;
  });

  useTheme(state.theme);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* dolu */ }
  }, [state]);

  const say = useCallback(m => { setToast(m); setTimeout(() => setToast(''), 2200); }, []);
  const set = patch => setState(s => ({ ...s, ...patch }));
  const setScore = useCallback((sk, id, v) => {
    setState(s => ({ ...s, scores: { ...s.scores, [sk]: { ...s.scores[sk], [id]: v } } }));
  }, []);

  const setPeriod = p => { if (p !== state.period) { buzz(8); set({ period: p }); } };
  const setIsRepeat = rep => { buzz(8); set({ isRepeat: rep }); };
  const setScreen = sc => { if (sc !== state.screen) { buzz(8); set({ screen: sc }); window.scrollTo({ top: 0 }); } };

  // Kişisel yüzdelikler değişince yeniden hesapla
  const [wv, setWv] = useState(0);
  useEffect(() => {
    const h = () => setWv(v => v + 1);
    window.addEventListener('atn-weights', h);
    return () => window.removeEventListener('atn-weights', h);
  }, []);

  // Fare tekerleğiyle kaydırırken inputların kaydırmayı bloke etmesini önle
  useEffect(() => {
    const onWheel = () => {
      if (document.activeElement?.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const r = useMemo(() => compute(sysKey, state.scores[sysKey]), [sysKey, state.scores, wv]);

  // Tarayıcı alert/confirm yerine yukarıdan kayan özel popup
  const requestResetTerm = () => {
    const curScores = state.scores[sysKey] || {};
    if (!Object.values(curScores).some(Boolean)) return say('Zaten boş');
    setConfirmDialog({
      title: `${sys.name} (${sys.statusLabel}) Notlarını Sil`,
      message: `${sys.name} (${sys.statusLabel}) için girdiğiniz tüm komite ve sınav notları temizlenecektir. Emin misiniz?`,
      confirmText: 'Sil',
      onConfirm: () => {
        setState(s => ({ ...s, scores: { ...s.scores, [sysKey]: {} } }));
        say(`${sys.name} sıfırlandı`);
        setConfirmDialog(null);
      },
    });
  };

  const requestClearAll = () => {
    setConfirmDialog({
      title: 'Tüm Notları Sil',
      message: 'Tüm dönemler (Dönem 1, 2, 3 normal ve tekrar) için cihazınızda kayıtlı olan tüm veriler silinecektir.',
      confirmText: 'Tümünü Sil',
      onConfirm: () => {
        setState(s => ({ ...s, scores: empty() }));
        say('Tüm notlar silindi');
        setConfirmDialog(null);
      },
    });
  };

  return (
    <div
      className="relative mx-auto max-w-[520px] px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 220px)' }}
    >
      <Backdrop />
      <header className="relative z-10 flex h-11 items-center justify-between mb-6">
        <Logo />
        <div className="flex h-10 items-center justify-end">
          <motion.div
            layout="position"
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="flex items-center"
          >
            <CelestialDeco />
          </motion.div>

          <AnimatePresence>
            {state.screen === 'calc' && (
              <motion.div
                key="reset-wrapper"
                layout="position"
                initial={{ width: 0, opacity: 0, scale: 0, marginLeft: 0 }}
                animate={{ width: 40, opacity: 1, scale: 1, marginLeft: 8 }}
                exit={{ width: 0, opacity: 0, scale: 0, marginLeft: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="flex size-10 items-center justify-center overflow-hidden flex-none"
              >
                <motion.button
                  key="reset"
                  whileTap={{ rotate: -180, scale: 0.85 }}
                  onClick={requestResetTerm}
                  aria-label="Bu dönemi sıfırla"
                  className="card-surface grid size-10 place-items-center rounded-full text-zinc-500 shadow-none dark:text-zinc-400"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={state.screen}
          initial={{ opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -22 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        >
          {state.screen === 'calc' && (
            <Calc
              period={state.period}
              setPeriod={setPeriod}
              isRepeat={state.isRepeat}
              setIsRepeat={setIsRepeat}
              scores={state.scores}
              setScore={setScore}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          )}
          {state.screen === 'how' && (
            <How
              period={state.period}
              setPeriod={setPeriod}
              isRepeat={state.isRepeat}
              setIsRepeat={setIsRepeat}
            />
          )}
          {state.screen === 'settings' && (
            <Settings
              theme={state.theme}
              setTheme={theme => set({ theme })}
              onClearAll={requestClearAll}
              period={state.period}
              isRepeat={state.isRepeat}
              say={say}
            />
          )}
        </motion.main>
      </AnimatePresence>

      {/* Dock (0/13 ilerleme veya ortalama kartı) */}
      <AnimatePresence>{state.screen === 'calc' && <Dock r={r} />}</AnimatePresence>

      {/* Menü — Dock ile tam olarak AYNI GENİŞLİKTE, gölgesiz, aralarındaki mesafe artırılmış */}
      <nav
        className="glass fixed inset-x-0 z-30 mx-auto flex w-[min(380px,calc(100vw-2rem))] items-center justify-between rounded-full border border-white/70 p-1.5 shadow-none dark:border-white/10"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        aria-label="Ana gezinme"
      >
        {SCREENS.map(sc => {
          const on = sc === state.screen;
          return (
            <button
              key={sc}
              onClick={() => setScreen(sc)}
              aria-current={on}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-colors ${
                on
                  ? 'text-[#9C7924] dark:text-[#F3E5AB]'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {on && (
                <motion.span
                  layoutId="tab-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-[#F5E6B3]/25 shadow-none dark:bg-[#F5E6B3]/15"
                />
              )}
              <motion.svg
                viewBox="0 0 24 24"
                className="relative size-[18px] fill-none stroke-current"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ scale: on ? 1.08 : 1 }}
                whileTap={{ scale: 0.88 }}
                transition={spring}
              >
                {icons[sc]}
              </motion.svg>
              <span className="relative text-[12px] font-medium">{labels[sc]}</span>
            </button>
          );
        })}
      </nav>

      {/* Ana ekrana ekleme rehberi */}
      <Install />

      {/* Yukarıdan kayarak gelen onay popup'ı */}
      <ConfirmModal
        isOpen={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText={confirmDialog?.confirmText}
        danger={confirmDialog?.danger !== false}
        onConfirm={() => confirmDialog?.onConfirm?.()}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* Yukarıdan kayarak gelen bilgi/uyarı bildirimi */}
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
