# 📚 DOCUMENTACIÓN TÉCNICA COMPLETA - ALQUILA UN AUTO

## **🎯 INFORMACIÓN GENERAL**

**Proyecto:** Plataforma de Alquiler de Vehículos  
**Versión:** 1.0.0  
**Arquitectura:** Full-Stack (MERN)  
**Base de Datos:** MongoDB  
**Autenticación:** JWT + bcrypt  

---

## **👥 ROLES DEL SISTEMA**

### **1. USUARIO (Cliente)**
- **Descripción:** Usuario final que alquila vehículos
- **Permisos:** Ver, buscar, reservar vehículos, gestionar perfil
- **Rutas:** `/`, `/signin`, `/signup`, `/profile/*`

### **2. VENDEDOR**
- **Descripción:** Proveedor de vehículos para alquiler
- **Permisos:** Gestionar vehículos, ver reservas, estadísticas
- **Rutas:** `/vendorSignin`, `/vendorSignup`, `/vendorDashboard/*`

### **3. ADMINISTRADOR**
- **Descripción:** Super usuario con control total del sistema
- **Permisos:** Gestionar usuarios, vendedores, vehículos, reservas
- **Rutas:** `/adminDashboard/*`

---

## **🔧 FUNCIONALIDADES POR ROL**

### **👤 USUARIO (Cliente) - 12 FUNCIONALIDADES**

#### **1. Registro e Inicio de Sesión**
- **Función:** `signUp`, `signIn`
- **Archivo:** `backend/controllers/authController.js`
- **Ruta:** `/api/auth/signup`, `/api/auth/signin`
- **Descripción:** Crear cuenta y autenticarse
- **Validaciones:** Username (3+ chars), Email único, Password (8+ chars, mayúscula, minúscula, número, especial)

#### **2. Búsqueda de Vehículos**
- **Función:** `hanldeData` (en CarSearch.jsx)
- **Archivo:** `client/src/pages/user/CarSearch.jsx`
- **Ruta:** Frontend - página principal
- **Descripción:** Buscar por ubicación, fechas, tipo de vehículo

#### **3. Filtros y Ordenamiento**
- **Función:** `handleInputChange` (en Sort.jsx)
- **Archivo:** `client/src/components/Sort.jsx`
- **Ruta:** Frontend - componente de filtros
- **Descripción:** Filtrar por precio, año, ordenar resultados

#### **4. Vista de Vehículos Disponibles**
- **Función:** `fetchVehicles` (en Vehicles.jsx)
- **Archivo:** `client/src/pages/user/Vehicles.jsx`
- **Ruta:** `/vehicles`
- **Descripción:** Mostrar lista de vehículos con paginación

#### **5. Detalles del Vehículo**
- **Función:** `onVehicleDetail` (en VehicleDetails.jsx)
- **Archivo:** `client/src/pages/user/VehicleDetails.jsx`
- **Ruta:** `/vehicleDetails`
- **Descripción:** Mostrar información completa del vehículo

#### **6. Sistema de Favoritos**
- **Función:** `addToFavorites` (en Favorites.jsx)
- **Archivo:** `client/src/pages/user/Favorites.jsx`
- **Ruta:** `/profile/favorites`
- **Descripción:** Guardar y gestionar vehículos favoritos

#### **7. Reserva de Vehículos**
- **Función:** `handleBooking` (en CheckoutPage.jsx)
- **Archivo:** `client/src/pages/user/CheckoutPage.jsx`
- **Ruta:** `/checkoutPage`
- **Descripción:** Proceso de reserva con fechas y ubicaciones

#### **8. Proceso de Pago**
- **Función:** `handlePayment` (en Razorpay.jsx)
- **Archivo:** `client/src/pages/user/Razorpay.jsx`
- **Ruta:** `/razorpay`
- **Descripción:** Integración con Razorpay para pagos

#### **9. Historial de Reservas**
- **Función:** `fetchOrders` (en Orders.jsx)
- **Archivo:** `client/src/pages/user/Orders.jsx`
- **Ruta:** `/profile/orders`
- **Descripción:** Ver todas las reservas realizadas

