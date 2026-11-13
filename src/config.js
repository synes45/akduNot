/* Dönemler, komiteler ve 6 farklı hesaplama sistemi:
 * 3 Dönem (Dönem 1, Dönem 2, Dönem 3) × 2 Durum (İlk defa alanlar / Dönem tekrarı) = 6 Sistem.
 *
 * Ağırlıklar şu sırayla belirlenir:
 *   1. Bu cihazdaki yönetici önizlemesi (localStorage, /admin'den)
 *   2. /api/weights (sunucuda saklanan, herkesin gördüğü değerler; server.js)
 *   3. Aşağıdaki varsayılanlar (w)
 */

export const PDO_RATIO = 0.15;
export const PASS = 59.5;
const LOCAL_KEY = 'atn_weights_local';

export const PERIODS = [
  { id: 'd1', label: 'Dönem 1' },
  { id: 'd2', label: 'Dönem 2' },
  { id: 'd3', label: 'Dönem 3' },
];

export const getSystemKey = (period, isRepeat) => `${period}_${isRepeat ? 'repeat' : 'normal'}`;

export const SYSTEMS = {
  d1_normal: {
    period: 'd1', isRepeat: false,
    name: 'Dönem 1', statusLabel: 'İlk defa alanlar', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 22 },
      { id: 'k2', label: 'Komite 2', w: 18, pdo: true },
      { id: 'k3', label: 'Komite 3', w: 30, mult: 0.75, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k4', label: 'Komite 4', w: 16, mult: 0.82, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }] },
      { id: 'dsbb', label: 'DSBB', w: 10 },
      { id: 'tdp', label: 'TDP', w: 4 },
    ],
  },
  d1_repeat: {
    period: 'd1', isRepeat: true,
    name: 'Dönem 1', statusLabel: 'Dönem tekrarı', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 14 },
      { id: 'k2', label: 'Komite 2', w: 22, pdo: true },
      { id: 'k3', label: 'Komite 3', w: 32, mult: 0.75, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k4', label: 'Komite 4', w: 18, mult: 0.82, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }] },
      { id: 'dsbb', label: 'DSBB', w: 10 },
      { id: 'tdp', label: 'TDP', w: 4 },
    ],
  },
  d2_normal: {
    period: 'd2', isRepeat: false,
    name: 'Dönem 2', statusLabel: 'İlk defa alanlar', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 25.13, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k2', label: 'Komite 2', w: 22.3, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k3', label: 'Komite 3', w: 23.29, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k4', label: 'Komite 4', w: 17.3, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k5', label: 'Komite 5', w: 11.98, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 6 }, { id: 'histo', label: 'Histoloji pratik', max: 3 }] },
      { id: 'ocm', label: 'ÖÇM', w: 0 },
    ],
  },
  d2_repeat: {
    period: 'd2', isRepeat: true,
    name: 'Dönem 2', statusLabel: 'Dönem tekrarı', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 25.13, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k2', label: 'Komite 2', w: 22.3, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k3', label: 'Komite 3', w: 23.29, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k4', label: 'Komite 4', w: 17.3, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 18 }, { id: 'histo', label: 'Histoloji pratik', max: 7 }] },
      { id: 'k5', label: 'Komite 5', w: 11.98, pdo: true,
        prac: [{ id: 'anatomi', label: 'Anatomi pratik', max: 6 }, { id: 'histo', label: 'Histoloji pratik', max: 3 }] },
      { id: 'ocm', label: 'ÖÇM', w: 0 },
    ],
  },
  d3_normal: {
    period: 'd3', isRepeat: false,
    name: 'Dönem 3', statusLabel: 'İlk defa alanlar', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 16, pdo: true },
      { id: 'k2', label: 'Komite 2', w: 16, pdo: true },
      { id: 'k3', label: 'Komite 3', w: 16, pdo: true },
      { id: 'k4', label: 'Komite 4', w: 16, pdo: true },
      { id: 'k5', label: 'Komite 5', w: 16, pdo: true },
      { id: 'k6', label: 'Komite 6', w: 16, pdo: true },
      { id: 'tdp', label: 'TDP', w: 4 },
    ],
  },
  d3_repeat: {
    period: 'd3', isRepeat: true,
    name: 'Dönem 3', statusLabel: 'Dönem tekrarı', inYear: 60,
    items: [
      { id: 'k1', label: 'Komite 1', w: 16, pdo: true },
      { id: 'k2', label: 'Komite 2', w: 16, pdo: true },
      { id: 'k3', label: 'Komite 3', w: 16, pdo: true },
      { id: 'k4', label: 'Komite 4', w: 16, pdo: true },
      { id: 'k5', label: 'Komite 5', w: 16, pdo: true },
      { id: 'k6', label: 'Komite 6', w: 16, pdo: true },
      { id: 'tdp', label: 'TDP', w: 4 },
    ],
  },
};

export const SYSTEM_KEYS = Object.keys(SYSTEMS);

let remote = {};
const readLocal = (key = LOCAL_KEY) => {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
};
let local = readLocal();

/* Kişisel yüzdelikler: yalnızca bu cihazda, kullanıcının Ayarlar'dan girdiği değerler.
 * Açıkken her şeyin önüne geçer. { enabled: bool, d1_normal: { k1: 20, _inYear: 60, ... }, ... } */
