import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Input,
  ListItem,
  ListItemText,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import React from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import useOpen from '../../hooks/useOpen';
import { Unit } from '../../store/types';

const XenosRules: React.FC<{ unit: Unit; onChange: (unit: Unit) => void }> = ({
  unit,
  onChange,
}) => {
  const [open, handleOpen, handleClose] = useOpen();
  const xenosRulesData = useAppSelector((state) => state.data.xenosRulesData);
  const inlineRules = useAppSelector((state) => state.ui.inlineRules);

  const xenosRules = Object.keys(xenosRulesData).filter(
    (rule) => !xenosRulesData[rule].exclude_units.includes(unit.name)
  );

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    onChange({ ...unit, xenosRules: [...(e.target.value as string[])] });

  return (
    <>
      <FormLabel onClick={handleOpen} component="legend" style={{ marginTop: 5 }}>
        Xenos Rules <ArrowDropDownIcon />
      </FormLabel>
      {unit.xenosRules &&
        unit.xenosRules.length > 0 &&
        unit.xenosRules.map((name) => (
          <div key={name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={true}
                  onChange={() =>
                    onChange({
                      ...unit,
                      xenosRules: [...unit.xenosRules.filter((v) => v !== name)],
                    })
                  }
                />
              }
              label={
                <Tooltip title={xenosRulesData[name].description}>
                  <Typography>
                    {name}{' '}
                    <Typography color="secondary" component="span">
                      @{xenosRulesData[name].points}
                    </Typography>
                  </Typography>
                </Tooltip>
              }
              key={name}
            />
          </div>
        ))}
      <FormControl style={{ marginTop: 0, width: 0, height: 0 }}>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          IconComponent={() => <Box />}
          multiple
          value={unit.xenosRules}
          onChange={handleChange}
          input={<Input />}
          renderValue={() => ' '}
        >
          {xenosRules.map((name) => (
            <ListItem key={name} value={name} dense style={{ maxWidth: 400 }}>
              <Tooltip title={xenosRulesData[name].description}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color={unit.xenosRules.indexOf(name) > -1 ? 'primary' : 'inherit'}
                    >
                      {name}{' '}
                      <Typography color="secondary" component="span" variant="body2">
                        @{xenosRulesData[name].points}
                      </Typography>
                    </Typography>
                  }
                  secondary={(inlineRules && xenosRulesData[name]?.short) || ''}
                  style={{ margin: 0 }}
                />
              </Tooltip>
            </ListItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default XenosRules;
