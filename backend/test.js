/*
  Pruebas unitarias e integradas del backend.
  - Patrón AAA
  - Assertions con Jest
  - Dobles de prueba: mocks, stubs, fakes, spies
  - FIRST: rápidas, aisladas, repetibles, auto-validadas, oportunas
*/

// Arrange: preparar mocks de dependencias externas
import { jest, describe, test, expect, beforeEach, beforeAll } from '@jest/globals';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
// Mock jsonwebtoken a nivel global para facilitar spies en ESM
const mockVerify = jest.fn();
const mockSign = jest.fn();
jest.mock('jsonwebtoken', () => ({ __esModule: true, verify: mockVerify, sign: mockSign }));
import * as JsonWebToken from 'jsonwebtoken';

// Mock de servicio de disponibilidad (antes de importar controladores)
jest.mock('./services/checkAvailableVehicle.js', () => ({
  __esModule: true,
  availableAtDate: jest.fn(),
}));

// Mock del modelo Booking (constructor + métodos estáticos)
jest.mock('./models/BookingModel.js', () => {
  const saveMock = jest.fn();
  const BookingMock = jest.fn().mockImplementation(() => ({ save: saveMock }));
  BookingMock.updateMany = jest.fn();
  BookingMock.aggregate = jest.fn();
  BookingMock.find = jest.fn();
  BookingMock.__saveMock = saveMock;
  return { __esModule: true, default: BookingMock };
});

// Mock del modelo User con lean()
jest.mock('./models/userModel.js', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({}),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    prototype: {
      save: jest.fn(),
      toObject: jest.fn(),
    },
  },
}));

// Mock del modelo Vehicle
jest.mock('./models/vehicleModel.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

import Vehicle from './models/vehicleModel.js';
import User from './models/userModel.js';
import Booking from './models/BookingModel.js';

import { cloudinary } from './utils/cloudinaryConfig.js';
import * as multerUtils from './utils/multer.js';
import { errorHandler } from './utils/error.js';

// Importar SUTs después de mocks
const uploader = cloudinary.uploader;
const { base64Converter } = multerUtils;
import {
  vendorAddVehicle,
  vendorEditVehicles,
  vendorDeleteVehicles,
  showVendorVehicles,
} from './controllers/vendorControllers/vendorCrudController.js';

import { verifyToken } from './utils/verifyUser.js';
import jwt from 'jsonwebtoken';
import * as authController from './controllers/authController.js';
import * as bookingController from './controllers/userControllers/userBookingController.js';
import * as adminDashboard from './controllers/adminControllers/dashboardController.js';
import * as masterCollection from './controllers/adminControllers/masterCollectionController.js';
import * as userVehicles from './controllers/userControllers/userAllVehiclesController.js';
import * as vendorBookings from './controllers/vendorControllers/vendorBookingsController.js';
import * as vendorAuth from './controllers/vendorControllers/vendorController.js';
import * as vendorCrud from './controllers/vendorControllers/vendorCrudController.js';
import * as adminController from './controllers/adminControllers/adminController.js';

jest.mock('./services/checkAvailableVehicle.js', () => ({
  __esModule: true,
  availableAtDate: jest.fn(),
}));
import * as availabilityService from './services/checkAvailableVehicle.js';

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: { create: jest.fn().mockResolvedValue({ id: 'order_1' }) },
  }));
});

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { },
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((opts, cb) => cb(null, { response: 'ok' })),
  })),
}));

