import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Plus, Edit, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { ConfirmModal } from "./ui/confirm-modal";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useSalones } from "../contexts/SalonesContext";
import { usePagination } from "../hooks/usePagination";
import { TablePagination } from "./ui/table-pagination";

interface Salon {
  id_salon: number;
  codigo: string;
  nombre: string | null;
  capacidad: number | null;
  estado: "activo" | "inactivo";
}

export function ClassroomManagementScreen() {
  const {
    salones: classrooms,
    loading,
    error,
    fetchSalones,
    createSalon,
    updateSalon,
    toggleSalonEstado,
  } = useSalones();

  const [showNewClassroomDialog, setShowNewClassroomDialog] = useState(false);
  const [showEditClassroomDialog, setShowEditClassroomDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [classroomToToggle, setClassroomToToggle] = useState<Salon | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    capacidad: "",
  });

  const [editingClassroom, setEditingClassroom] = useState<Salon | null>(null);

  // Cargar salones al montar el componente
  useEffect(() => {
    fetchSalones();
  }, [fetchSalones]);

  // Mostrar errores con toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateClassroom = async () => {
    if (!formData.codigo.trim()) {
      toast.error("El código del aula es requerido");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Creando aula...");

    try {
      await createSalon({
        codigo: formData.codigo,
        nombre: formData.nombre || null,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
      });

      toast.dismiss(loadingToast);
      toast.success("Aula creada exitosamente");

      // Limpiar formulario y cerrar diálogo
      setFormData({ codigo: "", nombre: "", capacidad: "" });
      setShowNewClassroomDialog(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al crear el aula";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClassroom = async () => {
    if (!editingClassroom) return;

    if (!formData.codigo.trim()) {
      toast.error("El código del aula es requerido");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Actualizando aula...");

    try {
      await updateSalon(editingClassroom.id_salon, {
        codigo: formData.codigo,
        nombre: formData.nombre || null,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
      });

      toast.dismiss(loadingToast);
      toast.success("Aula actualizada exitosamente");

      // Limpiar formulario y cerrar diálogo
      setFormData({ codigo: "", nombre: "", capacidad: "" });
      setEditingClassroom(null);
      setShowEditClassroomDialog(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al actualizar el aula";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openToggleConfirm = (classroom: Salon) => {
    setClassroomToToggle(classroom);
    setConfirmToggleOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!classroomToToggle) return;

    const loadingToast = toast.loading(
      `${classroomToToggle.estado === "activo" ? "Desactivando" : "Activando"} aula...`
    );

    try {
      await toggleSalonEstado(classroomToToggle.id_salon);

      toast.dismiss(loadingToast);
      toast.success(
        `Aula ${classroomToToggle.estado === "activo" ? "desactivada" : "activada"} exitosamente`
      );

      setConfirmToggleOpen(false);
      setClassroomToToggle(null);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al cambiar el estado del aula";
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (classroom: Salon) => {
    setEditingClassroom(classroom);
    setFormData({
      codigo: classroom.codigo,
      nombre: classroom.nombre || "",
      capacidad: classroom.capacidad?.toString() || "",
    });
    setShowEditClassroomDialog(true);
  };

  const getStatusBadge = (status: "activo" | "inactivo") => {
    return (
      <Badge className={status === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {status === "activo" ? "Activo" : "Inactivo"}
      </Badge>
    );
  };

  // Aplicar paginación a los salones
  const {
    currentPage,
    itemsPerPage,
    paginatedData: paginatedClassrooms,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(classrooms, { initialItemsPerPage: 10 });

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando aulas..." fullScreen />;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Aulas</CardTitle>
            <Dialog open={showNewClassroomDialog} onOpenChange={setShowNewClassroomDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#b71c1c] hover:bg-[#8f1616]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Aula</DialogTitle>
                  <DialogDescription>
                    Crear una nueva aula con los detalles a continuación.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="classroomCode">Código de Aula *</Label>
                    <Input
                      id="classroomCode"
                      placeholder="ej., F-601"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classroomName">Nombre de Aula</Label>
                    <Input
                      id="classroomName"
                      placeholder="ej., Laboratorio de Biología"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classroomCapacity">Capacidad</Label>
                    <Input
                      id="classroomCapacity"
                      type="number"
                      placeholder="ej., 30"
                      value={formData.capacidad}
                      onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-[#b71c1c] hover:bg-[#8f1616]"
                      onClick={handleCreateClassroom}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Aula"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowNewClassroomDialog(false);
                        setFormData({ codigo: "", nombre: "", capacidad: "" });
                      }}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditClassroomDialog} onOpenChange={setShowEditClassroomDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription>
              Modificar los detalles del aula.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editClassroomCode">Código de Aula *</Label>
              <Input
                id="editClassroomCode"
                placeholder="ej., F-601"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClassroomName">Nombre de Aula</Label>
              <Input
                id="editClassroomName"
                placeholder="ej., Laboratorio de Biología"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClassroomCapacity">Capacidad</Label>
              <Input
                id="editClassroomCapacity"
                type="number"
                placeholder="ej., 30"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1 bg-[#b71c1c] hover:bg-[#8f1616]"
                onClick={handleEditClassroom}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditClassroomDialog(false);
                  setEditingClassroom(null);
                  setFormData({ codigo: "", nombre: "", capacidad: "" });
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Classrooms Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No hay salones registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClassrooms.map((classroom) => (
                  <TableRow key={classroom.id_salon}>
                    <TableCell className="font-medium">{classroom.codigo}</TableCell>
                    <TableCell>{classroom.nombre || "-"}</TableCell>
                    <TableCell>
                      {classroom.capacidad ? `${classroom.capacidad} estudiantes` : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(classroom.estado)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(classroom)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openToggleConfirm(classroom)}
                        >
                          {classroom.estado === "activo" ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      <TablePagination
        currentPage={currentPage}
        totalItems={classrooms.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Aulas</p>
                <p className="text-2xl font-bold text-gray-900">{classrooms.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aulas Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {classrooms.filter(c => c.estado === "activo").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Capacidad Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {classrooms.reduce((sum, c) => sum + (c.capacidad || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal for Toggle Status */}
      <ConfirmModal
        isOpen={confirmToggleOpen}
        onClose={() => {
          setConfirmToggleOpen(false);
          setClassroomToToggle(null);
        }}
        onConfirm={handleToggleStatus}
        title={
          classroomToToggle?.estado === "activo"
            ? "Desactivar Aula"
            : "Activar Aula"
        }
        message={
          classroomToToggle?.estado === "activo"
            ? `¿Estás seguro de que deseas desactivar el aula ${classroomToToggle?.codigo}?`
            : `¿Estás seguro de que deseas activar el aula ${classroomToToggle?.codigo}?`
        }
        confirmText={classroomToToggle?.estado === "activo" ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        confirmVariant={classroomToToggle?.estado === "activo" ? "destructive" : "default"}
      />
    </div>
  );
}
