
# Alquila un Auto

Este repositorio contiene el código para un sitio web completo de alquiler de autos con 3 módulos: Usuario, Administrador y Vendedor. El proyecto está dividido en Cliente y Backend.

## Instalación

Clona Alquila un Auto

```bash
https://github.com/ZlmDnl7/Alquiler-Autos.git
```

Instala los módulos de Node

```bash
  cd backend
  npm install
  npm run dev
```
```bash
  cd client
  npm install
  npm run dev
```

    
## Stack Tecnológico

**Cliente:** React, Javascript, Redux Toolkit, Material Ui, TailwindCSS, React Toast 

**Servidor:** Express.js, MongoDB, Cloudinary, Nodemailer, Multer

**Frontend y Backend desplegados en AWS EC2, Nginx como Proxy Inverso, Cloudflare como Resolutor DNS, PM2 para tiempo de actividad**


## Descripción del Proyecto
Una Plataforma Completa de Alquiler de Autos con módulos de usuario, administrador y vendedor, diseñada para ofrecer reservas de vehículos, gestión y administración sin problemas. La plataforma está desarrollada usando tecnologías modernas para asegurar operaciones suaves y eficientes, atendiendo a diferentes roles de usuario con funcionalidades distintas.

##

**Características y Módulos Clave:**

**Módulo de Usuario:**

* Ver y Reservar Vehículos: Los usuarios pueden ver vehículos disponibles y reservarlos en línea.
* Gestión de Perfil: Los usuarios pueden ver y editar sus perfiles, así como gestionar la configuración de su cuenta.
* Gestión de Pedidos: Ver pedidos pasados y futuros; los usuarios solo pueden acceder a sus propias reservas.
* Gestión de Cuenta: Los usuarios pueden registrarse, iniciar sesión, eliminar su cuenta y cerrar sesión sin problemas.
* Notificaciones por Email: Después de reservar un vehículo, los usuarios reciben un email con los detalles del pedido.

**Módulo de Administrador:**

* Gestión de Reservas: Los administradores pueden ver y gestionar reservas, incluyendo detalles y estados de las reservas.

* Gestión de Vendedores: Ver y aprobar/rechazar vendedores, así como remover vendedores de la plataforma.

* Gestión de Vehículos: Los administradores pueden ver, actualizar y eliminar listados de vehículos.

* Gestión de Usuarios: Los administradores tienen la capacidad de remover usuarios de la plataforma.

**Módulo de Vendedor:**

* Registro e Inicio de Sesión: Flujo separado de registro e inicio de sesión para vendedores.

* Listado de Vehículos: Los vendedores pueden agregar sus vehículos a la plataforma para aprobación por el administrador. Los vehículos aprobados serán listados en el sitio.

* Notificaciones de Pedidos: Los vendedores reciben actualizaciones sobre pedidos cuando los usuarios reservan sus vehículos.

##

**Stack Tecnológico:**

**Frontend:** React.js (con Vite), Redux Toolkit, Tailwind CSS, React Hook Form, Zod para validación de formularios, Google OAuth, Razorpay para procesamiento de pagos.

**Backend:** Node.js, Express.js, MongoDB, Multer para manejar datos de formularios multiparte, Nodemailer para enviar emails, Cloudinary para almacenamiento de medios, Arquitectura MVC, JWT con tokens de acceso y actualización, Rutas protegidas, Control de acceso basado en roles.

**Base de Datos:** MongoDB con pipelines de agregación, modelos de referencia y soluciones de almacenamiento optimizadas.

**Despliegue:** Desplegado en AWS EC2, utilizando Nginx como proxy inverso y Cloudflare para gestión de DNS.

##

**Características e Implementaciones:**

* Autenticación JWT: Integrados tokens JWT de acceso y actualización para asegurar flujos de inicio de sesión de usuario, administrador y vendedor.

* Acceso Basado en Roles: Implementadas rutas protegidas y control de acceso basado en roles para restringir el acceso según los roles de usuario (Administrador, Usuario, Vendedor).

