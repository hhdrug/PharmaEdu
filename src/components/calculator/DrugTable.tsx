'use client';

/**
 * DrugTable.tsx
 * 계산기 페이지의 약품 목록 섹션. 약품 행 추가/삭제/편집 + 계산 실행 버튼.
 * 기존 page.tsx 1,174줄 모놀리스에서 분리됨.
 */

import { Plus, Trash2, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

// ─── 타입 ──────────────────────────────────────────────────────────────

export interface DrugRow {
  id: number;
  code: string;
  price: string;
  dose: string;
  dNum: string;
  dDay: string;
  insuPay: string;
  take: string;
  isPowder: string; // "1" | ""
}

// ─── 드롭다운 옵션 ─────────────────────────────────────────────────────

const INSU_PAY_OPTIONS = [
  { value: 'covered',    label: '급여' },
  { value: 'nonCovered', label: '비급여' },
  { value: 'fullSelf',   label: '100%본인' },
  { value: 'partial50',  label: '선별50%' },
  { value: 'partial80',  label: '선별80%' },
  { value: 'partial30',  label: 'D항 선별30%' },
  { value: 'partial90',  label: 'E항 선별90%' },
  { value: 'veteran100', label: 'V항 보훈100/100' },
];

const TAKE_OPTIONS = [
  { value: 'internal',  label: '내복' },
  { value: 'external',  label: '외용' },
  { value: 'injection', label: '주사' },
];

// ─── ID 생성기 ─────────────────────────────────────────────────────────

let _idSeq = 0;
export function nextDrugId(): number { return ++_idSeq; }

export function defaultDrugRow(): DrugRow {
  return {
    id: nextDrugId(),
    code: '', price: '', dose: '1', dNum: '3', dDay: '7',
    insuPay: 'covered', take: 'internal', isPowder: '',
  };
}

// ─── Props ─────────────────────────────────────────────────────────────

export interface DrugTableProps {
  drugs: DrugRow[];
  onAddRow: () => void;
  onRemoveRow: (id: number) => void;
  onUpdateCell: (id: number, field: keyof DrugRow, value: string) => void;
  onCalculate: () => void;
  loading?: boolean;
}

export default function DrugTable({
  drugs,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
  onCalculate,
  loading,
}: DrugTableProps) {
  return (
    <Card variant="standard">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">약품 목록</h2>
        <Button variant="ghost" size="sm" onClick={onAddRow} aria-label="약품 추가">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      <div className="space-y-4">
        {drugs.map((drug, idx) => (
          <div key={drug.id} className="p-3 rounded-lg bg-bg-panel border border-border-light">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-muted">약품 {idx + 1}</span>
              {drugs.length > 1 && (
                <button
                  onClick={() => onRemoveRow(drug.id)}
                  aria-label={`약품 ${idx + 1} 삭제`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-error-500 transition-colors rounded-lg hover:bg-error-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 코드 + 단가 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Input
                label="약품코드"
                value={drug.code}
                onChange={(e) => onUpdateCell(drug.id, 'code', e.target.value)}
                placeholder="선택사항"
              />
              <Input
                label="단가 (원)"
                type="number"
                min="0"
                value={drug.price}
                onChange={(e) => onUpdateCell(drug.id, 'price', e.target.value)}
                placeholder="예: 500"
                required
              />
            </div>

            {/* 1회투약량 + 1일횟수 + 총일수 */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Input label="1회투약량"   type="number" min="0" step="0.5" value={drug.dose} onChange={(e) => onUpdateCell(drug.id, 'dose', e.target.value)} />
              <Input label="1일횟수"     type="number" min="1"           value={drug.dNum} onChange={(e) => onUpdateCell(drug.id, 'dNum', e.target.value)} />
              <Input label="총투여일수"  type="number" min="1"           value={drug.dDay} onChange={(e) => onUpdateCell(drug.id, 'dDay', e.target.value)} />
            </div>

            {/* 급여구분 + 복용구분 + 산제여부 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select
                label="급여구분"
                value={drug.insuPay}
                onChange={(e) => onUpdateCell(drug.id, 'insuPay', e.target.value)}
                options={INSU_PAY_OPTIONS}
              />
              <Select
                label="복용구분"
                value={drug.take}
                onChange={(e) => onUpdateCell(drug.id, 'take', e.target.value)}
                options={TAKE_OPTIONS}
              />
              <Select
                label="산제여부"
                value={drug.isPowder}
                onChange={(e) => onUpdateCell(drug.id, 'isPowder', e.target.value)}
                options={[
                  { value: '',  label: '일반' },
                  { value: '1', label: '산제(가루)' },
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={onCalculate}
          loading={loading}
          className="w-full"
        >
          <Calculator className="w-5 h-5" />
          계산하기
        </Button>
      </div>
    </Card>
  );
}
