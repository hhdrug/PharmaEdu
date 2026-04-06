export type { CalcHistoryEntry, CalcResultSnapshot } from './types';
export {
  getCalcHistory,
  saveCalcHistory,
  deleteCalcHistory,
  clearCalcHistory,
  generateHistoryId,
} from './storage';
