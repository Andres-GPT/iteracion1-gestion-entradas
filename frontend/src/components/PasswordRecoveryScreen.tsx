import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft } from "lucide-react";
import { forgotPassword } from "../services/authService";
import toast from "react-hot-toast";

interface PasswordRecoveryScreenProps {
  onBackToLogin: () => void;
}

export function PasswordRecoveryScreen({ onBackToLogin }: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRecovery = async () => {
    if (!email.trim()) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Enviando correo de recuperación...");

    try {
      const response = await forgotPassword(email);
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Correo enviado exitosamente");
        setEmailSent(true);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || "Error al enviar el correo";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <button
          onClick={onBackToLogin}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Login
        </button>

        {/* University Logo */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
          <h1 className="text-2xl text-gray-900">Recuperación de Contraseña</h1>
        </div>

        {/* Recovery Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-center text-gray-900">Restablecer tu Contraseña</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {!emailSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Dirección de Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu dirección de email"
                    className="w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendRecovery();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSendRecovery}
                  className="w-full bg-[#b71c1c] hover:bg-[#8f1616]"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                </Button>
              </>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ✅ Revisa tu email para continuar. Te hemos enviado un enlace para restablecer tu contraseña.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}