#### **10. Gestión de Perfil**
- **Función:** `updateProfile` (en ProfileEdit.jsx)
- **Archivo:** `client/src/pages/user/ProfileEdit.jsx`
- **Ruta:** `/profile/profiles`
- **Descripción:** Editar información personal y de contacto

#### **11. Notificaciones del Sistema**
- **Función:** `showToast` (en varios componentes)
- **Archivo:** `client/src/components/` (varios)
- **Descripción:** Mostrar mensajes de éxito, error, confirmación

#### **12. Cerrar Sesión**
- **Función:** `signOut` (en Header.jsx)
- **Archivo:** `client/src/components/Header.jsx`
- **Ruta:** Frontend - header
- **Descripción:** Cerrar sesión y limpiar estado

---

### **🏪 VENDEDOR - 8 FUNCIONALIDADES**

#### **13. Registro e Inicio de Sesión**
- **Función:** `vendorSignUp`, `vendorSignIn`
- **Archivo:** `backend/controllers/vendorController.js`
- **Ruta:** `/api/vendor/vendorsignup`, `/api/vendor/vendorsignin`
- **Descripción:** Cuenta especial para vendedores

#### **14. Dashboard Personal**
- **Función:** `VendorDashboard` (componente)
- **Archivo:** `client/src/pages/vendor/Dashboard/VendorDashboard.jsx`
- **Ruta:** `/vendorDashboard`
- **Descripción:** Panel de control con métricas

#### **15. Agregar Vehículos**
- **Función:** `handleSubmit` (en VendorAddProductModal.jsx)
- **Archivo:** `client/src/pages/vendor/Components/VendorAddVehilceModal.jsx`
- **Ruta:** `/vendorDashboard/vendorAddProduct`
- **Descripción:** Formulario para agregar vehículos

#### **16. Editar Vehículos**
- **Función:** `handleEdit` (en VendorEditProductComponent.jsx)
- **Archivo:** `client/src/pages/vendor/Components/VendorEditProductComponent.jsx`
- **Ruta:** `/vendorDashboard/vendorEditProductComponent`
- **Descripción:** Modificar información de vehículos

#### **17. Eliminar Vehículos**
- **Función:** `handleDelete` (en VendorDeleteVehicleModal.jsx)
- **Archivo:** `client/src/pages/vendor/Components/VendorDeleteVehicleModal.jsx`
- **Ruta:** `/vendorDashboard/vendorDeleteVehicleModal`
- **Descripción:** Remover vehículos del catálogo

#### **18. Gestión de Reservas**
- **Función:** `fetchBookings` (en VendorBookingTable.jsx)
- **Archivo:** `client/src/pages/vendor/Components/VendorBookingTable.jsx`
- **Ruta:** `/vendorDashboard/bookings`
- **Descripción:** Ver reservas de vehículos propios

#### **19. Cambio de Estado de Reservas**
- **Función:** `changeVehicleStatus` (en VendorBookingTable.jsx)
- **Archivo:** `client/src/pages/vendor/Components/VendorBookingTable.jsx`
- **Ruta:** `/api/vendor/changeStatus`
- **Descripción:** Aprobar/rechazar reservas

#### **20. Estadísticas de Rendimiento**
- **Función:** `VendorDashboard` (componente)
- **Archivo:** `client/src/pages/vendor/Dashboard/VendorDashboard.jsx`
- **Ruta:** `/vendorDashboard`
- **Descripción:** Métricas de vehículos y reservas

---

### **👑 ADMINISTRADOR - 8 FUNCIONALIDADES**

#### **21. Panel de Control Global**
- **Función:** `AdminHomeMain` (componente)
- **Archivo:** `client/src/pages/admin/pages/AdminHomeMain.jsx`
- **Ruta:** `/adminDashboard`
- **Descripción:** Dashboard con estadísticas globales

#### **22. Gestión de Usuarios**
- **Función:** `getAllUsers` (en adminController.js)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/getAllUsers`
- **Descripción:** Ver todos los usuarios del sistema

#### **23. Gestión de Vendedores**
- **Función:** `getAllUsers` (filtrado por isVendor)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/getAllUsers`
- **Descripción:** Ver y gestionar vendedores

