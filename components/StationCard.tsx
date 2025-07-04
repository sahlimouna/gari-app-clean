// src/components/StationCard.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Battery } from "lucide-react";
import { Station } from "../types/Station";

interface StationCardProps {
  station: Station;
}

export function StationCard({ station }: StationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {station.name}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {station.address}
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-600 font-semibold">
              {station.available}/{station.total}
            </div>
            <div className="text-xs text-gray-500">disponibles</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Battery className="h-4 w-4 mr-2 text-blue-500" />
            <span>{station.power}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-orange-500" />
            <span>{station.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
