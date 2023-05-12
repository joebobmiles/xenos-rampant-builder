import * as yup from 'yup';
import { DataUnit, UnitOption } from '../../../store/types';
import { dynamicSchemaObject } from '../../../utils/dynamicSchemaObject';

export const unitSetStatsSchema = yup.object({
  attack: yup.number().min(2).max(12),
  move: yup.number().min(2).max(12),
  shoot: yup.number().min(0).max(12),
  courage: yup.number().min(2).max(12),
  armor: yup.number().min(0).max(6),
  attackValue: yup.number().min(0).max(6),
  defenceValue: yup.number().min(0).max(6),
  shootValue: yup.number().min(0).max(6),
  shootRange: yup.number().min(0).max(24),
  movement: yup.number().min(0).max(18),
  strengthPoints: yup.number().oneOf([5, 10]),
});

export const unitAdjustStatsSchema = yup.object({
  attack: yup.number().min(-12).max(12),
  move: yup.number().min(-12).max(12),
  shoot: yup.number().min(-12).max(12),
  courage: yup.number().min(-12).max(12),
  armor: yup.number().min(-6).max(6),
  attackValue: yup.number().min(-6).max(6),
  defenceValue: yup.number().min(-6).max(6),
  shootValue: yup.number().min(-6).max(6),
  shootRange: yup.number().min(-6).max(24),
  movement: yup.number().min(-18).max(18),
  strengthPoints: yup.number().oneOf([-10, -5, 0, 5, 10]),
});

export const unitOptionSchema = yup.object({
  name: yup.string().min(1).required(),
  points: yup.number().required(),
  description: yup.string().required(),
  short: yup.string(),
  remove: yup.array().of(yup.string()),
  add: yup.array().of(yup.string()),
  setStats: unitSetStatsSchema,
  adjustStats: unitAdjustStatsSchema,
  disabledBy: yup.array().of(yup.string()),
  enabledBy: yup.array().of(yup.string()),
});

export const dataUnitSchema = yup.object({
  name: yup.string().min(1).required(),
  type: yup.string(),
  points: yup.number().min(1).required(),
  stats: unitSetStatsSchema,
  rules: yup.array().of(yup.string()),
  xenosRules: yup.array().of(yup.string()),
  freeActivations: yup.array().of(yup.string()),
  options: dynamicSchemaObject(unitOptionSchema),
});

export const emptyOption: UnitOption = {
  name: '',
  points: 0,
  description: '',
};

export const emptyUnit: DataUnit = {
  name: 'Name',
  type: 'foot',
  points: 2,
  stats: {
    attack: 5,
    move: 6,
    shoot: 0,
    courage: 4,
    armor: 2,
    attackValue: 5,
    defenceValue: 5,
    shootValue: 0,
    shootRange: 0,
    movement: 6,
    strengthPoints: 5,
  },
  freeActivations: [],
  rules: [],
  options: {},
  xenosRules: [],
};