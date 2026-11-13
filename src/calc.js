import { SYSTEMS, PDO_RATIO, PASS, getW, getInYear, getPracW, getTheoryW } from './config';

export const num = v => Number(String(v).replace(',', '.'));
export const has = v => v !== undefined && v !== '' && !isNaN(num(v));
export const fmt = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
export const buzz = ms => { try { navigator.vibrate?.(ms); } catch { /* yok say */ } };

/** Girdiyi temizler: yalnızca rakam ve tek ondalık ayracı, üst sınıra kırpar. */
export function clean(v, max) {
  let s = v.replace(/[^0-9.,]/g, '');
  const parts = s.split(/[.,]/);
  if (parts.length > 2) s = parts[0] + ',' + parts.slice(1).join('');
  if (s !== '' && num(s) > max) s = String(max);
  return s;
}

export function fieldsOf(item, sysKey) {
  const f = [{ id: item.id, kind: 'theory', max: 100 }];
  (item.prac || []).forEach(p => {
    const pw = sysKey ? getPracW(sysKey, item.id, p.id) : p.max;
    if (pw > 0) {
      f.push({ id: `${item.id}_${p.id}`, kind: 'prac', max: p.in ?? pw, w: pw, label: p.label });
    }
  });
  if (item.pdo) f.push({ id: `${item.id}_pdo`, kind: 'pdo', max: 100, label: 'PDÖ' });
  return f;
}

export function itemScore(item, s, sysKey) {
  const fs = fieldsOf(item, sysKey);
  if (!fs.every(f => has(s[f.id]))) return null;

  let exam = 0;
  const pracFields = fs.filter(f => f.kind === 'prac');
  if (pracFields.length > 0 && sysKey) {
    const thW = getTheoryW(sysKey, item);
    exam = num(s[item.id]) * (thW / 100);
    pracFields.forEach(pf => {
      exam += num(s[pf.id]) * pf.w / pf.max;
    });
  } else {
    exam = num(s[item.id]) * (item.mult ?? 1);
    pracFields.forEach(pf => {
      exam += num(s[pf.id]) * pf.w / pf.max;
    });
  }

  return item.pdo ? exam * (1 - PDO_RATIO) + num(s[`${item.id}_pdo`]) * PDO_RATIO : exam;
}

export function compute(sysKey, s) {
  const sys = SYSTEMS[sysKey];
  if (!sys) return { ready: false, progress: 0, filled: 0, count: 0 };
  let total = 0, filled = 0, count = 0, ready = true;
  sys.items.forEach(item => {
    const w = getW(sysKey, item);
    const fs = fieldsOf(item, sysKey);
    if (w > 0) {
      count += fs.length;
      filled += fs.filter(f => has(s?.[f.id])).length;
      const sc = itemScore(item, s || {}, sysKey);
      if (sc === null) ready = false;
      else total += sc * w / 100;
    } else {
      // 0 ağırlıklı kalemler (örn: varsayılan ÖÇM)
      const filledSub = fs.filter(f => has(s?.[f.id])).length;
      if (filledSub > 0) {
        filled += filledSub;
        count += fs.length;
      }
    }
  });
  const finalFilled = has(s?.final);
  count += 1; filled += finalFilled ? 1 : 0;
  const a = getInYear(sysKey) / 100, b = 1 - a;
  const out = { ready, progress: count > 0 ? Math.round(filled / count * 100) : 0, filled, count };
  if (ready) {
    const need = (PASS - total * a) / b;
    out.impossible = need > 100;
    out.alreadyPassed = need <= 40;
    out.need = Math.min(Math.max(need, 40), 100);
    if (finalFilled) out.genel = total * a + num(s.final) * b;
  }
  return out;
}
