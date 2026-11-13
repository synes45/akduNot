import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PERIODS, SYSTEMS, PASS, getSystemKey, getW, getInYear,
  getBaseW, getBaseInYear, getTotal, weightSum, getUnitPref, unitTotal, toView, fromView, unitSym, isPersonalOn, setPersonalOn, setPersonal, getPersonalRaw, clearPersonal,
  getPracW, getBasePracW, getTheoryW,
} from './config';
import { fmt, buzz, clean, num, wText } from './calc';
import { Seg, soft } from './ui';

const Panel = ({ title, children }) => (
  <section className="card-surface mb-5 rounded-3xl p-5">
    <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</h2>
    {children}
  </section>
);
const P = ({ children }) => <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</p>;
const Formula = ({ children }) => (
  <div className="mt-3 overflow-x-auto whitespace-nowrap rounded-2xl bg-zinc-100 px-4 py-3 font-mono text-xs leading-7 select-text dark:bg-white/6">{children}</div>
);

export function How({ period, setPeriod, isRepeat, setIsRepeat }) {
  const sysKey = getSystemKey(period, isRepeat);
  const sys = SYSTEMS[sysKey];
  const a = getInYear(sysKey) / 100, b = 1 - a;
  const forms = sys.items.filter(i => i.mult || i.prac || i.pdo).map(i => {
    const pr = (i.prac || [])
      .filter(p => getPracW(sysKey, i.id, p.id) > 0)
      .map(p => ` + ${p.label.replace(' pratik', '').toLowerCase()} (en çok ${fmt(getPracW(sysKey, i.id, p.id))})`)
      .join('');
    const thW = getTheoryW(sysKey, i);
    const exam = thW < 100 ? `(teorik × ${fmt(thW / 100)})${pr}` : 'teorik';
    return i.pdo ? `${i.label} = ${exam} × 0.85 + PDÖ × 0.15` : `${i.label} = ${exam}`;
  });

  return (
    <div>
      <div className="mb-4">
        <Seg id="how-period" value={period} onChange={setPeriod} items={PERIODS.map(p => ({ id: p.id, label: p.label }))} />
      </div>

      <div className="mb-5 flex items-center justify-between rounded-2xl card-surface px-4 py-3">
        <span className="text-xs font-semibold text-zinc-900 dark:text-white">Dönem tekrarı ağırlıklarını göster</span>
        <button
          type="button"
          role="switch"
          aria-checked={isRepeat}
          onClick={() => { buzz(8); setIsRepeat(!isRepeat); }}
          className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
            isRepeat ? 'bg-[#E8D184]' : 'bg-zinc-200 dark:bg-white/15'
          }`}
        >
          <span
            className={`inline-block size-4.5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
              isRepeat ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <Panel title={`1 · ${sys.name} (${sys.statusLabel}) Komite Puanları`}>
        <P>Her komite önce kendi içinde hesaplanır. Pratik varsa teorik notun katsayısına eklenir, PDÖ varsa %15 pay alır.</P>
        <Formula>{forms.length ? forms.map((f, i) => <div key={i}>{f}</div>) : 'komite = teorik not'}</Formula>
      </Panel>

      <Panel title={`2 · ${sys.name} Dönem İçi Ağırlıklar`}>
        <table className="w-full text-sm">
          <tbody>
            {sys.items.map(i => (
              <tr key={i.id} className="border-t border-zinc-900/6 first:border-0 dark:border-white/10">
                <td className="py-2.5 text-zinc-500 dark:text-zinc-400">{i.label}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{wText(sysKey, getW(sysKey, i))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="3 · Genel Not">
        <P>Dönem içi puanın %{fmt(a * 100)}'ı ile finalin %{fmt(b * 100)}'ı toplanır.</P>
        <Formula>genel = dönemİçi × {fmt(a)} + final × {fmt(b)}</Formula>
      </Panel>

      <Panel title="4 · Gereken Final">
        <P>Geçme eşiği {PASS} kabul edilir. Sonuç 40'ın altındaysa 40 gösterilir.</P>
        <Formula>gerekenFinal = ({PASS} − dönemİçi × {fmt(a)}) / {fmt(b)}</Formula>
      </Panel>
    </div>
  );
}

const Switch = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => { buzz(8); onChange(!on); }}
    className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${on ? 'bg-[#E8D184]' : 'bg-zinc-200 dark:bg-white/15'}`}
  >
    <span className={`inline-block size-4.5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${on ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
  </button>
);

/** Tek bir kişisel kutu. Boş bırakılırsa resmi değer (placeholder) kullanılır.
 * weight: kalem ağırlığı (kredi/yüzde tercihine göre gösterilir); değilse düz yüzde. */
function PInput({ sysKey, k, official, weight }) {
  const raw = getPersonalRaw(sysKey, k);
  const view = v => (weight ? toView(sysKey, v) : v);
  const show = v => (v === undefined ? '' : String(Math.round(view(v) * 100) / 100).replace('.', ','));
  const [draft, setDraft] = useState(show(raw));
  useEffect(() => { setDraft(show(raw)); }, [sysKey, raw, getUnitPref()]);
  return (
    <div className="relative w-24">
      <input
        className="field !h-10 !rounded-xl pr-8 text-right !text-[15px]"
        type="text"
        inputMode="decimal"
        placeholder={fmt(view(official))}
        value={draft}
        onChange={e => {
          const v = clean(e.target.value, weight ? unitTotal(sysKey) : 100);
          setDraft(v);
          setPersonal(sysKey, k, v === '' ? undefined : weight ? fromView(sysKey, num(v)) : num(v));
        }}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{weight ? unitSym(sysKey) : '%'}</span>
    </div>
  );
}

function PersonalWeights({ period: p0, isRepeat: r0, say }) {
  const [on, setOn] = useState(isPersonalOn);
  const [period, setPeriod] = useState(p0);
  const [isRepeat, setIsRepeat] = useState(r0);
  const [, tick] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const h = () => tick(x => x + 1);
    window.addEventListener('atn-weights', h);
    return () => window.removeEventListener('atn-weights', h);
  }, []);

  const sysKey = getSystemKey(period, isRepeat);
  const sys = SYSTEMS[sysKey];
  const sum = weightSum(sysKey), total = getTotal(sysKey), ok = Math.abs(sum - total) < 0.001;

  return (
    <Panel title="Kişisel yüzdelikler">
      <div className="flex items-center justify-between gap-4">
        <P>Hesaplamayı kendi girdiğin yüzdeliklerle yap. Yalnızca bu cihazda saklanır, kimse görmez.</P>
        <Switch on={on} label="Kişisel yüzdelikleri kullan" onChange={v => { setPersonalOn(v); setOn(v); say?.(v ? 'Kişisel yüzdelikler açık' : 'Resmi yüzdeliklere dönüldü'); }} />
      </div>

      <AnimatePresence initial={false}>
        {on && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: soft, opacity: { duration: 0.15 } }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-4">
              <Seg id="pw-period" value={period} onChange={setPeriod} items={PERIODS.map(x => ({ id: x.id, label: x.label }))} />
              <div className="mt-2.5 flex items-center justify-between px-1">
                <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">Dönem tekrarı</span>
                <Switch on={isRepeat} label="Dönem tekrarı" onChange={setIsRepeat} />
              </div>

              <div key={`${sysKey}-${resetKey}`} className="mt-3 divide-y divide-zinc-900/6 dark:divide-white/5">
                {sys.items.map(i => {
                  const hasPrac = !!i.prac && i.prac.length > 0;
                  return (
                    <div key={i.id} className="py-2.5 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{i.label}</span>
                          {hasPrac && (
                            <span className="ml-2 text-[11px] text-zinc-400">
                              (Teorik %{fmt(getTheoryW(sysKey, i))})
                            </span>
                          )}
                        </div>
                        <PInput sysKey={sysKey} k={i.id} official={getBaseW(sysKey, i)} weight />
                      </div>

                      {hasPrac && (
                        <div className="mt-2.5 ml-2 space-y-2 rounded-2xl bg-zinc-900/[.02] p-2.5 dark:bg-white/[.02] border border-zinc-900/5 dark:border-white/5">
                          {i.prac.map(p => (
                            <div key={p.id} className="flex items-center justify-between pl-1">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">↳ {p.label} payı</span>
                              <PInput
                                sysKey={sysKey}
                                k={`${i.id}_${p.id}`}
                                official={getBasePracW(sysKey, i.id, p.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Yıl içi payı</span>
                  <PInput sysKey={sysKey} k="_inYear" official={getBaseInYear(sysKey)} />
                </div>
              </div>

              <div className="mt-2 flex justify-between border-t border-zinc-900/8 pt-3 text-sm font-medium dark:border-white/10">
                <span>Komite toplamı</span>
                <span className={ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{wText(sysKey, sum)}{ok ? ' ✓' : ` · ${unitTotal(sysKey)} olmalı`}</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-zinc-400">Boş bıraktığın kutular resmi değeri (soluk yazan) kullanır. Komite içindeki Anatomi/Histoloji pratik paylarını da dilediğin gibi değiştirebilirsin.</p>

              <button
                onClick={() => { clearPersonal(sysKey); setResetKey(x => x + 1); buzz(8); say?.(`${sys.name} resmi değerlere döndü`); }}
                className="mt-3 h-11 w-full rounded-2xl bg-zinc-900/5 text-sm font-medium text-zinc-700 transition active:scale-[.98] dark:bg-white/10 dark:text-zinc-200"
              >
                Bu dönemi resmi değerlere döndür
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

export function Settings({ theme, setTheme, onClearAll, period, isRepeat, say }) {
  return (
    <div>
      <Panel title="Tema">
        <Seg id="theme" value={theme} onChange={setTheme}
          items={[{ id: 'auto', label: 'Otomatik' }, { id: 'light', label: 'Açık' }, { id: 'dark', label: 'Koyu' }]} />
      </Panel>
      <PersonalWeights period={period} isRepeat={isRepeat} say={say} />
      <Panel title="Veriler">
        <P>Girdiğin notlar yalnızca bu cihazda saklanır.</P>
        <button
          onClick={onClearAll}
          className="mt-4 h-12 w-full rounded-2xl bg-rose-500/10 font-medium text-rose-600 transition active:scale-[.98] dark:text-rose-400"
        >
          Tüm notları temizle
        </button>
      </Panel>

      <footer className="mt-12 mb-4 flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center rounded-2xl p-2">
          <img
            src="/akdeniz-tob-logo.png"
            alt="Akdeniz Tıp Öğrencileri Birliği"
            width="225" height="225"
            className="size-24 max-w-[190px] object-contain select-none drop-shadow-sm opacity-90 transition-opacity hover:opacity-100 dark:brightness-105"
            loading="lazy"
          />
        </div>
        <p className="mt-3 text-[13px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
          akdutip<span className="text-[#E5CD82]">✦</span>com
        </p>
        <p className="mt-1 max-w-[320px] text-[11.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Akdeniz TÖB Proje ve Girişimler bünyesinde <br />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Ali Efe Küçükoğlu</span> tarafından geliştirilmiştir.
        </p>
      </footer>
    </div>
  );
}
