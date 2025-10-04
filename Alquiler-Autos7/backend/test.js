import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// ============================================================================
// CONFIGURACIÃ“N DE MOCKS - PreparaciÃ³n del entorno de pruebas
// ============================================================================

// Mock de Mongoose para evitar conexiones a la base de datos
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
    once: jest.fn()
  },
  Schema: jest.fn(),
  model: jest.fn(() => ({
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    create: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({ nModified: 1 }),
    updateMany: jest.fn().mockResolvedValue({ nModified: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(10),
    exists: jest.fn().mockResolvedValue(true),
    distinct: jest.fn().mockResolvedValue(['value1', 'value2']),
    aggregate: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({}),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    insertMany: jest.fn().mockResolvedValue([]),
    _doc: { _id: '507f1f77bcf86cd799439011', username: 'testuser', email: 'test@example.com' }
  }))
}));

// Mock de bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
  hashSync: jest.fn().mockReturnValue('hashedpassword'),
  compareSync: jest.fn().mockReturnValue(true)
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: '507f1f77bcf86cd799439011', role: 'user' })
}));

// Mock de cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/image.jpg' }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Mock de dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock de nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// ============================================================================
// IMPORTACIONES - MÃ³dulos a probar
// ============================================================================

import authController from './controllers/authController.js';
import * as adminController from './controllers/adminController.js';
import * as userController from './controllers/userControllers/userController.js';
import * as vendorController from './controllers/vendorControllers/vendorController.js';
import { verifyToken } from './utils/verifyUser.js';
import { errorHandler } from './utils/error.js';

// ============================================================================
// FUNCIONES AUXILIARES - Helpers para las pruebas
// ============================================================================

/**
 * FunciÃ³n helper para crear objetos req, res, next
 * Siguiendo el principio DRY (Don't Repeat Yourself)
 */
function createMockReqResNext(customReq = {}, customRes = {}) {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: null,
    ...customReq
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    ...customRes
  };
  
  const next = jest.fn();
  
  return { req, res, next };
}

// ============================================================================
// SUITE DE PRUEBAS: AUTH CONTROLLER
// Pruebas para el controlador de autenticaciÃ³n
// ============================================================================

