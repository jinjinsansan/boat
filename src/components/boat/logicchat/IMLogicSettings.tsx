'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Save,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  Circle,
  Ruler,
  Dna,
  Users,
  Award,
  MapPin,
  Cloud,
  TrendingUp,
  Scale,
  Activity,
  RotateCw,
  BarChart,
  Timer,
  LucideIcon,
} from 'lucide-react';
import { IMLogicSettingsData } from '@/types/logicchat';

interface Props {
  onComplete: (settings: IMLogicSettingsData) => void;
}

interface ItemConfig {
  id: keyof IMLogicSettingsData['item_weights'];
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const ITEM_CONFIGS: ItemConfig[] = [
  {
    id: '1_distance_aptitude',
    label: '距離適性',
    description: '艇のベスト距離への適応度',
    icon: Ruler,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: '2_bloodline_evaluation',
    label: '血統評価',
    description: '血統による能力の継承度',
    icon: Dna,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: '3_jockey_compatibility',
    label: '選手相性',
    description: '選手と艇の相性評価',
    icon: Users,
    color: 'from-green-400 to-green-600',
  },
  {
    id: '4_trainer_evaluation',
    label: '整備師評価',
    description: '整備師の実績と指導力',
    icon: Award,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: '5_track_aptitude',
    label: '水面適性',
    description: 'コース特性への適応度',
    icon: MapPin,
    color: 'from-teal-400 to-teal-600',
  },
  {
    id: '6_weather_aptitude',
    label: '天候適性',
    description: '天候・水面状態への対応力',
    icon: Cloud,
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: '7_popularity_factor',
    label: '人気要因',
    description: '人気による過大・過小評価',
    icon: TrendingUp,
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: '8_weight_impact',
    label: '斤量影響',
    description: '背負う重量の影響度',
    icon: Scale,
    color: 'from-red-400 to-red-600',
  },
  {
    id: '9_horse_weight_impact',
    label: '艇体重影響',
    description: '艇体重変化の影響',
    icon: Activity,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: '10_corner_specialist',
    label: 'ターン適性',
    description: 'ターン通過の上手さ',
    icon: RotateCw,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: '11_margin_analysis',
    label: 'マージン分析',
    description: '着差による実力評価',
    icon: BarChart,
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: '12_time_index',
    label: 'タイムインデックス',
    description: 'タイムによる能力指標',
    icon: Timer,
    color: 'from-emerald-400 to-emerald-600',
  },
];

type ItemId = ItemConfig['id'];

const ALL_ITEM_IDS: ItemId[] = ITEM_CONFIGS.map((item) => item.id);

const distributeWeights = (selected: Set<ItemId>): IMLogicSettingsData['item_weights'] => {
  const weights = {} as IMLogicSettingsData['item_weights'];

  ITEM_CONFIGS.forEach((item) => {
    weights[item.id] = 0;
  });

  const count = selected.size;
  if (count === 0) {
    return weights;
  }

  const selectedList = Array.from(selected);
  let remaining = 100;

  selectedList.forEach((id, index) => {
    let value: number;
    if (index === selectedList.length - 1) {
      value = parseFloat(remaining.toFixed(2));
    } else {
      value = parseFloat((100 / count).toFixed(2));
      remaining -= value;
    }
    weights[id] = value;
  });

  return weights;
};



export default function IMLogicSettings({ onComplete }: Props) {
  const [settingsName, setSettingsName] = useState('カスタム設定');
  const [horseWeight, setHorseWeight] = useState(70);
  const [jockeyWeight, setJockeyWeight] = useState(30);
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<ItemId>>(
    () => new Set<ItemId>(ALL_ITEM_IDS),
  );
  const [itemWeights, setItemWeights] = useState<IMLogicSettingsData['item_weights']>(() =>
    distributeWeights(new Set<ItemId>(ALL_ITEM_IDS)),
  );

  // 馬・騎手比率の調整
  const handleHorseJockeyRatioChange = useCallback((newHorseWeight: number) => {
    setHorseWeight(newHorseWeight);
    setJockeyWeight(100 - newHorseWeight);
  }, []);

  const applySelection = useCallback((ids: ItemId[]) => {
    if (ids.length === 0) {
      toast.error('少なくとも1項目を選択してください');
      return;
    }

    const selection = new Set<ItemId>(ids);
    setSelectedItems(selection);
    setItemWeights(distributeWeights(selection));
  }, []);

  const handleToggleItem = useCallback((itemId: ItemId) => {
    setSelectedItems((prev) => {
      const next = new Set<ItemId>(prev);

      if (next.has(itemId)) {
        if (next.size === 1) {
          toast.error('少なくとも1項目を選択してください');
          return prev;
        }
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      setItemWeights(distributeWeights(next));
      return next;
    });
  }, []);

  // プリセットの適用
  const applyPreset = useCallback(
    (presetType: 'balanced' | 'bloodline' | 'time' | 'jockey') => {
      let selection: ItemId[] = ALL_ITEM_IDS;
      let presetName = 'カスタム設定';
      let horseRatio = 70;
      let jockeyRatio = 30;

      switch (presetType) {
        case 'balanced':
          presetName = 'バランス型';
          selection = ALL_ITEM_IDS;
          horseRatio = 70;
          jockeyRatio = 30;
          break;
        case 'bloodline':
          presetName = '血統重視型';
          selection = [
            '2_bloodline_evaluation',
            '1_distance_aptitude',
            '4_trainer_evaluation',
            '5_track_aptitude',
            '12_time_index',
          ];
          horseRatio = 70;
          jockeyRatio = 30;
          break;
        case 'time':
          presetName = 'タイム重視型';
          selection = [
            '12_time_index',
            '1_distance_aptitude',
            '11_margin_analysis',
            '10_corner_specialist',
            '9_horse_weight_impact',
            '5_track_aptitude',
          ];
          horseRatio = 65;
          jockeyRatio = 35;
          break;
        case 'jockey':
          presetName = '選手重視型';
          selection = [
            '3_jockey_compatibility',
            '4_trainer_evaluation',
            '7_popularity_factor',
            '10_corner_specialist',
            '1_distance_aptitude',
          ];
          horseRatio = 50;
          jockeyRatio = 50;
          break;
      }

      setSettingsName(presetName);
      setHorseWeight(horseRatio);
      setJockeyWeight(jockeyRatio);
      applySelection(selection);
      toast.success(`${presetName}を適用しました`);
    },
    [applySelection],
  );

  // 設定の保存
  const handleSave = useCallback(async () => {
    if (saving) return;

    setSaving(true);

    try {
      const settings: IMLogicSettingsData = {
        id: `boat-${Date.now()}`,
        name: settingsName,
        horse_weight: horseWeight,
        jockey_weight: jockeyWeight,
        item_weights: itemWeights,
      };

      onComplete(settings);
      toast.success('IMLogic設定を保存しました');
    } catch (error) {
      console.error('設定保存エラー:', error);
      toast.error(error instanceof Error ? error.message : 'IMLogic設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [settingsName, horseWeight, jockeyWeight, itemWeights, onComplete, saving]);

  // 合計の検証
  const itemWeightsTotal = Object.values(itemWeights).reduce((sum, val) => sum + val, 0);
  const isValid = selectedItems.size > 0 && Math.abs(itemWeightsTotal - 100) < 0.1;

  return (
    <div className="space-y-6">
      {/* 設定名 */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">設定名</label>
        <input
          type="text"
          value={settingsName}
          onChange={(e) => setSettingsName(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
          placeholder="例: 血統重視型"
        />
      </div>

      {/* プリセットボタン */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
          <span className="text-sm font-medium text-[var(--muted)]">プリセット</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('balanced')}
            className="px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--foreground)] rounded-lg transition-colors border border-[var(--border)]"
          >
            バランス型
          </button>
          <button
            onClick={() => applyPreset('bloodline')}
            className="px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--foreground)] rounded-lg transition-colors border border-[var(--border)]"
          >
            血統重視
          </button>
          <button
            onClick={() => applyPreset('time')}
            className="px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--foreground)] rounded-lg transition-colors border border-[var(--border)]"
          >
            タイム重視
          </button>
          <button
            onClick={() => applyPreset('jockey')}
            className="px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--foreground)] rounded-lg transition-colors border border-[var(--border)]"
          >
            選手重視
          </button>
        </div>
      </div>

      {/* 艇・選手比率 */}
      <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            パラメータ２　艇・選手のデータ計算の比重を選択
          </h3>
          <div className="flex items-center space-x-4 text-sm text-[var(--foreground)]">
            <span className="font-medium">艇: {horseWeight}%</span>
            <span className="font-medium">選手: {jockeyWeight}%</span>
          </div>
        </div>

        {/* モバイル用のボタン式コントロール */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--foreground)]">艇の評価比率</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleHorseJockeyRatioChange(Math.max(0, horseWeight - 10))}
                className="w-10 h-10 rounded-lg bg-[var(--background)] hover:bg-[var(--surface)] text-[var(--foreground)] flex items-center justify-center transition-colors border border-[var(--border)]"
              >
                <span className="text-xl leading-none">−</span>
              </button>
              <span className="text-xl font-bold text-[var(--brand-primary)] w-16 text-center">
                {horseWeight}%
              </span>
              <button
                onClick={() => handleHorseJockeyRatioChange(Math.min(100, horseWeight + 10))}
                className="w-10 h-10 rounded-lg bg-[var(--background)] hover:bg-[var(--surface)] text-[var(--foreground)] flex items-center justify-center transition-colors border border-[var(--border)]"
              >
                <span className="text-xl leading-none">+</span>
              </button>
            </div>
          </div>

          {/* ビジュアル表示 */}
          <div className="relative h-8 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="absolute left-0 top-0 h-full bg-[var(--brand-primary)] transition-all duration-300"
              style={{ width: `${horseWeight}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-xs font-medium text-white z-10">艇</span>
              <span className="text-xs font-medium text-[var(--muted)]">選手</span>
            </div>
          </div>
        </div>

        {/* デスクトップ用のスライダー */}
        <div className="hidden md:block">
          <div className="relative h-12 bg-[var(--background)] rounded-full shadow-inner overflow-hidden border border-[var(--border)]">
            <div
              className="absolute left-0 top-0 h-full bg-[var(--brand-primary)] transition-all duration-300"
              style={{ width: `${horseWeight}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-sm font-medium text-white z-10">艇</span>
              <span className="text-sm font-medium text-[var(--muted)]">選手</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={horseWeight}
              onChange={(e) => handleHorseJockeyRatioChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer touch-none"
              style={{ touchAction: 'pan-x' }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 12項目の重み付け */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              パラメータ１　選択した項目で重みを自動的に均等配分します
            </h3>
          </div>
          <div className="text-xs sm:text-sm font-medium text-[var(--muted)]">
            選択中: <span className="text-[var(--brand-primary)]">{selectedItems.size}</span> 項目
            {selectedItems.size > 0 && (
              <span className="ml-2">（1項目あたり {(100 / selectedItems.size).toFixed(1)}%）</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {ITEM_CONFIGS.map((item) => {
            const isSelected = selectedItems.has(item.id);
            const cardClass = isSelected
              ? `border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg scale-105`
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--brand-primary)] hover:bg-[var(--background)] hover:scale-105';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleItem(item.id)}
                className={`group relative aspect-square rounded-xl border p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--brand-primary)] ${cardClass}`}
              >
                {/* 選択インジケーター */}
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--muted)]" />
                  )}
                </div>

                {/* 中央コンテンツ */}
                <div className="flex flex-col items-center justify-center h-full text-center gap-1 sm:gap-2">
                  <item.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base leading-tight px-1">
                    {item.label}
                  </h4>
                  <span
                    className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-[var(--brand-primary)]'}`}
                  >
                    {itemWeights[item.id].toFixed(1)}%
                  </span>
                </div>

                {/* ホバー時の説明（デスクトップのみ） */}
                <div className="hidden md:block absolute inset-0 bg-black/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xs text-white/90 leading-tight">{item.description}</p>
                    <span className="mt-2 text-xs text-white/70">
                      {isSelected ? 'クリックで解除' : 'クリックで選択'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={() => applyPreset('balanced')}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base border border-[var(--border)]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>リセット</span>
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${
            isValid && !saving
              ? 'bg-[var(--brand-primary)] text-white hover:bg-[#0d4fce] shadow-lg'
              : 'bg-[var(--surface)] text-[var(--muted)] cursor-not-allowed border border-[var(--border)]'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '保存中...' : '設定を保存して分析開始'}</span>
        </button>
      </div>

      {/* ヒント */}
      <div className="bg-[var(--surface)] rounded-lg p-4 flex items-start space-x-3 border border-[var(--border)]">
        <Info className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[var(--muted)]">
          <p className="font-medium mb-1 text-[var(--foreground)]">ヒント</p>
          <ul className="space-y-1">
            <li>• スライダーを動かすと、他の項目が自動調整されます</li>
            <li>• 特定の項目を重視すると、その項目の影響が強くなります</li>
            <li>• 艇と選手の比率は10%単位で調整できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
