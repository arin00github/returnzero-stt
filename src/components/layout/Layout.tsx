import { Box, LinkBox } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

type MenuItem = {
  url: string;
  label: string;
  id: string;
};

const asideMenu: MenuItem[] = [
  { label: "스트리밍STT", id: "STREAMING", url: "/stream" },
  {
    label: "일반STT",
    id: "NORMAL",
    url: "/normal",
  },
];

export const Layout = (props: LayoutProps) => {
  const router = useRouter();

  const handleMovetoMenu = (item: MenuItem) => {
    router.push(item.url);
  };

  return (
    <Box w="100%" h="100%">
      <Box w="240px" pos="fixed" top={0} left={0} bottom={0} h="100vh" bg="black" color="white">
        {asideMenu.map((menu) => {
          return (
            <LinkBox
              px="12px"
              h="44px"
              lineHeight="44px"
              key={`menu_${menu.id}`}
              onClick={() => handleMovetoMenu(menu)}
            >
              {menu.label}
            </LinkBox>
          );
        })}
      </Box>
      <Box w="calc(100% - 240px)" pos="fixed" h="100vh" left={"240px"} top={0} bottom={0} right={0}>
        {props.children}
      </Box>
    </Box>
  );
};
