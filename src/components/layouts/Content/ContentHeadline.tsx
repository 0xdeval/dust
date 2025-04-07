import { Flex, Heading, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";

interface Props {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonAction: () => void;
  isButtonDisabled?: boolean;
}

export const ContentHeadline = ({
  title,
  subtitle,
  buttonLabel,
  buttonAction,
  isButtonDisabled = true,
}: Props) => {
  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      alignItems={"flex-start"}
    >
      <Flex flexDirection={"column"} gap={4}>
        <Heading as="h1" size="4xl">
          {title}
        </Heading>
        <Text color="textSecondary">{subtitle}</Text>
      </Flex>
      <Button
        size={"lg"}
        bg={"actionButtonSolid"}
        onClick={buttonAction}
        disabled={isButtonDisabled}
      >
        {buttonLabel}
      </Button>
    </Flex>
  );
};
