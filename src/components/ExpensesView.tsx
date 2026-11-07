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

  const [courtFee, setCourtFee] = useState<number | string>(currentExpenses.courtFee || '');
  const [shuttlecockFee, setShuttlecockFee] = useState<number | string>(
    currentExpenses.shuttlecockFee || ''
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
  const numCourt = Number(courtFee) || 0;
  const numShuttle = Number(shuttlecockFee) || 0;
  const totalAmount = numCourt + numShuttle;
  const perPerson = Math.ceil(totalAmount / numPlayers);

  // Save changes
  const saveState = (updatedPaid: string[]) => {
    setPaidPlayerIds(updatedPaid);
    onSaveExpenses({
      courtFee: Number(courtFee) || 0,
      shuttlecockFee: Number(shuttlecockFee) || 0,
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
      courtFee: Number(courtFee) || 0,
      shuttlecockFee: Number(shuttlecockFee) || 0,
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
    text += `💰 ค่าคอร์ท: ${numCourt.toLocaleString()} บาท\n`;
    if (numShuttle > 0) {
      text += `🏸 ค่าลูกแบด/อื่นๆ: ${numShuttle.toLocaleString()} บาท\n`;
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>สรุปค่าใช้จ่าย &amp; หารค่าคอร์ท</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              คำนวณและหารเฉลี่ยเท่าๆ กันตามรายชื่อสมาชิกที่มาเล่นวันนี้ ({numPlayers} คน)
            </p>
          </div>

          <button
            onClick={handleCopyLineSummary}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition active:scale-95"
          >
            {copiedSummary ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedSummary ? 'คัดลอกสรุปสำเร็จ!' : 'คัดลอกสรุปส่ง LINE'}</span>
          </button>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>ค่าใช้จ่ายรวม</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white mt-1">
              {totalAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">บาท</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>จำนวนคนหาร</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-teal-400 mt-1">
              {numPlayers} <span className="text-xs font-normal text-slate-400">คน</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ตกคนละ</span>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5 font-mono">
              {perPerson.toLocaleString()} <span className="text-xs font-normal text-slate-300">บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* PromptPay Info Box */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg">
        <h3 className="font-semibold text-sm sm:text-base text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>ช่องทางชำระเงิน (พร้อมเพย์)</span>
        </h3>

        {promptPayNumber.trim() ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0">
                📱
              </div>
              <div>
                <div className="text-xs text-slate-400">หมายเลขพร้อมเพย์</div>
                <div className="text-lg sm:text-xl font-bold text-white font-mono tracking-wider">
                  {promptPayNumber}
                </div>
                {promptPayName.trim() && (
                  <div className="text-xs text-slate-300">ชื่อบัญชี: {promptPayName}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyPromptPay}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition active:scale-95"
              >
                {copiedPromptPay ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPromptPay ? 'คัดลอกแล้ว!' : 'คัดลอกเบอร์'}</span>
              </button>

              {promptPayQrUrl && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>ดู QR Code ({perPerson} บาท)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-dashed border-slate-700 text-center">
            ยังไม่ได้ระบุหมายเลขพร้อมเพย์ สามารถใส่หมายเลขในแบบฟอร์มด้านล่างได้เลยครับ
          </div>
        )}
      </div>

      {/* Member Payment Checklist */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Header & Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>เช็คชื่อการจ่ายเงิน ({paidCount} / {numPlayers} คน)</span>
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleMarkAllPaid}
                className="text-emerald-400 hover:underline"
              >
                จ่ายครบทุกคน
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={handleResetPaid}
                className="text-slate-400 hover:underline"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((paidCount / numPlayers) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
            <span>เก็บได้แล้ว: <b className="text-emerald-400">{collectedAmount.toLocaleString()} บาท</b></span>
            <span>ยังขาดอีก: <b className="text-amber-400">{Math.max(0, remainingAmount).toLocaleString()} บาท</b></span>
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
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                  isPaid
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                      isPaid
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                      <span>{player.name}</span>
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded">
                        ทีม {player.teamCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {player.teamName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-bold ${isPaid ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {perPerson} บาท
                  </div>
                  <div className="text-[10px] flex items-center justify-end gap-1">
                    {isPaid ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> ชำระแล้ว
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> ยังไม่จ่าย
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
      <form onSubmit={handleSaveConfig} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <h3 className="font-semibold text-sm sm:text-base text-white">
          ⚙️ ตั้งค่ายอดเงิน &amp; หมายเลขพร้อมเพย์
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">ค่าคอร์ทวันนี้ (บาท)</label>
            <input
              type="number"
              placeholder="เช่น 600"
              value={courtFee}
              onChange={(e) => setCourtFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">ค่าลูกแบด / ค่าน้ำ (ถ้ามี)</label>
            <input
              type="number"
              placeholder="เช่น 120"
              value={shuttlecockFee}
              onChange={(e) => setShuttlecockFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">หมายเลขพร้อมเพย์ (PromptPay)</label>
            <input
              type="text"
              placeholder="เช่น 0812345678"
              value={promptPayNumber}
              onChange={(e) => setPromptPayNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">ชื่อเจ้าของบัญชี (ระบุหรือไม่ก็ได้)</label>
            <input
              type="text"
              placeholder="เช่น นัส"
              value={promptPayName}
              onChange={(e) => setPromptPayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>

      {/* QR Code Modal */}
      {showQRModal && promptPayQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-white">สแกนจ่ายผ่านพร้อมเพย์</h4>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
              <img
                src={promptPayQrUrl}
                alt="PromptPay QR"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {perPerson} บาท
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                {promptPayNumber} {promptPayName && `(${promptPayName})`}
              </div>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
