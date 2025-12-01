/**
 * FormSelect Component
 * React Hook Form wrapper for Select component
 */

import { useController } from "react-hook-form";
import Select from "../ui/Select";

export const FormSelect = ({
  name,
  control,
  rules,
  defaultValue = "",
  ...selectProps
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <Select
      {...field}
      {...selectProps}
      error={error?.message}
      value={field.value}
      onChange={(e) => field.onChange(e.target.value)}
    />
  );
};

export default FormSelect;
