import { useParams } from "react-router-dom";
import { ScrabbleGame } from "@/components/ScrabbleGame";

export default function GamePage() {
  const { roomId } = useParams();
  const id = roomId || "solo";
  return <ScrabbleGame mode={id === "solo" ? "solo" : "server"} roomId={id} />;
}
