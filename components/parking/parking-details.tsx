"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, MapPin, Car, Clock, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Parking } from "@/types/parking"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReserveButton } from "@/components/parking/reservebutton"
import { useAuth } from "@/components/auth-provider"

interface ParkingDetailsProps {
  parking: Parking
}

export function ParkingDetails({ parking }: ParkingDetailsProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("17:00")

  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  )

  const calculateDuration = () => {
    if (!startDate || !endDate || !startTime || !endTime) return 0
    const start = new Date(startDate)
    const [startHour] = startTime.split(":").map(Number)
    start.setHours(startHour, 0, 0, 0)
    const end = new Date(endDate)
    const [endHour] = endTime.split(":")[0] as unknown as number
    end.setHours(endHour, 0, 0, 0)
    const diffMs = end.getTime() - start.getTime()
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
  }

  const calculatePrice = () => calculateDuration() * parking.pricePerHour

  return (
    <div className="space-y-6">
      <div className="h-60 bg-muted relative rounded-lg overflow-hidden">
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
          {parking.availableSpots} places disponibles
        </div>
        <img
          src={parking.image || "/placeholder.svg?height=240&width=640"}
          alt={parking.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">{parking.name}</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{parking.address}</span>
          </div>
          <div className="flex items-center">
            <Car className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{parking.totalSpots} places totales</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{parking.pricePerHour} DA/heure</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Choisir les dates de réservation</h3>

          <div className="space-y-4">
            {/* Date d'arrivée */}
            <div>
              <label className="block text-sm font-medium mb-2">Date et heure d'arrivée</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: fr }) : "Date d'arrivée"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>

                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date de départ */}
            <div>
              <label className="block text-sm font-medium mb-2">Date et heure de départ</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: fr }) : "Date de départ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < (startDate || new Date(new Date().setHours(0, 0, 0, 0)))}
                    />
                  </PopoverContent>
                </Popover>

                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Résumé */}
            {startDate && endDate && startTime && endTime && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Résumé de la réservation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Durée :</span>
                    <span className="font-medium">{calculateDuration()} heure(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix par heure :</span>
                    <span className="font-medium">{parking.pricePerHour} DA</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total :</span>
                    <span className="text-primary">{calculatePrice()} DA</span>
                  </div>
                </div>
              </div>
            )}

            {/* BOUTON */}
            <ReserveButton
              parkingId={parking.id}
              start={new Date(new Date(startDate!).setHours(Number(startTime.split(":")[0]), 0, 0, 0)).toISOString()}
              end={new Date(new Date(endDate!).setHours(Number(endTime.split(":")[0]), 0, 0, 0)).toISOString()}
              disabled={!startDate || !endDate || !startTime || !endTime}
            />

            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>Le paiement se fait après confirmation, via CIB ou EDAHABIA en Dinars Algériens.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
