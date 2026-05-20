import Game from "@components/battleship/Game/Game.tsx";
import { Header } from "@components/battleship/Header/Header.tsx";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-3 md:py-4 flex-1 flex relative z-1">
        <div className="container flex-1 flex flex-col">
          <Game />
        </div>
      </main>
    </div>
  );
}

export default App;
