"use client";

import { Controller, FieldValues } from "react-hook-form";
import { TextField, FormControl, InputBaseComponentProps } from "@mui/material";
interface FormFieldProps<T> {
  name: keyof T;
  control: any; // Type for 'control' from react-hook-form
  label: string;
  type?: string;
  helperText?: string;
  inputProps?: InputBaseComponentProps;
}

const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  inputProps,
  ...rest
}: FormFieldProps<T>) => (
  <Controller
    name={name as string}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <FormControl className="form-control">
        <TextField
          label={label}
          type={type}
          variant="outlined"
          className="mb-4"
          error={!!error}
          helperText={error ? error.message : ""}
          {...field}
          {...rest}
          inputProps={inputProps}
        />
      </FormControl>
    )}
  />
);

export default FormField;
