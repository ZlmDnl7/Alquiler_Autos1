# 🏆 25 FUNCIONALIDADES PRINCIPALES Y BIEN ARQUITECTADAS - RENT-A-RIDE

---

## 1. Registro de Usuario
Permite crear cuentas de usuario con validaciones robustas.
- Backend: [`controllers/authController.js`](backend/controllers/authController.js)
- Frontend: [`pages/user/SignUp.jsx`](client/src/pages/user/SignUp.jsx)

## 2. Inicio de Sesión de Usuario
Autenticación segura con JWT y manejo de sesiones.
- Backend: [`controllers/authController.js`](backend/controllers/authController.js)
- Frontend: [`pages/user/SignIn.jsx`](client/src/pages/user/SignIn.jsx)

## 3. Registro de Vendedor
Permite crear cuentas de vendedor con workflow de aprobación.
- Backend: [`vendorControllers/vendorController.js`](backend/controllers/vendorControllers/vendorController.js)
- Frontend: [`pages/vendor/pages/VendorSignup.jsx`](client/src/pages/vendor/pages/VendorSignup.jsx)

## 4. Inicio de Sesión de Vendedor
Login específico para vendedores aprobados.
- Backend: [`vendorControllers/vendorController.js`](backend/controllers/vendorControllers/vendorController.js)
- Frontend: [`pages/vendor/pages/VendorSignin.jsx`](client/src/pages/vendor/pages/VendorSignin.jsx)

## 5. Listado de Vehículos Disponibles
Muestra todos los vehículos aprobados para reserva.
- Backend: [`userControllers/userAllVehiclesController.js`](backend/controllers/userControllers/userAllVehiclesController.js)
- Frontend: [`pages/user/Vehicles.jsx`](client/src/pages/user/Vehicles.jsx)

## 6. Búsqueda y Filtrado de Vehículos
Permite buscar y filtrar vehículos por precio, año, tipo, etc.
- Backend: [`userControllers/userBookingController.js`](backend/controllers/userControllers/userBookingController.js)
- Frontend: [`components/Filter.jsx`](client/src/components/Filter.jsx), [`components/Sort.jsx`](client/src/components/Sort.jsx), [`pages/user/CarSearch.jsx`](client/src/pages/user/CarSearch.jsx)

## 7. Detalles de Vehículo
Muestra información completa de un vehículo seleccionado.
- Backend: [`userControllers/userAllVehiclesController.js`](backend/controllers/userControllers/userAllVehiclesController.js)
- Frontend: [`pages/user/VehicleDetails.jsx`](client/src/pages/user/VehicleDetails.jsx)

## 8. Reserva de Vehículo
Permite a usuarios reservar vehículos disponibles.
- Backend: [`userControllers/userBookingController.js`](backend/controllers/userControllers/userBookingController.js)
- Frontend: [`pages/user/CheckoutPage.jsx`](client/src/pages/user/CheckoutPage.jsx)

## 9. Proceso de Pago con Razorpay
Integración con Razorpay para pagos seguros.
- Backend: [`userControllers/userBookingController.js`](backend/controllers/userControllers/userBookingController.js)
- Frontend: [`pages/user/Razorpay.jsx`](client/src/pages/user/Razorpay.jsx)

## 10. Historial de Reservas del Usuario
Muestra todas las reservas realizadas por el usuario.
- Backend: [`userControllers/userBookingController.js`](backend/controllers/userControllers/userBookingController.js)
- Frontend: [`pages/user/Orders.jsx`](client/src/pages/user/Orders.jsx)

## 11. Gestión de Perfil de Usuario
Permite ver y editar información personal y de contacto.
- Backend: [`userControllers/userProfileController.js`](backend/controllers/userControllers/userProfileController.js)
- Frontend: [`pages/user/ProfileEdit.jsx`](client/src/pages/user/ProfileEdit.jsx)

## 12. Creación de Vehículos por Vendedor
Permite a vendedores agregar vehículos con validaciones y subida de imágenes.
- Backend: [`vendorControllers/vendorCrudController.js`](backend/controllers/vendorControllers/vendorCrudController.js)
- Frontend: [`pages/vendor/Components/VendorAddVehilceModal.jsx`](client/src/pages/vendor/Components/VendorAddVehilceModal.jsx)

