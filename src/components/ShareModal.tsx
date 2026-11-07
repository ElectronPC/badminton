import React, { useState } from 'react';
import type { TournamentSession } from '../types';
import { X, Copy, Check, Share2, Smartphone } from 'lucide-react';

interface ShareModalProps {
  session: TournamentSession;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate URL with room / cloudObjectId if present
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${session.cloudObjectId ? `?room=${session.cloudObjectId}` : ''}`
    : '';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=ea580c&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: `🏸 ดูตารางแข่งขันและคะแนนสดก๊วนแบด ${session.title}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">แชร์ลิงก์ให้เพื่อน</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">เพื่อนสามารถเปิดดูตารางและแต้มสดได้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <img
            src={qrImageUrl}
            alt="QR Code สำหรับสแกนเข้าดูตาราง"
            className="w-44 h-44 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 bg-white"
          />
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-orange-500" />
            <span>ยกกล้องมือถือสแกน QR Code นี้ได้เลย</span>
          </div>
        </div>

        {/* Share Link Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">ลิงก์หน้าเว็บตารางแข่งขัน:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl font-semibold text-xs transition flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-orange-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกลิงก์'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/30 transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>ส่งเข้า Line</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
