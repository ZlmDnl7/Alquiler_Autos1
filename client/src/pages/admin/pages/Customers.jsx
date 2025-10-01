import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { toast } from "sonner";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/getAllUsers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Filtrar SOLO usuarios normales (NO vendedores, NO administradores)
        const filteredCustomers = data.filter(
          (user) => user.isVendor === false && user.isAdmin === false
        );
        setCustomers(filteredCustomers);
      } else {
        toast.error("Error al cargar clientes");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "username",
      headerName: "Nombre de Usuario",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <img
            src={params.row.profilePicture || "https://via.placeholder.com/40"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span>{params.row.username}</span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "role",
      headerName: "Rol",
      width: 120,
      renderCell: (params) => {
        if (params.row.isAdmin) return "Administrador";
        if (params.row.isVendor) return "Vendedor";
        return "Cliente";
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha de Registro",
      width: 200,
      renderCell: (params) => {
        return new Date(params.row.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 120,
      renderCell: (params) => (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          Activo
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <p className="text-gray-600">Total: {customers.length} usuarios</p>
      </div>

      <div className="h-[600px] w-full">
        <DataGrid
          rows={customers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          className="bg-white"
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  );
};

export default Customers;