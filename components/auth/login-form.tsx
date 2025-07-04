"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import Link from "next/link"

// ✅ IMPORT Realtime Database
import { ref, push, set } from "firebase/database"
import { auth, rtdb } from "@/lib/firebase/config" // ✅ rtdb بدل db!
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // ✅ Log dans Realtime Database
      const logRef = push(ref(rtdb, "adminNotifications"))
      await set(logRef, {
        type: "login",
        userEmail: data.email,
        userId: user.uid,
        timestamp: Date.now(),
        message: `Nouvelle connexion de ${data.email}`,
      })

      sonnerToast.success(t("loginSuccess"))
      router.push("/home")
    } catch (error: any) {
      handleAuthError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (error: any) => {
    let errorMessage = t("invalidCredentials")
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = t("userNotFound")
        break
      case "auth/wrong-password":
        errorMessage = t("wrongPassword")
        break
      case "auth/invalid-email":
        errorMessage = t("invalidEmail")
        break
      case "auth/user-disabled":
        errorMessage = t("userDisabled")
        break
      default:
        errorMessage = t("loginError")
    }
    sonnerToast.error(errorMessage)
  }

  const handleDemoLogin = async () => {
    const email = "demo@gari.com"
    const password = "demo123456"
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      sonnerToast.success(t("loginSuccess"))
      router.push("/home")
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const user = userCredential.user

          // ✅ إنشاء الحساب في RTDB
          const userRef = ref(rtdb, `users/${user.uid}`)
          await set(userRef, {
            firstName: "Utilisateur",
            lastName: "Démo",
            email,
            role: "client",
            createdAt: Date.now(),
          })

          sonnerToast.success(t("demoAccountCreated"))
          router.push("/home")
        } catch (createError) {
          sonnerToast.error(t("errorCreatingDemoAccount"))
        }
      } else {
        handleAuthError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-12 rounded-2xl shadow-lg border border-slate-700 bg-slate-900">
      <CardHeader>
        <CardTitle className="text-center text-white text-3xl font-bold tracking-tight">Gari</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-slate-800 border-slate-600 text-white pl-10"
                placeholder="votre@email.com"
              />
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
            {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="bg-slate-800 border-slate-600 text-white pl-10 pr-10"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 text-slate-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t("loggingIn")}
              </>
            ) : (
              t("login")
            )}
          </Button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative inline-block bg-slate-900 px-4 text-xs text-slate-400 uppercase">
              {t("or")}
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
            {t("demoLogin")}
          </Button>

          <div className="text-center text-sm mt-4">
            {t("noAccount")} {" "}
            <Link href="/auth/register" className="text-blue-400 hover:underline">
              {t("createAccount")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
