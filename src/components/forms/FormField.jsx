/**
 * FormField Component
 * Wrapper integrating react-hook-form with Input
 */

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export const FormField = ({ name, control, rules, ...inputProps }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Input {...field} error={error?.message} {...inputProps} />
      )}
    />
  );
};

export default FormField;