* Selector de Ubicación Dinámico: El selector de ubicación actualiza dinámicamente las opciones de recogida y devolución basándose en la selección de ubicación del usuario.

* Funcionalidad de Búsqueda, Ordenamiento y Filtrado: Capacidades mejoradas de búsqueda, filtrado y ordenamiento para navegación y reserva de vehículos sin problemas.

* Desarrollo de UI: Construida la mayor parte de la UI desde cero, incluyendo validaciones de formularios dinámicas usando Zod y React Hook Form.

* Google OAuth: Integrado Google OAuth para funcionalidad rápida y segura de registro/inicio de sesión.

* Notificaciones por Email: Implementadas notificaciones automáticas por email para confirmaciones de reserva de vehículos usando Nodemailer.

* Integración de Cloudinary: Usado Cloudinary para manejar almacenamiento de imágenes y videos, reduciendo la carga de la base de datos optimizando activos de medios.

* MongoDB: Usados cuatro modelos principales para aprovechar la funcionalidad de referencia de MongoDB, mejorando la organización de datos y eficiencia de recuperación.

* Multer: Utilizado Multer para manejar subidas de archivos para vehículos, incluyendo imágenes y videos.

* Control de Versiones: Empleado Git a lo largo del proyecto para control de versiones, colaboración y respaldo.

## Capturas de Pantalla

//usuario
<img width="1440" alt="Screenshot 2024-04-06 at 3 06 32 PM" src="https://github.com/user-attachments/assets/4b769f7d-5d2c-43a7-8283-07fa8402de92">
<img width="1430" alt="Screenshot 2024-12-10 at 12 35 41 AM" src="https://github.com/user-attachments/assets/5d6e0160-5f1d-4e67-a64e-1e18fb17a590">
<img width="1425" alt="Screenshot 2024-12-10 at 12 35 58 AM" src="https://github.com/user-attachments/assets/ac6b0f33-344e-4009-a979-23ea7dc3a5bb">
<img width="1430" alt="Screenshot 2024-12-10 at 12 36 15 AM" src="https://github.com/user-attachments/assets/40e2dc7d-0694-483d-bf4a-badac9c4d5f3">
<img width="1426" alt="Screenshot 2024-12-10 at 12 36 28 AM" src="https://github.com/user-attachments/assets/7ce5d1fa-c51f-414b-92da-cc04ac7c3402">
<img width="1428" alt="Screenshot 2024-12-10 at 1 59 45 AM" src="https://github.com/user-attachments/assets/0e87009c-832d-4c5e-be7c-ecd4df341070">
<img width="1408" alt="Screenshot 2024-12-10 at 2 00 01 AM" src="https://github.com/user-attachments/assets/baf15b5d-2e04-4410-803b-527dddda1aab">


//Administrador
<img width="1418" alt="Screenshot 2024-12-10 at 2 01 09 AM" src="https://github.com/user-attachments/assets/c08e3bf0-2776-4236-80b6-6714d52ec8d7">
<img width="1421" alt="Screenshot 2024-12-10 at 2 04 29 AM" src="https://github.com/user-attachments/assets/ce6dada8-41b7-4aec-b86a-4a359f6d339f">
<img width="1431" alt="Screenshot 2024-12-10 at 2 04 42 AM" src="https://github.com/user-attachments/assets/467503a4-ab9a-4396-bc57-1abff5fe8106">
<img width="1418" alt="Screenshot 2024-12-10 at 2 05 02 AM" src="https://github.com/user-attachments/assets/8e1d2948-6316-420b-8336-30ec7c752b04">


//vendedor
<img width="1418" alt="Screenshot 2024-12-10 at 2 05 02 AM" src="https://github.com/user-attachments/assets/59a9a9c7-5dc1-4f61-8d15-43266579386c">
<img width="1432" alt="Screenshot 2024-12-10 at 2 08 00 AM" src="https://github.com/user-attachments/assets/4e9d8f66-0984-4163-8dea-f9023db56ce0">






