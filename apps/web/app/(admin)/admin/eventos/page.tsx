import { EventsClient } from "./events-client";

export const metadata = {
  title: "Gerenciar Eventos | Admin",
  description: "Gerenciar eventos de jogos",
};

export default function AdminEventsPage() {
  return <EventsClient />;
}
