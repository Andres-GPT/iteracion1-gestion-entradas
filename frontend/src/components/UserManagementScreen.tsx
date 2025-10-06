"use client";
import { useEffect, useState } from "react";
import { useUsuarios } from "../contexts/UsuariosContext";
import { usePagination } from "../hooks/usePagination";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { TablePagination } from "./ui/table-pagination";
import { Search, Plus, Edit, Eye, UserX, UserCheck, Upload } from "lucide-react";
import { importProfesores, importEstudiantes } from "../services/usuarioService";

const roleMap: Record<number, { name: string; style: string }> = {
  1: { name: "D. Programa", style: "bg-gray-100 text-black-800" },
  2: { name: "D. Departamento", style: "bg-gray-100 text-black-800" },
  3: { name: "Profesor", style: "bg-green-100 text-green-800" },
  4: { name: "Amigo Académico", style: "bg-purple-100 text-purple-800" },
  5: { name: "Estudiante", style: "bg-blue-100 text-blue-800" },
  6: { name: "Visitante", style: "bg-yellow-100 text-yellow-800" },
  7: { name: "Vigilante", style: "bg-red-100 text-red-800" },
};

export function UserManagementScreen() {
  const {
    usuarios: allUsuarios,
    loading,
    fetchUsuarios,
    createUsuario: createUser,
    updateUsuario: updateUser,
    deleteUsuario: deleteUser,
  } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Estados para importación
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<"profesor" | "estudiante">("estudiante");
  const [isImporting, setIsImporting] = useState(false);

  // Estado para confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [newUser, setNewUser] = useState({
    nombre: "",
    codigo: "",
    cedula: "",
    correo: "",
    telefono: "",
    id_rol: 5,
    password_hash: "",
  });

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Filtrar usuarios según estado (activo/inactivo)
  const usuarios = allUsuarios.filter((u: any) =>
    mostrarInactivos ? u.estado === "inactivo" : u.estado === "activo"
  );

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      toast.success("Usuario creado exitosamente");
      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear usuario");
      console.error("Error creando usuario:", error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(newUser.cedula, newUser);
      toast.success("Usuario actualizado exitosamente");
      setShowDialog(false);
      setIsEditing(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar usuario");
      console.error("Error actualizando usuario:", error);
    }
  };

  const handleDeleteUser = (cedula: string) => {
    setConfirmDialog({
      open: true,
      title: mostrarInactivos ? "Activar Usuario" : "Desactivar Usuario",
      description: `¿Estás seguro de que deseas ${
        mostrarInactivos ? "activar" : "desactivar"
      } este usuario?`,
      onConfirm: async () => {
        try {
          await deleteUser(cedula);
          toast.success(
            mostrarInactivos
              ? "Usuario activado exitosamente"
              : "Usuario desactivado exitosamente"
          );
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Error al procesar la solicitud");
          console.error("Error:", error);
        }
      },
    });
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsImporting(true);
    const loadingToast = toast.loading("Importando usuarios...");

    try {
      const response =
        importType === "profesor"
          ? await importProfesores(importFile)
          : await importEstudiantes(importFile);

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(response.data.message);

        // Mostrar detalles si hay errores
        if (response.data.data.errores > 0) {
          toast.error(
            `Se encontraron ${response.data.data.errores} errores durante la importación`,
            { duration: 5000 }
          );
        }

        setShowImportDialog(false);
        setImportFile(null);
        fetchUsuarios();
      } else {
        toast.error(response.data.message || "Error al importar usuarios");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(
        error.response?.data?.message || "Error al importar archivo"
      );
      console.error("Error importando:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleEdit = (user: any) => {
    setNewUser({ ...user, password_hash: "" });
    setIsEditing(true);
    setIsViewing(false);
    setShowDialog(true);
  };

  const handleView = (user: any) => {
    setNewUser({ ...user });
    setIsViewing(true);
    setIsEditing(false);
    setShowDialog(true);
  };

  const resetForm = () => {
    setNewUser({
      nombre: "",
      codigo: "",
      cedula: "",
      correo: "",
      telefono: "",
      id_rol: 5,
      password_hash: "",
    });
  };

  const filteredUsers = usuarios.filter((user) => {
    const nombre = String(user.nombre ?? "").toLowerCase();
    const codigo = String(user.codigo ?? "").toLowerCase();
    const cedula = String(user.cedula ?? "").toLowerCase();

    const matchesSearch =
      nombre.includes(searchTerm.toLowerCase()) ||
      codigo.includes(searchTerm.toLowerCase()) ||
      cedula.includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || String(user.id_rol) === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Aplicar paginación a los usuarios filtrados
  const {
    currentPage,
    itemsPerPage,
    paginatedData: paginatedUsers,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredUsers, { initialItemsPerPage: 10 });

  const getRoleBadge = (roleId: number) => {
    const role = roleMap[roleId];
    if (!role)
      return (
        <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
      );
    return <Badge className={role.style}>{role.name}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, código o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Roles</SelectItem>
                  {Object.entries(roleMap).map(([id, role]) => (
                    <SelectItem key={id} value={id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Usuarios
              </Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#b71c1c] hover:bg-[#8f1616]"
                    onClick={() => {
                      resetForm();
                      setIsEditing(false);
                      setIsViewing(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                {/* Modal */}
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {isViewing
                        ? "Detalle Usuario"
                        : isEditing
                        ? "Editar Usuario"
                        : "Agregar Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription>
                      {isViewing
                        ? "Información del usuario (solo lectura)."
                        : isEditing
                        ? "Modifica la información del usuario."
                        : "Crea una nueva cuenta de usuario con la información a continuación."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre Completo</Label>
                      <Input
                        value={newUser.nombre}
                        disabled={isViewing}
                        onChange={(e) =>
                          setNewUser({ ...newUser, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Código</Label>
                      <Input
                        value={newUser.codigo}
                        disabled={isViewing}
                        onChange={(e) =>
                          setNewUser({ ...newUser, codigo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Cédula</Label>
                      <Input
                        value={newUser.cedula}
                        disabled={isEditing || isViewing}
                        onChange={(e) =>
                          setNewUser({ ...newUser, cedula: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={newUser.correo}
                        disabled={isViewing}
                        onChange={(e) =>
                          setNewUser({ ...newUser, correo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={newUser.telefono}
                        disabled={isViewing}
                        onChange={(e) =>
                          setNewUser({ ...newUser, telefono: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Rol</Label>
                      <Select
                        value={String(newUser.id_rol)}
                        disabled={isViewing}
                        onValueChange={(val: string) =>
                          setNewUser({ ...newUser, id_rol: Number(val) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleMap).map(([id, role]) => (
                            <SelectItem key={id} value={id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isEditing && (
                      <div>
                        <Label>Nueva Contraseña</Label>
                        <Input
                          type="password"
                          value={newUser.password_hash}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              password_hash: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      {isViewing ? (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowDialog(false)}
                        >
                          Cerrar
                        </Button>
                      ) : (
                        <>
                          <Button
                            className="flex-1 bg-[#b71c1c] hover:bg-[#8f1616]"
                            onClick={
                              isEditing ? handleUpdateUser : handleCreateUser
                            }
                          >
                            {isEditing ? "Actualizar Usuario" : "Crear Usuario"}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowDialog(false)}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Botón alternar activos/inactivos */}
              <Button
                variant="outline"
                onClick={() => setMostrarInactivos(!mostrarInactivos)}
              >
                {mostrarInactivos
                  ? "Mostrar Activos"
                  : "Mostrar Inactivos"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.cedula}>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.codigo}</TableCell>
                  <TableCell>{user.cedula}</TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>{user.telefono}</TableCell>
                  <TableCell>{getRoleBadge(user.id_rol)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!mostrarInactivos ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-100"
                          onClick={() => handleDeleteUser(user.cedula)}
                          title="Desactivar usuario"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-100"
                          onClick={() => handleDeleteUser(user.cedula)}
                          title="Activar usuario"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal de Importación */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Usuarios desde Excel</DialogTitle>
            <DialogDescription>
              Sube un archivo .xlsx con la estructura correcta según el tipo de usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Archivo Excel</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                disabled={isImporting}
              />
              {importFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Archivo seleccionado: {importFile.name}
                </p>
              )}
            </div>

            <div>
              <Label>Tipo de Usuario</Label>
              <RadioGroup
                value={importType}
                onValueChange={(value) =>
                  setImportType(value as "profesor" | "estudiante")
                }
                disabled={isImporting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="estudiante" id="estudiante" />
                  <Label htmlFor="estudiante">Estudiantes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="profesor" id="profesor" />
                  <Label htmlFor="profesor">Profesores</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Estructura esperada:
              </p>
              {importType === "profesor" ? (
                <ul className="text-xs text-blue-700 list-disc list-inside">
                  <li>Código Docente</li>
                  <li>Nombre Docente</li>
                  <li>Documento (cédula)</li>
                  <li>Correo Institucional</li>
                  <li>Celular</li>
                </ul>
              ) : (
                <ul className="text-xs text-blue-700 list-disc list-inside">
                  <li>Codigo Alumno</li>
                  <li>Nombre Alumno</li>
                  <li>Documento (cédula)</li>
                  <li>Email Institucional</li>
                  <li>Celular</li>
                </ul>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportFile(null);
                }}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !importFile}>
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="destructive"
      />
    </div>
  );
}
