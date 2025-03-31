import { Checkbox } from "@chakra-ui/react";

type CheckboxProps = {
  isChecked: boolean;
  onChange: () => void;
  colorScheme: string;
};

export const CustomCheckbox = ({
  isChecked,
  onChange,
  colorScheme,
}: CheckboxProps) => {
  return (
    <Checkbox.Root
      defaultChecked={isChecked}
      variant={"subtle"}
      colorScheme={colorScheme}
      onChange={onChange}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
    </Checkbox.Root>
  );
};
