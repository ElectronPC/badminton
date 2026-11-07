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
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#f59e0b', '#ec4899', '#ffffff'],
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

  const isLeftOrange = leftRole === 'A';

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between overflow-hidden select-none transition-colors">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
              แมตช์ที่ {match.matchNumber} จาก {session.matches.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              แข่งจบที่ {target} แต้ม (คอร์ต 1)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSwappedSides(!swappedSides)}
            title="สลับฝั่งคอร์ต"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สลับแดน</span>
          </button>

          <button
            onClick={handleResetScore}
            title="รีเซ็ตแต้ม"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-amber-600 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Arena - High Contrast */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800 max-w-4xl mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-4 items-stretch">
        {/* Left Team Box */}
        <div className={`flex flex-col justify-between p-3 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 shadow-md relative transition-colors ${
          isLeftOrange ? 'border-orange-500/70' : 'border-rose-500/70'
        }`}>
          {/* Server Indicator */}
          {server === leftRole && (
            <div className={`absolute top-3 left-3 border text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
              isLeftOrange
                ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700'
                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isLeftOrange ? 'bg-orange-500' : 'bg-rose-500'}`}></span>
              เสิร์ฟ
            </div>
          )}

          {/* Team Info */}
          <div className="text-center mt-6">
            <span className={`inline-block w-8 h-8 rounded-xl text-white font-black text-sm leading-8 mb-1 shadow-xs ${
              isLeftOrange ? 'bg-orange-600' : 'bg-rose-600'
            }`}>
              {leftTeam.code}
            </span>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">
              {leftTeam.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {leftTeam.player1} &amp; {leftTeam.player2}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="my-auto text-center py-4">
            <div
              onClick={() => handlePoint(leftRole, 1)}
              className="text-8xl sm:text-9xl font-black tracking-tighter text-slate-950 dark:text-white font-mono cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {leftScore}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">แตะที่ตัวเลขหรือปุ่ม +1 ด้านล่าง</div>
          </div>

          {/* Score Adjustment Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePoint(leftRole, -1)}
              disabled={leftScore === 0}
              className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center transition active:scale-90 border border-slate-200 dark:border-slate-700"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </button>
            <button
              onClick={() => handlePoint(leftRole, 1)}
              className={`flex-1 h-12 sm:h-16 rounded-2xl text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                isLeftOrange
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              <Plus className="w-7 h-7 stroke-[3]" />
              <span>+1 แต้ม</span>
            </button>
          </div>
        </div>

        {/* Right Team Box */}
        <div className={`flex flex-col justify-between p-3 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 shadow-md relative transition-colors ${
          !isLeftOrange ? 'border-orange-500/70' : 'border-rose-500/70'
        }`}>
          {/* Server Indicator */}
          {server === rightRole && (
            <div className={`absolute top-3 left-3 border text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
              !isLeftOrange
                ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700'
                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${!isLeftOrange ? 'bg-orange-500' : 'bg-rose-500'}`}></span>
              เสิร์ฟ
            </div>
          )}

          {/* Team Info */}
          <div className="text-center mt-6">
            <span className={`inline-block w-8 h-8 rounded-xl text-white font-black text-sm leading-8 mb-1 shadow-xs ${
              !isLeftOrange ? 'bg-orange-600' : 'bg-rose-600'
            }`}>
              {rightTeam.code}
            </span>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">
              {rightTeam.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {rightTeam.player1} &amp; {rightTeam.player2}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="my-auto text-center py-4">
            <div
              onClick={() => handlePoint(rightRole, 1)}
              className="text-8xl sm:text-9xl font-black tracking-tighter text-slate-950 dark:text-white font-mono cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {rightScore}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">แตะที่ตัวเลขหรือปุ่ม +1 ด้านล่าง</div>
          </div>

          {/* Score Adjustment Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePoint(rightRole, -1)}
              disabled={rightScore === 0}
              className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center transition active:scale-90 border border-slate-200 dark:border-slate-700"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </button>
            <button
              onClick={() => handlePoint(rightRole, 1)}
              className={`flex-1 h-12 sm:h-16 rounded-2xl text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                !isLeftOrange
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              <Plus className="w-7 h-7 stroke-[3]" />
              <span>+1 แต้ม</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Win Banner */}
      {isMatchWon && (
        <div className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-center py-2.5 px-4 animate-bounce flex items-center justify-center gap-2 text-base shadow-lg">
          <Trophy className="w-5 h-5 fill-white" />
          <span>
            {currentLeader === 'A' ? teamA.name : teamB.name} ชนะเกมนี้! ({scoreA} - {scoreB})
          </span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 max-w-4xl mx-auto w-full flex items-center justify-between gap-3 shadow-md">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 transition"
        >
          กลับไปดูตาราง
        </button>

        <button
          onClick={handleFinishMatch}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 transition active:scale-[0.98]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>บันทึกผลการแข่งขัน &amp; จบเกม</span>
        </button>
      </div>
    </div>
  );
};
