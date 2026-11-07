import React, { useState } from 'react';
import { Share2, Check, RefreshCw, Trophy, Calendar, Users, Wallet } from 'lucide-react';

interface NavbarProps {
  activeTab: 'setup' | 'schedule' | 'standings' | 'expenses';
  setActiveTab: (tab: 'setup' | 'schedule' | 'standings' | 'expenses') => void;
  isCloudSynced: boolean;
  onShareClick: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCloudSynced,
  onShareClick,
  onRefreshClick,
  isRefreshing,
}) => {
  const [copied, setCopied] = useState(false);

  const handleQuickCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
            🏸
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              Badminton ก๊วน
              {isCloudSynced ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded-full">
                  Local
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">จัดตารางแข่ง &amp; นับแต้มสด</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              title="รีเฟรชข้อมูลล่าสุด"
              className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 ${
                isRefreshing ? 'animate-spin text-emerald-400' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>แชร์ลิงก์</span>
          </button>

          <button
            onClick={handleQuickCopy}
            title="คัดลอกลิงก์ด่วน"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>{copied ? 'คัดลอกแล้ว!' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex border-t border-slate-800/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ตารางแข่ง</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'standings'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ตารางคะแนน</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'setup'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>สมาชิกก๊วน</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ค่าคอร์ท / หารเงิน</span>
        </button>
      </div>
    </header>
  );
};
