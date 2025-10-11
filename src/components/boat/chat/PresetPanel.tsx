'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

import type { ChatPreset } from '@/types/chat';

interface PresetPanelProps {
  presets: ChatPreset[];
  onSelect: (preset: ChatPreset) => void;
}

export function PresetPanel({ presets, onSelect }: PresetPanelProps) {
  const grouped = useMemo(() => {
    return presets.reduce<Record<string, ChatPreset[]>>((acc, preset) => {
      const key = preset.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(preset);
      return acc;
    }, {});
  }, [presets]);

  if (presets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <Sparkles size={16} className="text-[var(--brand-primary)]" />
        推奨プリセット
      </div>
      <div className="grid gap-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase text-[var(--muted)]">
              {category === 'prediction'
                ? '予想系'
                : category === 'trend'
                  ? '傾向分析'
                  : category === 'knowledge'
                    ? 'ナレッジ'
                    : 'スターター'}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelect(preset)}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[#f9fbff] p-3 text-left transition hover:border-[var(--brand-primary)] hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">{preset.label}</p>
                  {preset.description && (
                    <p className="mt-1 text-xs text-[var(--muted)]">{preset.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