#### **24. Aprobación de Vehículos**
- **Función:** `approveVehicle` (en adminController.js)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/approveVehicle`
- **Descripción:** Revisar y aprobar vehículos nuevos

#### **25. Gestión de Reservas Global**
- **Función:** `allBookings` (en bookingsController.js)
- **Archivo:** `backend/controllers/adminControllers/bookingsController.js`
- **Ruta:** `/api/admin/allBookings`
- **Descripción:** Ver todas las reservas del sistema

#### **26. Estadísticas Globales**
- **Función:** `getDashboardStats` (en adminController.js)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/getDashboardStats`
- **Descripción:** Métricas de toda la plataforma

#### **27. Gestión de Contenido**
- **Función:** `updateSiteContent` (en adminController.js)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/updateContent`
- **Descripción:** Editar información del sitio

#### **28. Reportes del Sistema**
- **Función:** `generateReport` (en adminController.js)
- **Archivo:** `backend/controllers/adminController.js`
- **Ruta:** `/api/admin/generateReport`
- **Descripción:** Generar reportes de actividad

---

## **🗂️ ESTRUCTURA DE ARCHIVOS Y FUNCIONES**

### **📁 BACKEND - ESTRUCTURA**

```
backend/
├── controllers/
│   ├── authController.js          # signUp, signIn, refreshToken
│   ├── adminController.js         # getAllUsers, getDashboardStats
│   ├── vendorController.js        # vendorSignUp, vendorSignIn
│   └── adminControllers/
│       └── bookingsController.js  # allBookings, changeStatus
├── models/
│   ├── userModel.js               # Esquema de usuarios
│   ├── vehicleModel.js            # Esquema de vehículos
│   └── bookingModel.js            # Esquema de reservas
├── routes/
│   ├── authRoute.js               # /api/auth/*
│   ├── adminRoute.js              # /api/admin/*
│   ├── vendorRoute.js             # /api/vendor/*
│   └── userRoute.js               # /api/user/*
├── services/                      # Lógica de negocio
├── utils/                         # Utilidades y helpers
└── server.js                      # Punto de entrada
```

### **📁 FRONTEND - ESTRUCTURA**

```
client/src/
├── pages/
│   ├── user/                      # Interfaz de usuario
│   │   ├── Home.jsx              # Página principal
│   │   ├── SignIn.jsx            # Inicio de sesión
│   │   ├── SignUp.jsx            # Registro
│   │   ├── Vehicles.jsx          # Lista de vehículos
│   │   ├── VehicleDetails.jsx    # Detalles del vehículo
│   │   ├── CarSearch.jsx         # Búsqueda
│   │   ├── CheckoutPage.jsx      # Proceso de reserva
│   │   ├── Razorpay.jsx          # Pago
│   │   ├── Orders.jsx            # Historial de reservas
│   │   ├── Favorites.jsx         # Favoritos
│   │   ├── Profile.jsx           # Perfil principal
│   │   └── ProfileEdit.jsx       # Editar perfil
│   ├── vendor/                    # Interfaz de vendedor
│   │   ├── pages/
│   │   │   ├── VendorSignin.jsx  # Inicio de sesión
│   │   │   ├── VendorSignup.jsx  # Registro
│   │   │   ├── VendorAllVehicles.jsx # Vehículos del vendedor
│   │   │   └── VendorDashboard.jsx   # Dashboard
│   │   └── Components/
│   │       ├── VendorAddVehilceModal.jsx    # Agregar vehículo
│   │       ├── VendorEditProductComponent.jsx # Editar vehículo
│   │       ├── VendorDeleteVehicleModal.jsx   # Eliminar vehículo
│   │       └── VendorBookingTable.jsx        # Tabla de reservas
│   └── admin/                     # Interfaz de administrador
│       ├── pages/
│       │   ├── AdminHomeMain.jsx # Dashboard principal
│       │   ├── AllVehicles.jsx   # Todos los vehículos
│       │   ├── Customers.jsx     # Lista de clientes
│       │   ├── Employees.jsx     # Lista de empleados
│       │   └── AllUsers.jsx      # Todos los usuarios
│       ├── components/
│       │   ├── SideBar.jsx       # Barra lateral
│       │   ├── Navbar.jsx        # Barra superior
│       │   ├── UserProfile.jsx   # Perfil de usuario
│       │   └── BookingsTable.jsx # Tabla de reservas
│       └── data/
│           ├── SidebarContents.jsx # Contenido de la barra lateral
│           └── dummys.jsx         # Datos de ejemplo
├── components/                     # Componentes reutilizables
│   ├── Header.jsx                 # Encabezado principal
│   ├── Footer.jsx                 # Pie de página
│   ├── Sort.jsx                   # Componente de ordenamiento
│   ├── Filter.jsx                 # Componente de filtros
│   └── ui/                        # Componentes de UI
├── redux/                         # Estado global
│   ├── user/                      # Estado del usuario
│   ├── vendor/                    # Estado del vendedor
│   └── adminSlices/               # Estado del administrador
└── utils/                         # Utilidades del frontend
```

---

## **🔗 RUTAS COMPLETAS DEL SISTEMA**

### **🌐 RUTAS PÚBLICAS (Sin autenticación)**
```
GET  /                           # Página principal
GET  /vehicles                   # Lista de vehículos
GET  /enterprise                 # Página empresarial
GET  /contact                    # Página de contacto
POST /api/auth/signup            # Registro de usuario
POST /api/auth/signin            # Inicio de sesión de usuario
POST /api/vendor/vendorsignup    # Registro de vendedor
POST /api/vendor/vendorsignin    # Inicio de sesión de vendedor
```

### **🔐 RUTAS PROTEGIDAS - USUARIO**
```
GET  /profile/*                  # Perfil del usuario
GET  /allVariants                # Variantes del mismo modelo
GET  /vehicleDetails             # Detalles del vehículo
GET  /orders                     # Historial de reservas
GET  /availableVehicles          # Vehículos disponibles
GET  /checkoutPage               # Proceso de reserva
GET  /razorpay                   # Página de pago
POST /api/user/filterVehicles    # Filtrar vehículos
POST /api/user/showSingleofSameModel # Mostrar variantes
```

### **🔐 RUTAS PROTEGIDAS - VENDEDOR**
```
GET  /vendorDashboard/*          # Dashboard del vendedor
GET  /vendorDashboard/vendorEditProductComponent # Editar producto
GET  /vendorDashboard/vendorDeleteVehicleModal   # Eliminar vehículo
GET  /vendorDashboard/vendorAddProduct           # Agregar producto
POST /api/vendor/vendorsignup    # Registro
POST /api/vendor/vendorsignin    # Inicio de sesión
POST /api/vendor/changeStatus    # Cambiar estado de reserva
```

### **🔐 RUTAS PROTEGIDAS - ADMINISTRADOR**
```
GET  /adminDashboard/*           # Dashboard del administrador
GET  /adminDashboard/editProducts # Editar productos
GET  /adminDashboard/addProducts  # Agregar productos
GET  /api/admin/getAllUsers       # Obtener todos los usuarios
GET  /api/admin/getDashboardStats # Estadísticas del dashboard
GET  /api/admin/allBookings       # Todas las reservas
POST /api/admin/changeStatus      # Cambiar estado de reserva
```

---

## **📊 ESTRUCTURA DE LA BASE DE DATOS**

### **🗃️ COLECCIÓN: `users`**
```javascript
{
  _id: ObjectId,                    // ID único del usuario
  username: "string",               // Nombre de usuario (ÚNICO)
  email: "string",                  // Email (ÚNICO)
  password: "string",               // Contraseña hasheada
  phoneNumber: "string",            // Número de teléfono (OPCIONAL)
  adress: "string",                 // Dirección (OPCIONAL)
  profilePicture: "string",         // URL de imagen de perfil
  isUser: boolean,                  // true para usuarios normales
  isAdmin: boolean,                 // true para administradores
  isVendor: boolean,                // true para vendedores
  refreshToken: "string",           // Token JWT de actualización
  createdAt: Date,                  // Fecha de creación
  updatedAt: Date                   // Fecha de última actualización
}
```

### **🚗 COLECCIÓN: `vehicles`**
```javascript
{
  _id: ObjectId,                    // ID único del vehículo
  registeration_number: "string",   // Número de registro
  company: "string",                // Marca (Toyota, Honda, etc.)
  name: "string",                   // Modelo
  title: "string",                  // Título descriptivo
  base_package: "string",           // Paquete base
  price: number,                    // Precio por día
  year_made: number,                // Año de fabricación
  fuel_type: "string",              // Tipo de combustible
  car_type: "string",               // Tipo de auto
  image: ["string"],                // Array de URLs de imágenes
  isAdminApproved: boolean,         // Aprobado por administrador
  isDeleted: boolean,               // No eliminado
  vendor_id: ObjectId,              // ID del vendedor
  createdAt: Date,                  // Fecha de creación
  updatedAt: Date                   // Fecha de última actualización
}
```

### **📅 COLECCIÓN: `bookings`**
```javascript
{
  _id: ObjectId,                    // ID único de la reserva
  user_id: ObjectId,                // ID del usuario
  vehicle_id: ObjectId,             // ID del vehículo
  pickup_location: "string",        // Ubicación de recogida
  pickup_date: Date,                // Fecha de recogida
  dropoff_location: "string",       // Ubicación de devolución
  dropoff_date: Date,               // Fecha de devolución
  total_amount: number,             // Monto total
  status: "string",                 // pending, approved, rejected, completed
  payment_status: "string",         // pending, completed, failed
  createdAt: Date,                  // Fecha de creación
  updatedAt: Date                   // Fecha de última actualización
}
```

---

## **🎯 CASOS DE USO PRINCIPALES**

### **👤 USUARIO (Cliente)**

#### **Caso de Uso 1: Registro de Usuario**
1. Usuario accede a `/signup`
2. Llena formulario con datos personales
3. Sistema valida datos (username único, email único, password fuerte)
4. Sistema crea cuenta en base de datos
5. Usuario recibe confirmación

#### **Caso de Uso 2: Búsqueda y Reserva de Vehículo**
1. Usuario accede a página principal
2. Selecciona ubicación, fechas de recogida/devolución
3. Sistema muestra vehículos disponibles
4. Usuario filtra y ordena resultados
5. Usuario selecciona vehículo
6. Sistema muestra detalles y precios
7. Usuario confirma reserva
8. Sistema procesa pago con Razorpay
9. Usuario recibe confirmación por email

#### **Caso de Uso 3: Gestión de Perfil**
1. Usuario accede a `/profile`
2. Visualiza información personal
3. Edita datos (nombre, teléfono, dirección)
4. Sistema actualiza base de datos
5. Usuario recibe confirmación

### **🏪 VENDEDOR**

#### **Caso de Uso 1: Registro de Vendedor**
1. Vendedor accede a `/vendorsignup`
2. Llena formulario con datos empresariales
3. Sistema valida datos únicos
4. Sistema crea cuenta de vendedor
5. Vendedor espera aprobación del administrador

#### **Caso de Uso 2: Agregar Vehículo**
1. Vendedor inicia sesión
2. Accede a `/vendorDashboard/vendorAddProduct`
3. Llena formulario con datos del vehículo
4. Sube imágenes del vehículo
5. Sistema guarda vehículo pendiente de aprobación
6. Administrador revisa y aprueba/rechaza

#### **Caso de Uso 3: Gestión de Reservas**
1. Vendedor accede a dashboard
2. Visualiza reservas de sus vehículos
3. Cambia estado de reservas (aprobar/rechazar)
4. Sistema notifica cambios al usuario
5. Vendedor gestiona disponibilidad

### **👑 ADMINISTRADOR**

#### **Caso de Uso 1: Gestión de Usuarios**
1. Administrador accede a dashboard
2. Visualiza lista de todos los usuarios
3. Filtra por rol (cliente, vendedor, administrador)
4. Gestiona permisos y estados
5. Sistema aplica cambios en tiempo real

#### **Caso de Uso 2: Aprobación de Vehículos**
1. Administrador accede a dashboard
2. Visualiza vehículos pendientes de aprobación
3. Revisa información y imágenes
4. Aprueba o rechaza vehículo
5. Sistema notifica al vendedor
6. Vehículo aparece/disaparece del catálogo

#### **Caso de Uso 3: Monitoreo del Sistema**
1. Administrador accede a dashboard
2. Visualiza estadísticas globales
3. Monitorea actividad de usuarios
4. Genera reportes de uso
5. Toma decisiones basadas en métricas

---

## **🔒 SEGURIDAD Y AUTENTICACIÓN**

### **JWT (JSON Web Tokens)**
- **Access Token:** 15 minutos de duración
- **Refresh Token:** 7 días de duración
- **Almacenamiento:** Cookies httpOnly
- **Renovación:** Automática con refresh token

### **Validaciones de Seguridad**
- **Contraseñas:** Mínimo 8 caracteres, mayúscula, minúscula, número, especial
- **Emails:** Formato válido y únicos
- **Usernames:** Mínimo 3 caracteres y únicos
- **Archivos:** Validación de tipo y tamaño

### **Control de Acceso**
- **Rutas Protegidas:** Middleware de autenticación
- **Roles:** Usuario, Vendedor, Administrador
- **Permisos:** Basados en rol del usuario
- **Sesiones:** Gestión automática de tokens

---

## **📱 INTERFACES DE USUARIO**

### **🎨 Diseño Responsivo**
- **Mobile First:** Diseño optimizado para móviles
- **Breakpoints:** sm, md, lg, xl, 2xl
- **Componentes:** Adaptables a diferentes tamaños
- **Navegación:** Menú hamburguesa en móviles

### **🎯 Componentes Reutilizables**
- **Botones:** Diferentes estilos y estados
- **Formularios:** Validación con Zod
- **Tablas:** DataGrid de Material-UI
- **Modales:** Confirmaciones y formularios
- **Notificaciones:** Toast con Sonner

### **🌐 Internacionalización**
- **Idioma:** Español (100% traducido)
- **Componentes:** Textos dinámicos
- **Formularios:** Mensajes de error en español
- **Interfaz:** Consistente en todo el sistema

---

## **📊 MÉTRICAS Y ESTADÍSTICAS**

### **📈 Dashboard de Administrador**
- **Total de Usuarios:** Contador de clientes
- **Total de Vendedores:** Contador de vendedores
- **Total de Administradores:** Contador de administradores
- **Usuarios Recientes:** Lista de últimos registros
- **Resumen del Sistema:** Métricas generales

### **📊 Dashboard de Vendedor**
- **Vehículos Activos:** Contador de vehículos aprobados
- **Reservas Pendientes:** Contador de reservas por aprobar
- **Ingresos:** Métricas de ganancias
- **Rendimiento:** Estadísticas de vehículos

### **📋 Dashboard de Usuario**
- **Reservas Activas:** Contador de reservas vigentes
- **Favoritos:** Lista de vehículos guardados
- **Historial:** Resumen de reservas pasadas
- **Perfil:** Información personal actualizada

---

## **🚀 DESPLIEGUE Y PRODUCCIÓN**

### **🌐 Frontend**
- **Framework:** React con Vite
- **Build:** Optimizado para producción
- **Hosting:** AWS EC2
- **Proxy:** Nginx como proxy inverso

### **⚙️ Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Servidor:** AWS EC2
- **Proceso:** PM2 para gestión de procesos

### **🗄️ Base de Datos**
- **Sistema:** MongoDB
- **Hosting:** AWS EC2
- **Backup:** Automático
- **Monitoreo:** Logs y métricas

### **🔧 Herramientas de Producción**
- **DNS:** Cloudflare
- **SSL:** Certificados automáticos
- **Monitoreo:** PM2 + logs
- **Escalabilidad:** Arquitectura horizontal

---

## **🚗 SISTEMA DE CREACIÓN Y GESTIÓN DE VEHÍCULOS**

### **📋 FUNCIONALIDADES PRINCIPALES**

#### **🔧 Creación de Vehículos (Vendedores)**
- **Formulario Inteligente:** Interfaz reactiva con validación en tiempo real
- **Selección Múltiple de Imágenes:** Hasta 5 imágenes con vista previa
- **Acumulación de Imágenes:** Las imágenes se suman, no se reemplazan
- **Validación de Archivos:** Solo acepta imágenes (JPG, PNG, GIF) hasta 5MB
- **Campos Obligatorios:** Número de registro, marca, modelo, título, paquete, precio, año, combustible, tipo
- **Estados de Aprobación:** Pendiente → Aprobado/Rechazado por administrador

#### **📊 Gestión de Vehículos (Vendedores)**
- **Dashboard Personalizado:** Estadísticas específicas del vendedor
- **Lista de Vehículos:** Vista completa con estados (Pendiente, Aprobado, Rechazado)
- **Edición de Vehículos:** Modificación de información y reenvío para aprobación
- **Eliminación Segura:** Marcado como eliminado, no borrado físicamente
- **Filtros y Búsqueda:** Por estado, marca, modelo, año

#### **👨‍💼 Panel de Administración**
- **Aprobación de Vehículos:** Revisión y validación de vehículos pendientes
- **Gestión de Vendedores:** Control de acceso y permisos
- **Estadísticas Globales:** Métricas de toda la plataforma
- **Moderación de Contenido:** Rechazo con motivo específico

### **🏗️ ARQUITECTURA DEL SISTEMA**

#### **🗄️ Base de Datos - Colección `vehicles`**
```javascript
{
  _id: ObjectId,                    // Identificador único
  registeration_number: String,     // Número de matrícula (ÚNICO)
  company: String,                  // Marca del vehículo
  name: String,                     // Modelo específico
  title: String,                    // Título descriptivo
  base_package: String,             // Nivel de equipamiento
  price: Number,                    // Precio por día en euros
  year_made: Number,                // Año de fabricación
  fuel_type: String,                // Tipo de combustible
  car_type: String,                 // Categoría del vehículo
  image: [String],                  // Array de URLs de imágenes
  isAdminApproved: Boolean,         // Estado de aprobación
  isDeleted: Boolean,               // Marcado de eliminación
  vendor_id: ObjectId,              // Referencia al vendedor
  createdAt: Date,                  // Fecha de creación
  updatedAt: Date                   // Fecha de última modificación
}
```

#### **🔐 Sistema de Permisos**
- **Vendedores:** Solo pueden ver y gestionar sus propios vehículos
- **Administradores:** Acceso completo a todos los vehículos y vendedores
- **Usuarios:** Solo pueden ver vehículos aprobados para reservas

### **🎯 FLUJO DE TRABAJO**

#### **1. Creación del Vehículo**
```
Vendedor → Llena Formulario → Sube Imágenes → Envía → Estado: Pendiente
```

#### **2. Proceso de Aprobación**
```
Administrador → Revisa Información → Valida Imágenes → Aprueba/Rechaza
```

#### **3. Publicación**
```
Vehículo Aprobado → Visible en Catálogo → Disponible para Reservas
```

### **⚡ CARACTERÍSTICAS TÉCNICAS**

#### **🖼️ Sistema de Imágenes**
- **Almacenamiento:** Cloudinary para optimización automática
- **Formatos Soportados:** JPG, PNG, GIF
- **Límites:** Máximo 5 imágenes por vehículo, 5MB por imagen
- **Optimización:** Redimensionamiento automático y compresión
- **CDN:** Distribución global para carga rápida

#### **🔍 Validaciones del Sistema**
- **Número de Registro:** Único en toda la base de datos
- **Año de Fabricación:** Rango 1990-2025
- **Precio:** Mínimo 1€ por día
- **Imágenes:** Mínimo 1, máximo 5
- **Campos Obligatorios:** Todos los campos marcados con *

#### **📱 Interfaz de Usuario**
- **Responsive Design:** Adaptable a móviles, tablets y desktop
- **Validación en Tiempo Real:** Feedback inmediato al usuario
- **Vista Previa de Imágenes:** Miniatura con opción de eliminación
- **Estados Visuales:** Colores y iconos para diferentes estados
- **Navegación Intuitiva:** Flujo claro y lógico

### **🔄 INTEGRACIÓN CON OTROS MÓDULOS**

#### **📅 Sistema de Reservas**
- **Disponibilidad:** Solo vehículos aprobados aparecen en búsquedas
- **Precios:** Se calculan automáticamente por día
- **Información:** Datos del vehículo se muestran en detalles de reserva

#### **💰 Sistema de Pagos**
- **Cálculo de Precios:** Basado en días de alquiler × precio por día
- **Verificación:** Solo vehículos activos pueden ser reservados

#### **👥 Gestión de Usuarios**
- **Vendedores:** Acceso al panel de creación y gestión
- **Clientes:** Solo pueden ver vehículos aprobados
- **Administradores:** Control total del sistema

### **🚀 FUNCIONALIDADES AVANZADAS**

#### **📊 Dashboard Inteligente**
- **Estadísticas en Tiempo Real:** Contadores actualizados automáticamente
- **Métricas de Rendimiento:** Vehículos por estado, reservas activas
- **Gráficos Interactivos:** Visualización de datos históricos
- **Filtros Dinámicos:** Búsqueda y filtrado avanzado

#### **🔔 Sistema de Notificaciones**
- **Aprobación de Vehículos:** Notificación al vendedor
- **Rechazo con Motivo:** Explicación detallada del rechazo
- **Recordatorios:** Notificaciones de vehículos pendientes

#### **📈 Análisis y Reportes**
- **Rendimiento por Vendedor:** Métricas individuales
- **Tendencias de Mercado:** Vehículos más populares
- **Análisis de Precios:** Comparación con el mercado

### **🛡️ SEGURIDAD Y VALIDACIÓN**

#### **🔒 Medidas de Seguridad**
- **Validación del Lado del Cliente:** React Hook Form + Zod
- **Validación del Lado del Servidor:** Middleware de autenticación
- **Sanitización de Datos:** Prevención de inyección de código
- **Control de Acceso:** Verificación de roles y permisos

#### **📋 Validaciones de Negocio**
- **Unicidad de Matrícula:** No se permiten duplicados
- **Límites de Imágenes:** Control de cantidad y tamaño
- **Estados Válidos:** Transiciones de estado controladas
- **Integridad de Datos:** Referencias válidas entre colecciones

---

## **📝 NOTAS TÉCNICAS**

### **🔄 Estado Global (Redux)**
- **Slices:** Separados por funcionalidad
- **Actions:** Funciones bien definidas
- **Reducers:** Manejo predecible del estado
- **Middleware:** Thunk para operaciones asíncronas

### **🎣 Hooks Personalizados**
- **useFetchLocationsLov:** Búsqueda de ubicaciones
- **useMediaQuery:** Responsive design
- **useLocalStorage:** Persistencia local
- **useDebounce:** Optimización de búsquedas

### **🔧 Utilidades del Sistema**
- **Validaciones:** Zod para esquemas
- **Formularios:** React Hook Form
- **Notificaciones:** Sonner para toasts
- **Iconos:** React Icons
- **Animaciones:** Framer Motion

---

## **📚 RECURSOS ADICIONALES**

### **🔗 Enlaces Útiles**
- **Documentación React:** https://react.dev/
- **Documentación Redux:** https://redux.js.org/
- **Documentación MongoDB:** https://docs.mongodb.com/
- **Documentación Express:** https://expressjs.com/

### **📖 Bibliografía Recomendada**
- "Clean Code" - Robert C. Martin
- "Design Patterns" - Gang of Four
- "MongoDB: The Definitive Guide" - Shannon Bradshaw
- "Node.js Design Patterns" - Mario Casciaro

---

## **📞 CONTACTO Y SOPORTE**

### **👨‍💻 Desarrollador Principal**
- **Nombre:** ZlmDnl7
- **GitHub:** https://github.com/ZlmDnl7
- **LinkedIn:** [Tu LinkedIn aquí]

### **🐛 Reporte de Errores**
- **Issues:** GitHub Issues del repositorio
- **Documentación:** Este archivo técnico
- **Soporte:** Comunidad de desarrolladores

---

**📄 Última actualización:** 23 de Agosto, 2025  
**📋 Versión del documento:** 1.0.0  
**👨‍💻 Mantenido por:** ZlmDnl7  
**🔒 Estado:** Documentación completa y actualizada
