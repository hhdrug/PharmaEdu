/**
 * calc-engine/supabase-repo.ts
 * ICalcRepository Supabase 구현체
 * 서버 사이드(Route Handler)에서만 사용
 */

import type { ICalcRepository, InsuRate } from './types';

type SupabaseClient = Awaited<ReturnType<typeof import('@/lib/supabase-server').createServerSupabase>>;

export class SupabaseCalcRepository implements ICalcRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Z코드별 단가/수가명 Map 반환
   * suga_fee 테이블에서 해당 연도 전체를 로드
   */
  async getSugaFeeMap(year: number): Promise<Map<string, { price: number; name: string }>> {
    const { data, error } = await this.supabase
      .from('suga_fee')
      .select('code, name, price')
      .eq('apply_year', year);

    if (error || !data) {
      console.error('[SupabaseRepo] getSugaFeeMap error:', error?.message);
      return new Map();
    }

    const map = new Map<string, { price: number; name: string }>();
    for (const row of data) {
      map.set(row.code as string, {
        price: Number(row.price),
        name: row.name as string,
      });
    }
    return map;
  }

  /**
   * 투약일수에 해당하는 처방조제료 조회
   * presc_dosage_fee 테이블: min_days <= days <= max_days 인 행
   */
  async getPrescDosageFee(
    year: number,
    days: number
  ): Promise<{ sugaCode: string; fee: number } | null> {
    const { data, error } = await this.supabase
      .from('presc_dosage_fee')
      .select('suga_code, fee')
      .eq('apply_year', year)
      .lte('min_days', days)
      .gte('max_days', days)
      .maybeSingle();

    if (error || !data) {
      console.error('[SupabaseRepo] getPrescDosageFee error:', error?.message);
      return null;
    }

    return {
      sugaCode: data.suga_code as string,
      fee: Number(data.fee),
    };
  }

  /**
   * 보험코드별 요율 조회
   * insu_rate 테이블
   */
  async getInsuRate(insuCode: string): Promise<InsuRate | null> {
    const { data, error } = await this.supabase
      .from('insu_rate')
      .select('insu_code, rate, six_age_rate, fix_cost, mcode, bcode, age65_12000_less')
      .eq('insu_code', insuCode)
      .maybeSingle();

    if (error || !data) {
      console.error('[SupabaseRepo] getInsuRate error:', error?.message);
      return null;
    }

    return {
      insuCode: data.insu_code as string,
      rate: Number(data.rate),
      sixAgeRate: Number(data.six_age_rate),
      fixCost: Number(data.fix_cost),
      mcode: Number(data.mcode),
      bcode: Number(data.bcode),
      age65_12000Less: Number(data.age65_12000_less),
    };
  }
}
