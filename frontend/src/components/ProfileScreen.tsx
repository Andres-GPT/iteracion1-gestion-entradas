import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { User, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUsuarios } from "../contexts/UsuariosContext";
import toast from "react-hot-toast";

export function ProfileScreen() {
  const { user } = useAuth();
  const { updateUsuario } = useUsuarios();

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Actualizando contraseña...");

    try {
      // Actualizar solo la contraseña usando el updateUsuario del context
      await updateUsuario(user.cedula.toString(), {
        password: passwordData.newPassword
      });

      toast.dismiss(loadingToast);
      toast.success("Contraseña actualizada exitosamente");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || "Error al cambiar la contraseña";
      toast.error(errorMessage);
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay información de usuario disponible</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <CardTitle>Información de Perfil</CardTitle>
              <p className="text-gray-600">Los detalles de tu cuenta</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="profileName">Nombre Completo</Label>
              <Input
                id="profileName"
                value={user.nombre}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">El nombre no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileEmail">Dirección de Email</Label>
              <Input
                id="profileEmail"
                type="email"
                value={user.correo}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">El email no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhone">Número de Teléfono</Label>
              <Input
                id="profilePhone"
                value={user.telefono || "No especificado"}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Contacta al administrador para actualizar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileRole">Rol</Label>
              <Input
                id="profileRole"
                value={user.rol}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Tu rol en el sistema</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileCedula">Cédula</Label>
              <Input
                id="profileCedula"
                value={user.cedula}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Identificación nacional</p>
            </div>

            {user.codigo && (
              <div className="space-y-2">
                <Label htmlFor="profileCode">Código</Label>
                <Input
                  id="profileCode"
                  value={user.codigo}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Código de estudiante</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <p className="text-gray-600">Actualiza la contraseña de tu cuenta</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                placeholder="Ingrese su nueva contraseña"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                placeholder="Confirme su nueva contraseña"
                disabled={loading}
              />
              {passwordData.newPassword && passwordData.confirmPassword &&
               passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSavePassword}
              disabled={
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword !== passwordData.confirmPassword ||
                loading
              }
              className="bg-[#b71c1c] hover:bg-[#8f1616]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
