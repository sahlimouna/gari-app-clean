"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Payment } from "@/types/payment"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CreditCard, Download, CheckCircle, Clock, XCircle, Receipt } from "lucide-react"

interface PaymentHistoryProps {
  payments: Payment[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const { t, language } = useLanguage()

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
      case "simulated": // ✅ gérer le statut simulé !
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          label: t("paid") || "Payé",
        }
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          label: t("pending") || "En attente",
        }
      case "failed":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          label: t("failed") || "Échoué",
        }
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          label: status,
        }
    }
  }

  // Calculs sécurisés même si amount ou date sont manquants
  const totalAmount = payments
    .filter((p) => p.status === "completed" || p.status === "simulated")
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const completedPayments = payments.filter((p) => p.status === "completed" || p.status === "simulated").length
  const pendingPayments = payments.filter((p) => p.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPaid") || "Total payé"}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toFixed(0)} DA</div>
            <p className="text-xs text-muted-foreground">Dinars Algériens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("completedPayments") || "Paiements réussis"}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">Transactions terminées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pending") || "En attente"}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>
      </div>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t("paymentHistory") || "Historique des paiements"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("noPayments") || "Aucun paiement effectué"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status || "pending")
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                        <div className={statusInfo.color}>{statusInfo.icon}</div>
                      </div>
                      <div>
                        <h3 className="font-medium">{payment.parkingName || t("noParkingName")}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {payment.date?.toDate
                              ? format(payment.date.toDate(), "PPP", { locale: language === "fr" ? fr : undefined })
                              : t("noDate") || "-"}
                          </span>
                          <span>•</span>
                          <span>{payment.paymentMethod || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-lg">{(payment.amount || 0).toFixed(0)} DA</p>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {payment.receiptUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(payment.receiptUrl, "_blank")}>
                          <Download className="h-4 w-4 mr-1" />
                          {t("receipt") || "Reçu"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
