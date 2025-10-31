import Icon from "@components/common/Icon/Icon.tsx";
import Button from "@components/common/Button/Button.tsx";
import { useGameStore } from "@utils/store.ts";
import { useState } from "react";
import cn from "classnames";
import { ThemeToggle } from "@components/battleship/Header/ThemeToggle.tsx";

export function Menu() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const resetSameGame = useGameStore((s) => s.resetSameGame);
  const phase = useGameStore((s) => s.phase);

  const [isOpen, setIsOpen] = useState(false);

  function OpenMenu() {
    setIsOpen(true);
  }

  return (
    <>
      <Button
        className="absolute right-0 cursor-pointer text-foreground w-6 lg:w-8"
        variant="clean"
        onClick={OpenMenu}
      >
        <Icon name="menu" size="auto" />
      </Button>
      <nav
        className={cn(
          "invisible h-screen fixed top-0 right-0 z-100 transition-all duration-150 ease-in-out translate-x-0",
          {
            "translate-x-full": !isOpen,
            visible: isOpen,
          },
        )}
      >
        <div className="bg-tone h-full py-16 px-20 relative flex flex-col">
          <Button
            variant="clean"
            className="absolute right-4 top-4 text-foreground w-6 lg:w-8"
            onClick={() => setIsOpen(false)}
          >
            <Icon name="close" size="auto" />
          </Button>
          <div className="flex-1 flex flex-col gap-2 justify-center">
            <div className="my-2">
              <ThemeToggle />
            </div>
            {phase !== "placement" && (
              <>
                <Button variant="text" onClick={resetSameGame}>
                  Reset
                </Button>
                <Button variant="text" onClick={startNewGame}>
                  Start new game
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
