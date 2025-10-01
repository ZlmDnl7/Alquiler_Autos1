import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import VendorBookingsTable from "./VendorBookingTable";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { _id } = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!_id) return;
      
      try {
        setLoading(true);
        const res = await fetch("/api/user/findBookingsForVendor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId: _id })
        });

        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        } else {
          console.error('Error cargando reservas');
          setBookings([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [_id]);

  if (loading) {
    return (
      <div className="mt-5 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h2>
        <p className="text-gray-600">Administra las reservas de tus vehículos</p>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay reservas aún</h3>
          <p className="text-gray-500">Cuando los clientes reserven tus vehículos, aparecerán aquí</p>
        </div>
      ) : (
        <VendorBookingsTable bookings={bookings} />
      )}
    </div>
  );
};

export default VendorBookings;