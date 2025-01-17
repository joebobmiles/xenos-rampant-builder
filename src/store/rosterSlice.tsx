import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BattleSelection } from '../components/Campaign/Battles/BattlesView';
import { selectAllRules } from '../store/dataSlice';
import {
  BattleStates,
  CommanderBattle,
  CommanderState,
  Data,
  PsychicPowers,
  RootState,
  RosterState,
  Rules,
  Thunk,
  Unit,
} from './types';

const rosterInitialState: RosterState = {
  name: 'New List',
  units: [],
};

const commanderInitialState: CommanderState = {
  name: 'Commander 1',
  commanderTraits: [],
  removedCommanderTraits: [],
  detachmentExpansions: 0,
  missesGame: false,
  initialCareerPoints: 10,
  careerPointAdjustment: 0,
  battles: [],
};

const rosterSlice = createSlice({
  name: 'roster',
  initialState: rosterInitialState,
  reducers: {
    newRoster: () => ({ ...rosterInitialState }),
    setRoster: (_, action: PayloadAction<RosterState>) => ({ ...action.payload }),
    updateRoster: (state, action: PayloadAction<Partial<RosterState>>) => ({
      ...state,
      ...action.payload,
    }),
    /* ------------------------------------ Units ------------------------------------ */
    _addUnit: (state: RosterState, action: PayloadAction<[Data, Unit?, number?]>) => {
      // eslint-disable-next-line prefer-const
      let [data, unit, index] = action.payload;
      unit = unit ? unit : { ...data.unitData.Unit, options: [], xenosRules: [] };
      index == null ? state.units.push(unit) : state.units.splice(index + 1, 0, unit);
    },
    _setUnit: (state, action: PayloadAction<[Data, number, string]>) => {
      const [data, id, name] = action.payload;
      state.units[id] = { ...data.unitData[name], options: [], xenosRules: [] };
    },
    updateUnit: {
      reducer: (state, action: PayloadAction<[number, Partial<Unit>]>) => {
        const [id, newAttributes] = action.payload;
        state.units[id] = { ...state.units[id], ...newAttributes };
      },
      prepare: (
        id: number,
        newAttributes: Partial<Unit>
      ): { payload: [number, Partial<Unit>] } => ({ payload: [id, newAttributes] }),
    },
    removeUnit: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.units.splice(id, 1);
    },
    renameUnit: {
      reducer: (state, action: PayloadAction<[number, string]>) => {
        const [id, name] = action.payload;
        state.units[id].customName = name;
      },
      prepare: (id: number, name: string): { payload: [number, string] } => ({
        payload: [id, name],
      }),
    },
    moveUnit: {
      reducer: (state, action: PayloadAction<[number, 'left' | 'right']>) => {
        const [index, direction] = action.payload;
        const nextIndex = direction === 'left' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= state.units.length) return state;
        [state.units[nextIndex], state.units[index]] = [
          state.units[index],
          state.units[nextIndex],
        ];
      },
      prepare: (
        id: number,
        direction: 'left' | 'right'
      ): { payload: [number, 'left' | 'right'] } => ({ payload: [id, direction] }),
    },
    /* ----------------------------------- Campaign ---------------------------------- */
    addCampaign: (state) => {
      state.campaign = {
        commanders: [{ ...commanderInitialState }],
        retirements: 0,
      };
    },
    addCommander: (state) => {
      const retirements = state.campaign?.retirements || 0;
      const initialCareerPoints = retirements === 1 ? 5 : retirements > 1 ? 0 : 10;
      state.campaign?.commanders.push({
        ...commanderInitialState,
        name: 'Commander ' + (state.campaign?.commanders.length + 1).toString(),
        initialCareerPoints: initialCareerPoints,
      });
    },
    adjustCareerPoints: (state, action: PayloadAction<number>) => {
      const amount = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        state.campaign.commanders[index].careerPointAdjustment = amount;
      }
    },
    setCommanderName: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        state.campaign.commanders[index].name = name;
      }
    },
    addTrait: (state, action: PayloadAction<string[]>) => {
      const traits = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        state.campaign.commanders[index].commanderTraits = [...traits];
      }
    },
    removeTrait: (state, action: PayloadAction<string[]>) => {
      const traits = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        state.campaign.commanders[index].removedCommanderTraits = [...traits];
      }
    },
    adjustDetachmentExpansions: (state, action: PayloadAction<number>) => {
      const amount = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        if (state.campaign.commanders[index].detachmentExpansions + amount > 0) {
          state.campaign.commanders[index].detachmentExpansions += amount;
        } else {
          state.campaign.commanders[index].detachmentExpansions = 0;
        }
      }
    },
    addRetirement: (state) => {
      if (state.campaign) {
        state.campaign.retirements += 1;
      }
    },
    addBattle: (state, action: PayloadAction<CommanderBattle>) => {
      const battle = action.payload;
      if (state.campaign) {
        const index = state.campaign.commanders.length - 1;
        state.campaign.commanders[index].battles.push(battle);
      }
    },
    removeBattle: (state, action: PayloadAction<BattleSelection>) => {
      const { commanderIndex, battleIndex } = action.payload;
      if (state.campaign) {
        state.campaign.commanders[commanderIndex].battles.splice(battleIndex, 1);
      }
    },
    editBattle: {
      reducer: (state, action: PayloadAction<[CommanderBattle, BattleSelection]>) => {
        const [battle, { commanderIndex, battleIndex }] = action.payload;
        if (state.campaign) {
          state.campaign.commanders[commanderIndex].battles[battleIndex] = battle;
        }
      },
      prepare: (
        battle: CommanderBattle,
        battleSelection: BattleSelection
      ): { payload: [CommanderBattle, BattleSelection] } => ({
        payload: [battle, battleSelection],
      }),
    },
  },
});

