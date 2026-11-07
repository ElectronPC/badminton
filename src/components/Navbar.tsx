import React, { useState } from 'react';
import { Share2, Check, RefreshCw, Trophy, Calendar, Users, Wallet, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'setup' | 'schedule' | 'standings' | 'expenses';
  setActiveTab: (tab: 'setup' | 'schedule' | 'standings' | 'expenses') => void;
  isCloudSynced: boolean;
  onShareClick: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCloudSynced,
  onShareClick,
  onRefreshClick,
  isRefreshing,
  theme,
  onToggleTheme,
}) => {
  const [copied, setCopied] = useState(false);

  const handleQuickCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-xl shadow-md shadow-orange-500/25 text-white">
            🏸
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Badminton ก๊วน
              {isCloudSynced ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  Live Sync
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full">
                  Local
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">จัดตารางแข่ง &amp; นับแต้มสด</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day / Night Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดกลางวัน (สว่าง)' : 'เปลี่ยนเป็นโหมดกลางคืน (มืด)'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition active:scale-95 text-xs font-semibold shadow-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">กลางวัน</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">กลางคืน</span>
              </>
            )}
          </button>

          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              title="รีเฟรชข้อมูลล่าสุด"
              className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95 border border-slate-200/60 dark:border-slate-700 ${
                isRefreshing ? 'animate-spin text-orange-500' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>แชร์ลิงก์</span>
          </button>

          <button
            onClick={handleQuickCopy}
            title="คัดลอกลิงก์ด่วน"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-orange-500" /> : null}
            <span>{copied ? 'คัดลอกแล้ว!' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex border-t border-slate-200/60 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[70px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ตารางแข่ง</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex-1 min-w-[70px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'standings'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ตารางคะแนน</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex-1 min-w-[70px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'setup'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>สมาชิกก๊วน</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 min-w-[85px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ค่าคอร์ท / หารเงิน</span>
          <span className="text-[10px] opacity-75">🔒</span>
        </button>
      </div>
    </header>
  );
};
