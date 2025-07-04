"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { PaymentHistory } from "./payment-history";
import { PaymentForm } from "./payment-form";
import { auth } from "@/lib/firebase/config";
import { getUserPayments } from "@/lib/firebase/realtime"; // تأكد أن هذا للـ RTDB!
import type { Payment } from "@/types/payment";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PaymentContainer() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        loadPayments(user.uid);
      } else {
        // ✅ إذا لم يكن مسجل --> بيانات demo فقط
        loadPayments("demo-user");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadPayments = async (uid: string) => {
    try {
      const paymentsData = await getUserPayments(uid);
      setPayments(paymentsData);
    } catch (error) {
      console.error("❌ Erreur chargement paiements:", error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Header title="Paiements" />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Header title="Paiements" />

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="card">Carte de paiement</TabsTrigger>
          <TabsTrigger value="about">À propos</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <PaymentHistory payments={payments} />
        </TabsContent>

        <TabsContent value="card">
          {/* ✅ تمرير الـ userId الحقيقي إلى PaymentForm */}
          <PaymentForm userId={userId} />
        </TabsContent>

        <TabsContent value="about">
          <AboutSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ✅ قسم معلومات التطبيق — منظم أكثر
function AboutSection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">À propos de Gari</h2>
        <p className="text-muted-foreground mb-6">
          Application de réservation de parking pour la ville d'Annaba.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Version" value="1.0.0" />
        <InfoCard title="Développeur" value="Équipe Gari Annaba" />
        <InfoCard title="Contact" value="support@gari-annaba.dz" />
        <InfoCard title="Ville" value="Annaba, Algérie" />
      </div>

      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Fonctionnalités</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Réservation de places de parking en temps réel</li>
          <li>• Paiement sécurisé avec CIB et EDAHABIA</li>
          <li>• Notifications push pour vos réservations</li>
          <li>• Interface multilingue (Français/Arabe)</li>
          <li>• Géolocalisation des parkings</li>
          <li>• Historique des paiements</li>
        </ul>
      </div>
    </div>
  );
}

// ✅ مكون صغير لبطاقة المعلومات
function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
