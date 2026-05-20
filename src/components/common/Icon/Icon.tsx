import type { FC, SVGProps } from "react";
import ArrowIcon from "@assets/arrow.svg?react";
import BrigantineIcon from "@assets/brigantine.svg?react";
import CircleIcon from "@assets/circle.svg?react";
import CloseIcon from "@assets/close.svg?react";
import CubeIcon from "@assets/cube.svg?react";
import FrigateIcon from "@assets/frigate.svg?react";
import GalleonIcon from "@assets/galleon.svg?react";
import HandIcon from "@assets/hand.svg?react";
import HorizontalIcon from "@assets/horizontal.svg?react";
import MenuIcon from "@assets/menu.svg?react";
import SchoonerIcon from "@assets/schooner.svg?react";
import SloopIcon from "@assets/sloop.svg?react";
import VerticalIcon from "@assets/vertical.svg?react";
import cn from "clsx";

const ICONS = {
  arrow: ArrowIcon,
  brigantine: BrigantineIcon,
  circle: CircleIcon,
  close: CloseIcon,
  cube: CubeIcon,
  frigate: FrigateIcon,
  galleon: GalleonIcon,
  hand: HandIcon,
  horizontal: HorizontalIcon,
  menu: MenuIcon,
  schooner: SchoonerIcon,
  sloop: SloopIcon,
  vertical: VerticalIcon,
} satisfies Record<string, FC<SVGProps<SVGSVGElement>>>;

export type IconName = keyof typeof ICONS;

type IconSize = "auto" | "base";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "color"> & {
  name: IconName;
  size?: IconSize;
  className?: string;
};

export default function Icon({ name, size = "base", className, ...rest }: IconProps) {
  const SvgIcon = ICONS[name];

  return (
    <SvgIcon
      className={cn(
        "max-w-full max-h-full flex justify-center items-center",
        { "w-full h-auto": size === "auto" },
        { "w-4 h-4 xl:w-5 xl:h-5": size === "base" },
        className,
      )}
      {...rest}
    />
  );
}
