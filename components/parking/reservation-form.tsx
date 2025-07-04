"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { uploadLicensePlateImage } from "@/lib/firebase/firestore";
import { rtdb, auth } from "@/lib/firebase/config";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Camera, Upload } from "lucide-react";
import type { Parking } from "@/types/parking";
import { ref, get, update, push, set } from "firebase/database";

interface ReservationFormProps {
  parking: Parking;
  reservationId: string;
}

export function ReservationForm({ parking, reservationId }: ReservationFormProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licensePlateImage, setLicensePlateImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    carBrand: "",
    carColor: "",
    licensePlate: "",
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservationRef = ref(rtdb, `requests/${reservationId}`);
        const snapshot = await get(reservationRef);

        if (!snapshot.exists()) {
          router.push(`/home/parking/${parking.id}`);
          return;
        }

        const data = snapshot.val();

        if (!data.startDate || !data.endDate) {
          toast({ title: t("error"), description: "Données manquantes", variant: "destructive" });
          return;
        }

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          toast({ title: t("error"), description: "Dates invalides", variant: "destructive" });
          return;
        }

        setStartDate(start);
        setEndDate(end);
      } catch (error) {
        console.error("Erreur réservation:", error);
        toast({ title: t("error"), description: "Erreur de chargement", variant: "destructive" });
      }
    };

    fetchReservation();
  }, [reservationId, parking.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicensePlateImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Vous devez être connecté.");

      let imageUrl = null;
      if (licensePlateImage) {
        imageUrl = await uploadLicensePlateImage(reservationId, licensePlateImage);
      }

      await update(ref(rtdb, `requests/${reservationId}`), {
        userId: user.uid,
        ...formData,
        licensePlateImageUrl: imageUrl,
        status: "confirmed",
        updatedAt: Date.now(),
      });

      await set(ref(rtdb, `reservations/${reservationId}`), {
        reservationId,
        parkingId: parking.id,
        userId: user.uid,
        ...formData,
        licensePlateImageUrl: imageUrl || null,
        status: "confirmed",
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      await update(ref(rtdb, `parkingspots/${parking.id}`), {
        isOccupied: true,
        reservedBy: user.uid,
        vehicleInfo: `${formData.carBrand} - ${formData.licensePlate}`,
        occupiedSince: Date.now(),
        reservationId,
      });

      await set(push(ref(rtdb, "parkinglogs")), {
        spotId: parking.id,
        eventType: "entry",
        timestamp: Date.now(),
        vehicleInfo: `${formData.carBrand} - ${formData.licensePlate}`,
        userId: user.uid,
      });

      toast({ title: t("reservationSuccess"), description: t("reservationConfirmed") });
      router.push(`/payment?reservationId=${reservationId}`);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!startDate || !endDate) {
    return <p className="text-center py-10">{t("loading") || "Chargement..."}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("reservationDetails")}</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("parking")}</p>
              <p className="font-medium">{parking.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("price")}</p>
              <p className="font-medium">
                {calculatePrice(startDate, endDate, parking.pricePerHour)} {t("currency")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("startDate")}</p>
              <p className="font-medium">
                {format(startDate, "PPP", { locale: language === "fr" ? fr : undefined })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("endDate")}</p>
              <p className="font-medium">
                {format(endDate, "PPP", { locale: language === "fr" ? fr : undefined })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "firstName", label: t("firstName") },
              { id: "lastName", label: t("lastName") },
              { id: "carBrand", label: t("carBrand") },
              { id: "carColor", label: t("carColor") },
              { id: "licensePlate", label: t("licensePlate") },
            ].map(({ id, label }) => (
              <div key={id} className="space-y-2">
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} name={id} value={(formData as any)[id]} onChange={handleChange} required />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="licensePlateImage">{t("licensePlateImage")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("licensePlateImage")?.click()}
                  className="w-full"
                >
                  {licensePlateImage ? <Upload className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  {licensePlateImage ? t("imageSelected") : t("takePicture")}
                </Button>
                <input
                  id="licensePlateImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {licensePlateImage && <p className="text-xs text-muted-foreground mt-1">{licensePlateImage.name}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("processing") : t("confirmReservation")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePrice(startDate: Date, endDate: Date, pricePerHour: number): number {
  const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  return hours * pricePerHour;
}