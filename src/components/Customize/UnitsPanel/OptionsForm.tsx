import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import React, { BaseSyntheticEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
  FormContainer,
  MultiSelectElement,
  SelectElement,
  TextFieldElement,
} from '../../../libs/react-hook-form-mui';
import { RootState, UnitOption } from '../../../store/types';
import range from '../../../utils/range';
import StatManipulation from '../common/StatManipulation';
import { unitOptionSchema } from './unitSchemas';

const OptionsForm: React.FC<{
  open: boolean;
  handleClose: () => void;
  option: UnitOption;
  rules: string[];
  onSubmit: (option: UnitOption) => void;
}> = ({ open, handleClose, option, rules, onSubmit }) => {
  const specialRules = useSelector((state: RootState) => state.data.rulesData);

  const formContext = useForm<UnitOption>({
    resolver: yupResolver(unitOptionSchema),
    defaultValues: { ...option },
  });
  const { reset, watch, setValue, handleSubmit } = formContext;

  useEffect(() => {
    if (open) {
      reset({ ...option });
    }
  }, [reset, open, option]);

  const handleSubmitWithoutPropagation = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(handleAction)(e);
  };

  const handleAction = (option: UnitOption) => {
    onSubmit(option);
    handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Option</DialogTitle>
      <FormContainer
        formContext={formContext}
        handleSubmit={handleSubmitWithoutPropagation}
      >
        <DialogContent>
          {/* --------------------------------- Name -------------------------------- */}
          <TextFieldElement
            name="name"
            label="Name"
            type="text"
            margin="normal"
            fullWidth
          />
          {/* -------------------------------- Points ------------------------------- */}
          <SelectElement
            name="points"
            label="Points"
            margin="normal"
            type="number"
            fullWidth
            options={range(-4, 6)}
          />
          {/* ------------------------------- Summary ------------------------------- */}
          <TextFieldElement
            name="description"
            label="Description"
            type="text"
            margin="normal"
            fullWidth
            multiline
            style={{ marginBottom: 20 }}
          />
          {/* ----------------------------- Remove Rules ---------------------------- */}
          <MultiSelectElement
            name="remove"
            label="Remove Rules"
            fullWidth
            menuItems={[...rules]}
            style={{ marginBottom: 20 }}
          />
          {/* ------------------------------ Add Rules ------------------------------ */}
          <MultiSelectElement
            name="add"
            label="Add Rules"
            fullWidth
            menuItems={[...Object.keys(specialRules)]}
            style={{ marginBottom: 20 }}
          />
          {/* ------------------------------- Set Stats ----------------------------- */}
          <StatManipulation
            title="Set Stats"
            type="setStats"
            watch={watch}
            setValue={setValue}
          />
          {/* ----------------------------- Adjust Stats ---------------------------- */}
          <StatManipulation
            title="Adjust Stats"
            type="adjustStats"
            watch={watch}
            setValue={setValue}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Okay
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  );
};

export default OptionsForm;