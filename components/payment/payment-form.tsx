"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard, Calendar, Lock, CheckCircle,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { auth, rtdb } from "@/lib/firebase/config";

export function PaymentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "cvv") {
      const cvv = value.replace(/\D/g, "").slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: cvv }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const { cardNumber, cardName, expiryMonth, expiryYear, cvv } = formData;

    if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs du formulaire.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "demo-user";

      const paymentsRef = ref(rtdb, `payments/${userId}`);
      const newPaymentRef = push(paymentsRef);

      await set(newPaymentRef, {
        amount: 1000,
        cardName,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        status: "simulated",
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      toast({
        title: "Paiement enregistré",
        description: "Les informations de paiement ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error("Erreur paiement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return <SelectItem key={month} value={month}>{month}</SelectItem>;
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = (currentYear + i).toString();
    return <SelectItem key={year} value={year}>{year}</SelectItem>;
  });

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold">Paiement simulé</h3>
            <p className="mb-6 text-muted-foreground">
              Les données ont été enregistrées dans la base de données.
            </p>
            <Button className="w-full md:w-auto" onClick={() => setIsSuccess(false)}>
              Nouveau paiement
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement (Démo)
        </CardTitle>
        <CardDescription>
          Remplissez le formulaire pour générer une entrée dans Realtime Database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Numéro de carte</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="4242 4242 4242 4242"
              value={formData.cardNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Nom sur la carte</Label>
            <Input
              id="cardName"
              name="cardName"
              placeholder="NOM COMPLET"
              value={formData.cardName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Date d'expiration</Label>
              <div className="flex gap-2">
                <Select value={formData.expiryMonth} onValueChange={(value) => handleSelectChange("expiryMonth", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>{months}</SelectContent>
                </Select>
                <Select value={formData.expiryYear} onValueChange={(value) => handleSelectChange("expiryYear", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>{years}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Simuler le paiement"}
        </Button>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Lock className="mr-1 h-3 w-3" />
          Simulation uniquement – données non envoyées à une vraie passerelle de paiement.
        </div>
      </CardFooter>
    </Card>
  );
}
