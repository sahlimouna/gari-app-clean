// src/services/chargingStationService.ts

import { Station } from "@/types/Station";

/**
 * Service pour récupérer les stations de recharge.
 * Dans un vrai projet, ce serait un appel API ou Firestore.
 */
export async function getStations(): Promise<Station[]> {
  // Simule une requête asynchrone
  return [
    {
      name: "Station Tesla Annaba Centre",
      address: "Place de l'Indépendance, Annaba",
      power: "150 kW",
      available: 3,
      total: 4,
      price: "45 DA/kWh",
    },
    {
      name: "Borne Rapide Aéroport",
      address: "Aéroport Rabah Bitat, Annaba",
      power: "50 kW",
      available: 2,
      total: 2,
      price: "35 DA/kWh",
    },
  ];
}
