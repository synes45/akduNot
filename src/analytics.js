/**
 * akdutip.space Ziyaretçi & Canlı Trafik Analitik Modülü
 * Siteye giren/çıkan kişi sayısını, tekil ziyaretçileri ve anlık aktif kullanıcıları takip eder.
 */

const API_BASE = 'https://countapi.mileshilliard.com/api/v1';

// Bugünün tarih anahtarı (örn: 2026_10_13)
export function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}_${m}_${day}`;
}

/** Sayfa açıldığında giriş ve tekil ziyaretçi takibini başlatır */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  const today = getTodayKey();
  const sessionKey = 'atn_session_' + Date.now();
  sessionStorage.setItem('atn_active_session', sessionKey);

  // 1. Toplam Giriş Sayacı (Hit)
  try {
    fetch(`${API_BASE}/hit/akdutip_total_entries`, { mode: 'cors' }).catch(() => {});
    fetch(`${API_BASE}/hit/akdutip_entries_${today}`, { mode: 'cors' }).catch(() => {});
  } catch (e) {
    // Çevrimdışı veya bloklanmış durumlar için sessiz kal
  }

  // 2. Tekil Ziyaretçi Sayacı (Cihazda ilk kez açılıyorsa)
  if (!localStorage.getItem('atn_device_tracked')) {
    localStorage.setItem('atn_device_tracked', '1');
    try {
      fetch(`${API_BASE}/hit/akdutip_unique_visitors`, { mode: 'cors' }).catch(() => {});
    } catch (e) {}
  }

  // 3. Siteden Çıkış (Ayrılma) Takibi (Sekme kapatma / arka plana atma)
  let exited = false;
  const onExit = () => {
    if (exited) return;
    exited = true;

    const exitUrl = `${API_BASE}/hit/akdutip_total_exits`;
    const todayExitUrl = `${API_BASE}/hit/akdutip_exits_${today}`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(exitUrl);
      navigator.sendBeacon(todayExitUrl);
    } else {
      fetch(exitUrl, { keepalive: true, mode: 'cors' }).catch(() => {});
      fetch(todayExitUrl, { keepalive: true, mode: 'cors' }).catch(() => {});
    }
  };

  window.addEventListener('pagehide', onExit);
  window.addEventListener('beforeunload', onExit);
}

/** Admin paneli için canlı istatistikleri çeker */
export async function fetchAnalytics() {
  const today = getTodayKey();

  const getVal = async (key) => {
    try {
      const res = await fetch(`${API_BASE}/get/${key}`, { cache: 'no-store', mode: 'cors' });
      const data = await res.json();
      return data.value ? Number(data.value) : 0;
    } catch (e) {
      return 0;
    }
  };

  const [
    totalEntries,
    totalExits,
    todayEntries,
    todayExits,
    uniqueVisitors
  ] = await Promise.all([
    getVal('akdutip_total_entries'),
    getVal('akdutip_total_exits'),
    getVal(`akdutip_entries_${today}`),
    getVal(`akdutip_exits_${today}`),
    getVal('akdutip_unique_visitors')
  ]);

  // Canlı aktif kullanıcı hesabı: giren - çıkan (en az 1 kabul edilir)
  const estimatedOnline = Math.max(1, Math.min(totalEntries, totalEntries - totalExits));

  return {
    totalEntries,
    totalExits,
    todayEntries,
    todayExits,
    uniqueVisitors,
    estimatedOnline,
    updatedAt: new Date().toLocaleTimeString('tr-TR')
  };
}
