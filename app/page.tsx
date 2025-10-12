import Divider from "@/components/Divider";
import JoinGame from "@/components/JoinGame";
import Navbar from "@/components/Navbar";
import NewGame from "@/components/NewGame";

export default function Home() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto">
      <Navbar />
      <NewGame />
      <Divider />
      <JoinGame />
    </main>
  );
}
