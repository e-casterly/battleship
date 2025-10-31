import { Menu } from "@components/battleship/Header/Menu.tsx";

export function Header() {
  return (
    <header className="py-1.5 sm:py-2 xl:py-4 relative z-2">
      <div className="container">
        <div className="relative flex items-center justify-center">
          <h1 className="text-lg sm:text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-bold font-decorative">
            Battleship
          </h1>
          <Menu />
        </div>
      </div>
    </header>
  );
}
