// src/pages/ChargingStationsPage.tsx

import { Header } from "@/components/header";
import { Zap } from "lucide-react";
import { getStations } from "@/components/services/chargingStationService";
import { StationCard } from "@/components/StationCard";

export default async function ChargingStationsPage() {
  const stations = await getStations();

  return (
    <div className="container mx-auto px-4 py-6">
      <Header
        title="Bornes de recharge électrique"
        backUrl="/settings"
      />

      <div className="mt-6 space-y-4">
        <div className="text-center mb-6">
          <Zap className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Stations de recharge à Annaba
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Trouvez et réservez une borne de recharge électrique
          </p>
        </div>

        {stations.map((station, index) => (
          <StationCard key={index} station={station} />
        ))}
      </div>
    </div>
  );
}
