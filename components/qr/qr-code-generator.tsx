"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // ✅ VRAI QR CODE
import { toPng } from "html-to-image"; // ✅ Pour convertir en PNG

interface QRCodeGeneratorProps {
  reservationId: string;
  parkingName: string;
  startDate: Date;
  endDate: Date;
  amount: number;
}

export function QRCodeGenerator({
  reservationId,
  parkingName,
  startDate,
  endDate,
  amount,
}: QRCodeGeneratorProps) {
  const [qrCodeData, setQrCodeData] = useState("");
  const qrRef = useRef<HTMLDivElement>(null); // ✅ pour capturer

  useEffect(() => {
    const qrData = {
      reservationId,
      parkingName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount,
    };
    setQrCodeData(JSON.stringify(qrData));
  }, [reservationId, parkingName, startDate, endDate, amount]);

  const downloadQRCode = async () => {
    if (qrRef.current === null) return;

    const dataUrl = await toPng(qrRef.current);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `gari-qr-${reservationId}.png`;
    link.click();
  };

  const shareQRCode = async () => {
    if (qrRef.current === null) return;

    const dataUrl = await toPng(qrRef.current);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `gari-qr-${reservationId}.png`, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "QR Code Gari",
          text: `Ma réservation parking: ${parkingName}`,
        });
      } catch (err) {
        console.log("Partage annulé", err);
      }
    } else {
      navigator.clipboard.writeText(qrCodeData);
      alert("QR Code copié dans le presse-papier");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          Réservation confirmée
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ✅ VRAI QR Code */}
        <div className="text-center" ref={qrRef}>
          <QRCodeSVG
            value={qrCodeData}
            size={200}
            level="H"
            includeMargin
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Présentez ce QR Code à l'entrée du parking
          </p>
        </div>

        {/* Détails */}
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Parking :</span>
            <span className="font-medium">{parkingName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Arrivée :</span>
            <span className="font-medium">{startDate.toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Départ :</span>
            <span className="font-medium">{endDate.toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total :</span>
            <span className="font-bold text-green-600">{amount} DA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Réservation :</span>
            <span className="font-mono text-sm">#{reservationId.slice(-8)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadQRCode} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Télécharger Image
          </Button>
          <Button variant="outline" onClick={shareQRCode} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>

        {/* Infos */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Gardez ce QR Code accessible sur votre téléphone</p>
          <p>• Arrivez 5 minutes avant l'heure de réservation</p>
          <p>• En cas de problème, contactez le support</p>
        </div>
      </CardContent>
    </Card>
  );
}
