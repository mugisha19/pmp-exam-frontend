/**
 * FormTextarea Component
 * React Hook Form wrapper for Textarea component
 */

import { useController } from "react-hook-form";
import Textarea from "../ui/Textarea";

export const FormTextarea = ({
  name,
  control,
  rules,
  defaultValue = "",
  ...textareaProps
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

  return <Textarea {...field} {...textareaProps} error={error?.message} />;
};

export default FormTextarea;
