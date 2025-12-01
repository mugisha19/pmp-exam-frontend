/**
 * FormCheckbox Component
 * Wrapper integrating react-hook-form with Checkbox
 */

import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";

export const FormCheckbox = ({ name, control, rules, ...checkboxProps }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { value, onChange, ...field },
        fieldState: { error },
      }) => (
        <Checkbox
          {...field}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          error={error?.message}
          {...checkboxProps}
        />
      )}
    />
  );
};

export default FormCheckbox;
