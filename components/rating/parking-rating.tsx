"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ref, push, set } from "firebase/database"
import { rtdb } from "@/lib/firebase/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Send, ThumbsUp } from "lucide-react"

interface ParkingRatingProps {
  parkingId: string
  parkingName: string
}

export function ParkingRating({ parkingId, parkingName }: ParkingRatingProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez donner une note avant de soumettre",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour évaluer",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const ratingRef = push(ref(rtdb, `ratings/${parkingId}`))
      await set(ratingRef, {
        uid: user.uid,
        email: user.email,
        comment,
        rating,
        timestamp: Date.now(),
      })

      toast({
        title: "Merci pour votre avis !",
        description: "Votre évaluation a été enregistrée avec succès.",
      })

      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre avis.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return "Très insatisfait"
      case 2: return "Insatisfait"
      case 3: return "Correct"
      case 4: return "Satisfait"
      case 5: return "Excellent"
      default: return "Donnez votre avis"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ThumbsUp className="h-5 w-5 text-blue-500" />
          Évaluez votre expérience
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{parkingName}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Étoiles */}
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getRatingText(hoveredRating || rating)}
          </p>
        </div>

        {/* Commentaire */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire (optionnel)</label>
          <Textarea
            placeholder="Partagez votre expérience avec ce parking..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right">{comment.length}/500</p>
        </div>

        {/* Critères rapides */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Évaluez rapidement :</p>
          <div className="grid grid-cols-2 gap-2">
            {["Sécurité", "Propreté", "Accessibilité", "Prix"].map((criteria) => (
              <Button
                key={criteria}
                variant="outline"
                size="sm"
                onClick={() => setComment((prev) => prev + (prev ? ", " : "") + criteria + " ✓")}
                className="text-xs"
              >
                {criteria}
              </Button>
            ))}
          </div>
        </div>

        {/* Bouton d'envoi */}
        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
          {isSubmitting ? (
            "Envoi en cours..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer l'évaluation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
