'use client';

import { Gauge, MapPin, Ship, Wind } from 'lucide-react';

import type { BoatRaceDetail } from '@/types/race';

interface RaceInfoPanelProps {
  race: BoatRaceDetail;
}

export function RaceInfoPanel({ race }: RaceInfoPanelProps) {
  return (
    <aside className="flex h-full flex-col gap-4">
      <section className="rounded-2xl border border-[#2B3139] bg-[#181A20] p-6 text-[#EAECEF]">
        <div className="flex items-center gap-2 text-xs text-[#B7BDC6]">
          <MapPin className="h-4 w-4" /> {race.venue} / Day {race.day}
        </div>
        <h2 className="mt-3 text-xl font-semibold text-white">{race.title}</h2>
        <p className="mt-2 text-sm text-[#B7BDC6]">{race.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-[#B7BDC6]">
          <div className="rounded-xl bg-[#0B0E11] p-3">
            <p className="text-[10px] uppercase text-[#848E9C]">風</p>
            <p className="mt-1 text-lg font-semibold text-[#F0B90B]">{race.windSpeed} m/s</p>
          </div>
          <div className="rounded-xl bg-[#0B0E11] p-3">
            <p className="text-[10px] uppercase text-[#848E9C]">波</p>
            <p className="mt-1 text-lg font-semibold text-[#F0B90B]">{race.waveHeight} cm</p>
          </div>
          <div className="rounded-xl bg-[#0B0E11] p-3">
            <p className="text-[10px] uppercase text-[#848E9C]">AI指数</p>
            <p className="mt-1 text-lg font-semibold text-[#F0B90B]">{race.aiRank}/5</p>
          </div>
        </div>
      </section>

      <section className="flex-1 overflow-hidden rounded-2xl border border-[#2B3139] bg-[#181A20] text-[#EAECEF]">
        <header className="flex items-center gap-2 border-b border-[#2B3139] px-5 py-4 text-sm font-semibold">
          <Ship className="h-4 w-4 text-[#F0B90B]" /> 出走表
        </header>
        <div className="max-h-[360px] overflow-y-auto px-5 py-4 text-xs text-[#B7BDC6]">
          <table className="w-full min-w-[320px] border-collapse">
            <thead className="text-[10px] uppercase tracking-wide text-[#848E9C]">
              <tr className="border-b border-[#2B3139]">
                <th className="py-2 text-left">艇</th>
                <th className="py-2 text-left">選手</th>
                <th className="py-2 text-left">支部</th>
                <th className="py-2 text-left">モーター/艇</th>
                <th className="py-2 text-left">勝率</th>
              </tr>
            </thead>
            <tbody>
              {race.entries.map((entry) => (
                <tr key={entry.registerNumber} className="border-b border-[#2B3139]">
                  <td className="py-2 font-semibold text-[#F0B90B]">{entry.lane}</td>
                  <td className="py-2 text-[#EAECEF]">
                    <div className="flex flex-col">
                      <span>{entry.racerName}</span>
                      <span className="text-[10px] uppercase text-[#848E9C]">登録 {entry.registerNumber}</span>
                    </div>
                  </td>
                  <td className="py-2">{entry.branch}</td>
                  <td className="py-2">#{entry.motorNo} / #{entry.boatNo}</td>
                  <td className="py-2">
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
      </section>

      <section className="rounded-2xl border border-dashed border-[#2B3139] bg-[#181A20] p-5 text-xs text-[#B7BDC6]">
        <div className="flex items-center gap-2 text-[#848E9C]">
          <Wind className="h-4 w-4" />
          情報メモ
        </div>
        <p className="mt-2 leading-relaxed">
          展示タイムや進入予想など、競馬版で提供しているサイド情報をここに集約できます。バックエンドと接続後にリアルタイムで更新されます。
        </p>
      </section>
    </aside>
  );
}
