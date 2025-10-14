import Divider from "@/components/Divider";
import LoadGame from "@/components/load-game";
import Navbar from "@/components/layout/Navbar";
import CreateGame from "@/components/create-game";

export default function Home() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto">
      <Navbar />
      <CreateGame />
      <Divider />
      <LoadGame />
    </main>
  );
}
