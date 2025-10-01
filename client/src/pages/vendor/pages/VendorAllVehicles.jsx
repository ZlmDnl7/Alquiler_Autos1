import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import toast, { Toaster } from "react-hot-toast";

import Box from "@mui/material/Box";
import {
  setVendorDeleteSuccess,
  setVendorEditSuccess,
  setVendorError,
  setVenodrVehilces,
} from "../../../redux/vendor/vendorDashboardSlice";

import { GrStatusGood } from "react-icons/gr";
import { MdOutlinePending } from "react-icons/md";
import VendorHeader from "../Components/VendorHeader";
import VendorAddProductModal from "../Components/VendorAddVehilceModal";

const VendorAllVehicles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAddModal, setShowAddModal] = useState(false);

  const { vendorVehilces, vendorEditSuccess,vendorDeleteSuccess, vendorErrorSuccess } = useSelector(
    (state) => state.vendorDashboardSlice
  );
  const { _id } = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/vendor/showVendorVehilces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id,
          }),
        });
        if (!res.ok) {
          console.log("not success");
          return;
        }
        const data = await res.json();
        dispatch(setVenodrVehilces(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [_id, dispatch]);

  //edit vehicles
  const handleEditVehicle = (vehicle_id) => {
    navigate(`/vendorDashboard/vendorEditProductComponent?vehicle_id=${vehicle_id}`);
  };

  //delete vehicles modal
  const handleDeleteVehicles = (vehicle_id) => {
    navigate(`/vendorDashboard/vendorDeleteVehicleModal?vehicle_id=${vehicle_id}`);
  }

  //add vehicle
  const handleAddVehicle = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const columns = [
    {
      field: "image",
      headerName: "Imagen",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "50px",
            height: "40px",
            borderRadius: "5px",
            objectFit: "cover",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "registeration_number",
      headerName: "Número de Registro",
      width: 150,
    },
    { field: "company", headerName: "Compañía", width: 150 },
    { field: "name", headerName: "Nombre", width: 150 },
    {
      field: "status",
      headerName: "Estado",
      width: 150,
      renderCell: (params) =>
        params.row.status === "rejected" ? (
          <div className="flex items-center gap-2">
            <MdOutlinePending className="text-red-500" />
            <span className="text-red-500">Rechazado</span>
          </div>
        ) : params.row.status === true ? (
          <div className="flex items-center gap-2">
            <GrStatusGood className="text-green-500" />
            <span className="text-green-500">Aprobado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MdOutlinePending className="text-yellow-500" />
            <span className="text-yellow-500">Pendiente</span>
          </div>
        ),
    },
    {
      field: "edit",
      headerName: "Editar",
      width: 100,
      renderCell: (params) => (
        <Button onClick={() => handleEditVehicle(params.row.id)}>
          <ModeEditOutlineIcon />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Eliminar",
      width: 100,
      renderCell: (params) => (
        <Button onClick={() => handleDeleteVehicles(params.row.id)}>
          <DeleteForeverIcon />
        </Button>
      ),
    },
  ];

  const rows =
    vendorVehilces &&
    vendorVehilces
      .filter((vehicle) => vehicle.isDeleted === "false")
      .map((vehicle) => ({
        id: vehicle._id,
        image: vehicle.image[0],
        registeration_number: vehicle.registeration_number,
        company: vehicle.company,
        name: vehicle.name,
        status: !vehicle.isRejected ? vehicle.isAdminApproved : "rejected",
      }));

  //checking if vendor has vehicles
  const isVendorVehiclesEmpty = vendorVehilces && vendorVehilces.length === 0;

  //showing success only if the vendor request is send
  useEffect(() => {
    if (vendorEditSuccess) {
      toast.success("Solicitud enviada");
      dispatch(setVendorEditSuccess(false));
    }

     //deleted success
     if(vendorDeleteSuccess){
      toast.success("Vehículo Eliminado")
      dispatch(setVendorDeleteSuccess(false))
     }

    //showing error if error
    if (vendorErrorSuccess) {
      toast.error("error");
      dispatch(setVendorError(false));
    }

   
  }, [vendorEditSuccess,vendorDeleteSuccess]);

  return (
    <div className="max-w-[1000px]  d-flex   justify-end text-start items-end p-10 bg-slate-100 rounded-md">
      {vendorEditSuccess && <Toaster />}
      {vendorDeleteSuccess && <Toaster/>}

      <VendorHeader 
        title="Mis Vehículos" 
        category="Gestión de Vehículos"
        onAddVehicle={handleAddVehicle}
      />
      
      {isVendorVehiclesEmpty ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes vehículos aún</h3>
          <p className="text-gray-500 mb-4">Comienza agregando tu primer vehículo para alquiler</p>
          <button
            onClick={handleAddVehicle}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Agregar Primer Vehículo
          </button>
        </div>
      ) : (
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              ".MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "&.MuiDataGrid-root": {
                border: "none",
              },
            }}
          />
        </Box>
      )}

      {/* Modal de creación de vehículos */}
      {showAddModal && (
        <VendorAddProductModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default VendorAllVehicles;
