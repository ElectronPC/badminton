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

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&bgcolor=f8fafc&color=0f172a&margin=10`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">แชร์ลิงก์ให้เพื่อน</h3>
              <p className="text-xs text-slate-500">เพื่อนสามารถเปิดดูตารางและแต้มสดได้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <img
            src={qrImageUrl}
            alt="QR Code สำหรับสแกนเข้าดูตาราง"
            className="w-44 h-44 rounded-xl shadow-xs border border-slate-200"
          />
          <div className="text-xs text-slate-600 font-medium mt-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>ยกกล้องมือถือสแกน QR Code นี้ได้เลย</span>
          </div>
        </div>

        {/* Share Link Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-700 font-semibold">ลิงก์หน้าเว็บตารางแข่งขัน:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl font-semibold text-xs transition flex items-center gap-1 shrink-0 ${
                copied ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกลิงก์'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition active:scale-95"
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
