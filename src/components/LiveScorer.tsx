import React, { useState, useEffect } from 'react';
import type { Match, TournamentSession } from '../types';
import { Plus, Minus, ArrowLeftRight, CheckCircle2, Trophy, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPointSound, playUndoSound, playWinSound } from '../utils/feedback';

interface LiveScorerProps {
  match: Match;
  session: TournamentSession;
  onUpdateMatchScore: (matchId: number, scoreA: number, scoreB: number, isFinished: boolean, winnerId: string | null) => void;
  onClose: () => void;
}

export const LiveScorer: React.FC<LiveScorerProps> = ({
  match,
  session,
  onUpdateMatchScore,
  onClose,
}) => {
  const teamA = session.teams.find(t => t.id === match.teamAId);
  const teamB = session.teams.find(t => t.id === match.teamBId);

  const [scoreA, setScoreA] = useState(match.scoreA);
  const [scoreB, setScoreB] = useState(match.scoreB);
  const [swappedSides, setSwappedSides] = useState(false);
  const [server, setServer] = useState<'A' | 'B'>('A');

  const target = session.targetPoints || 21;
  const isMatchWon = (scoreA >= target || scoreB >= target) && Math.abs(scoreA - scoreB) >= 1;
  const currentLeader = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null;

  useEffect(() => {
    if (isMatchWon) {
      playWinSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isMatchWon]);

  const handlePoint = (team: 'A' | 'B', delta: number) => {
    if (delta > 0) {
      playPointSound();
      setServer(team);
      if (team === 'A') {
        const next = scoreA + 1;
        setScoreA(next);
        onUpdateMatchScore(match.id, next, scoreB, false, null);
      } else {
        const next = scoreB + 1;
        setScoreB(next);
        onUpdateMatchScore(match.id, scoreA, next, false, null);
      }
    } else {
      playUndoSound();
      if (team === 'A' && scoreA > 0) {
        const next = scoreA - 1;
        setScoreA(next);
        onUpdateMatchScore(match.id, next, scoreB, false, null);
      } else if (team === 'B' && scoreB > 0) {
        const next = scoreB - 1;
        setScoreB(next);
        onUpdateMatchScore(match.id, scoreA, next, false, null);
      }
    }
  };

  const handleFinishMatch = () => {
    if (scoreA === scoreB) {
      alert('แต้มเสมอกันอยู่ กรุณาเล่นแต้มตัดสินก่อนบันทึกผล');
      return;
    }
    const winnerId = scoreA > scoreB ? match.teamAId : match.teamBId;
    onUpdateMatchScore(match.id, scoreA, scoreB, true, winnerId);
    onClose();
  };

  const handleResetScore = () => {
    if (confirm('คุณต้องการรีเซ็ตแต้มคู่นี้เป็น 0-0 ใช่หรือไม่?')) {
      setScoreA(0);
      setScoreB(0);
      onUpdateMatchScore(match.id, 0, 0, false, null);
    }
  };

  if (!teamA || !teamB) return null;

  // Render left / right based on swapped sides
  const leftTeam = swappedSides ? teamB : teamA;
  const rightTeam = swappedSides ? teamA : teamB;
  const leftScore = swappedSides ? scoreB : scoreA;
  const rightScore = swappedSides ? scoreA : scoreB;
  const leftRole = swappedSides ? 'B' : 'A';
  const rightRole = swappedSides ? 'A' : 'B';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-semibold text-emerald-400">
              แมตช์ที่ {match.matchNumber} จาก {session.matches.length}
            </div>
            <div className="text-[11px] text-slate-400">
              แข่งจบที่ {target} แต้ม (คอร์ต 1)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSwappedSides(!swappedSides)}
            title="สลับฝั่งคอร์ต"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สลับแดน</span>
          </button>

          <button
            onClick={handleResetScore}
            title="รีเซ็ตแต้ม"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Arena */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 max-w-4xl mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-4 items-stretch">
        {/* Left Team Box */}
        <div className="flex flex-col justify-between p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 relative">
          {/* Server Indicator */}
          {server === leftRole && (
            <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              เสิร์ฟ
            </div>
          )}

          {/* Team Info */}
          <div className="text-center mt-6">
            <span className="inline-block w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm border border-emerald-500/20 leading-8 mb-1">
              {leftTeam.code}
            </span>
            <h3 className="text-base sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
              {leftTeam.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {leftTeam.player1} &amp; {leftTeam.player2}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="my-auto text-center py-4">
            <div
              onClick={() => handlePoint(leftRole, 1)}
              className="text-7xl sm:text-9xl font-black tracking-tighter text-white font-mono cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {leftScore}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">แตะที่ตัวเลขหรือปุ่ม +1 ด้านล่าง</div>
          </div>

          {/* Score Adjustment Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePoint(leftRole, -1)}
              disabled={leftScore === 0}
              className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center transition active:scale-90"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePoint(leftRole, 1)}
              className="flex-1 h-12 sm:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span>+1 แต้ม</span>
            </button>
          </div>
        </div>

        {/* Right Team Box */}
        <div className="flex flex-col justify-between p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 relative">
          {/* Server Indicator */}
          {server === rightRole && (
            <div className="absolute top-3 left-3 bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
              เสิร์ฟ
            </div>
          )}

          {/* Team Info */}
          <div className="text-center mt-6">
            <span className="inline-block w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 font-bold text-sm border border-teal-500/20 leading-8 mb-1">
              {rightTeam.code}
            </span>
            <h3 className="text-base sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
              {rightTeam.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {rightTeam.player1} &amp; {rightTeam.player2}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="my-auto text-center py-4">
            <div
              onClick={() => handlePoint(rightRole, 1)}
              className="text-7xl sm:text-9xl font-black tracking-tighter text-white font-mono cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {rightScore}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">แตะที่ตัวเลขหรือปุ่ม +1 ด้านล่าง</div>
          </div>

          {/* Score Adjustment Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePoint(rightRole, -1)}
              disabled={rightScore === 0}
              className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center transition active:scale-90"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePoint(rightRole, 1)}
              className="flex-1 h-12 sm:h-14 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/30 transition active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span>+1 แต้ม</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Win or Completion Banner */}
      {isMatchWon && (
        <div className="bg-emerald-500 text-slate-950 font-bold text-center py-2 px-4 animate-bounce flex items-center justify-center gap-2 text-sm sm:text-base">
          <Trophy className="w-5 h-5 fill-slate-950" />
          <span>
            {currentLeader === 'A' ? teamA.name : teamB.name} ชนะเกมนี้! ({scoreA} - {scoreB})
          </span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition"
        >
          กลับไปดูตาราง (นับต่อทีหลังได้)
        </button>

        <button
          onClick={handleFinishMatch}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition active:scale-[0.98]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>บันทึกผลการแข่งขัน &amp; จบเกม</span>
        </button>
      </div>
    </div>
  );
};
