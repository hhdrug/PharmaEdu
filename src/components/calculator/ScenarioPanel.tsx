'use client';

/**
 * ScenarioPanel.tsx
 * 19개 테스트 시나리오 프리셋 선택 UI — 5개 탭 + 버튼.
 * Phase 1 메타데이터 활용 — 각 버튼에 해당 시나리오가 다루는 챕터 뱃지 표시.
 */

import { FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SCENARIOS, SCENARIO_GROUPS, type ScenarioPreset } from '@/components/calculator/scenarios';

// ─── Props ─────────────────────────────────────────────────────────────

export interface ScenarioPanelProps {
  activeGroup: number;
  onGroupChange: (index: number) => void;
  onApply: (scenarioId: string) => void;
  selectedScenarioId?: string;
}

export default function ScenarioPanel({
  activeGroup,
  onGroupChange,
  onApply,
  selectedScenarioId,
}: ScenarioPanelProps) {
  const scenariosInGroup: ScenarioPreset[] = SCENARIO_GROUPS[activeGroup].ids
    .map((id) => SCENARIOS.find((s) => s.id === id))
    .filter((s): s is ScenarioPreset => !!s);

  return (
    <Card variant="outlined">
      <p className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">
        19개 테스트 시나리오 프리셋
      </p>

      {/* 카테고리 탭 */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {SCENARIO_GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => onGroupChange(i)}
            className={[
              'px-2.5 py-2 min-h-[36px] rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              activeGroup === i
                ? 'bg-primary-500 text-white'
                : 'bg-bg-panel text-text-secondary hover:bg-primary-100 hover:text-primary-700',
            ].join(' ')}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 해당 그룹의 시나리오 버튼 */}
      <div className="flex flex-wrap gap-2">
        {scenariosInGroup.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          return (
            <div key={sc.id} className="flex flex-col items-start gap-1">
              <Button
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onApply(sc.id)}
                title={sc.description}
                className="text-left justify-start"
              >
                <FlaskConical className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                <span className="font-medium text-xs">{sc.label}</span>
              </Button>
              {/* 관련 챕터 뱃지 (Phase 1 메타데이터) */}
              {sc.relatedChapters && sc.relatedChapters.length > 0 && (
                <div className="flex flex-wrap gap-0.5 ml-1">
                  {sc.relatedChapters.slice(0, 4).map((ch) => (
                    <Badge key={ch} variant="neutral" className="text-[10px] px-1.5 py-0">
                      {ch}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-muted mt-3">
        버튼을 클릭하면 모든 입력 필드가 시나리오 값으로 설정됩니다. 뱃지의 CH번호는 해당 시나리오가 다루는 학습 챕터입니다.
      </p>
    </Card>
  );
}
