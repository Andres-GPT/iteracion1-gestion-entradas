import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { verifyResetToken, resetPassword } from "../services/authService";
import toast from "react-hot-toast";

interface ResetPasswordScreenProps {
  token: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function ResetPasswordScreen({ token, onSuccess, onBackToLogin }: ResetPasswordScreenProps) {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{ nombre: string; correo: string } | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await verifyResetToken(token);

        if (response.data.success && response.data.valid) {
          setTokenValid(true);
          setUserInfo(response.data.usuario);
        } else {
          setTokenValid(false);
          toast.error("El enlace de recuperación es inválido o ha expirado");
        }
      } catch (error: any) {
        setTokenValid(false);
        const errorMessage = error.response?.data?.message || "El enlace de recuperación es inválido";
        toast.error(errorMessage);
      }
    };

    checkToken();
  }, [token]);

  const getPasswordStrength = (password: string): { strength: string; color: string; label: string } => {
    if (password.length === 0) return { strength: "0%", color: "bg-gray-200", label: "" };
    if (password.length < 6) return { strength: "33%", color: "bg-red-500", label: "Débil" };
    if (password.length < 10) return { strength: "66%", color: "bg-yellow-500", label: "Media" };
    return { strength: "100%", color: "bg-green-500", label: "Fuerte" };
  };

  const passwordStrength = getPasswordStrength(nuevaPassword);
  const passwordsMatch = nuevaPassword === confirmarPassword && confirmarPassword.length > 0;
  const passwordsDontMatch = nuevaPassword !== confirmarPassword && confirmarPassword.length > 0;

  const handleResetPassword = async () => {
    if (!nuevaPassword.trim()) {
      toast.error("Por favor ingresa una nueva contraseña");
      return;
    }

    if (nuevaPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Actualizando contraseña...");

    try {
      const response = await resetPassword(token, nuevaPassword);
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Contraseña actualizada exitosamente. Redirigiendo al login...");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || "Error al actualizar la contraseña";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#b71c1c] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Verificando enlace de recuperación...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl text-gray-900 font-bold">Enlace Inválido</h1>
            <p className="text-gray-600 mt-2">
              El enlace de recuperación es inválido o ha expirado.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                <AlertDescription className="text-yellow-800">
                  Por favor, solicita un nuevo enlace de recuperación de contraseña.
                </AlertDescription>
              </Alert>

              <Button
                onClick={onBackToLogin}
                className="w-full bg-[#b71c1c] hover:bg-[#8f1616]"
              >
                Volver al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl text-gray-900 font-bold">Nueva Contraseña</h1>
          {userInfo && (
            <p className="text-gray-600 mt-2">
              Hola, <strong>{userInfo.nombre}</strong>
            </p>
          )}
        </div>

        {/* Reset Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-center text-gray-900">Ingresa tu nueva contraseña</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="nuevaPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="nuevaPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full pr-10"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {nuevaPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: passwordStrength.strength }}
                    ></div>
                  </div>
                  {passwordStrength.label && (
                    <p className={`text-xs ${
                      passwordStrength.label === "Débil" ? "text-red-600" :
                      passwordStrength.label === "Media" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      Fortaleza: {passwordStrength.label}
                    </p>
                  )}
                </div>
              )}

              {nuevaPassword.length > 0 && nuevaPassword.length < 6 && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmarPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full pr-10"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleResetPassword();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Las contraseñas coinciden
                </p>
              )}

              {passwordsDontMatch && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <Button
              onClick={handleResetPassword}
              className="w-full bg-[#b71c1c] hover:bg-[#8f1616]"
              disabled={isLoading || nuevaPassword.length < 6 || !passwordsMatch}
            >
              {isLoading ? "Actualizando..." : "Restablecer Contraseña"}
            </Button>

            <Button
              variant="outline"
              onClick={onBackToLogin}
              className="w-full"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
