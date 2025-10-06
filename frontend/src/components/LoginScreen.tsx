import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface LoginScreenProps {
  onLoginSuccess: (role: string) => void;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLoginSuccess, onForgotPassword }: LoginScreenProps) {
  const { login, error, loading, clearError } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  // Mostrar error con toast cuando cambie
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!correo || !password) {
      return;
    }

    try {
      await login(correo, password);
      // El login exitoso se maneja en el AuthContext
      // y App.tsx detectará el cambio de autenticación
      onLoginSuccess(""); // El rol se obtiene del context
    } catch (err) {
      // El error ya está manejado en el context
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[#b71c1c] rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <CardTitle className="text-2xl">Sistema Universitario</CardTitle>
          <p className="text-gray-600">Sistema de Gestión</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#b71c1c] hover:bg-[#9a1818]"
              disabled={!correo || !password || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <Separator className="my-4" />

          <div className="text-center">
            <button
              onClick={onForgotPassword}
              className="text-gray-600 hover:text-[#b71c1c] text-sm"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            © 2024 Sistema de Gestión Universitaria v1.0
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
