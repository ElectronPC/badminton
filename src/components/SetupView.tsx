import React, { useState } from 'react';
import type { Team, TournamentSession } from '../types';
import { Plus, Trash2, RotateCcw, Play, AlertCircle } from 'lucide-react';
import { generateSchedule } from '../utils/scheduler';

interface SetupViewProps {
  session: TournamentSession | null;
  onSaveSession: (session: TournamentSession) => void;
  onGoToSchedule: () => void;
}

const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', code: 'A', name: 'ลิม - รอน', player1: 'ลิม', player2: 'รอน' },
  { id: 'team-2', code: 'B', name: 'นัส - ดาว', player1: 'นัส', player2: 'ดาว' },
  { id: 'team-3', code: 'C', name: 'ซิม - อัย', player1: 'ซิม', player2: 'อัย' },
  { id: 'team-4', code: 'D', name: 'ฟารุต - แว', player1: 'ฟารุต', player2: 'แว' },
  { id: 'team-5', code: 'E', name: 'ลัน - อาบิ', player1: 'ลัน', player2: 'อาบิ' },
  { id: 'team-6', code: 'F', name: 'อาท - มัง', player1: 'อาท', player2: 'มัง' },
];

export const SetupView: React.FC<SetupViewProps> = ({
  session,
  onSaveSession,
  onGoToSchedule,
}) => {
  const [teams, setTeams] = useState<Team[]>(
    session && session.teams.length > 0 ? session.teams : DEFAULT_TEAMS
  );
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [targetPoints, setTargetPoints] = useState<number>(session ? session.targetPoints : 21);
  const [title, setTitle] = useState<string>(session ? session.title : 'ก๊วนแบดมินตันประจำสัปดาห์');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim()) return;

    const nextIndex = teams.length;
    const code = alphabet[nextIndex % alphabet.length];
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      code,
      name: `${player1.trim()} - ${player2.trim()}`,
      player1: player1.trim(),
      player2: player2.trim(),
    };

    setTeams([...teams, newTeam]);
    setPlayer1('');
    setPlayer2('');
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) {
      alert('ต้องมีอย่างน้อย 2 ทีมสำหรับการแข่งขัน');
      return;
    }
    const updated = teams.filter(t => t.id !== id);
    // Re-code
    const reCoded = updated.map((t, idx) => ({
      ...t,
      code: alphabet[idx % alphabet.length],
    }));
    setTeams(reCoded);
  };

  const handleResetDefault = () => {
    setTeams(DEFAULT_TEAMS);
  };

  const handleCreateTournament = () => {
    if (teams.length < 2) {
      alert('กรุณาเพิ่มทีมอย่างน้อย 2 ทีม');
      return;
    }

    const matches = generateSchedule(teams);
    const newSession: TournamentSession = {
      id: session?.id || `room-${Date.now().toString(36)}`,
      cloudObjectId: session?.cloudObjectId,
      title: title.trim() || 'ก๊วนแบดมินตัน',
      date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      targetPoints: Number(targetPoints) || 21,
      courtName: 'คอร์ต 1',
      teams,
      matches,
      activeMatchId: null,
      expenses: session?.expenses || {
        courtFee: 600,
        shuttlecockFee: 0,
        promptPayNumber: '',
        promptPayName: '',
        paidPlayerIds: [],
      },
      lastUpdated: Date.now(),
    };

    onSaveSession(newSession);
    setConfirmModalOpen(false);
    onGoToSchedule();
  };

  const totalMatches = (teams.length * (teams.length - 1)) / 2;
  const matchesPerTeam = teams.length - 1;

  return (
    <div className="space-y-5 pb-12">
      {/* Intro Card */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-rose-600 text-white rounded-2xl p-5 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span>👥 สมาชิกและทีมที่มาเล่นวันนี้</span>
        </h2>
        <p className="text-xs text-amber-100 mt-1">
          ระบบจะจัดตารางแบบพบกันหมด (Round-Robin) ให้ทุกคนได้เล่นเท่ากันเป๊ะ และไม่มีใครต้องแข่งติดกัน
        </p>

        {/* Quick summary stat */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-black">{teams.length}</div>
            <div className="text-[11px] text-amber-100">ทีมทั้งหมด</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-black">{totalMatches}</div>
            <div className="text-[11px] text-amber-100">จำนวนแมตช์</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-black">{matchesPerTeam}</div>
            <div className="text-[11px] text-amber-100">แมตช์/ทีม</div>
          </div>
        </div>
      </div>

      {/* Add New Team Form */}
      <form onSubmit={handleAddTeam} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-orange-500" />
          <span>เพิ่มคู่ผู้เล่นใหม่</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ผู้เล่นคนที่ 1</label>
            <input
              type="text"
              placeholder="เช่น ต้น"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ผู้เล่นคนที่ 2</label>
            <input
              type="text"
              placeholder="เช่น บาส"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!player1.trim() || !player2.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มคู่นี้เข้าก๊วน</span>
          </button>
        </div>
      </form>

      {/* Current Teams List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            รายชื่อทีมที่เข้าร่วม ({teams.length} ทีม)
          </h3>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>โหลด 6 ทีมเริ่มต้น</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {team.code}
                </span>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{team.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {team.player1} &amp; {team.player2}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemoveTeam(team.id)}
                title="ลบทีมนี้"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Match Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3">
          ⚙️ การตั้งค่าการแข่งขัน
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อก๊วน / วันที่</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">แต้มจบเกม (ต่อแมตช์)</label>
            <div className="flex items-center gap-2">
              {[15, 21, 30].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setTargetPoints(pts)}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                    targetPoints === pts
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 border-orange-500 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pts} แต้ม
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Schedule CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            if (session && session.matches.some(m => m.status === 'finished')) {
              setConfirmModalOpen(true);
            } else {
              handleCreateTournament();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-base shadow-lg shadow-orange-500/25 transition transform active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>สร้างตารางแข่งขัน &amp; เริ่มเล่น ({totalMatches} แมตช์)</span>
        </button>

        {session && session.matches.length > 0 && (
          <div className="text-center mt-3">
            <button
              onClick={onGoToSchedule}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              หรือกลับไปดูตารางแข่งปัจจุบันที่กำลังดำเนินอยู่ ➔
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal if resetting ongoing tournament */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">สร้างตารางใหม่?</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              การสร้างตารางใหม่จะรีเซ็ตแต้มและผลการแข่งขันเดิมทั้งหมด คุณแน่ใจหรือไม่ว่าต้องการเริ่มใหม่?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateTournament}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                ยืนยันเริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
