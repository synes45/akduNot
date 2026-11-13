import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { spring } from './ui';

const NEVER_KEY = 'atn_never_show_install';
const ua = navigator.userAgent;
const isIOSDevice = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="inline size-4 -translate-y-0.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V3m0 0L8 7m4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
);

const PlusSquareIcon = () => (
  <svg viewBox="0 0 24 24" className="inline size-4 -translate-y-0.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const isMobileDevice = isIOSDevice || /android/i.test(ua);

export default function Install() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(isIOSDevice ? 'ios' : 'android');
  const [neverShow, setNeverShow] = useState(false);
  const deferred = useRef(null);

  useEffect(() => {
    // Zaten ana ekrandan açılmışsa veya "Daha gösterme" işaretlenmişse hiç gösterme
    if (standalone || localStorage.getItem(NEVER_KEY) === '1') return;

    const onPrompt = e => {
      e.preventDefault();
      deferred.current = e;
    };
    const onInstalled = () => {
      deferred.current = null;
      setOpen(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // Yalnızca mobil cihazlarda (iOS/Android) hafif gecikmeyle otomatik açılsın
    let timer;
    if (isMobileDevice) {
      timer = setTimeout(() => {
        setOpen(true);
      }, 1200);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleClose = () => {
    if (neverShow) {
      localStorage.setItem(NEVER_KEY, '1');
    }
    setOpen(false);
  };

  const handleNativeInstall = async () => {
    if (neverShow) localStorage.setItem(NEVER_KEY, '1');
    const d = deferred.current;
    if (d) {
      d.prompt();
      await d.userChoice.catch(() => {});
      deferred.current = null;
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Karartma arka planı */}
          <motion.div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Alttan açılan detaylı rehber paneli */}
          <motion.div
            role="dialog"
            aria-labelledby="inst-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, i) => {
              if (i.offset.y > 90 || i.velocity.y > 500) handleClose();
            }}
            className="glass relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-t-[32px] !bg-white/95 px-6 pt-3 shadow-2xl dark:!bg-zinc-900/95"
            style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Tutma çubuğu */}
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-zinc-400/40" />

            <div className="flex items-center gap-3.5 pb-2">
              <img
                src="/icon-192.png"
                alt="AkduTip"
                width="50"
                height="50"
                className="size-[50px] rounded-2xl shadow-md"
              />
              <div className="flex-1">
                <h2 id="inst-title" className="text-lg font-bold leading-tight text-zinc-900 dark:text-white">
                  Ana Ekrana Ekle
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Safari / Chrome sınırları olmadan tam ekran mobil uygulama deneyimi
                </p>
              </div>
            </div>

            {/* Platform Sekmeleri */}
            <div className="mt-3 flex rounded-xl bg-zinc-900/5 p-1 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setTab('ios')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  tab === 'ios'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Apple (iOS / iPhone)
              </button>
              <button
                type="button"
                onClick={() => setTab('android')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  tab === 'android'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Android / Chrome
              </button>
            </div>

            {/* Adımlar */}
            {tab === 'ios' ? (
              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-white/[.04]">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-[#F5E6B3]/25 text-xs font-bold text-[#8F6D1D] dark:text-[#F3E5AB]">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white">Paylaş menüsünü açın</span>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Safari'de alt araç çubuğundaki <ShareIcon /> <b>Paylaş</b> simgesine dokunun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-white/[.04]">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-[#F5E6B3]/25 text-xs font-bold text-[#8F6D1D] dark:text-[#F3E5AB]">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white">Seçeneği bulun</span>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Açılan menüyü aşağı kaydırıp <PlusSquareIcon /> <b>"Ana Ekrana Ekle"</b> seçeneğine dokunun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-white/[.04]">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-[#F5E6B3]/25 text-xs font-bold text-[#8F6D1D] dark:text-[#F3E5AB]">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white">Onaylayın</span>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Sağ üst köşedeki mavi <b>"Ekle"</b> butonuna basarak işlemi tamamlayın.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#F5E6B3]/35 bg-[#F5E6B3]/15 p-3 text-xs leading-relaxed text-[#8F6D1D] dark:text-[#F3E5AB]">
                  💡 <b>İpucu:</b> Chrome kullanıyorsanız da iOS 16.4+ üzerinde Paylaş menüsünden ekleyebilirsiniz, ancak en akıcı tam ekran deneyimini Safari sunar.
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-white/[.04]">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-[#F5E6B3]/25 text-xs font-bold text-[#8F6D1D] dark:text-[#F3E5AB]">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white">Menüyü açın</span>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Chrome'da sağ üst köşedeki <b>üç nokta (⋮)</b> simgesine dokunun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-white/[.04]">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-[#F5E6B3]/25 text-xs font-bold text-[#8F6D1D] dark:text-[#F3E5AB]">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white">Yükleyin</span>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <b>"Uygulamayı yükle"</b> veya <b>"Ana ekrana ekle"</b> seçeneğine dokunun.
                    </p>
                  </div>
                </div>

                {deferred.current && (
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="mt-1 h-12 w-full rounded-2xl bg-gradient-to-b from-[#F7EBBF] to-[#E5CD82] font-semibold text-zinc-900 shadow-md shadow-[#E5CD82]/20 transition active:scale-[.98]"
                  >
                    Hemen Yükle
                  </button>
                )}
              </div>
            )}

            {/* Çevrimdışı avantajı */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-100 p-2.5 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
              <span>⚡</span>
              <span>Ana ekrandan açtığınızda internetiniz olmasa bile tüm hesaplamalar çalışır.</span>
            </div>

            {/* "Bir daha gösterme" Seçeneği */}
            <div className="mt-4 flex items-center justify-between border-t border-zinc-900/10 pt-3 dark:border-white/10">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={neverShow}
                  onChange={e => setNeverShow(e.target.checked)}
                  className="size-4 rounded border-zinc-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Bir daha gösterme</span>
              </label>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#8F6D1D] transition active:scale-95 dark:text-[#F3E5AB]"
              >
                Anladım / Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
