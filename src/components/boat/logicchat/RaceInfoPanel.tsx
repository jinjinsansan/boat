'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Ship, X } from 'lucide-react';

import type { BoatRaceDetail } from '@/types/race';

interface RaceInfoPanelProps {
  race: BoatRaceDetail;
  onPanelStateChange?: (isOpen: boolean) => void;
}

function getLaneColor(lane: number): string {
  const colors = [
    'bg-white text-black',
    'bg-black text-white',
    'bg-red-600 text-white',
    'bg-blue-600 text-white',
    'bg-yellow-400 text-black',
    'bg-green-600 text-white',
  ];
  return colors[lane - 1] || 'bg-gray-500 text-white';
}

export function RaceInfoPanel({ race, onPanelStateChange }: RaceInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop && isOpen) {
        setIsOpen(true);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, [isOpen]);

  useEffect(() => {
    if (onPanelStateChange) {
      onPanelStateChange(isOpen && isDesktop);
    }
  }, [isOpen, isDesktop, onPanelStateChange]);

  const MobileHeader = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface)] transition-colors lg:hidden"
    >
      <div className="flex items-center space-x-3">
        <Ship className="w-5 h-5 text-[var(--brand-primary)]" />
        <div className="text-left">
          <div className="text-sm font-semibold text-[var(--foreground)]">
            {race.venue} Day{race.day}
          </div>
          <div className="text-xs text-[var(--muted)]">{race.title}</div>
        </div>
      </div>
      <ChevronDown
        className={`w-5 h-5 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );

  const DesktopHeader = () => (
    <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
      <div className="flex items-center space-x-3">
        <Ship className="w-5 h-5 text-[var(--brand-primary)]" />
        <div>
          <div className="text-sm font-semibold text-[var(--foreground)]">
            {race.venue} Day{race.day}
          </div>
          <div className="text-xs text-[var(--muted)]">{race.title}</div>
        </div>
      </div>
      <button
        onClick={() => setIsOpen(false)}
        className="p-1 hover:bg-[var(--surface)] rounded transition-colors"
      >
        <X className="w-4 h-4 text-[var(--muted)]" />
      </button>
    </div>
  );

  const RaceContent = () => (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs text-[var(--muted)]">開催場</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{race.venue}</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted)]">Day</span>
          <p className="text-sm font-medium text-[var(--foreground)]">Day{race.day}</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted)]">風速</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{race.windSpeed} m/s</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted)]">波高</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{race.waveHeight} cm</p>
        </div>
      </div>

      <div className="bg-[var(--background)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[350px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)] sticky left-0 bg-[var(--background)] z-10">
                  艇
                </th>
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">登録番号</th>
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)] min-w-[100px]">選手名</th>
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">支部</th>
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">機/艇</th>
                <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">勝率</th>
              </tr>
            </thead>
            <tbody>
              {race.entries.map((entry) => (
                <tr
                  key={entry.registerNumber}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                >
                  <td className="py-2 px-2 sticky left-0 bg-[var(--background)] z-10">
                    <span
                      className={`inline-block w-6 h-6 text-xs font-bold text-center leading-6 rounded ${getLaneColor(entry.lane)}`}
                    >
                      {entry.lane}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-[var(--foreground)] text-center">{entry.registerNumber}</td>
                  <td className="py-2 px-2 text-[var(--foreground)] font-medium whitespace-nowrap">
                    {entry.racerName}
                  </td>
                  <td className="py-2 px-2 text-[var(--muted)] whitespace-nowrap">{entry.branch}</td>
                  <td className="py-2 px-2 text-[var(--muted)] text-xs">
                    #{entry.motorNo} / #{entry.boatNo}
                  </td>
                  <td className="py-2 px-2 text-[var(--muted)] text-xs">
                    <div className="flex flex-col">
                      <span>機 {entry.motorWinRate.toFixed(1)}%</span>
                      <span>艇 {entry.boatWinRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden text-center py-2 text-xs text-[var(--muted)] bg-[var(--background)]">
          ← 横にスクロールできます →
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{race.entries.length}艇立て</span>
      </div>
    </div>
  );

  const MobileView = () => (
    <div className="lg:hidden bg-[var(--surface)] border-b border-[var(--border)]">
      <MobileHeader />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="border-t border-[var(--border)]">
          <RaceContent />
          <div className="px-4 pb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-[var(--background)] hover:bg-[var(--surface)] text-[var(--muted)] rounded-lg transition-colors text-sm font-medium border border-[var(--border)]"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopView = () => (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden lg:flex fixed right-4 top-20 items-center space-x-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--brand-primary)] transition-colors z-40"
        >
          <Ship className="w-4 h-4 text-[var(--brand-primary)]" />
          <span className="text-sm text-[var(--foreground)]">出走表</span>
        </button>
      )}

      <div
        className={`hidden lg:block fixed right-0 top-[64px] h-[calc(100vh-64px)] bg-[var(--surface)] border-l border-[var(--border)] transition-all duration-300 ${
          isOpen ? 'w-96' : 'w-0'
        } overflow-hidden z-40`}
      >
        <div className="w-96 h-full flex flex-col">
          <DesktopHeader />
          <div className="flex-1 overflow-y-auto">
            <RaceContent />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
}
