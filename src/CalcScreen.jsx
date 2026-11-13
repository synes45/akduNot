import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PERIODS, SYSTEMS, getSystemKey, getW, getInYear, isPersonalOn } from './config';
import { fieldsOf, itemScore, has, clean, fmt, buzz } from './calc';
import { Seg, Field, Chevron, soft } from './ui';

function Committee({ sysKey, item, s, setScore, collapsedFlag, setFlag }) {
  const fs = fieldsOf(item, sysKey);
  const filled = fs.filter(f => has(s?.[f.id])).length;
  const score = itemScore(item, s || {}, sysKey);
  const done = score !== null;
  const collapsed = collapsedFlag && done;
  const pracFields = fs.filter(f => f.kind === 'prac');
  const pdoField = fs.find(f => f.kind === 'pdo');
  const theoryField = fs.find(f => f.kind === 'theory');
  const more = pracFields.length > 0 || !!pdoField;

  // Eksik kalan (ya da silinen) komite kapanamaz; tamamlanınca yeniden kapanabilir hale gelir.
  useEffect(() => { if (!done && collapsedFlag) setFlag(false); }, [done, collapsedFlag, setFlag]);

  const field = (f, label, hint, cls) => (
    <Field key={f.id} className={cls} label={label} hint={hint} value={s?.[f.id]} onChange={v => setScore(f.id, clean(v, f.max))} />
  );

  return (
    <section className="card-surface mb-5 overflow-hidden rounded-3xl transition-colors">
      <button
        type="button"
        onClick={() => { if (done) { setFlag(!collapsed); buzz(6); } }}
        aria-expanded={!collapsed}
        className={`flex w-full items-center gap-3 px-5 py-4 text-left ${done ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="flex-1 text-[15px] font-semibold text-zinc-900 dark:text-white">{item.label}</span>
        <span className="rounded-full border border-[#F5E6B3]/30 bg-[#F5E6B3]/20 px-2.5 py-0.5 text-xs font-semibold text-[#8F6D1D] dark:text-[#F3E5AB]">%{fmt(getW(sysKey, item))}</span>
        {done ? (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="text-sm font-semibold tabular-nums">{score.toFixed(1)}</span>
            <Chevron open={!collapsed} />
          </span>
        ) : (
          <span className="min-w-9 text-right text-xs font-medium tabular-nums text-zinc-400">{filled}/{fs.length}</span>
        )}
      </button>

      <motion.div
        initial={false}
        animate={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
        transition={{ height: soft, opacity: { duration: 0.15 } }}
        style={{ overflow: 'hidden' }}
        inert={collapsed}
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 px-5 pb-5 pt-1">
          {theoryField && field(theoryField, more || item.id[0] === 'k' ? 'Teorik' : 'Not', null, more ? '' : 'col-span-2')}
          {pdoField ? field(pdoField, 'PDÖ') : more && <div />}
          {pracFields.length > 0 && <div className="col-span-2 h-px bg-zinc-900/6 dark:bg-white/10" />}
          {pracFields.map(pf => field(pf, pf.label, `en çok ${fmt(pf.max)}`, ''))}
        </div>
      </motion.div>
    </section>
  );
}

export default function Calc({
  period,
  setPeriod,
  isRepeat,
  setIsRepeat,
  scores,
  setScore,
  collapsed,
  setCollapsed,
}) {
  const sysKey = getSystemKey(period, isRepeat);
  const sys = SYSTEMS[sysKey];
  const s = scores[sysKey] || {};
  const b = 100 - getInYear(sysKey);
  const personal = isPersonalOn();

  return (
    <div>
      {/* 1. Seçenek: Dönem 1, Dönem 2, Dönem 3 (25 24 ibareleri yok) */}
      <Seg
        id="period"
        value={period}
        onChange={setPeriod}
        items={PERIODS.map(p => ({ id: p.id, label: p.label }))}
      />

      {personal && (
        <div className="mt-3.5 flex items-center gap-2 rounded-2xl border border-[#F5E6B3]/35 bg-[#F5E6B3]/15 px-4 py-2 text-[12px] font-medium text-[#8F6D1D] dark:text-[#F3E5AB]">
          <span className="size-1.5 rounded-full bg-[#E8D184]" />
          Kişisel yüzdeliklerin kullanılıyor
        </div>
      )}

      {/* 2. Seçenek: Dönem tekrarıyım toggle — ferah aralıklar */}
      <div className="mt-4 flex items-center justify-between rounded-2xl card-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-[#F5E6B3]/20 text-[#8F6D1D] dark:text-[#F3E5AB]">
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
            </svg>
          </span>
          <div>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">Dönem tekrarıyım</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isRepeat ? `${sys?.name} tekrar ağırlıkları aktif` : `${sys?.name} normal ağırlıkları aktif`}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isRepeat}
          onClick={() => {
            buzz(8);
            setIsRepeat(!isRepeat);
          }}
          className={`relative inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors ${
            isRepeat ? 'bg-[#E8D184]' : 'bg-zinc-200 dark:bg-white/15'
          }`}
        >
          <span
            className={`inline-block size-5.5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
              isRepeat ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Komiteler listesi — aralar açık, nefes alan ferah yerleşim */}
      <div key={sysKey} className="mt-6">
        {sys.items.map(item => {
          const key = `${sysKey}.${item.id}`;
          return (
            <Committee
              key={key}
              sysKey={sysKey}
              item={item}
              s={s}
              setScore={(id, v) => setScore(sysKey, id, v)}
              collapsedFlag={!!collapsed[key]}
              setFlag={v => setCollapsed(c => (c[key] === v ? c : { ...c, [key]: v }))}
            />
          );
        })}

        <section className="card-surface rounded-3xl p-5">
          <Field
            big
            label="Final sınavı"
            hint={`%${fmt(b)}`}
            value={s.final}
            onChange={v => setScore(sysKey, 'final', clean(v, 100))}
          />
        </section>
      </div>
    </div>
  );
}
