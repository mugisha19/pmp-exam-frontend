/**
 * FormPasswordField Component
 * Wrapper integrating react-hook-form with PasswordInput
 */

import { Controller } from "react-hook-form";
import { PasswordInput } from "@/components/ui/PasswordInput";

export const FormPasswordField = ({ name, control, rules, ...inputProps }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <PasswordInput {...field} error={error?.message} {...inputProps} />
      )}
    />
  );
};

export default FormPasswordField;
