import React, { useState, useMemo } from 'react';
import type { TournamentSession, ExpenseInfo } from '../types';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Share2,
  QrCode,
  DollarSign,
  Users,
  CreditCard,
  Sparkles,
  Settings,
  Lock,
  LogOut,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface ExpensesViewProps {
  session: TournamentSession;
  onSaveExpenses: (expenses: ExpenseInfo) => void;
  onGoToSchedule: () => void;
}

interface PlayerItem {
  id: string; // e.g. "team-1-p1"
  name: string;
  teamCode: string;
  teamName: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  session,
  onSaveExpenses,
  onGoToSchedule,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('badminton_expenses_auth') === 'true';
    }
    return false;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const currentExpenses = session.expenses || {
    courtFee: 600,
    shuttlecockFee: 0,
    promptPayNumber: '',
    promptPayName: '',
    paidPlayerIds: [],
  };

  const [courtFee, setCourtFee] = useState<number>(Number(currentExpenses.courtFee) || 600);
  const [shuttlecockFee, setShuttlecockFee] = useState<number>(
    Number(currentExpenses.shuttlecockFee) || 0
  );
  const [promptPayNumber, setPromptPayNumber] = useState<string>(
    currentExpenses.promptPayNumber || ''
  );
  const [promptPayName, setPromptPayName] = useState<string>(
    currentExpenses.promptPayName || ''
  );
  const [paidPlayerIds, setPaidPlayerIds] = useState<string[]>(
    currentExpenses.paidPlayerIds || []
  );

  const [copiedPromptPay, setCopiedPromptPay] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'Electron' && passwordInput === 'Electron_11') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('badminton_expenses_auth', 'true');
      }
      setLoginError('');
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('badminton_expenses_auth');
    }
  };

  // Extract all individual players from session.teams
  const allPlayers: PlayerItem[] = useMemo(() => {
    const list: PlayerItem[] = [];
    session.teams.forEach((t) => {
      if (t.player1) {
        list.push({
          id: `${t.id}-p1`,
          name: t.player1,
          teamCode: t.code,
          teamName: t.name,
        });
      }
      if (t.player2) {
        list.push({
          id: `${t.id}-p2`,
          name: t.player2,
          teamCode: t.code,
          teamName: t.name,
        });
      }
    });
    return list;
  }, [session.teams]);

  const numPlayers = allPlayers.length || 1;
  const totalAmount = courtFee + shuttlecockFee;
  const perPerson = Math.ceil(totalAmount / numPlayers);

  // Save changes
  const saveState = (updatedPaid: string[], newCourt = courtFee, newShuttle = shuttlecockFee) => {
    setPaidPlayerIds(updatedPaid);
    onSaveExpenses({
      courtFee: newCourt,
      shuttlecockFee: newShuttle,
      promptPayNumber: promptPayNumber.trim(),
      promptPayName: promptPayName.trim(),
      paidPlayerIds: updatedPaid,
    });
  };

  const handleTogglePaid = (playerId: string) => {
    const next = paidPlayerIds.includes(playerId)
      ? paidPlayerIds.filter((id) => id !== playerId)
      : [...paidPlayerIds, playerId];
    saveState(next);
  };

  const handleMarkAllPaid = () => {
    const allIds = allPlayers.map((p) => p.id);
    saveState(allIds);
  };

  const handleResetPaid = () => {
    saveState([]);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveExpenses({
      courtFee,
      shuttlecockFee,
      promptPayNumber: promptPayNumber.trim(),
      promptPayName: promptPayName.trim(),
      paidPlayerIds,
    });
    alert('บันทึกข้อมูลค่าใช้จ่ายและพร้อมเพย์เรียบร้อยแล้ว');
  };

  const handleCopyPromptPay = () => {
    if (!promptPayNumber.trim()) return;
    navigator.clipboard.writeText(promptPayNumber.trim());
    setCopiedPromptPay(true);
    setTimeout(() => setCopiedPromptPay(false), 2000);
  };

  // Generate LINE Summary Text
  const handleCopyLineSummary = () => {
    const paidList = allPlayers.filter((p) => paidPlayerIds.includes(p.id));
    const unpaidList = allPlayers.filter((p) => !paidPlayerIds.includes(p.id));

    let text = `🏸 สรุปค่าคอร์ทแบดมินตัน - ${session.title}\n`;
    text += `📅 วันที่: ${session.date}\n`;
    text += `💰 ค่าคอร์ท: ${courtFee.toLocaleString()} บาท\n`;
    if (shuttlecockFee > 0) {
      text += `🏸 ค่าลูกแบด/อื่นๆ: ${shuttlecockFee.toLocaleString()} บาท\n`;
    }
    text += `💵 ยอดรวมทั้งหมด: ${totalAmount.toLocaleString()} บาท (${numPlayers} คน)\n`;
    text += `👉 ตกคนละ: ${perPerson.toLocaleString()} บาท\n\n`;

    if (promptPayNumber.trim()) {
      text += `📱 พร้อมเพย์: ${promptPayNumber.trim()}${
        promptPayName.trim() ? ` (${promptPayName.trim()})` : ''
      }\n\n`;
    }

    text += `✅ จ่ายแล้ว (${paidList.length}/${numPlayers} คน):\n`;
    if (paidList.length > 0) {
      text += paidList.map((p) => ` • ${p.name} (${p.teamName})`).join('\n') + '\n\n';
    } else {
      text += ` - ยังไม่มี -\n\n`;
    }

    text += `⏳ ยังไม่จ่าย (${unpaidList.length} คน):\n`;
    if (unpaidList.length > 0) {
      text += unpaidList.map((p) => ` • ${p.name} (${p.teamName})`).join('\n');
    } else {
      text += ` - จ่ายครบทุกคนแล้ว! ขอบคุณครับ 🎉 -`;
    }

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const paidCount = allPlayers.filter((p) => paidPlayerIds.includes(p.id)).length;
  const collectedAmount = paidCount * perPerson;
  const remainingAmount = totalAmount - collectedAmount;

  // PromptPay QR image URL
  const cleanPromptPay = promptPayNumber.replace(/[^0-9]/g, '');
  const promptPayQrUrl = cleanPromptPay
    ? `https://promptpay.io/${cleanPromptPay}/${perPerson}.png`
    : null;

  // ==========================================
  // 🔒 LOGIN GATE IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-14 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 transition-colors">
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              เข้าสู่ระบบจัดการค่าใช้จ่าย
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลก๊วน (Admin) เท่านั้น<br />
              สมาชิกทั่วไปสามารถเข้าใช้งานได้ 3 ส่วนแรก
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อผู้ใช้"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                placeholder="ระบุรหัสผ่าน"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.99] mt-2"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Back Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onGoToSchedule}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับไปดูตารางแข่งขัน</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔓 AUTHENTICATED EXPENSES VIEW
  // ==========================================
  return (
    <div className="space-y-5 pb-12">
      {/* Admin Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-orange-800 dark:text-orange-300">
          <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span>เข้าสู่ระบบในชื่อ: <b>Electron</b> (ผู้ดูแลระบบ)</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Top Banner - Sunset Orange / Red Theme */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-rose-600 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-200" />
              <span>สรุปค่าใช้จ่าย &amp; หารค่าคอร์ท</span>
            </h2>
            <p className="text-xs text-amber-100 mt-1">
              คำนวณและหารเฉลี่ยเท่าๆ กันตามรายชื่อสมาชิกที่มาเล่นวันนี้ ({numPlayers} คน)
            </p>
          </div>

          <button
            onClick={handleCopyLineSummary}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-orange-800 hover:bg-orange-50 font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-orange-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedSummary ? 'คัดลอกสรุปสำเร็จ!' : 'คัดลอกสรุปส่ง LINE'}</span>
          </button>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-orange-100 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>ค่าใช้จ่ายรวม</span>
            </div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono">
              {totalAmount.toLocaleString()} <span className="text-xs font-normal">บาท</span>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-orange-100 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>จำนวนคนหาร</span>
            </div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono">
              {numPlayers} <span className="text-xs font-normal">คน</span>
            </div>
          </div>

          <div className="bg-white text-orange-900 rounded-xl p-3 sm:p-4 text-center shadow-md">
            <div className="text-xs text-orange-700 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ตกคนละ</span>
            </div>
            <div className="text-xl sm:text-3xl font-black mt-0.5 text-orange-600 font-mono">
              {perPerson.toLocaleString()} <span className="text-xs font-semibold text-slate-600">บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* PromptPay Info Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-500" />
          <span>ช่องทางชำระเงิน (พร้อมเพย์)</span>
        </h3>

        {promptPayNumber.trim() ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-orange-50/50 dark:bg-slate-950/60 border border-orange-200/70 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-2xl shrink-0">
                📱
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">หมายเลขพร้อมเพย์</div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
                  {promptPayNumber}
                </div>
                {promptPayName.trim() && (
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อบัญชี: {promptPayName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyPromptPay}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm transition active:scale-95"
              >
                {copiedPromptPay ? <Check className="w-3.5 h-3.5 text-orange-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPromptPay ? 'คัดลอกแล้ว!' : 'คัดลอกเบอร์'}</span>
              </button>

              {promptPayQrUrl && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>เปิด QR Code ({perPerson} บ.)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
            ยังไม่ได้ระบุหมายเลขพร้อมเพย์ สามารถใส่หมายเลขในแบบฟอร์มด้านล่างได้เลยครับ
          </div>
        )}
      </div>

      {/* Member Payment Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
        {/* Header & Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
              <span>เช็คชื่อการจ่ายเงิน ({paidCount} / {numPlayers} คน)</span>
            </h3>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={handleMarkAllPaid}
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                จ่ายครบทุกคน
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={handleResetPaid}
                className="text-slate-500 hover:underline"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-rose-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((paidCount / numPlayers) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            <span>เก็บได้แล้ว: <b className="text-orange-600 dark:text-orange-400 font-bold">{collectedAmount.toLocaleString()} บาท</b></span>
            <span>ยังขาดอีก: <b className="text-rose-600 dark:text-rose-400 font-bold">{Math.max(0, remainingAmount).toLocaleString()} บาท</b></span>
          </div>
        </div>

        {/* Players List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {allPlayers.map((player) => {
            const isPaid = paidPlayerIds.includes(player.id);
            return (
              <div
                key={player.id}
                onClick={() => handleTogglePaid(player.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer select-none transition ${
                  isPaid
                    ? 'bg-orange-50/70 border-orange-500 text-orange-950 dark:bg-orange-950/25 dark:border-orange-500/60 dark:text-orange-200 shadow-xs'
                    : 'bg-white border-slate-200 dark:bg-slate-950/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition ${
                      isPaid
                        ? 'bg-gradient-to-tr from-orange-500 to-rose-500 border-orange-500 text-white'
                        : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{player.name}</span>
                      <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                        ทีม {player.teamCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {player.teamName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-black font-mono ${isPaid ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {perPerson} บาท
                  </div>
                  <div className="text-[11px] font-semibold flex items-center justify-end gap-1 mt-0.5">
                    {isPaid ? (
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ชำระแล้ว
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" /> ยังไม่จ่าย
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Form - User enters court fee, extra fees, and promptpay directly */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" />
          <span>ตั้งค่ายอดเงิน &amp; บัญชีพร้อมเพย์</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ค่าคอร์ทวันนี้ (บาท)
            </label>
            <input
              type="number"
              placeholder="เช่น 600"
              value={courtFee || ''}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setCourtFee(val);
                saveState(paidPlayerIds, val, shuttlecockFee);
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ค่าลูกแบด / ค่าน้ำ / ค่าอื่นๆ (บาท)
            </label>
            <input
              type="number"
              placeholder="เช่น 120"
              value={shuttlecockFee || ''}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setShuttlecockFee(val);
                saveState(paidPlayerIds, courtFee, val);
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              หมายเลขพร้อมเพย์ (PromptPay)
            </label>
            <input
              type="text"
              placeholder="เช่น 0812345678"
              value={promptPayNumber}
              onChange={(e) => setPromptPayNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อเจ้าของบัญชี (ระบุหรือไม่ก็ได้)
            </label>
            <input
              type="text"
              placeholder="เช่น นัส"
              value={promptPayName}
              onChange={(e) => setPromptPayName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>

      {/* QR Code Modal */}
      {showQRModal && promptPayQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">สแกนจ่ายผ่านพร้อมเพย์</h4>
            <div className="bg-white p-3 rounded-2xl inline-block border border-slate-200 shadow-sm">
              <img
                src={promptPayQrUrl}
                alt="PromptPay QR"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
                {perPerson} บาท
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono font-medium">
                {promptPayNumber} {promptPayName && `(${promptPayName})`}
              </div>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
