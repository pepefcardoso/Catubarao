import { PollsClient } from "./polls-client";

export const metadata = {
  title: "Votações | Sócio-Torcedor",
  description: "Participe das decisões do clube.",
};

export default function PollsPage() {
  return (
    <div className="py-8">
      <PollsClient />
    </div>
  );
}
