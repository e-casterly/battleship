import * as React from "react";
import CloseIcon from "@assets/close.svg?react";
import CircleIcon from "@assets/circle.svg?react";
import SchoonerIcon from "@assets/schooner.svg?react";
import SloopIcon from "@assets/sloop.svg?react";
import BrigantineIcon from "@assets/brigantine.svg?react";
import GalleonIcon from "@assets/galleon.svg?react";
import FrigateIcon from "@assets/frigate.svg?react";
import MenuIcon from "@assets/menu.svg?react";
import CubeIcon from "@assets/cube.svg?react";
import HandIcon from "@assets/hand.svg?react";
import HorizontalIcon from "@assets/horizontal.svg?react";
import VerticalIcon from "@assets/vertical.svg?react";
import ArrowIcon from "@assets/arrow.svg?react";
import cn from "classnames";

const ICONS = {
  menu: MenuIcon,
  close: CloseIcon,
  circle: CircleIcon,
  schooner: SchoonerIcon,
  sloop: SloopIcon,
  galleon: GalleonIcon,
  frigate: FrigateIcon,
  brigantine: BrigantineIcon,
  cube: CubeIcon,
  hand: HandIcon,
  horizontal: HorizontalIcon,
  vertical: VerticalIcon,
  arrow: ArrowIcon,
};

type IconName = keyof typeof ICONS;

export type IconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "width" | "height" | "color"
> & {
  name?: IconName;
  size?: "auto" | "base";
  className?: string;
};

export default function Icon({
  name = "circle",
  size = "base",
  className,
  ...rest
}: IconProps) {
  const SvgIcon = ICONS[name] satisfies React.FC<React.SVGProps<SVGSVGElement>>;

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
