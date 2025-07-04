// src/app/stations/page.tsx

import { Header } from "@/components/header";
import { Zap } from "lucide-react";
import { getStations } from "@/components/services/chargingStationService";
import { StationCard } from "@/components/StationCard";
import { Station } from "@/types/Station";

export default async function StationsPage() {
  // 🔑 Appel au service pour récupérer dynamiquement les données
  const stations: Station[] = await getStations();

  return (
    <main className="container mx-auto px-4 py-6">
      {/* ✅ Header réutilisable */}
      <Header
        title="Bornes de recharge électrique"
        backUrl="/settings"
      />

      {/* ✅ Titre + sous-titre */}
      <section className="mt-6 space-y-4">
        <div className="text-center mb-6">
          <Zap className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Stations de recharge à Annaba
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Trouvez et réservez une borne de recharge électrique
          </p>
        </div>

        {/* ✅ Liste des stations via composant dédié */}
        <div className="space-y-4">
          {stations.map((station: Station, index: number) => (
            <StationCard key={index} station={station} />
          ))}
        </div>
      </section>
    </main>
  );
}
