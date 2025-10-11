'use client';

import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import { CheckCircle2, Info, RefreshCw, Save, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { IMLogicSettingsData } from '@/types/logicchat';

interface IMLogicSettingsProps {
  onComplete: (settings: IMLogicSettingsData) => void;
  raceName?: string;
}

interface WeightItem {
  id: keyof IMLogicSettingsData['item_weights'];
  label: string;
  description: string;
}

const WEIGHT_ITEMS: WeightItem[] = [
  { id: '1_distance_aptitude', label: '距離適性', description: 'ベスト距離への適合度' },
  { id: '2_bloodline_evaluation', label: '血統評価', description: '血統による伸びしろ' },
  { id: '3_jockey_compatibility', label: '選手相性', description: '選手との相性評価' },
  { id: '4_trainer_evaluation', label: 'チーム評価', description: '整備力・経験値' },
  { id: '5_track_aptitude', label: '水面適性', description: 'コース・水質対応力' },
  { id: '6_weather_aptitude', label: '天候適性', description: '気象条件への適応度' },
  { id: '7_popularity_factor', label: '人気要因', description: 'オッズとの乖離' },
  { id: '8_weight_impact', label: '重量影響', description: '重量差の影響度' },
  { id: '9_horse_weight_impact', label: '整備影響', description: '展示・整備での影響' },
  { id: '10_corner_specialist', label: '旋回力', description: 'ターンの鋭さ' },
  { id: '11_margin_analysis', label: '着差分析', description: '過去着差の安定感' },
  { id: '12_time_index', label: 'タイム指標', description: '直近タイムの優位性' },
];

const createDefaultWeights = (): IMLogicSettingsData['item_weights'] => {
  const base = 100 / WEIGHT_ITEMS.length;
  return WEIGHT_ITEMS.reduce((acc, item, index) => {
    const value = index === WEIGHT_ITEMS.length - 1 ? 100 - base * (WEIGHT_ITEMS.length - 1) : base;
    acc[item.id] = parseFloat(value.toFixed(2));
    return acc;
  }, {} as IMLogicSettingsData['item_weights']);
};

const createSettings = (overrides?: Partial<IMLogicSettingsData>): IMLogicSettingsData => ({
  id: nanoid(10),
  name: 'カスタム設定',
  horse_weight: 70,
  jockey_weight: 30,
  item_weights: createDefaultWeights(),
  ...overrides,
});

export function IMLogicSettings({ onComplete, raceName }: IMLogicSettingsProps) {
  const [settings, setSettings] = useState<IMLogicSettingsData>(() => createSettings());
  const [selectedItems, setSelectedItems] = useState<Set<WeightItem['id']>>(
    () => new Set(WEIGHT_ITEMS.map((item) => item.id)),
  );
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => Object.values(settings.item_weights).reduce((sum, value) => sum + value, 0),
    [settings.item_weights],
  );

  const applyWeightDistribution = useCallback((ids: Set<WeightItem['id']>) => {
    if (ids.size === 0) return settings.item_weights;
    const base = 100 / ids.size;
    const result = { ...settings.item_weights };
    WEIGHT_ITEMS.forEach((item, index) => {
      if (ids.has(item.id)) {
        const value = index === ids.size - 1 ? 100 - base * (ids.size - 1) : base;
        result[item.id] = parseFloat(value.toFixed(2));
      } else {
        result[item.id] = 0;
      }
    });
    return result;
  }, [settings.item_weights]);

  const handleToggleItem = useCallback((id: WeightItem['id']) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) {
          toast.error('少なくとも1項目を選択してください');
          return prev;
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      setSettings((current) => ({
        ...current,
        item_weights: applyWeightDistribution(next),
      }));
      return next;
    });
  }, [applyWeightDistribution]);

  const handlePreset = useCallback((preset: 'balanced' | 'attack' | 'stability' | 'jockey') => {
    let nextSelection: WeightItem['id'][] = [];
    let horse = 70;
    let jockey = 30;
    let name = 'カスタム設定';

    switch (preset) {
      case 'balanced':
        nextSelection = WEIGHT_ITEMS.map((item) => item.id);
        horse = 70;
        jockey = 30;
        name = 'バランス型';
        break;
      case 'attack':
        nextSelection = [
          '12_time_index',
          '10_corner_specialist',
          '1_distance_aptitude',
          '9_horse_weight_impact',
          '11_margin_analysis',
        ];
        horse = 65;
        jockey = 35;
        name = '攻め重視';
        break;
      case 'stability':
        nextSelection = [
          '4_trainer_evaluation',
          '6_weather_aptitude',
          '5_track_aptitude',
          '8_weight_impact',
          '7_popularity_factor',
        ];
        horse = 75;
        jockey = 25;
        name = '安定重視';
        break;
      case 'jockey':
        nextSelection = [
          '3_jockey_compatibility',
          '4_trainer_evaluation',
          '10_corner_specialist',
          '12_time_index',
        ];
        horse = 55;
        jockey = 45;
        name = '選手重視';
        break;
    }

    const nextSet = new Set<WeightItem['id']>(nextSelection);
    setSelectedItems(nextSet);
    setSettings((current) => ({
      ...current,
      id: nanoid(10),
      name,
      horse_weight: horse,
      jockey_weight: jockey,
      item_weights: applyWeightDistribution(nextSet),
    }));
    toast.success(`${name}を適用しました`);
  }, [applyWeightDistribution]);

  const handleSave = useCallback(() => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      onComplete({ ...settings, id: nanoid(12) });
      toast.success('IMLogic の重み付けを適用しました');
      setSaving(false);
    }, 300);
  }, [onComplete, saving, settings]);

  const isValid = Math.abs(total - 100) < 0.5;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#2B3139] bg-[#181A20] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#B7BDC6]">ステップ 2</p>
            <h2 className="text-2xl font-semibold text-white">{raceName ?? 'カスタムエンジン設定'}</h2>
            <p className="mt-1 text-sm text-[#848E9C]">
              馬(艇)と選手の比率・着目項目を調整し、チャットに適用してください。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettings(createSettings())}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2B3139] px-4 py-2 text-sm text-[#EAECEF] transition hover:bg-[#2B3139]"
            >
              <RefreshCw className="h-4 w-4" /> リセット
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F0B90B] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#FCD535] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" /> 適用
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#2B3139] bg-[#181A20] p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-[#F0B90B]" /> プリセット
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handlePreset('balanced')}
              className="rounded-lg bg-[#2B3139] px-3 py-2 text-[#EAECEF] transition hover:bg-[#3C434B]"
            >
              バランス
            </button>
            <button
              type="button"
              onClick={() => handlePreset('attack')}
              className="rounded-lg bg-[#2B3139] px-3 py-2 text-[#EAECEF] transition hover:bg-[#3C434B]"
            >
              攻め重視
            </button>
            <button
              type="button"
              onClick={() => handlePreset('stability')}
              className="rounded-lg bg-[#2B3139] px-3 py-2 text-[#EAECEF] transition hover:bg-[#3C434B]"
            >
              安定重視
            </button>
            <button
              type="button"
              onClick={() => handlePreset('jockey')}
              className="rounded-lg bg-[#2B3139] px-3 py-2 text-[#EAECEF] transition hover:bg-[#3C434B]"
            >
              選手重視
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#2B3139] bg-[#181A20] p-6 text-[#EAECEF]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#B7BDC6]">艇・選手の比率</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-[#848E9C]">艇</span>
                <span className="text-2xl font-semibold text-[#F0B90B]">{settings.horse_weight}%</span>
              </div>
              <div className="h-10 w-px bg-[#2B3139]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-[#848E9C]">選手</span>
                <span className="text-2xl font-semibold text-[#F0B90B]">{settings.jockey_weight}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-[#B7BDC6]">
            <button
              type="button"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  horse_weight: Math.min(100, current.horse_weight + 5),
                  jockey_weight: Math.max(0, current.jockey_weight - 5),
                }))
              }
              className="rounded-lg border border-[#2B3139] px-3 py-2 transition hover:bg-[#2B3139]"
            >
              馬(艇)比率 +5%
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  horse_weight: Math.max(0, current.horse_weight - 5),
                  jockey_weight: Math.min(100, current.jockey_weight + 5),
                }))
              }
              className="rounded-lg border border-[#2B3139] px-3 py-2 transition hover:bg-[#2B3139]"
            >
              選手比率 +5%
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info className="h-4 w-4 text-[#F0B90B]" /> 着目項目を選択
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {WEIGHT_ITEMS.map((item) => {
            const checked = selectedItems.has(item.id);
            const value = settings.item_weights[item.id];
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`flex h-full flex-col gap-2 rounded-xl border px-4 py-4 text-left transition ${
                  checked
                    ? 'border-[#F0B90B] bg-[#2B3139]'
                    : 'border-[#2B3139] bg-[#181A20] hover:border-[#3C434B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  {checked ? (
                    <CheckCircle2 className="h-4 w-4 text-[#F0B90B]" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-[#3C434B]" />
                  )}
                </div>
                <p className="text-xs text-[#B7BDC6]">{item.description}</p>
                <p className="text-xs text-[#F0B90B]">配分 {value.toFixed(1)}%</p>
              </button>
            );
          })}
        </div>
        {!isValid && (
          <p className="text-xs text-[#f87171]">配分の合計が100%になるよう調整してください（現在 {total.toFixed(2)}%）。</p>
        )}
      </section>
    </div>
  );
}