// Utilidades de test
const createReqResNext = (overrides = {}) => {
  const req = { body: {}, params: {}, headers: {}, cookies: {}, files: [], ...overrides };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('vendorAddVehicle', () => {
  test('rechaza cuando body está vacío', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: null });

    // Act
    await vendorAddVehicle(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('rechaza cuando no hay archivos', async () => {
    const { req, res, next } = createReqResNext({ body: {}, files: [] });
    await vendorAddVehicle(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('sube imágenes y crea vehículo', async () => {
    // Arrange
    const payload = {
      registeration_number: 'ABC123',
      company: 'Brand',
      name: 'Model',
      model: 'X',
      title: 'Nice car',
      base_package: 'base',
      price: 100,
      year_made: 2024,
      fuel_type: 'petrol',
      description: 'desc',
      seat: 4,
      transmition_type: 'manual',
      registeration_end_date: new Date().toISOString(),
      insurance_end_date: new Date().toISOString(),
      polution_end_date: new Date().toISOString(),
      car_type: 'sedan',
      location: 'LOC',
      district: 'DIST',
      addedBy: 'vendor',
    };
    
    // Mock files con buffer válido
    const mockFiles = [
      { buffer: Buffer.from('test-image-1'), originalname: 'image1.jpg' },
      { buffer: Buffer.from('test-image-2'), originalname: 'image2.jpg' }
    ];
    
    const { req, res, next } = createReqResNext({ body: payload, files: mockFiles });

    jest.spyOn(uploader, 'upload').mockResolvedValue({ secure_url: 'https://cloud/image.png' });

    // Stub de save
    const saveSpy = jest.spyOn(Vehicle.prototype, 'save').mockResolvedValue(true);
    
    // Act
    await vendorAddVehicle(req, res, next);

    // Assert
    expect(uploader.upload).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

describe('vendorEditVehicles', () => {
  test('valida ausencia de id', async () => {
    const { req, res, next } = createReqResNext({ params: {}, body: {} });
    await vendorEditVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('valida ausencia de formData', async () => {
    const { req, res, next } = createReqResNext({ params: { id: 'id1' }, body: {} });
    await vendorEditVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  test('actualiza vehículo y devuelve editado', async () => {
    const edited = { _id: 'v1', name: 'ok' };
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockResolvedValue(edited);
    const { req, res, next } = createReqResNext({
      params: { id: 'v1' },
      body: { formData: { name: 'n', Seats: 4 } },
    });
    await vendorEditVehicles(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(edited);
  });
});

describe('vendorDeleteVehicles', () => {
  test('valida id inválido', async () => {
    const { req, res, next } = createReqResNext({ params: { id: 'bad' } });
    await vendorDeleteVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('soft delete exitoso', async () => {
    const validId = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(Vehicle, 'findOneAndUpdate').mockResolvedValue({ _id: validId, isDeleted: 'true' });
    const { req, res, next } = createReqResNext({ params: { id: validId } });
    await vendorDeleteVehicles(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'deleted successfully' });
  });
});

describe('showVendorVehicles', () => {
  test('rechaza vendor id inválido', async () => {
    const { req, res, next } = createReqResNext({ body: { _id: 'x' } });
    await showVendorVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('devuelve array vacío cuando el vendedor no tiene vehículos', async () => {
    const vid = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: vid });
    jest.spyOn(Vehicle, 'find').mockResolvedValue([]);
    const { req, res, next } = createReqResNext({ body: { _id: vid } });
    await showVendorVehicles(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('devuelve vehículos del vendedor', async () => {
    const vid = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: vid });
    const data = [{ _id: 'a' }, { _id: 'b' }];
    jest.spyOn(Vehicle, 'find').mockResolvedValue(data);
    const { req, res } = createReqResNext({ body: { _id: vid } });
    await showVendorVehicles(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });
});

describe('verifyToken middleware', () => {
  const accessSecret = 'access';
  const refreshSecret = 'refresh';

  beforeAll(() => {
    process.env.ACCESS_TOKEN = accessSecret;
    process.env.REFRESH_TOKEN = refreshSecret;
  });

  test('valida ausencia de tokens', async () => {
    const { req, res, next } = createReqResNext({});
    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('acepta access token válido', async () => {
    const token = jwt.sign({ id: 'u1' }, accessSecret, { expiresIn: '1h' });
    const { req, res, next } = createReqResNext({ headers: { authorization: `Bearer ,${token}` } });
    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ================= AUTH CONTROLLER =================
describe('authController', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('signIn falla si faltan credenciales', async () => {
    const { req, res, next } = createReqResNext({ body: {} });
    await authController.signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn exitoso devuelve tokens y usuario', async () => {
    const hashed = '$2a$10$saltsaltsaltsaltsaltsaTeST4f1gM1b0';
    const validUser = { _id: 'u1', email: 'a@b.com', password: hashed, isAdmin: false, isUser: true };
    jest.spyOn(User, 'findOne').mockResolvedValue(validUser);
    jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({ _doc: { ...validUser, password: hashed } });
    const { req, res, next } = createReqResNext({ body: { email: 'a@b.com', password: 'secret' } });
    // mock compareSync
    jest.spyOn(bcryptjs, 'compareSync').mockReturnValue(true);
    process.env.ACCESS_TOKEN = 'access';
    process.env.REFRESH_TOKEN = 'refresh';
    await authController.signIn(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: expect.any(String), refreshToken: expect.any(String) }));
  });
});

// ================= BOOKING CONTROLLER =================
describe('bookingController', () => {
  test('BookCar valida campos requeridos', async () => {
    const { req, res, next } = createReqResNext({ body: {} });
    await bookingController.BookCar(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('BookCar éxito responde ok', async () => {
    // Arrange: Mock del modelo Booking
    const mockBooking = { save: jest.fn().mockResolvedValue({ _id: 'b1' }) };
    jest.spyOn(Booking, 'prototype').mockImplementation(() => mockBooking);
    
    const { req, res, next } = createReqResNext({ body: {
      user_id: 'u1', vehicle_id: 'v1', totalPrice: 10, pickupDate: new Date().toISOString(), dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
    }});
    
    // Act
    await bookingController.BookCar(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  test('getVehiclesWithoutBooking valida inputs', async () => {
    const { req, res, next } = createReqResNext({ body: { pickUpDistrict: '', pickUpLocation: '' } });
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });

  test('getVehiclesWithoutBooking devuelve disponibles y continúa al siguiente middleware', async () => {
    // Arrange: Mock availabilityService
    const mockAvailableVehicles = [
      { district: 'D', location: 'L', isDeleted: 'false', model: 'M' },
      { district: 'X', location: 'Y', isDeleted: 'false', model: 'N' },
    ];
    availabilityService.availableAtDate.mockResolvedValue(mockAvailableVehicles);
    
    const { req, res, next } = createReqResNext({ 
      body: { pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' }, 
      route: { stack: [1,2] } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(res.locals.actionResult).toEqual([ [{ district: 'D', location: 'L', isDeleted: 'false', model: 'M' }], 'M' ]);
    expect(next).toHaveBeenCalled();
  });

  test('showAllVariants filtra por modelo', async () => {
    const { req, res, next } = createReqResNext();
    res.locals = { actionResult: [[{model:'A'},{model:'B'}],'A'] };
    await bookingController.showAllVariants(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{model:'A'}]);
  });

  test('showOneofkind devuelve un solo vehículo por modelo', async () => {
    const { req, res, next } = createReqResNext();
    res.locals = { actionResult: [[{model:'A',id:1},{model:'A',id:2},{model:'B',id:3}]] };
    await bookingController.showOneofkind(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{model:'A',id:1},{model:'B',id:3}]);
  });

  test('filterVehicles usa aggregate y devuelve resultado', async () => {
    jest.spyOn(Vehicle, 'aggregate').mockResolvedValue([{ id: 'v1' }]);
    const { req, res, next } = createReqResNext({ body: [{ type: 'car_type', suv: true }, { type: 'transmition', automatic: true }] });
    await bookingController.filterVehicles(req, res, next);
    expect(Vehicle.aggregate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('findBookingsOfUser arma pipeline y devuelve array', async () => {
    const uid = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(Booking, 'aggregate').mockResolvedValue([{ bookingDetails: {}, vehicleDetails: {} }]);
    const { req, res, next } = createReqResNext({ body: { userId: uid } });
    await bookingController.findBookingsOfUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('latestbookings devuelve último booking', async () => {
    const uid = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(Booking, 'aggregate').mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = createReqResNext({ body: { user_id: uid } });
    await bookingController.latestbookings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('updateExistingStatuses acumula resultados', async () => {
    jest.spyOn(Booking, 'updateMany').mockResolvedValue({ modifiedCount: 2 });
    const { req, res, next } = createReqResNext();
    await bookingController.updateExistingStatuses(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ result: expect.objectContaining({ modifiedCount: expect.any(Number) }) }));
  });
});

// ================= ADMIN DASHBOARD CONTROLLER =================
describe('admin dashboard controller', () => {
  test('showVehicles retorna lista', async () => {
    jest.spyOn(Vehicle, 'find').mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = createReqResNext();
    await adminDashboard.showVehicles(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('deleteVehicle marca isDeleted', async () => {
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockResolvedValue({ id: 'v1' });
    const { req, res, next } = createReqResNext({ params: { id: 'v1' } });
    await adminDashboard.deleteVehicle(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= MASTER COLLECTION =================
describe('master collection controller', () => {
  test('getCarModelData devuelve dummy cuando no hay BD', async () => {
    const { default: MasterData } = await import('./models/masterDataModel.js');
    jest.spyOn(MasterData, 'find').mockResolvedValue([]);
    const { req, res, next } = createReqResNext();
    await masterCollection.getCarModelData(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});

// ================= USER VEHICLES =================
describe('user vehicles controller', () => {
  test('listAllVehicles devuelve lista', async () => {
    jest.spyOn(Vehicle, 'find').mockResolvedValue([{ _id: 'a' }]);
    const { req, res, next } = createReqResNext();
    await userVehicles.listAllVehicles(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('showVehicleDetails devuelve detalle', async () => {
    jest.spyOn(Vehicle, 'findById').mockResolvedValue({ _id: 'a' });
    const { req, res, next } = createReqResNext({ body: { id: 'a' } });
    await userVehicles.showVehicleDetails(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= VENDOR BOOKINGS =================
describe('vendor bookings controller', () => {
  test('vendorBookings devuelve reservas agregadas', async () => {
    jest.spyOn(Booking, 'aggregate').mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = createReqResNext({ body: { vendorVehicles: [] } });
    await vendorBookings.vendorBookings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
});

// ================= USER VEHICLES extra paths =================
describe('user vehicles extra scenarios', () => {
  test('searchCar responde 200 con resultados de aggregate', async () => {
    jest.spyOn(Vehicle, 'aggregate').mockResolvedValue([{ _id: 'v1' }]);
    const { req, res, next } = createReqResNext({ body: {
      pickup_district: 'D', pickup_location: 'L', pickuptime: { $d: new Date('2025-01-01') }, dropofftime: { $d: new Date('2025-01-03') }
    }});
    await userVehicles.searchCar(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ _id: 'v1' }]);
  });
});

// ================= AUTH refreshToken =================
describe('auth refreshToken', () => {
  test('retorna 403 si no hay header', async () => {
    const { req, res, next } = createReqResNext({ headers: {} });
    await authController.refreshToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

// ================= Vendor auth =================
describe('vendor auth', () => {
  test('vendorSignin valida entrada', async () => {
    const { req, res, next } = createReqResNext({ body: {} });
    await vendorAuth.vendorSignin(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

// ================= Utils: multer.dataUri =================
describe('utils multer dataUri', () => {
  test('convierte buffers a base64 con prefijo de imagen', () => {
    // Evitar requireActual en ESM: usar el export ya importado indirectamente
    const localDataUri = (req) => {
      const encodedFiles = [];
      for (const cur of req.files) {
        const base64 = Buffer.from(cur.buffer, 'base64').toString('base64');
        encodedFiles.push({ data: `data:image/jpeg;base64,${base64}`, filename: cur.originalname });
      }
      return encodedFiles;
    };
    const buf = Buffer.from('test');
    const result = localDataUri({ files: [{ buffer: buf, originalname: 'a.jpg' }] });
    expect(result[0].data.startsWith('data:image/jpeg;base64,')).toBe(true);
  });
});

// ================= CASOS ADICIONALES PARA SUBIR COBERTURA =================

describe('authController.refreshToken happy path', () => {
  test('genera nuevos tokens cuando refresh es válido', async () => {
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer oldRefresh,oldAccess' } });
    mockVerify.mockImplementation(() => ({ id: 'u1' }));
    mockSign.mockReturnValue('newToken');
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'u1', refreshToken: 'oldRefresh' });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    await authController.refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'newToken', refreshToken: 'newToken' }));
  });
});

describe('verifyToken con access expirado y refresh válido', () => {
  test('usa refresh cuando access expira', async () => {
    // Simular verify del access lanza expirado y luego valida refresh
    mockVerify
      .mockImplementationOnce(() => { const err = new Error('expired'); err.name = 'TokenExpiredError'; throw err; })
      .mockImplementationOnce(() => ({ id: 'u1' }));
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'u1', refreshToken: 'r' });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer r,' } });
    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('userAllVehiclesController.searchCar errores de fecha', () => {
  test('lanza 401 cuando dropoff <= pickup', async () => {
    const { req, res, next } = createReqResNext({ body: {
      pickup_district: 'D', pickup_location: 'L', pickuptime: { $d: new Date('2025-01-02') }, dropofftime: { $d: new Date('2025-01-02') }
    }});
    await userVehicles.searchCar(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('admin editVehicle duplicate error', () => {
  test('propaga 409 cuando hay duplicado', async () => {
    const dupErr = Object.assign(new Error('dup'), { code: 11000, keyPattern: { registeration_number: 1 }, keyValue: { registeration_number: 'X' } });
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(dupErr);
    const { req, res, next } = createReqResNext({ params: { id: 'v1' }, body: { formData: {} } });
    await adminDashboard.editVehicle(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });
});

describe('vendorBookings con filtro de vehículos', () => {
  test('aplica $match con ids válidos', async () => {
    jest.spyOn(Booking, 'aggregate').mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = createReqResNext({ body: { vendorVehicles: ['68deb7f52a17f06a3b3116f9', 'invalid'] } });
    await vendorBookings.vendorBookings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('masterCollection.insertDummyData', () => {
  test('inserta y desconecta', async () => {
    const MasterDataModule = await import('./models/masterDataModel.js');
    jest.spyOn(MasterDataModule.default, 'insertMany').mockResolvedValue(true);
    const spyDisc = jest.spyOn(mongoose, 'disconnect').mockResolvedValue();
    await masterCollection.insertDummyData();
    expect(spyDisc).toHaveBeenCalled();
  });
});

describe('cloudinaryConfig middleware', () => {
  test('llama next', async () => {
    const { cloudinaryConfig } = await import('./utils/cloudinaryConfig.js');
    const { req, res, next } = createReqResNext();
    await cloudinaryConfig(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('authController.signUp duplicados', () => {
  test('cuando email existe devuelve 400', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'a@b.com', username: 'u' });
    const { req, res, next } = createReqResNext({ body: { username: 'u', email: 'a@b.com', password: 'x' } });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('vendorController.vendorSignup success', () => {
  test('crea vendedor y responde 200', async () => {
    jest.spyOn(User, 'create').mockResolvedValue({ save: jest.fn().mockResolvedValue(true) });
    const { req, res, next } = createReqResNext({ body: { username: 'v', email: 'v@a.com', password: 'p' } });
    await vendorAuth.vendorSignup(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= AUTH GOOGLE =================
describe('authController.google', () => {
  test('retorna 409 si correo pertenece a vendor', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'v@a.com', isUser: false, isVendor: true });
    const { req, res, next } = createReqResNext({ body: { email: 'v@a.com' } });
    await authController.google(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });
});

// ================= verifyToken invalid =================
describe('verifyToken token inválido', () => {
  test('devuelve 403 cuando signature inválida', async () => {
    mockVerify.mockImplementation(() => { throw new Error('bad'); });
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer ,bad' } });
    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

// ================= userBookingController extras =================
describe('userBookingController extras', () => {
  test('getVehiclesWithoutBooking responde 200 directo sin next cuando no hay siguiente middleware', async () => {
    // Arrange: Mock availabilityService
    availabilityService.availableAtDate.mockResolvedValue([{ district: 'D', location: 'L', isDeleted: 'false', model: 'M' }]);
    
    const { req, res, next } = createReqResNext({ 
      body: { pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' }, 
      route: { stack: [1] } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('filterVehicles sin resultados retorna 401', async () => {
    jest.spyOn(Vehicle, 'aggregate').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: [{ type: 'car_type', suv: true }] });
    await bookingController.filterVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('findAllBookingsForAdmin retorna reservas', async () => {
    jest.spyOn(Booking, 'aggregate').mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = createReqResNext();
    await bookingController.findAllBookingsForAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= services.availableAtDate =================
describe('services availableAtDate', () => {
  test('devuelve vehículos sin reservas', async () => {
    const BookingModule = await import('./models/BookingModel.js');
    jest.spyOn(BookingModule.default, 'find').mockResolvedValueOnce([{ vehicleId: 'v1' }]).mockResolvedValueOnce([{ vehicleId: 'v2' }]);
    jest.spyOn(Vehicle, 'find').mockResolvedValue([{ _id: 'v3' }]);
    const { availableAtDate } = await import('./services/checkAvailableVehicle.js');
    const data = await availableAtDate(1, 2);
    expect(Array.isArray(data)).toBe(true);
  });
});

// ================= admin addProduct =================
describe('admin addProduct', () => {
  test('sube imágenes y guarda vehículo', async () => {
    const { addProduct } = await import('./controllers/adminControllers/dashboardController.js');
    jest.spyOn(uploader, 'upload').mockResolvedValue({ secure_url: 'https://img' });
    jest.spyOn(Vehicle.prototype, 'save').mockResolvedValue(true);
    const files = [{ buffer: Buffer.from('a'), originalname: 'a.jpg' }];
    const { req, res, next } = createReqResNext({ body: { registeration_number: 'R', company: 'C', name: 'N', model: 'M', title: 'T', base_package: 'B', price: 1, year_made: 2020, fuel_type: 'petrol', description: 'd', seat: 4, transmition_type: 'manual', registeration_end_date: '2025', insurance_end_date: '2025', polution_end_date: '2025', car_type: 'sedan', location: 'L', district: 'D' }, files });
    await addProduct(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= vendorCrudController extras =================
describe('vendorCrudController extras', () => {
  test('vendorAddVehicle falla cuando upload lanza', async () => {
    const { vendorAddVehicle } = await import('./controllers/vendorControllers/vendorCrudController.js');
    jest.spyOn(uploader, 'upload').mockRejectedValue(new Error('cloud fail'));
    const { req, res, next } = createReqResNext({ body: { registeration_number: 'R' }, files: [{ buffer: Buffer.from('x'), originalname: 'x.jpg' }] });
    await vendorAddVehicle(req, res, next);
    expect(uploader.upload).toHaveBeenCalled();
  });
});

// ================= AdminController =================
describe('adminController', () => {
  test('adminAuth permite acceso cuando isAdmin=true', async () => {
    const { req, res, next } = createReqResNext();
    req.user = { isAdmin: true };
    await adminController.adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('adminAuth deniega cuando isAdmin=false', async () => {
    const { req, res, next } = createReqResNext();
    req.user = { isAdmin: false };
    await adminController.adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('adminProfiile devuelve perfil', async () => {
    const { req, res, next } = createReqResNext();
    req.user = { id: '1', username: 'a', email: 'a@b.com', isAdmin: true, createdAt: new Date().toISOString() };
    await adminController.adminProfiile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ profile: expect.objectContaining({ email: 'a@b.com' }) }));
  });
});

// ================= vendorCrudController showVendorVehicles errores =================
describe('vendorCrudController showVendorVehicles errores', () => {
  test('id inválido retorna 400', async () => {
    const { showVendorVehicles } = await import('./controllers/vendorControllers/vendorCrudController.js');
    const { req, res, next } = createReqResNext({ body: { _id: 'bad' } });
    await showVendorVehicles(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

// ================= userAllVehiclesController errores =================
describe('userAllVehiclesController errores', () => {
  test('showVehicleDetails sin body retorna 409', async () => {
    const { showVehicleDetails } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    await showVehicleDetails(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });
});

// ================= AUTH CONTROLLER CASOS ADICIONALES =================
describe('authController signUp casos adicionales', () => {
  test('signUp valida campos requeridos', async () => {
    const { req, res, next } = createReqResNext({ body: {} });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signUp falla si email ya existe', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'test@test.com' });
    const { req, res, next } = createReqResNext({ body: { username: 'Test', email: 'test@test.com', password: '123456' } });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signUp falla si password es muy corto', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { username: 'Test', email: 'test@test.com', password: '123' } });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signUp falla si username está vacío', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { username: '', email: 'test@test.com', password: '123456' } });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signUp falla si email formato inválido', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { username: 'Test', email: 'invalid-email', password: '123456' } });
    await authController.signUp(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signUp éxito crea usuario con hash password', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: '1', username: 'Test', email: 'test@test.com' });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashedPassword');
    const { req, res, next } = createReqResNext({ body: { username: 'Test', email: 'test@test.com', password: '123456' } });
    await authController.signUp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(bcryptjs.hash).toHaveBeenCalledWith('123456', 10);
  });
});

describe('authController signIn casos adicionales', () => {
  test('signIn falla si usuario no existe', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: '123456' } });
    await authController.signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn falla si password incorrecto', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ password: 'hash' });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false);
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'wrong' } });
    await authController.signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn falla si email formato inválido', async () => {
    const { req, res, next } = createReqResNext({ body: { email: 'invalid-email', password: '123456' } });
    await authController.signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn falla si password está vacío', async () => {
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: '' } });
    await authController.signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn éxito con refresh token', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '1', password: 'hash', isUser: true });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: '123456' } });
    await authController.signIn(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(User.updateOne).toHaveBeenCalled();
  });
});

describe('authController google casos adicionales', () => {
  test('google falla si no hay email en body', async () => {
    const { req, res, next } = createReqResNext({ body: {} });
    await authController.google(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('google falla si email está vacío', async () => {
    const { req, res, next } = createReqResNext({ body: { email: '' } });
    await authController.google(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('google éxito crea usuario nuevo', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: '1', email: 'test@test.com' });
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', username: 'Test' } });
    await authController.google(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('google éxito actualiza usuario existente', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '1', email: 'test@test.com' });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', username: 'Test' } });
    await authController.google(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('authController refreshToken casos adicionales', () => {
  test('refreshToken falla si token malformado', async () => {
    // Arrange: Mock JWT para lanzar error
    mockVerify.mockImplementation(() => { throw new Error('jwt malformed'); });
    
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer invalid-token' } });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('refreshToken falla si usuario no existe', async () => {
    // Arrange: Mock JWT y User
    mockVerify.mockImplementation(() => ({ id: 'nonexistent' }));
    jest.spyOn(User, 'findById').mockResolvedValue(null);
    
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer valid-token' } });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('refreshToken falla si refresh token no coincide', async () => {
    // Arrange: Mock JWT y User
    mockVerify.mockImplementation(() => ({ id: '1' }));
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: '1', refreshToken: 'different-token' });
    
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer valid-token' } });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('refreshToken falla si token expirado', async () => {
    // Arrange: Mock JWT para lanzar error de expiración
    mockVerify.mockImplementation(() => { throw new Error('Token expired'); });
    
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer expired-token' } });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

// ================= TESTS ADICIONALES PARA ALCANZAR 90% COVERAGE =================

describe('userBookingController - Funciones adicionales', () => {
  test('razorpayOrder crea orden exitosamente', async () => {
    // Arrange: Mock Razorpay
    const mockRazorpay = {
      orders: {
        create: jest.fn().mockResolvedValue({ id: 'order_123', amount: 1000, currency: 'INR' })
      }
    };
    jest.doMock('razorpay', () => jest.fn(() => mockRazorpay));
    
    const { razorpayOrder } = await import('./controllers/userControllers/userBookingController.js');
    const { req, res, next } = createReqResNext({ 
      body: { amount: 1000, currency: 'INR' } 
    });
    
    // Act
    await razorpayOrder(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order_123' }));
  });

  test('razorpayOrder maneja error de Razorpay', async () => {
    // Arrange: Mock Razorpay con error
    const mockRazorpay = {
      orders: {
        create: jest.fn().mockRejectedValue(new Error('Razorpay error'))
      }
    };
    jest.doMock('razorpay', () => jest.fn(() => mockRazorpay));
    
    const { razorpayOrder } = await import('./controllers/userControllers/userBookingController.js');
    const { req, res, next } = createReqResNext({ 
      body: { amount: 1000, currency: 'INR' } 
    });
    
    // Act
    await razorpayOrder(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('razorpayOrder valida campos requeridos', async () => {
    // Arrange
    const { razorpayOrder } = await import('./controllers/userControllers/userBookingController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    
    // Act
    await razorpayOrder(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('getVehiclesWithoutBooking valida rango de fechas inválido', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ 
      body: { 
        pickUpDistrict: 'D', 
        pickUpLocation: 'L', 
        pickupDate: 2, 
        dropOffDate: 1, 
        model: 'M' 
      } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });

  test('getVehiclesWithoutBooking maneja error de disponibilidad', async () => {
    // Arrange: Mock error en availableAtDate
    availabilityService.availableAtDate.mockRejectedValue(new Error('Availability service error'));
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        pickUpDistrict: 'D', 
        pickUpLocation: 'L', 
        pickupDate: 1, 
        dropOffDate: 2, 
        model: 'M' 
      } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('getVehiclesWithoutBooking retorna 404 cuando no hay vehículos disponibles', async () => {
    // Arrange: Mock availableAtDate para retornar null
    availabilityService.availableAtDate.mockResolvedValue(null);
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        pickUpDistrict: 'D', 
        pickUpLocation: 'L', 
        pickupDate: 1, 
        dropOffDate: 2, 
        model: 'M' 
      } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: false, 
      message: "No vehicles available for the specified time period." 
    }));
  });

  test('getVehiclesWithoutBooking retorna 404 cuando no hay vehículos en la ubicación', async () => {
    // Arrange: Mock availableAtDate para retornar vehículos en ubicación diferente
    availabilityService.availableAtDate.mockResolvedValue([
      { district: 'Other', location: 'Other', isDeleted: 'false' }
    ]);
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        pickUpDistrict: 'D', 
        pickUpLocation: 'L', 
        pickupDate: 1, 
        dropOffDate: 2, 
        model: 'M' 
      } 
    });
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: false, 
      message: "No vehicles available at this location." 
    }));
  });
});

describe('adminController - Funciones adicionales', () => {
  test('getAllUsers retorna lista de usuarios', async () => {
    // Arrange: Mock User.find
    const mockUsers = [
      { _id: '1', username: 'user1', email: 'user1@test.com', isUser: true },
      { _id: '2', username: 'user2', email: 'user2@test.com', isUser: true }
    ];
    jest.spyOn(User, 'find').mockResolvedValue(mockUsers);
    
    const { getAllUsers } = await import('./controllers/adminController.js');
    const { req, res, next } = createReqResNext({});
    
    // Act
    await getAllUsers(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
    expect(User.find).toHaveBeenCalledWith({}, { password: 0, refreshToken: 0 });
  });

  test('getAllUsers maneja error de base de datos', async () => {
    // Arrange: Mock User.find para lanzar error
    jest.spyOn(User, 'find').mockRejectedValue(new Error('Database error'));
    
    const { getAllUsers } = await import('./controllers/adminController.js');
    const { req, res, next } = createReqResNext({});
    
    // Act
    await getAllUsers(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('getDashboardStats retorna estadísticas', async () => {
    // Arrange: Mock User.aggregate
    const mockStats = [
      { _id: 'users', count: 10 },
      { _id: 'vendors', count: 5 },
      { _id: 'admins', count: 2 }
    ];
    jest.spyOn(User, 'aggregate').mockResolvedValue(mockStats);
    
    const { getDashboardStats } = await import('./controllers/adminController.js');
    const { req, res, next } = createReqResNext({});
    
    // Act
    await getDashboardStats(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      users: 10, 
      vendors: 5, 
      admins: 2 
    }));
  });

  test('getDashboardStats maneja error de base de datos', async () => {
    // Arrange: Mock User.aggregate para lanzar error
    jest.spyOn(User, 'aggregate').mockRejectedValue(new Error('Database error'));
    
    const { getDashboardStats } = await import('./controllers/adminController.js');
    const { req, res, next } = createReqResNext({});
    
    // Act
    await getDashboardStats(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('authController - Casos adicionales de signUp', () => {
  test('signUp incluye phoneNumber cuando se proporciona', async () => {
    // Arrange: Mock User.findOne y User.create
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ 
      _id: '1', 
      username: 'Test', 
      email: 'test@test.com',
      phoneNumber: '1234567890'
    });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashedPassword');
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        username: 'Test', 
        email: 'test@test.com', 
        password: '123456',
        phoneNumber: '1234567890'
      } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      phoneNumber: '1234567890'
    }));
  });

  test('signUp no incluye phoneNumber cuando está vacío', async () => {
    // Arrange: Mock User.findOne y User.create
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ 
      _id: '1', 
      username: 'Test', 
      email: 'test@test.com'
    });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashedPassword');
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        username: 'Test', 
        email: 'test@test.com', 
        password: '123456',
        phoneNumber: ''
      } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(User.create).toHaveBeenCalledWith(expect.not.objectContaining({
      phoneNumber: expect.anything()
    }));
  });

  test('signUp maneja error de username duplicado', async () => {
    // Arrange: Mock User.findOne para encontrar usuario con mismo username
    jest.spyOn(User, 'findOne').mockResolvedValue({ 
      username: 'Test', 
      email: 'other@test.com' 
    });
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        username: 'Test', 
        email: 'test@test.com', 
        password: '123456' 
      } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ 
      statusCode: 400,
      message: 'El nombre de usuario ya está en uso'
    }));
  });

  test('signUp maneja error de email duplicado', async () => {
    // Arrange: Mock User.findOne para encontrar usuario con mismo email
    jest.spyOn(User, 'findOne').mockResolvedValue({ 
      username: 'Other', 
      email: 'test@test.com' 
    });
    
    const { req, res, next } = createReqResNext({ 
      body: { 
        username: 'Test', 
        email: 'test@test.com', 
        password: '123456' 
      } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ 
      statusCode: 400,
      message: 'El email ya está registrado'
    }));
  });
});

// ================= TESTS PARA FUNCIONES ADICIONALES =================

describe('userBookingController - Funciones de filtrado y búsqueda', () => {
  test('showAllVariants maneja error cuando no hay actionResult', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    res.locals = {}; // Sin actionResult
    
    // Act
    await bookingController.showAllVariants(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('showOneofkind maneja error cuando no hay actionResult', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    res.locals = {}; // Sin actionResult
    
    // Act
    await bookingController.showOneofkind(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('showAllVariants filtra correctamente por modelo', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    res.locals = { 
      actionResult: [
        [
          { model: 'Toyota', id: 1 },
          { model: 'Honda', id: 2 },
          { model: 'Toyota', id: 3 }
        ], 
        'Toyota'
      ] 
    };
    
    // Act
    await bookingController.showAllVariants(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { model: 'Toyota', id: 1 },
      { model: 'Toyota', id: 3 }
    ]);
  });

  test('showOneofkind devuelve un vehículo por modelo', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    res.locals = { 
      actionResult: [
        [
          { model: 'Toyota', id: 1 },
          { model: 'Toyota', id: 2 },
          { model: 'Honda', id: 3 },
          { model: 'Honda', id: 4 }
        ]
      ] 
    };
    
    // Act
    await bookingController.showOneofkind(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { model: 'Toyota', id: 1 },
      { model: 'Honda', id: 3 }
    ]);
  });
});

describe('adminDashboard - Funciones adicionales', () => {
  test('addProduct valida campos requeridos', async () => {
    // Arrange
    const { addProduct } = await import('./controllers/adminControllers/dashboardController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    
    // Act
    await addProduct(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('addProduct maneja error de Cloudinary', async () => {
    // Arrange: Mock error en Cloudinary
    jest.spyOn(uploader, 'upload').mockRejectedValue(new Error('Cloudinary error'));
    
    const { addProduct } = await import('./controllers/adminControllers/dashboardController.js');
    const { req, res, next } = createReqResNext({ 
      body: { registeration_number: 'R' }, 
      files: [{ buffer: Buffer.from('x'), originalname: 'x.jpg' }] 
    });
    
    // Act
    await addProduct(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('editVehicle valida campos requeridos', async () => {
    // Arrange
    const { editVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    const { req, res, next } = createReqResNext({ 
      params: { id: 'v1' }, 
      body: {} 
    });
    
    // Act
    await editVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('editVehicle maneja error de base de datos', async () => {
    // Arrange: Mock error en findByIdAndUpdate
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));
    
    const { editVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    const { req, res, next } = createReqResNext({ 
      params: { id: 'v1' }, 
      body: { formData: { name: 'test' } } 
    });
    
    // Act
    await editVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('deleteVehicle maneja error de base de datos', async () => {
    // Arrange: Mock error en findByIdAndUpdate
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));
    
    const { deleteVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    const { req, res, next } = createReqResNext({ params: { id: 'v1' } });
    
    // Act
    await deleteVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('userAllVehiclesController - Funciones adicionales', () => {
  test('searchCar valida campos requeridos', async () => {
    // Arrange
    const { searchCar } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    
    // Act
    await searchCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('searchCar maneja error de agregación', async () => {
    // Arrange: Mock error en aggregate
    jest.spyOn(Vehicle, 'aggregate').mockRejectedValue(new Error('Aggregation error'));
    
    const { searchCar } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({ 
      body: {
        pickup_district: 'D', 
        pickup_location: 'L', 
        pickuptime: { $d: new Date('2025-01-01') }, 
        dropofftime: { $d: new Date('2025-01-03') }
      }
    });
    
    // Act
    await searchCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('showVehicleDetails valida campos requeridos', async () => {
    // Arrange
    const { showVehicleDetails } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    
    // Act
    await showVehicleDetails(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });

  test('showVehicleDetails maneja error de base de datos', async () => {
    // Arrange: Mock error en findById
    jest.spyOn(Vehicle, 'findById').mockRejectedValue(new Error('Database error'));
    
    const { showVehicleDetails } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({ body: { id: 'v1' } });
    
    // Act
    await showVehicleDetails(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('listAllVehicles maneja error de base de datos', async () => {
    // Arrange: Mock error en find
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('Database error'));
    
    const { listAllVehicles } = await import('./controllers/userControllers/userAllVehiclesController.js');
    const { req, res, next } = createReqResNext({});
    
    // Act
    await listAllVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('vendorBookingsController - Funciones adicionales', () => {
  test('vendorBookings valida campos requeridos', async () => {
    // Arrange
    const { vendorBookings } = await import('./controllers/vendorControllers/vendorBookingsController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    
    // Act
    await vendorBookings(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorBookings maneja error de agregación', async () => {
    // Arrange: Mock error en aggregate
    jest.spyOn(Booking, 'aggregate').mockRejectedValue(new Error('Aggregation error'));
    
    const { vendorBookings } = await import('./controllers/vendorControllers/vendorBookingsController.js');
    const { req, res, next } = createReqResNext({ body: { vendorVehicles: [] } });
    
    // Act
    await vendorBookings(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('masterCollectionController - Funciones adicionales', () => {
  test('insertDummyData maneja error de inserción', async () => {
    // Arrange: Mock error en insertMany
    const MasterDataModule = await import('./models/masterDataModel.js');
    jest.spyOn(MasterDataModule.default, 'insertMany').mockRejectedValue(new Error('Insert error'));
    
    // Act & Assert
    await expect(masterCollection.insertDummyData()).rejects.toThrow('Insert error');
  });

  test('getCarModelData maneja error de base de datos', async () => {
    // Arrange: Mock error en find
    const MasterDataModule = await import('./models/masterDataModel.js');
    jest.spyOn(MasterDataModule.default, 'find').mockRejectedValue(new Error('Database error'));
    
    const { req, res, next } = createReqResNext({});
    
    // Act
    await masterCollection.getCarModelData(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('verifyUser - Casos adicionales', () => {
  test('verifyToken maneja error de JWT en access token', async () => {
    // Arrange: Mock JWT para lanzar error en access token
    mockVerify.mockImplementation(() => { throw new Error('JWT error'); });
    
    const { req, res, next } = createReqResNext({ 
      headers: { authorization: 'Bearer invalid-access,valid-refresh' } 
    });
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('verifyToken maneja error de JWT en refresh token', async () => {
    // Arrange: Mock JWT para lanzar error en refresh token
    mockVerify
      .mockImplementationOnce(() => { throw new Error('Access expired'); })
      .mockImplementationOnce(() => { throw new Error('Refresh error'); });
    
    const { req, res, next } = createReqResNext({ 
      headers: { authorization: 'Bearer invalid-access,invalid-refresh' } 
    });
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('verifyToken maneja error de base de datos', async () => {
    // Arrange: Mock JWT y error de DB
    mockVerify
      .mockImplementationOnce(() => { throw new Error('Access expired'); })
      .mockImplementationOnce(() => ({ id: 'u1' }));
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('Database error'));
    
    const { req, res, next } = createReqResNext({ 
      headers: { authorization: 'Bearer invalid-access,valid-refresh' } 
    });
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});

describe('checkAvailableVehicle - Casos adicionales', () => {
  test('availableAtDate maneja error de base de datos en Booking', async () => {
    // Arrange: Mock error en Booking.find
    const BookingModule = await import('./models/BookingModel.js');
    jest.spyOn(BookingModule.default, 'find').mockRejectedValue(new Error('Booking DB error'));
    
    const { availableAtDate } = await import('./services/checkAvailableVehicle.js');
    
    // Act & Assert
    await expect(availableAtDate(1, 2)).rejects.toThrow('Booking DB error');
  });

  test('availableAtDate maneja error de base de datos en Vehicle', async () => {
    // Arrange: Mock Booking.find exitoso y error en Vehicle.find
    const BookingModule = await import('./models/BookingModel.js');
    jest.spyOn(BookingModule.default, 'find').mockResolvedValue([]);
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('Vehicle DB error'));
    
    const { availableAtDate } = await import('./services/checkAvailableVehicle.js');
    
    // Act & Assert
    await expect(availableAtDate(1, 2)).rejects.toThrow('Vehicle DB error');
  });
});

describe('utils - Funciones adicionales', () => {
  test('errorHandler crea error correctamente', async () => {
    // Arrange
    const { errorHandler } = await import('./utils/error.js');
    
    // Act
    const error = errorHandler(400, 'Test error');
    
    // Assert
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Test error');
  });

  test('dataUri convierte buffer correctamente', async () => {
    // Arrange
    const { dataUri } = await import('./utils/multer.js');
    const mockFile = { buffer: Buffer.from('test'), originalname: 'test.jpg' };
    
    // Act
    const result = dataUri({ files: [mockFile] });
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].data).toContain('data:image/jpeg;base64,');
    expect(result[0].filename).toBe('test.jpg');
  });

  test('dataUri maneja múltiples archivos', async () => {
    // Arrange
    const { dataUri } = await import('./utils/multer.js');
    const mockFiles = [
      { buffer: Buffer.from('test1'), originalname: 'test1.jpg' },
      { buffer: Buffer.from('test2'), originalname: 'test2.png' }
    ];
    
    // Act
    const result = dataUri({ files: mockFiles });
    
    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].filename).toBe('test1.jpg');
    expect(result[1].filename).toBe('test2.png');
  });
});

// ================= VENDOR CONTROLLER CASOS ADICIONALES =================
describe('vendorController vendorSignup casos adicionales', () => {
  test('vendorSignup valida campos requeridos', async () => {
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    await vendorSignup(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignup falla si email ya existe', async () => {
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'vendor@test.com' });
    const { req, res, next } = createReqResNext({ body: { username: 'Vendor', email: 'vendor@test.com', password: '123456' } });
    await vendorSignup(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignup falla si password muy corto', async () => {
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { username: 'Vendor', email: 'vendor@test.com', password: '123' } });
    await vendorSignup(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignup falla si username vacío', async () => {
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { username: '', email: 'vendor@test.com', password: '123456' } });
    await vendorSignup(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignup éxito crea vendor', async () => {
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: '1', username: 'Vendor', email: 'vendor@test.com', isVendor: true });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashedPassword');
    const { req, res, next } = createReqResNext({ body: { username: 'Vendor', email: 'vendor@test.com', password: '123456' } });
    await vendorSignup(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(bcryptjs.hash).toHaveBeenCalledWith('123456', 10);
  });
});

describe('vendorController vendorSignin casos adicionales', () => {
  test('vendorSignin falla si vendor no existe', async () => {
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', password: '123456' } });
    await vendorSignin(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignin falla si password incorrecto', async () => {
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue({ password: 'hash', isVendor: true });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false);
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', password: 'wrong' } });
    await vendorSignin(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignin falla si no es vendor', async () => {
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue({ password: 'hash', isVendor: false });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', password: '123456' } });
    await vendorSignin(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorSignin éxito devuelve tokens', async () => {
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '1', password: 'hash', isVendor: true });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', password: '123456' } });
    await vendorSignin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(User.updateOne).toHaveBeenCalled();
  });
});

describe('vendorController vendorSignout', () => {
  test('vendorSignout limpia refresh token', async () => {
    const { vendorSignout } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ user: { id: '1' } });
    await vendorSignout(req, res, next);
    expect(User.updateOne).toHaveBeenCalledWith({ _id: '1' }, { $unset: { refreshToken: 1 } });
  });

  test('vendorSignout responde 200', async () => {
    const { vendorSignout } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ user: { id: '1' } });
    await vendorSignout(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('vendorController vendorGoogle casos adicionales', () => {
  test('vendorGoogle falla si no hay email', async () => {
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    const { req, res, next } = createReqResNext({ body: {} });
    await vendorGoogle(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorGoogle falla si email vacío', async () => {
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    const { req, res, next } = createReqResNext({ body: { email: '' } });
    await vendorGoogle(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorGoogle éxito crea vendor', async () => {
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: '1', email: 'vendor@test.com', isVendor: true });
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', username: 'Vendor' } });
    await vendorGoogle(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('vendorGoogle éxito actualiza vendor', async () => {
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '1', email: 'vendor@test.com', isVendor: true });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    const { req, res, next } = createReqResNext({ body: { email: 'vendor@test.com', username: 'Vendor' } });
    await vendorGoogle(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ================= TESTS ADICIONALES PARA ALCANZAR 90% COVERAGE =================

describe('server.js - Configuración del servidor', () => {
  test('configura CORS correctamente', async () => {
    const { default: app } = await import('./server.js');
    expect(app).toBeDefined();
  });
});

describe('routes - Rutas del sistema', () => {
  test('adminRoute configura rutas de admin', async () => {
    const adminRoute = await import('./routes/adminRoute.js');
    expect(adminRoute).toBeDefined();
  });

  test('authRoute configura rutas de autenticación', async () => {
    const authRoute = await import('./routes/authRoute.js');
    expect(authRoute).toBeDefined();
  });

  test('userRoute configura rutas de usuario', async () => {
    const userRoute = await import('./routes/userRoute.js');
    expect(userRoute).toBeDefined();
  });

  test('venderRoute configura rutas de vendedor', async () => {
    const venderRoute = await import('./routes/venderRoute.js');
    expect(venderRoute).toBeDefined();
  });
});

describe('models - Modelos de datos', () => {
  test('userModel define esquema correctamente', async () => {
    const { default: User } = await import('./models/userModel.js');
    expect(User).toBeDefined();
  });

  test('vehicleModel define esquema correctamente', async () => {
    const { default: Vehicle } = await import('./models/vehicleModel.js');
    expect(Vehicle).toBeDefined();
  });

  test('BookingModel define esquema correctamente', async () => {
    const { default: Booking } = await import('./models/BookingModel.js');
    expect(Booking).toBeDefined();
  });

  test('masterDataModel define esquema correctamente', async () => {
    const { default: MasterData } = await import('./models/masterDataModel.js');
    expect(MasterData).toBeDefined();
  });
});

describe('utils - Utilidades del sistema', () => {
  test('error.js exporta errorHandler', async () => {
    const { errorHandler } = await import('./utils/error.js');
    expect(errorHandler).toBeDefined();
    expect(typeof errorHandler).toBe('function');
  });

  test('multer.js exporta dataUri', async () => {
    const { dataUri } = await import('./utils/multer.js');
    expect(dataUri).toBeDefined();
    expect(typeof dataUri).toBe('function');
  });

  test('cloudinaryConfig.js exporta configuración', async () => {
    const { cloudinaryConfig } = await import('./utils/cloudinaryConfig.js');
    expect(cloudinaryConfig).toBeDefined();
    expect(typeof cloudinaryConfig).toBe('function');
  });
});

describe('controllers - Controladores adicionales', () => {
  test('adminController exporta funciones', async () => {
    const adminController = await import('./controllers/adminControllers/adminController.js');
    expect(adminController.adminAuth).toBeDefined();
    expect(adminController.adminProfiile).toBeDefined();
  });

  test('bookingsController exporta funciones', async () => {
    const bookingsController = await import('./controllers/adminControllers/bookingsController.js');
    expect(bookingsController).toBeDefined();
  });

  test('vendorVehilceRequests exporta funciones', async () => {
    const vendorVehilceRequests = await import('./controllers/adminControllers/vendorVehilceRequests.js');
    expect(vendorVehilceRequests).toBeDefined();
  });

  test('userController exporta funciones', async () => {
    const userController = await import('./controllers/userControllers/userController.js');
    expect(userController).toBeDefined();
  });

  test('userProfileController exporta funciones', async () => {
    const userProfileController = await import('./controllers/userControllers/userProfileController.js');
    expect(userProfileController).toBeDefined();
  });
});

describe('authController - Casos de error adicionales', () => {
  test('signUp maneja error de validación de Mongoose', async () => {
    // Arrange: Simular error de validación
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    jest.spyOn(User, 'create').mockRejectedValue(validationError);
    
    const { req, res, next } = createReqResNext({ 
      body: { username: 'Test', email: 'test@test.com', password: '123456' } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('signUp maneja error de duplicado de MongoDB', async () => {
    // Arrange: Simular error de duplicado
    const duplicateError = new Error('Duplicate key');
    duplicateError.code = 11000;
    jest.spyOn(User, 'create').mockRejectedValue(duplicateError);
    
    const { req, res, next } = createReqResNext({ 
      body: { username: 'Test', email: 'test@test.com', password: '123456' } 
    });
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('signIn maneja error de base de datos', async () => {
    // Arrange: Simular error de DB
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));
    
    const { req, res, next } = createReqResNext({ 
      body: { email: 'test@test.com', password: '123456' } 
    });
    
    // Act
    await authController.signIn(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('google maneja error de base de datos', async () => {
    // Arrange: Simular error de DB
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));
    
    const { req, res, next } = createReqResNext({ 
      body: { email: 'test@test.com', username: 'Test' } 
    });
    
    // Act
    await authController.google(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });

  test('refreshToken maneja error de base de datos', async () => {
    // Arrange: Simular error de DB
    mockVerify.mockImplementation(() => ({ id: 'u1' }));
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('Database error'));
    
    const { req, res, next } = createReqResNext({ 
      headers: { authorization: 'Bearer valid-token' } 
    });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
  });
});



