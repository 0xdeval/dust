import { Link } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FiArrowUpRight } from "react-icons/fi";

export const CustomLink = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <Link
      flexDirection="row"
      alignItems="center"
      gap={1}
      href={href}
      transition="color 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        textDecoration: "none",
        color: "accentMain",
        transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      _focus={{ boxShadow: "none", outline: "none" }}
      _active={{ boxShadow: "none", outline: "none" }}
      target="_blank"
    >
      {children}
      <FiArrowUpRight />
    </Link>
  );
};
