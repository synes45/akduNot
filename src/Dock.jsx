import { AnimatePresence, motion } from 'framer-motion';
import { PASS } from './config';
import { Num, soft } from './ui';

export default function Dock({ r }) {
  const passed = r.genel !== undefined && r.genel >= PASS;
  let msg = 'Küsuratlardan dolayı gereken finalde 0,2 puana kadar fark olabilir.', tone = '';
  if (r.ready) {
    if (r.impossible) { msg = 'Final 100 alsan bile geçmek mümkün değil.'; tone = 'fail'; }
    else if (r.genel !== undefined) { msg = passed ? 'Geçtin.' : `Geçme notu ${PASS} değerinin altında.`; tone = passed ? 'pass' : 'fail'; }
    else if (r.alreadyPassed) { msg = 'Finalden 40 alman yeterli.'; tone = 'pass'; }
  }
  const toneCls = { pass: 'text-emerald-600 dark:text-emerald-400', fail: 'text-rose-600 dark:text-rose-400', '': 'text-zinc-500 dark:text-zinc-400' }[tone];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={soft}
      className="pointer-events-none fixed inset-x-0 z-20 mx-auto w-[min(380px,calc(100vw-2rem))]"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}
    >
      <div className="glass pointer-events-auto overflow-hidden rounded-[26px] px-5 py-4 border border-white/70 shadow-none dark:border-white/10">
        <AnimatePresence mode="wait" initial={false}>
          {!r.ready ? (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900/8 dark:bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F7EBBF] to-[#E5CD82]"
                  initial={false} animate={{ width: `${r.progress}%` }} transition={soft} />
              </div>
              <p className="mt-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                <span className="tabular-nums font-medium text-zinc-700 dark:text-zinc-200">{r.filled}/{r.count}</span> alan dolu · tüm notları girince sonuç çıkar
              </p>
            </motion.div>
          ) : (
            <motion.div key="res" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ortalama</span>
                  <span className={`block text-[38px] font-semibold leading-none tracking-tight ${r.genel === undefined ? 'text-zinc-300 dark:text-zinc-600' : passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {r.genel === undefined ? '—' : <Num value={r.genel} dec={2} />}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Gereken final</span>
                  <span className={`block text-[24px] font-semibold leading-none tracking-tight ${r.impossible ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                    <Num value={r.need} dec={1} />
                  </span>
                </div>
              </div>
              <p className={`mt-3 text-[13px] ${toneCls}`}>{msg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
