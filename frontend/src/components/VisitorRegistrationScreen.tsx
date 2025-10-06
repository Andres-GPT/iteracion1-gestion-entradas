import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserCheck, CheckCircle } from "lucide-react";

export function VisitorRegistrationScreen() {
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    email: "",
    phone: ""
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    // Validate fields
    if (!formData.name || !formData.nationalId || !formData.email || !formData.phone) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    // Simulate registration
    const registrationInfo = {
      ...formData,
      visitId: `VIS${Date.now()}`,
      entryTime: new Date().toLocaleString(),
      status: "Active"
    };
    setRegistrationData(registrationInfo);
    setIsRegistered(true);
    toast.success("¡Entrada registrada exitosamente!");
  };

  const handleNewRegistration = () => {
    setFormData({ name: "", nationalId: "", email: "", phone: "" });
    setIsRegistered(false);
    setRegistrationData(null);
  };

  if (isRegistered && registrationData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-green-50">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-800">¡Registro Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Información del Visitante</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID de Visita</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).visitId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora de Entrada</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).entryTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cédula</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).nationalId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold text-gray-900">{(registrationData as any).phone}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Por favor conserve su ID de visita como referencia. Se le puede solicitar proporcionarlo durante su visita.
              </p>
              <Button 
                onClick={handleNewRegistration}
                className="bg-[#b71c1c] hover:bg-[#8f1616] text-lg px-8 py-3"
              >
                Registrar Otro Visitante
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-blue-50">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-blue-800">Registro de Visitante</CardTitle>
          <p className="text-gray-600 mt-2">Por favor proporcione su información para registrar su entrada</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="visitorName" className="text-lg">Nombre Completo *</Label>
              <Input
                id="visitorName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="text-lg p-4 h-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorNationalId" className="text-lg">Cédula *</Label>
              <Input
                id="visitorNationalId"
                value={formData.nationalId}
                onChange={(e) => handleInputChange("nationalId", e.target.value)}
                placeholder="Ingrese su número de cédula"
                className="text-lg p-4 h-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorEmail" className="text-lg">Dirección de Email *</Label>
              <Input
                id="visitorEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Ingrese su dirección de email"
                className="text-lg p-4 h-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorPhone" className="text-lg">Número de Teléfono *</Label>
              <Input
                id="visitorPhone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Ingrese su número de teléfono"
                className="text-lg p-4 h-14"
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={!formData.name || !formData.nationalId || !formData.email || !formData.phone}
              className="w-full bg-[#b71c1c] hover:bg-[#8f1616] text-xl py-6 mt-8"
            >
              Registrar Entrada
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Todos los campos marcados con * son obligatorios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}