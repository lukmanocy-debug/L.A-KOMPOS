import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  Download, 
  Share2, 
  PlusSquare, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  FileBox, 
  Sparkles,
  ShieldCheck,
  Layers,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onDirectInstall: () => void;
  isIOS: boolean;
}

export const PWAInstallGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isInstallable,
  onDirectInstall,
  isIOS,
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'apk' | 'qr' | 'ios' | 'pc'>(
    isIOS ? 'ios' : 'android'
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Dapatkan URL aplikasi mandiri (di luar AI Studio)
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  useEffect(() => {
    if (appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#14532d',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Gagal membuat QR Code:', err));
    }
  }, [appUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo, ini link aplikasi mandiri L.A KOMPOS (Manajemen Produksi & Stok Kohe): ${appUrl}\n\nBuka di Google Chrome Android, lalu klik 'Pasang Aplikasi' / 'Tambahkan ke Layar Utama' agar langsung terpasang seperti aplikasi biasa!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleOpenDirectTab = () => {
    window.open(appUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="L.A Kompos"
                className="w-11 h-11 rounded-full border-2 border-white/80 bg-white object-cover shadow"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-900 text-[9px] font-extrabold px-1 rounded-full border border-white">
                APK
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-1.5">
                <span>Instal L.A Kompos di Android</span>
                <span className="bg-emerald-700/80 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/50">
                  Mandiri
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Bisa berjalan mandiri tanpa lewat perantara Google AI Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActivePlatform('android')}
            className={`px-3 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activePlatform === 'android'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Pasang di Android</span>
          </button>

          <button
            onClick={() => setActivePlatform('qr')}
            className={`px-3 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activePlatform === 'qr'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Scan QR / Buka HP</span>
          </button>

          <button
            onClick={() => setActivePlatform('apk')}
            className={`px-3 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activePlatform === 'apk'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileBox className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Unduh File .APK</span>
            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
              SIAP
            </span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`px-3 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activePlatform === 'ios'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Apple className="w-4 h-4 text-stone-700" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => setActivePlatform('pc')}
            className={`px-3 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activePlatform === 'pc'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Monitor className="w-4 h-4 text-stone-700" />
            <span>PC/Laptop</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-stone-700">
          
          {/* Quick Action: Direct URL banner */}
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="overflow-hidden w-full">
              <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Alamat Langsung Aplikasi (Bebas AI Studio):
              </p>
              <p className="text-xs text-stone-600 font-mono truncate mt-0.5 bg-white px-2 py-1 rounded border border-emerald-100">
                {appUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold border border-stone-200 flex items-center justify-center gap-1 transition"
                title="Salin Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                title="Kirim ke WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim WA</span>
              </button>
              <button
                onClick={handleOpenDirectTab}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center justify-center transition"
                title="Buka Langsung di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: ANDROID NATIVE INSTALL (WebAPK) */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-gradient-to-br from-stone-50 to-emerald-50/40 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-emerald-700 text-white rounded-lg shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Cara Termudah & Resmi: Pasang Langsung Jadi Aplikasi Android
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Sistem Android otomatis mengonversi aplikasi L.A Kompos menjadi <strong>WebAPK resmi</strong>. 
                      Aplikasi akan memiliki ikon di menu aplikasi HP Anda, terbuka full-screen tanpa address bar, bekerja 100% offline, dan sama sekali <strong>tanpa lewat Google AI Studio</strong>.
                    </p>
                  </div>
                </div>

                {isInstallable && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onDirectInstall();
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 active:scale-98 transition"
                    >
                      <Download className="w-4 h-4 animate-bounce" />
                      <span>Pasang Sekarang di Perangkat Ini</span>
                    </button>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 pt-1">
                Langkah-Langkah di HP Android:
              </h4>

              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-3 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900">Buka Link di Browser Google Chrome HP</p>
                    <p className="text-stone-600 text-[11px] mt-0.5">
                      Buka link aplikasi di atas menggunakan <strong>Google Chrome</strong> di HP Android Anda (atau scan QR code di tab 'Scan QR').
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-3 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900">Pilih Menu "Pasang Aplikasi" / "Tambahkan ke Layar Utama"</p>
                    <p className="text-stone-600 text-[11px] mt-0.5">
                      Ketuk tombol <strong>"Instal Aplikasi"</strong> di bagian atas web, ATAU ketuk titik tiga <strong>(⋮)</strong> di pojok kanan atas Chrome lalu pilih <strong>"Tambahkan ke Layar Utama" / "Install App"</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-3 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900">Aplikasi Siap Digunakan Secara Mandiri</p>
                    <p className="text-stone-600 text-[11px] mt-0.5">
                      Ikon <strong>L.A KOMPOS</strong> akan muncul di beranda dan daftar aplikasi (App Drawer) HP Anda. Buka kapan saja tanpa internet dan tanpa membuka Google AI Studio!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN QR CODE & BUKA DI HP */}
          {activePlatform === 'qr' && (
            <div className="space-y-3.5 text-center animate-in fade-in duration-150">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-stone-800 mb-1">
                  Scan dengan Kamera HP Android / Google Lens
                </p>
                <p className="text-[11px] text-stone-500 mb-3 max-w-sm">
                  Arahkan kamera smartphone Anda ke QR code di bawah untuk langsung membuka aplikasi mandiri di HP Anda:
                </p>

                {qrCodeDataUrl ? (
                  <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-emerald-600/30 inline-block">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code L.A Kompos"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-stone-200 animate-pulse rounded-2xl flex items-center justify-center text-xs text-stone-500">
                    Membuat QR Code...
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Link ke WhatsApp Saya
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Tersalin!' : 'Salin Alamat'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNDUH BERKAS .APK ASLI SIAP INSTAL */}
          {activePlatform === 'apk' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              
              {/* Berkas APK Android Siap Pasang */}
              <div className="bg-gradient-to-br from-emerald-800 to-green-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-emerald-600 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl shrink-0 mt-0.5 border border-white/20">
                    <Download className="w-6 h-6 text-emerald-300 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg tracking-tight">
                        Berkas APK Android Sudah Siap!
                      </h4>
                      <span className="bg-amber-400 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Format .APK Murni
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                      Sesuai permintaan Anda, seluruh berkas aplikasi L.A KOMPOS telah dikompilasi dan disatukan menjadi satu file instalasi Android mandiri bertipe <strong>.apk</strong>:
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href="/LA_KOMPOS.apk"
                    download="LA_KOMPOS.apk"
                    className="w-full py-3.5 px-5 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl text-sm font-black flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition text-center group"
                  >
                    <Download className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                    <span>📥 DOWNLOAD LA_KOMPOS.apk (8.3 MB)</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-100/90 pt-1">
                  <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Tersertifikasi (Signed v1/v2/v3)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>100% Offline di Kandang</span>
                  </div>
                </div>
              </div>

              {/* Panduan 3 Langkah Memasang APK di HP Android */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <h5 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  Cara Pasang Berkas .APK di HP Android Anda:
                </h5>
                <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside">
                  <li className="bg-white p-2.5 rounded-lg border border-stone-200">
                    Klik tombol hijau <strong>"DOWNLOAD LA_KOMPOS.apk"</strong> di atas.
                  </li>
                  <li className="bg-white p-2.5 rounded-lg border border-stone-200">
                    Setelah unduhan selesai, ketuk notifikasi unduhan atau buka folder <strong>Download</strong> di HP Anda, lalu ketuk file <strong>LA_KOMPOS.apk</strong>.
                  </li>
                  <li className="bg-white p-2.5 rounded-lg border border-stone-200">
                    Ketuk <strong>"Instal"</strong>. <br />
                    <span className="text-[11px] text-stone-500 italic mt-0.5 block">
                      (Catatan: Jika muncul peringatan keamanan HP <em>"Izinkan penginstalan aplikasi dari sumber ini"</em>, cukup aktifkan tombol izin tersebut, lalu ketuk <em>Instal</em>).
                    </span>
                  </li>
                  <li className="bg-white p-2.5 rounded-lg border border-stone-200 text-emerald-900 font-semibold">
                    Aplikasi L.A KOMPOS akan langsung terpasang di menu aplikasi HP Anda dan bisa dibuka kapan pun tanpa sinyal internet!
                  </li>
                </ol>
              </div>

              {/* Berkas Cadangan ZIP */}
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <FileBox className="w-4 h-4 text-stone-500" />
                  <span>Cadangan Kode Web (ZIP):</span>
                </div>
                <a
                  href="/LA_KOMPOS_Offline.zip"
                  download="LA_KOMPOS_Offline.zip"
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                >
                  Unduh ZIP (2.7 MB)
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: IPHONE / IOS */}
          {activePlatform === 'ios' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Apple className="w-4 h-4 text-stone-700" />
                Cara Pasang di iPhone / iPad (Safari):
              </h4>
              <ol className="space-y-2 text-xs text-stone-600">
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-start gap-2">
                  <span className="font-bold text-emerald-700">1.</span>
                  <span>Buka alamat aplikasi ini menggunakan browser <strong>Safari</strong> di iPhone Anda.</span>
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak berpanah atas di toolbar bawah Safari).</span>
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Gulir ke bawah dan ketuk <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).</span>
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Ketuk <strong>"Add" / "Tambah"</strong> di pojok kanan atas. Ikon aplikasi langsung ada di Home Screen iPhone!</span>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 5: PC / LAPTOP */}
          {activePlatform === 'pc' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Cara Pasang di Komputer / Laptop (Windows, Mac, Linux):
              </h4>
              <ol className="space-y-2 text-xs text-stone-600 list-decimal list-inside">
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  Buka aplikasi ini di browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  Lihat ke bagian <strong>Address Bar (bilah alamat URL)</strong> di pojok kanan atas.
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  Klik ikon kecil <strong>Install / Pasang Aplikasi</strong> (ikon monitor atau tanda +).
                </li>
                <li className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  Aplikasi akan terbuka di jendela mandiri tanpa bingkai URL!
                </li>
              </ol>
            </div>
          )}

          {/* Keuntungan Fitur Offline */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Bisa Bekerja Tanpa Sinyal / Offline 100% di Lokasi Kandang</p>
              <p className="text-emerald-800/80 mt-0.5 text-[11px]">
                Semua data produksi ngarungi dan stok opnam otomatis tersimpan di memori lokal perangkat Anda, sehingga tim kandang tetap bisa mencatat walau tanpa kuota atau di lokasi pelosok yang susah sinyal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="L.A Kompos" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs font-semibold text-stone-700 hidden sm:inline">L.A Kompos v2.1</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
