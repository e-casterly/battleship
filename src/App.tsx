import Game from "@components/battleship/Game/Game.tsx";
import { Header } from "@components/battleship/Header/Header.tsx";
import { Bubbles } from "@components/battleship/Bubbles/Bubbles.tsx";
import { useGameStore } from "@utils/store.ts";

function App() {
  const phase = useGameStore((s) => s.phase);
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="py-3 md:py-4 flex-1 flex relative z-1">
          <div className="container flex-1 flex flex-col">
            <Game />
          </div>
        </main>
        {phase === "game-over" && <Bubbles />}
      </div>
    </>
  );
}

export default App;
