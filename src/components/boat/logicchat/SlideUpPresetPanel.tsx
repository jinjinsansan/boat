'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PresetButton {
  id: string;
  label: string;
  message: string;
  disabled?: boolean;
}

interface SlideUpPresetPanelProps {
  onPresetClick: (message: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  disabledMessages?: string[];
}

// プリセットボタンの定義（競艇版）
const presetCategories = {
  prediction: {
    name: '予想系',
    color: 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 hover:bg-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/50',
    activeColor: 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]',
    buttons: [
      { id: 'forecast', label: '展開予想', message: 'このレースの展開を教えて', disabled: false },
      { id: 'time', label: 'タイム重視', message: '展示タイムを重視した順位予測を教えて', disabled: false },
      { id: 'recent', label: '直近成績', message: '直近10走の成績から注目艇をピックアップして', disabled: false },
    ]
  },
  trend: {
    name: '傾向系',
    color: 'border-[#00D4FF]/30 bg-[#00D4FF]/5 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/50',
    activeColor: 'bg-[#00D4FF]/10 text-[#00D4FF] border-b-2 border-[#00D4FF]',
    buttons: [
      { id: 'in-escape', label: 'イン逃げ', message: 'このレースでイン逃げを阻止できる選手は誰？', disabled: false },
      { id: 'turn', label: 'まくり差し', message: 'まくりが決まる可能性を評価して', disabled: false },
      { id: 'racer', label: '選手分析', message: 'このレースの選手分析をして', disabled: false },
    ]
  },
};

type PresetCategoryKey = keyof typeof presetCategories;

export default function SlideUpPresetPanel({ onPresetClick, isOpen, setIsOpen, disabledMessages }: SlideUpPresetPanelProps) {
  const [activeTab, setActiveTab] = useState<PresetCategoryKey>('prediction');
  const panelRef = useRef<HTMLDivElement>(null);

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // 入力エリアのクリックは除外
        const inputArea = document.getElementById('chat-input-area');
        if (inputArea && !inputArea.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handlePresetClick = (message: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onPresetClick(message);
    setIsOpen(false);
  };

  const renderPresetButton = (preset: PresetButton) => {
    const isDisabled = preset.disabled || disabledMessages?.includes(preset.message) || false;
    return (
      <button
        key={preset.id}
        onClick={() => handlePresetClick(preset.message, isDisabled)}
        disabled={isDisabled}
        className={`min-w-[7.5rem] px-3 py-2.5 text-sm rounded-md transition-all duration-200 ${
          isDisabled
            ? 'border-[var(--border)]/50 bg-[var(--surface)]/50 text-[var(--muted)] cursor-not-allowed opacity-50'
            : `transform hover:scale-105 active:scale-95 ${presetCategories[activeTab].color} border text-[var(--foreground)] hover:text-[var(--brand-primary)]`
        } font-medium`}
      >
        {preset.label}
      </button>
    );
  };

  return (
    <>
      {/* スライドアップパネル */}
      <div
        ref={panelRef}
        className={`absolute bottom-full left-0 right-0 mb-0 transition-all duration-300 ease-out z-50 ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-t-lg border-b-0 overflow-hidden shadow-2xl">
          {/* タブヘッダー */}
          <div className="flex border-b border-[var(--border)]">
            {Object.entries(presetCategories).map(([key, category]) => {
              const categoryKey = key as PresetCategoryKey;
              return (
                <button
                  key={categoryKey}
                  onClick={() => setActiveTab(categoryKey)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === categoryKey
                      ? category.activeColor
                      : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* タブコンテンツ */}
          <div className="p-4">
            <div className="sm:hidden overflow-x-auto -mx-1 pb-1">
              <div className="flex gap-2 px-1">
                {presetCategories[activeTab].buttons.map(renderPresetButton)}
              </div>
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-2">
              {presetCategories[activeTab].buttons.map(renderPresetButton)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
