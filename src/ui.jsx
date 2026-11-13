import { useEffect, useRef } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';

export const spring = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 };
export const soft = { type: 'spring', duration: 0.35, bounce: 0 };

/** 4 köşeli yıldız (logo ve uzay süsleme işareti) */
export function Star({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  );
}

/** akdutip✦space — nokta yerine 4 köşeli yıldız, "space" üstte */
export function Logo({ className = '' }) {
  return (
    <a href="/" className={`relative z-10 inline-flex items-start select-none ${className}`} aria-label="akdutip.space">
      <span className="text-[22px] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">akdutip</span>
      <Star className="mx-[3px] mt-[3px] size-[13px] text-[#F3E5AB] drop-shadow-[0_0_8px_rgba(243,229,171,0.65)]" />
      <span className="-mt-[2px] text-[11px] font-semibold leading-none tracking-wide text-zinc-400 dark:text-zinc-500">space</span>
    </a>
  );
}

/** Sitenin üstü için zarif yarım ay ve yıldız süslemesi (akdutip.space uzay teması, abartısız) */
export function CelestialDeco({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex items-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 32"
        style={{ width: '80px', height: '26px' }}
        className="flex-none text-[#B8963D] opacity-45 dark:text-[#F5E6B3] dark:opacity-90 drop-shadow-[0_0_8px_rgba(245,230,175,0.45)]"
      >
        {/* Minik 4 Köşeli Yıldız 1 */}
        <path
          fill="currentColor"
          transform="translate(4, 14) scale(0.35)"
          d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
          opacity="0.75"
        />

        {/* Minik 4 Köşeli Yıldız 2 */}
        <path
          fill="currentColor"
          transform="translate(24, 6) scale(0.48)"
          d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
        />

        {/* Minik 4 Köşeli Yıldız 3 */}
        <path
          fill="currentColor"
          transform="translate(45, 18) scale(0.3)"
          d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
          opacity="0.8"
        />

        {/* Zarif Hilal / Yarım Ay */}
        <g transform="translate(68, 4) scale(0.95) rotate(-10 12 12)">
          <path
            fill="currentColor"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </g>

        {/* Uzay tozu noktaları */}
        <circle cx="16" cy="18" r="1" fill="currentColor" opacity="0.6" />
        <circle cx="36" cy="10" r="0.8" fill="currentColor" opacity="0.5" />
        <circle cx="58" cy="8" r="1.1" fill="currentColor" opacity="0.7" />
      </svg>
    </div>
  );
}

/** Ay sarısı / toz sarı arka plan glowları.
 * iPhone'da çökme/kasma olmaması için: blur filtresi YOK, animasyon YOK — yalnızca
 * tek bir sabit katmanda statik radial-gradient. */
export function Backdrop() {
  return <div aria-hidden="true" className="glow-bg pointer-events-none fixed inset-0 -z-10" />;
}

/** Kayan seçim işaretli segment kontrol */
export function Seg({ items, value, onChange, id }) {
  return (
    <div className="card-surface relative flex rounded-2xl p-1" role="tablist">
      {items.map(it => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            className={`relative flex-1 rounded-xl px-2 py-2 text-[13px] font-medium leading-tight transition-colors ${
              on ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-xl bg-zinc-100 shadow-sm dark:bg-white/10"
              />
            )}
            <span className="relative block">{it.label}</span>
            {it.sub && <span className="relative block text-[10.5px] font-normal opacity-60">{it.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Değer değiştikçe sayarak güncellenen sayı (bellek sızıntısız temiz listener) */
export function Num({ value, dec = 1, className = '' }) {
  const mv = useMotionValue(value);
  const ref = useRef(null);

  useEffect(() => {
    const c = animate(mv, value, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, mv]);

  useEffect(() => {
    const unsub = mv.on('change', v => {
      if (ref.current) ref.current.textContent = v.toFixed(dec);
    });
    return unsub;
  }, [mv, dec]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{value.toFixed(dec)}</span>;
}

export function Field({ label, hint, value, onChange, big, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 ml-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}{hint && <em className="ml-1 font-normal not-italic opacity-60">· {hint}</em>}
      </span>
      <input
        data-score-input
        className={`field ${big ? '!h-14 text-center !text-2xl font-semibold' : ''}`}
        type="text" inputMode="decimal" enterKeyHint="next" autoComplete="off" placeholder="0"
        value={value ?? ''} onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key !== 'Enter') return;
          const all = [...document.querySelectorAll('[data-score-input]')].filter(i => !i.closest('[inert]'));
          const next = all[all.indexOf(e.target) + 1];
          next ? next.focus() : e.target.blur();
        }}
      />
    </label>
  );
}

export const Chevron = ({ open }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className="size-4 fill-none stroke-current"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: open ? 180 : 0 }}
    transition={spring}
  >
    <path d="m6 9 6 6 6-6" />
  </motion.svg>
);