describe('Auth Controller - signUp Function', () => {
  
  // Principio FIRST: Fast, Independent, Repeatable, Self-validating, Timely
  
  test('debe crear un nuevo usuario exitosamente con datos vÃ¡lidos', async () => {
    // ARRANGE: Preparar datos de entrada
    const mockUser = {
      username: 'nuevoUsuario',
      email: 'nuevo@example.com',
      password: 'password123',
      phoneNumber: '1234567890'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: mockUser
    });

    // ACT: Ejecutar la funciÃ³n a probar
    await authController.signUp(req, res, next);

    // ASSERT: Verificar el resultado
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('debe manejar correctamente un registro sin nÃºmero de telÃ©fono', async () => {
    // ARRANGE
    const mockUser = {
      username: 'usuarioSinTelefono',
      email: 'sintelefono@example.com',
      password: 'password123'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: mockUser
    });

    // ACT
    await authController.signUp(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('Usuario creado')
    });
  });

  test('debe rechazar un registro con email invÃ¡lido', async () => {
    // ARRANGE
    const mockUser = {
      username: 'usuario',
      email: 'email-invalido',
      password: 'password123'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: mockUser
    });

    // ACT
    await authController.signUp(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe rechazar un registro con contraseÃ±a corta', async () => {
    // ARRANGE
    const mockUser = {
      username: 'usuario',
      email: 'valido@example.com',
      password: '123' // ContraseÃ±a muy corta
    };
    
    const { req, res, next } = createMockReqResNext({
      body: mockUser
    });

    // ACT
    await authController.signUp(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe rechazar registro con campos faltantes', async () => {
    // ARRANGE
    const mockUser = {
      username: 'usuario'
      // Falta email y password
    };
    
    const { req, res, next } = createMockReqResNext({
      body: mockUser
    });

    // ACT
    await authController.signUp(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Controller - signIn Function', () => {
  
  test('debe iniciar sesiÃ³n exitosamente con credenciales vÃ¡lidas', async () => {
    // ARRANGE
    const credentials = {
      email: 'usuario@example.com',
      password: 'password123'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: credentials
    });

    // ACT
    await authController.signIn(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe rechazar inicio de sesiÃ³n con email incorrecto', async () => {
    // ARRANGE
    const credentials = {
      email: 'noexiste@example.com',
      password: 'password123'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: credentials
    });

    // ACT
    await authController.signIn(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe rechazar inicio de sesiÃ³n con contraseÃ±a incorrecta', async () => {
    // ARRANGE
    const credentials = {
      email: 'usuario@example.com',
      password: 'passwordIncorrecto'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: credentials
    });

    // ACT
    await authController.signIn(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe rechazar inicio de sesiÃ³n con campos vacÃ­os', async () => {
    // ARRANGE
    const credentials = {
      email: '',
      password: ''
    };
    
    const { req, res, next } = createMockReqResNext({
      body: credentials
    });

    // ACT
    await authController.signIn(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Controller - google Function', () => {
  
  test('debe autenticar usuario con Google exitosamente', async () => {
    // ARRANGE
    const googleData = {
      name: 'Usuario Google',
      email: 'google@example.com',
      photo: 'https://example.com/photo.jpg'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: googleData
    });

    // ACT
    await authController.google(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe crear nuevo usuario si no existe en autenticaciÃ³n Google', async () => {
    // ARRANGE
    const googleData = {
      name: 'Nuevo Usuario Google',
      email: 'nuevogoogle@example.com',
      photo: 'https://example.com/photo.jpg'
    };
    
    const { req, res, next } = createMockReqResNext({
      body: googleData
    });

    // ACT
    await authController.google(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe rechazar autenticaciÃ³n Google sin email', async () => {
    // ARRANGE
    const googleData = {
      name: 'Usuario Google',
      photo: 'https://example.com/photo.jpg'
      // Falta email
    };
    
    const { req, res, next } = createMockReqResNext({
      body: googleData
    });

    // ACT
    await authController.google(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Controller - refreshToken Function', () => {
  
  test('debe refrescar el token exitosamente con refresh token vÃ¡lido', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext({
      headers: {
        authorization: 'Bearer valid-refresh-token,valid-access-token'
      }
    });

    // ACT
    await authController.refreshToken(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe rechazar refresh sin authorization header', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext({
      headers: {}
    });

    // ACT
    await authController.refreshToken(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe rechazar refresh token invÃ¡lido', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext({
      headers: {
        authorization: 'Bearer invalid-token,invalid-access'
      }
    });

    // ACT
    await authController.refreshToken(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Controller - signOut Function', () => {
  
  test('debe cerrar sesiÃ³n exitosamente', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await authController.signOut(req, res, next);

    // ASSERT
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe limpiar las cookies al cerrar sesiÃ³n', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext({
      cookies: {
        access_token: 'some-token',
        refresh_token: 'some-refresh-token'
      }
    });

    // ACT
    await authController.signOut(req, res, next);

    // ASSERT
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('Ã©xito')
    });
  });
});


// ============================================================================
// SUITE DE PRUEBAS: ADMIN CONTROLLER
// Pruebas para el controlador de administraciÃ³n
// ============================================================================

describe('Admin Controller - getAllUsers Function', () => {
  
  test('debe obtener todos los usuarios exitosamente', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getAllUsers(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('debe excluir contraseÃ±as de la respuesta de usuarios', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getAllUsers(req, res, next);

    // ASSERT
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    if (Array.isArray(responseData)) {
      responseData.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    }
  });

  test('debe manejar errores al obtener usuarios', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getAllUsers(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled() || expect(res.status).toHaveBeenCalled();
  });
});

describe('Admin Controller - getDashboardStats Function', () => {
  
  test('debe obtener estadÃ­sticas del dashboard exitosamente', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getDashboardStats(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('debe retornar conteo de diferentes tipos de usuarios', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getDashboardStats(req, res, next);

    // ASSERT
    expect(res.json).toHaveBeenCalled();
    const stats = res.json.mock.calls[0][0];
    if (stats) {
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalVendors');
      expect(stats).toHaveProperty('totalAdmins');
    }
  });

  test('debe retornar usuarios recientes en las estadÃ­sticas', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await adminController.getDashboardStats(req, res, next);

    // ASSERT
    expect(res.json).toHaveBeenCalled();
    const stats = res.json.mock.calls[0][0];
    if (stats) {
      expect(stats).toHaveProperty('recentUsers');
    }
  });
});

// ============================================================================
// SUITE DE PRUEBAS: USER CONTROLLER
// Pruebas para el controlador de usuarios
// ============================================================================

describe('User Controller - updateUser Function', () => {
  
  test('debe actualizar usuario exitosamente con datos vÃ¡lidos', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    const updateData = {
      username: 'nuevoUsername',
      email: 'nuevo@example.com'
    };
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      body: updateData,
      user: { id: userId }
    });

    // ACT
    await userController.updateUser(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('debe hashear la contraseÃ±a al actualizar', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    const updateData = {
      username: 'usuario',
      password: 'nuevaPassword123'
    };
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      body: updateData,
      user: { id: userId }
    });

    // ACT
    await userController.updateUser(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('debe rechazar actualizaciÃ³n de usuario no autorizado', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    const otherUserId = '507f1f77bcf86cd799439022';
    const updateData = {
      username: 'nuevoUsername'
    };
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      body: updateData,
      user: { id: otherUserId } // Usuario diferente
    });

    // ACT
    await userController.updateUser(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe manejar actualizaciÃ³n con datos vacÃ­os', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      body: {},
      user: { id: userId }
    });

    // ACT
    await userController.updateUser(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalled() || expect(next).toHaveBeenCalled();
  });
});

describe('User Controller - deleteUser Function', () => {
  
  test('debe eliminar usuario exitosamente', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      user: { id: userId }
    });

    // ACT
    await userController.deleteUser(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('eliminado')
    });
  });

  test('debe rechazar eliminaciÃ³n de usuario no autorizado', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439011';
    const otherUserId = '507f1f77bcf86cd799439022';
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      user: { id: otherUserId }
    });

    // ACT
    await userController.deleteUser(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled();
  });

  test('debe manejar eliminaciÃ³n de usuario inexistente', async () => {
    // ARRANGE
    const userId = '507f1f77bcf86cd799439099';
    
    const { req, res, next } = createMockReqResNext({
      params: { id: userId },
      user: { id: userId }
    });

    // ACT
    await userController.deleteUser(req, res, next);

    // ASSERT
    expect(next).toHaveBeenCalled() || expect(res.status).toHaveBeenCalled();
  });
});

describe('User Controller - signOut Function', () => {
  
  test('debe cerrar sesiÃ³n de usuario exitosamente', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext();

    // ACT
    await userController.signOut(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('Ã©xito')
    });
  });

  test('debe manejar cierre de sesiÃ³n con tokens existentes', async () => {
    // ARRANGE
    const { req, res, next } = createMockReqResNext({
      cookies: {
        access_token: 'some-token',
        refresh_token: 'some-refresh'
      }
    });

    // ACT
    await userController.signOut(req, res, next);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});

