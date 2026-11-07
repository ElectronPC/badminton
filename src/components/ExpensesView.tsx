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
  Plus,
} from 'lucide-react';

interface ExpensesViewProps {
  session: TournamentSession;
  onSaveExpenses: (expenses: ExpenseInfo) => void;
}

interface PlayerItem {
  id: string; // e.g. "team-1-p1"
  name: string;
  teamCode: string;
  teamName: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ session, onSaveExpenses }) => {
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

  const handleAdjustCourt = (delta: number) => {
    const next = Math.max(0, courtFee + delta);
    setCourtFee(next);
    saveState(paidPlayerIds, next, shuttlecockFee);
  };

  const handleAdjustShuttle = (delta: number) => {
    const next = Math.max(0, shuttlecockFee + delta);
    setShuttlecockFee(next);
    saveState(paidPlayerIds, courtFee, next);
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

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner - Bright & High Contrast for Daylight */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-200" />
              <span>สรุปค่าใช้จ่าย &amp; หารค่าคอร์ท</span>
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              คำนวณและหารเฉลี่ยเท่าๆ กันตามรายชื่อสมาชิกที่มาเล่นวันนี้ ({numPlayers} คน)
            </p>
          </div>

          <button
            onClick={handleCopyLineSummary}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedSummary ? 'คัดลอกสรุปสำเร็จ!' : 'คัดลอกสรุปส่ง LINE'}</span>
          </button>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-emerald-100 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>ค่าใช้จ่ายรวม</span>
            </div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono">
              {totalAmount.toLocaleString()} <span className="text-xs font-normal">บาท</span>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-emerald-100 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>จำนวนคนหาร</span>
            </div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono">
              {numPlayers} <span className="text-xs font-normal">คน</span>
            </div>
          </div>

          <div className="bg-white text-emerald-900 rounded-xl p-3 sm:p-4 text-center shadow-md">
            <div className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ตกคนละ</span>
            </div>
            <div className="text-xl sm:text-3xl font-black mt-0.5 text-emerald-800 font-mono">
              {perPerson.toLocaleString()} <span className="text-xs font-semibold text-slate-600">บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Price Adjuster (กดเพิ่มราคาได้เอง) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>กดเพิ่ม-ลดราคาได้เองตรงนี้ (อัปเดตยอดทันที)</span>
          </h3>
          <span className="text-xs text-slate-500">แตะเพื่อเพิ่มราคา</span>
        </div>

        {/* Court Fee Adjuster */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">ค่าคอร์ท:</span>
              <span className="font-mono text-xl font-black text-emerald-700">
                {courtFee.toLocaleString()} บาท
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustCourt(-50)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition active:scale-90"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCourt(50)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition active:scale-90"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCourt(100)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition active:scale-90"
              >
                +100
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons for Court */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[100, 150, 200, 250, 300].map((add) => (
              <button
                key={add}
                type="button"
                onClick={() => handleAdjustCourt(add)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition active:scale-95"
              >
                +{add} บ.
              </button>
            ))}
          </div>
        </div>

        {/* Shuttlecock & Extra Fees Adjuster */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">ค่าลูกแบด / ค่าน้ำ:</span>
              <span className="font-mono text-xl font-black text-teal-700">
                {shuttlecockFee.toLocaleString()} บาท
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustShuttle(-50)}
                disabled={shuttlecockFee === 0}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition active:scale-90"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() => handleAdjustShuttle(50)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-teal-700 border border-teal-300 rounded-lg text-xs font-bold transition active:scale-90"
              >
                +50
              </button>
            </div>
          </div>

          {/* Quick Shuttle & Drink Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleAdjustShuttle(80)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              🏸 +ลูก 1 ลูก (+80 บ.)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustShuttle(160)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              🏸 +ลูก 2 ลูก (+160 บ.)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustShuttle(750)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              🏸 +ลูก 1 หลอด (+750 บ.)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustShuttle(50)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              💧 +ค่าน้ำ (+50 บ.)
            </button>
          </div>
        </div>
      </div>

      {/* PromptPay Info Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>ช่องทางชำระเงิน (พร้อมเพย์)</span>
        </h3>

        {promptPayNumber.trim() ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                📱
              </div>
              <div>
                <div className="text-xs text-slate-500">หมายเลขพร้อมเพย์</div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-wider">
                  {promptPayNumber}
                </div>
                {promptPayName.trim() && (
                  <div className="text-xs font-semibold text-slate-700">ชื่อบัญชี: {promptPayName}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyPromptPay}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-sm transition active:scale-95"
              >
                {copiedPromptPay ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPromptPay ? 'คัดลอกแล้ว!' : 'คัดลอกเบอร์'}</span>
              </button>

              {promptPayQrUrl && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>เปิด QR Code ({perPerson} บ.)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-300 text-center">
            ยังไม่ได้ระบุหมายเลขพร้อมเพย์ สามารถใส่หมายเลขในแบบฟอร์มด้านล่างได้เลยครับ
          </div>
        )}
      </div>

      {/* Member Payment Checklist - High Visibility */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header & Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>เช็คชื่อการจ่ายเงิน ({paidCount} / {numPlayers} คน)</span>
            </h3>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={handleMarkAllPaid}
                className="text-emerald-700 hover:underline"
              >
                จ่ายครบทุกคน
              </button>
              <span className="text-slate-300">•</span>
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
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((paidCount / numPlayers) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-2 font-medium">
            <span>เก็บได้แล้ว: <b className="text-emerald-700 font-bold">{collectedAmount.toLocaleString()} บาท</b></span>
            <span>ยังขาดอีก: <b className="text-amber-700 font-bold">{Math.max(0, remainingAmount).toLocaleString()} บาท</b></span>
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
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition ${
                      isPaid
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      <span>{player.name}</span>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">
                        ทีม {player.teamCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {player.teamName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-black font-mono ${isPaid ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {perPerson} บาท
                  </div>
                  <div className="text-[11px] font-semibold flex items-center justify-end gap-1 mt-0.5">
                    {isPaid ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ชำระแล้ว
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-0.5">
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

      {/* Edit Form */}
      <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900">
          ⚙️ ตั้งค่ายอดเงิน &amp; บัญชีพร้อมเพย์
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ค่าคอร์ทวันนี้ (บาท)</label>
            <input
              type="number"
              placeholder="เช่น 600"
              value={courtFee || ''}
              onChange={(e) => setCourtFee(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ค่าลูกแบด / ค่าน้ำ (บาท)</label>
            <input
              type="number"
              placeholder="เช่น 120"
              value={shuttlecockFee || ''}
              onChange={(e) => setShuttlecockFee(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเลขพร้อมเพย์ (PromptPay)</label>
            <input
              type="text"
              placeholder="เช่น 0812345678"
              value={promptPayNumber}
              onChange={(e) => setPromptPayNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อเจ้าของบัญชี (ระบุหรือไม่ก็ได้)</label>
            <input
              type="text"
              placeholder="เช่น นัส"
              value={promptPayName}
              onChange={(e) => setPromptPayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>

      {/* QR Code Modal */}
      {showQRModal && promptPayQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900">สแกนจ่ายผ่านพร้อมเพย์</h4>
            <div className="bg-slate-50 p-3 rounded-2xl inline-block border border-slate-200">
              <img
                src={promptPayQrUrl}
                alt="PromptPay QR"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {perPerson} บาท
              </div>
              <div className="text-xs text-slate-600 mt-1 font-mono font-medium">
                {promptPayNumber} {promptPayName && `(${promptPayName})`}
              </div>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