const { _addUnit, _setUnit } = rosterSlice.actions;

export const addUnit =
  (unit?: Unit, index?: number): Thunk =>
  (dispatch, getState) => {
    const data = getState().data;
    dispatch(_addUnit([data, unit, index]));
  };

export const setUnit =
  (id: number, name: string): Thunk =>
  (dispatch, getState) => {
    const data = getState().data;
    dispatch(_setUnit([data, id, name]));
  };

export const getTotalPoints = createSelector(
  (state: RootState) => state.roster.units,
  (units) => units.reduce((acc, unit) => acc + unit.points, 0)
);

export const getSpecialRules = createSelector(
  (state: RootState) => state.roster.units,
  selectAllRules,
  (units, rulesData) => {
    const unique_rules = new Set<string>();
    units.forEach((unit) =>
      unit.rules.forEach((ruleName) => unique_rules.add(ruleName))
    );

    return [...unique_rules].sort().reduce(
      (acc: Rules, ruleName) =>
        rulesData[ruleName]
          ? {
              ...acc,
              [ruleName]: rulesData[ruleName],
            }
          : acc,
      {}
    );
  }
);

export const getPsychicPowers = createSelector(
  (state: RootState) => state.roster.units,
  (state: RootState) => state.data.psychicPowers,
  (units, rulesData) => {
    const unique_powers = new Set<string>();
    units.forEach(
      (unit) => unit.psiPowers?.forEach((powerName) => unique_powers.add(powerName))
    );

    return [...unique_powers].sort().reduce(
      (acc: PsychicPowers, powerName) => ({
        ...acc,
        [powerName]: rulesData[powerName],
      }),
      {}
    );
  }
);

export const getVictoryPoints = createSelector(
  (state: RootState) => state.roster.campaign?.commanders,
  (commanders) =>
    commanders
      ? commanders.reduce(
          (victoryPoints, commander) =>
            commander.battles.reduce(
              (victoryPoints, battle) => victoryPoints + battle.victoryPoints,
              victoryPoints
            ),
          0
        )
      : 0
);

export const getCurrentCommander = createSelector(
  (state: RootState) => state.roster.campaign?.commanders,
  (commanders) => (commanders ? commanders[commanders.length - 1] : null)
);

export const getBattles = createSelector(
  (state: RootState) => state.roster.campaign?.commanders,
  (commanders): [BattleStates, BattleSelection[]] => {
    if (!commanders) return [[], []];
    const battles: BattleStates = [];
    const battleSelection: BattleSelection[] = [];
    commanders.forEach((commander, commanderIndex) => {
      commander.battles.forEach((battle, battleIndex) => {
        battles.push({ commander: commander.name, ...battle });
        battleSelection.push({ commanderIndex, battleIndex });
      });
    });
    return [battles, battleSelection];
  }
);

export const {
  newRoster,
  setRoster,
  updateRoster,
  updateUnit,
  removeUnit,
  renameUnit,
  moveUnit,
  addCampaign,
  addCommander,
  adjustCareerPoints,
  setCommanderName,
  addTrait,
  removeTrait,
  adjustDetachmentExpansions,
  addRetirement,
  addBattle,
  editBattle,
  removeBattle,
} = rosterSlice.actions;

export default rosterSlice.reducer;