const PERSONAL_KEY = 'atn_weights_personal';
let personal = readLocal(PERSONAL_KEY);
const savePersonal = () => {
  try { localStorage.setItem(PERSONAL_KEY, JSON.stringify(personal)); } catch { /* dolu */ }
  window.dispatchEvent(new Event('atn-weights'));
};
export const isPersonalOn = () => !!personal.enabled;
export const setPersonalOn = on => { personal.enabled = !!on; savePersonal(); };
export const setPersonal = (sysKey, key, val) => {
  const o = (personal[sysKey] ||= {});
  if (val === undefined || val === null || Number.isNaN(val)) delete o[key]; else o[key] = val;
  savePersonal();
};
export const getPersonalRaw = (sysKey, key) => personal[sysKey]?.[key];
export const clearPersonal = sysKey => {
  if (sysKey) delete personal[sysKey];
  else personal = { enabled: personal.enabled };
  savePersonal();
};

/** Kişisel katman hariç (resmi) değer */
const pickBase = (sysKey, key, fallback) => {
  if (local[sysKey] && local[sysKey][key] !== undefined) return local[sysKey][key];
  if (key === 'ocm' && local[sysKey]?.tdp !== undefined) return local[sysKey].tdp;
  if (remote[sysKey] && remote[sysKey][key] !== undefined) return remote[sysKey][key];
  if (key === 'ocm' && remote[sysKey]?.tdp !== undefined) return remote[sysKey].tdp;
  return fallback;
};
const pick = (sysKey, key, fallback) => {
  if (personal.enabled && personal[sysKey]) {
    if (personal[sysKey][key] !== undefined) return personal[sysKey][key];
    if (key === 'ocm' && personal[sysKey].tdp !== undefined) return personal[sysKey].tdp;
  }
  return pickBase(sysKey, key, fallback);
};

export const ready = Promise.race([
  fetch('/api/weights', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : {}))
    .then(j => { remote = j || {}; })
    .catch(() => {}),
  new Promise(r => setTimeout(r, 1500)),
]);

export const getW = (sysKey, item) => pick(sysKey, item.id, item.w);
export const getInYear = sysKey => pick(sysKey, '_inYear', SYSTEMS[sysKey]?.inYear ?? 60);

/** Pratik sınav ağırlığını döndürür (kişisel > yerel > uzak > varsayılan) */
export const getPracW = (sysKey, itemId, pracId) => {
  const item = SYSTEMS[sysKey]?.items.find(i => i.id === itemId);
  const p = item?.prac?.find(x => x.id === pracId);
  const fallback = p?.max ?? 0;
  const k = `${itemId}_${pracId}`;
  return pick(sysKey, k, fallback);
};

export const getBasePracW = (sysKey, itemId, pracId) => {
  const item = SYSTEMS[sysKey]?.items.find(i => i.id === itemId);
  const p = item?.prac?.find(x => x.id === pracId);
  const fallback = p?.max ?? 0;
  const k = `${itemId}_${pracId}`;
  return pickBase(sysKey, k, fallback);
};

/** Komitedeki teorik sınav payı yüzdesini döndürür: 100 - (anatomi + histo + ...) */
export const getTheoryW = (sysKey, item) => {
  if (!item.prac || item.prac.length === 0) return (item.mult ?? 1) * 100;
  const pracSum = item.prac.reduce((sum, p) => sum + getPracW(sysKey, item.id, p.id), 0);
  return Math.max(0, 100 - pracSum);
};

export const getBaseTheoryW = (sysKey, item) => {
  if (!item.prac || item.prac.length === 0) return (item.mult ?? 1) * 100;
  const pracSum = item.prac.reduce((sum, p) => sum + getBasePracW(sysKey, item.id, p.id), 0);
  return Math.max(0, 100 - pracSum);
};

/** Resmi (yönetici/yayınlanan) değerler — kişisel katmanı yok sayar */
export const getBaseW = (sysKey, item) => pickBase(sysKey, item.id, item.w);
export const getBaseInYear = sysKey => pickBase(sysKey, '_inYear', SYSTEMS[sysKey]?.inYear ?? 60);
export const setLocal = (sysKey, key, val) => {
  (local[sysKey] ||= {})[key] = val;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
};
export const clearLocal = () => {
  local = {};
  localStorage.removeItem(LOCAL_KEY);
};
export const weightSum = sysKey => SYSTEMS[sysKey]?.items.reduce((a, i) => a + getW(sysKey, i), 0) ?? 100;
export const baseWeightSum = sysKey => SYSTEMS[sysKey]?.items.reduce((a, i) => a + getBaseW(sysKey, i), 0) ?? 100;

/** Yayınlanacak weights.json içeriği (mevcut etkin değerler) */
export const exportJson = () => {
  const o = {};
  SYSTEM_KEYS.forEach(k => {
    o[k] = { _inYear: getBaseInYear(k) };
    SYSTEMS[k].items.forEach(i => {
      o[k][i.id] = getBaseW(k, i);
      (i.prac || []).forEach(p => {
        o[k][`${i.id}_${p.id}`] = getBasePracW(k, i.id, p.id);
      });
    });
  });
  return JSON.stringify(o, null, 2) + '\n';
};