## 13. Edición de Vehículos por Vendedor
Permite modificar información de vehículos y reenviarlos para aprobación.
- Backend: [`vendorControllers/vendorCrudController.js`](backend/controllers/vendorControllers/vendorCrudController.js)
- Frontend: [`pages/vendor/Components/VendorEditProductComponent.jsx`](client/src/pages/vendor/Components/VendorEditProductComponent.jsx)

## 14. Eliminación Segura de Vehículos
Permite a vendedores marcar vehículos como eliminados.
- Backend: [`vendorControllers/vendorCrudController.js`](backend/controllers/vendorControllers/vendorCrudController.js)
- Frontend: [`pages/vendor/Components/VendorDeleteVehicleModal.jsx`](client/src/pages/vendor/Components/VendorDeleteVehicleModal.jsx)

## 15. Gestión de Reservas del Vendedor
Permite a vendedores ver y gestionar reservas de sus vehículos.
- Backend: [`vendorControllers/vendorBookingsController.js`](backend/controllers/vendorControllers/vendorBookingsController.js)
- Frontend: [`pages/vendor/Components/VendorBookingTable.jsx`](client/src/pages/vendor/Components/VendorBookingTable.jsx)

## 16. Cambio de Estado de Reservas (Aprobar/Rechazar)
Permite a vendedores y administradores cambiar el estado de reservas.
- Backend: [`adminControllers/bookingsController.js`](backend/controllers/adminControllers/bookingsController.js), [`vendorControllers/vendorBookingsController.js`](backend/controllers/vendorControllers/vendorBookingsController.js)
- Frontend: [`pages/vendor/Components/VendorBookingTable.jsx`](client/src/pages/vendor/Components/VendorBookingTable.jsx)

## 17. Panel de Control de Administrador
Dashboard con estadísticas globales y gestión de usuarios, vehículos y reservas.
- Backend: [`adminController.js`](backend/controllers/adminController.js)
- Frontend: [`pages/admin/pages/AdminHomeMain.jsx`](client/src/pages/admin/pages/AdminHomeMain.jsx)

## 18. Gestión de Usuarios (Administrador)
Permite ver, filtrar y eliminar usuarios.
- Backend: [`adminController.js`](backend/controllers/adminController.js)
- Frontend: [`pages/admin/pages/AllUsers.jsx`](client/src/pages/admin/pages/AllUsers.jsx)

## 19. Gestión de Vendedores (Administrador)
Permite ver, aprobar y eliminar vendedores.
- Backend: [`adminController.js`](backend/controllers/adminController.js)
- Frontend: [`pages/admin/pages/Employees.jsx`](client/src/pages/admin/pages/Employees.jsx)

## 20. Aprobación/Rechazo de Vehículos (Administrador)
Permite revisar, aprobar o rechazar vehículos enviados por vendedores.
- Backend: [`adminControllers/vendorVehilceRequests.js`](backend/controllers/adminControllers/vendorVehilceRequests.js)
- Frontend: [`pages/admin/pages/AllVehicles.jsx`](client/src/pages/admin/pages/AllVehicles.jsx)

## 21. Notificaciones por Email
Envía emails automáticos tras reservas y cambios de estado.
- Backend: [`services/`](backend/services/)
- Frontend: [`components/`](client/src/components/)

## 22. Sistema de Favoritos
Permite a usuarios guardar vehículos favoritos.
- Backend: [`models/userModel.js`](backend/models/userModel.js)
- Frontend: [`pages/user/Favorites.jsx`](client/src/pages/user/Favorites.jsx)

## 23. Validaciones Avanzadas de Formularios
Validación en tiempo real con Zod y React Hook Form.
- Backend: Validaciones en controladores
- Frontend: [`components/`](client/src/components/)

## 24. Subida y Gestión de Imágenes con Cloudinary
Permite subir, optimizar y almacenar imágenes de vehículos.
- Backend: [`utils/cloudinaryConfig.js`](backend/utils/cloudinaryConfig.js), [`utils/multer.js`](backend/utils/multer.js)
- Frontend: [`pages/vendor/Components/VendorAddVehilceModal.jsx`](client/src/pages/vendor/Components/VendorAddVehilceModal.jsx)

## 25. Seguridad y Autorización por Roles
Controla acceso a rutas y funcionalidades según el rol (usuario, vendedor, administrador).
- Backend: [`utils/verifyUser.js`](backend/utils/verifyUser.js), [`routes/`](backend/routes/)
- Frontend: [`redux/`](client/src/redux/)

---