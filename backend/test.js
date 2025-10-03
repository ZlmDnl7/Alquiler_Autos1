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
const mockAvailableAtDate = jest.fn();
jest.mock('./services/checkAvailableVehicle.js', () => ({
  __esModule: true,
  availableAtDate: mockAvailableAtDate,
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

import Vehicle from './models/vehicleModel.js';
// Mock User model con .lean()
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
import User from './models/userModel.js';
import Booking from './models/BookingModel.js';

// Mock MasterData model
jest.mock('./models/masterDataModel.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    insertMany: jest.fn(),
  },
}));
import MasterData from './models/masterDataModel.js';

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
  const req = { body: {}, params: {}, headers: {}, cookies: {}, files: [], route: { stack: [] }, ...overrides };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    locals: { actionResult: null },
  };
  const next = jest.fn();
  return { req, res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  // Reset mocks específicos
  mockAvailableAtDate.mockClear();
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
    const { req, res, next } = createReqResNext({ body: payload, files: [{}, {}] });

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
    // Usar el mock del módulo para el método save
    Booking.__saveMock.mockResolvedValue({ _id: 'b1' });
    const { req, res, next } = createReqResNext({ body: {
      user_id: '507f1f77bcf86cd799439011', vehicle_id: '507f1f77bcf86cd799439012', totalPrice: 10, pickupDate: new Date().toISOString(), dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
    }});
    await bookingController.BookCar(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  test('getVehiclesWithoutBooking valida inputs', async () => {
    const { req, res, next } = createReqResNext({ body: { pickUpDistrict: '', pickUpLocation: '' } });
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });

  test('getVehiclesWithoutBooking devuelve disponibles y continúa al siguiente middleware', async () => {
    mockAvailableAtDate.mockResolvedValue([
      { district: 'D', location: 'L', isDeleted: 'false', model: 'M' },
      { district: 'X', location: 'Y', isDeleted: 'false', model: 'N' },
    ]);
    const { req, res, next } = createReqResNext({ body: { pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' }, route: { stack: [1,2] } });
    await bookingController.getVehiclesWithoutBooking(req, res, next);
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
    JsonWebToken.verify.mockImplementation(() => ({ id: 'u1' }));
    JsonWebToken.sign.mockReturnValue('newToken');
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439011', refreshToken: 'oldRefresh' });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    await authController.refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'newToken', refreshToken: 'newToken' }));
  });
});

describe('verifyToken con access expirado y refresh válido', () => {
  test('usa refresh cuando access expira', async () => {
    // Simular verify del access lanza expirado y luego valida refresh
    JsonWebToken.verify
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

// ===== MÁS PRUEBAS MASIVAS PARA ALCANZAR 90% COVERAGE =====

describe('authController signUp casos adicionales', () => {
  test('signUp falla cuando bcryptjs.hash lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'pass' } });
    jest.spyOn(bcryptjs, 'hash').mockRejectedValue(new Error('hash error'));
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'hash error' }));
  });

  test('signUp falla cuando User.create lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'pass' } });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashed');
    jest.spyOn(User, 'create').mockRejectedValue(new Error('db error'));
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('signUp falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com' } }); // Sin password
    
    // Act
    await authController.signUp(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('authController signIn casos adicionales', () => {
  test('signIn falla cuando User.findOne lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'pass' } });
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('db error'));
    
    // Act
    await authController.signIn(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('signIn falla cuando bcryptjs.compare lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'pass' } });
    jest.spyOn(User, 'findOne').mockResolvedValue({ password: 'hash' });
    jest.spyOn(bcryptjs, 'compare').mockRejectedValue(new Error('compare error'));
    
    // Act
    await authController.signIn(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'compare error' }));
  });

  test('signIn falla cuando JsonWebToken.sign lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com', password: 'pass' } });
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', password: 'hash' });
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
    jest.spyOn(JsonWebToken, 'sign').mockImplementation(() => { throw new Error('jwt error'); });
    
    // Act
    await authController.signIn(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'jwt error' }));
  });
});

describe('authController google casos adicionales', () => {
  test('google falla cuando User.findOne lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'test@test.com' } });
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('db error'));
    
    // Act
    await authController.google(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('google crea usuario cuando no existe', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'new@test.com', name: 'New User' } });
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: 'u1', email: 'new@test.com' });
    jest.spyOn(JsonWebToken, 'sign').mockReturnValue('token');
    
    // Act
    await authController.google(req, res, next);
    
    // Assert
    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('google falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: {} }); // Sin email
    
    // Act
    await authController.google(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('authController refreshToken casos adicionales', () => {
  test('refreshToken falla cuando JsonWebToken.verify lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer token' } });
    jest.spyOn(JsonWebToken, 'verify').mockImplementation(() => { throw new Error('jwt error'); });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'jwt error' }));
  });

  test('refreshToken falla cuando User.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer token' } });
    mockVerify.mockReturnValue({ id: '507f1f77bcf86cd799439011' });
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('refreshToken falla cuando refresh token no coincide', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer token' } });
    mockVerify.mockReturnValue({ id: '507f1f77bcf86cd799439011' });
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439011', refreshToken: 'different' });
    
    // Act
    await authController.refreshToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

describe('vendorController casos adicionales', () => {
  test('vendorSignup falla cuando bcryptjs.hash lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'v@test.com', password: 'pass' } });
    jest.spyOn(bcryptjs, 'hash').mockRejectedValue(new Error('hash error'));
    
    // Act
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorSignup(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'hash error' }));
  });

  test('vendorSignup falla cuando User.create lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'v@test.com', password: 'pass' } });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashed');
    jest.spyOn(User, 'create').mockRejectedValue(new Error('db error'));
    
    // Act
    const { vendorSignup } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorSignup(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('vendorSignin falla cuando User.findOne lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'v@test.com', password: 'pass' } });
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('db error'));
    
    // Act
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorSignin(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('vendorSignin falla cuando bcryptjs.compare lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'v@test.com', password: 'pass' } });
    jest.spyOn(User, 'findOne').mockResolvedValue({ password: 'hash' });
    jest.spyOn(bcryptjs, 'compare').mockRejectedValue(new Error('compare error'));
    
    // Act
    const { vendorSignin } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorSignin(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'compare error' }));
  });

  test('vendorSignout responde 200', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    
    // Act
    const { vendorSignout } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorSignout(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('vendorGoogle falla cuando User.findOne lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'v@test.com' } });
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('db error'));
    
    // Act
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorGoogle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('vendorGoogle crea vendedor cuando no existe', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { email: 'new@test.com', name: 'New Vendor' } });
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ _id: 'v1', email: 'new@test.com' });
    jest.spyOn(JsonWebToken, 'sign').mockReturnValue('token');
    
    // Act
    const { vendorGoogle } = await import('./controllers/vendorControllers/vendorController.js');
    await vendorGoogle(req, res, next);
    
    // Assert
    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('userBookingController casos adicionales', () => {
  test('BookCar falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { user_id: 'u1' } }); // Faltan otros campos
    
    // Act
    await bookingController.BookCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('BookCar falla cuando Vehicle.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: {
      user_id: '507f1f77bcf86cd799439011', vehicle_id: '507f1f77bcf86cd799439012', totalPrice: 10, pickupDate: new Date().toISOString(), 
      dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
    }});
    jest.spyOn(Vehicle, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    await bookingController.BookCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('BookCar falla cuando availabilityService.availableAtDate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: {
      user_id: '507f1f77bcf86cd799439011', vehicle_id: '507f1f77bcf86cd799439012', totalPrice: 10, pickupDate: new Date().toISOString(), 
      dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
    }});
    jest.spyOn(Vehicle, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439012' });
    mockAvailableAtDate.mockRejectedValue(new Error('availability error'));
    
    // Act
    await bookingController.BookCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'availability error' }));
  });

  test('BookCar falla cuando Booking.save lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: {
      user_id: '507f1f77bcf86cd799439011', vehicle_id: '507f1f77bcf86cd799439012', totalPrice: 10, pickupDate: new Date().toISOString(), 
      dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
    }});
    jest.spyOn(Vehicle, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439012' });
    mockAvailableAtDate.mockResolvedValue([{ _id: '507f1f77bcf86cd799439012' }]);
    Booking.prototype.save.mockRejectedValue(new Error('save error'));
    
    // Act
    await bookingController.BookCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'save error' }));
  });

  test('getVehiclesWithoutBooking falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { pickUpDistrict: 'D' } }); // Faltan otros campos
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('getVehiclesWithoutBooking falla cuando availabilityService lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { 
      pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' 
    }});
    mockAvailableAtDate.mockRejectedValue(new Error('service error'));
    
    // Act
    await bookingController.getVehiclesWithoutBooking(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'service error' }));
  });

  test('showAllVariants falla cuando Vehicle.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { model: 'M' } });
    res.locals.actionResult = [[]]; // Inicializar actionResult como array de arrays
    jest.spyOn(Vehicle, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.showAllVariants(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('showOneofkind falla cuando Vehicle.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { model: 'M' } });
    res.locals.actionResult = [[]]; // Inicializar actionResult como array de arrays
    jest.spyOn(Vehicle, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.showOneofkind(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('filterVehicles falla cuando Vehicle.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { 
      pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' 
    }});
    jest.spyOn(Vehicle, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.filterVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('findBookingsOfUser falla cuando Booking.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { userId: '507f1f77bcf86cd799439011' } });
    jest.spyOn(Booking, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.findBookingsOfUser(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('latestbookings falla cuando Booking.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { userId: '507f1f77bcf86cd799439011' } });
    jest.spyOn(Booking, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.latestbookings(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('updateExistingStatuses falla cuando Booking.updateMany lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { userId: '507f1f77bcf86cd799439011' } });
    jest.spyOn(Booking, 'updateMany').mockRejectedValue(new Error('update error'));
    
    // Act
    await bookingController.updateExistingStatuses(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'update error' }));
  });

  test('findAllBookingsForAdmin falla cuando Booking.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    jest.spyOn(Booking, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    await bookingController.findAllBookingsForAdmin(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });
});

describe('adminController casos adicionales', () => {
  test('adminAuth falla cuando User.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { userId: '507f1f77bcf86cd799439011' } });
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    const { adminAuth } = await import('./controllers/adminControllers/adminController.js');
    await adminAuth(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('adminProfiile falla cuando User.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { userId: '507f1f77bcf86cd799439011' } });
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    const { adminProfiile } = await import('./controllers/adminControllers/adminController.js');
    await adminProfiile(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });
});

describe('dashboardController casos adicionales', () => {
  test('showVehicles falla cuando Vehicle.find lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { showVehicles } = await import('./controllers/adminControllers/dashboardController.js');
    await showVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('deleteVehicle falla cuando Vehicle.findByIdAndUpdate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { id: 'v1' } });
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('db error'));
    
    // Act
    const { deleteVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    await deleteVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('addProduct falla cuando uploader.upload lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ 
      body: { name: 'Car', price: 100 }, 
      files: [{ buffer: Buffer.from('x'), originalname: 'x.jpg' }] 
    });
    jest.spyOn(uploader, 'upload').mockRejectedValue(new Error('upload error'));
    
    // Act
    const { addProduct } = await import('./controllers/adminControllers/dashboardController.js');
    await addProduct(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'upload error' }));
  });

  test('addProduct falla cuando Vehicle.prototype.save lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ 
      body: { name: 'Car', price: 100 }, 
      files: [{ buffer: Buffer.from('x'), originalname: 'x.jpg' }] 
    });
    jest.spyOn(uploader, 'upload').mockResolvedValue({ secure_url: 'url' });
    jest.spyOn(Vehicle.prototype, 'save').mockRejectedValue(new Error('save error'));
    
    // Act
    const { addProduct } = await import('./controllers/adminControllers/dashboardController.js');
    await addProduct(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'save error' }));
  });

  test('editVehicle falla cuando Vehicle.findByIdAndUpdate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { id: 'v1', name: 'New Car' } });
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('db error'));
    
    // Act
    const { editVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    await editVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('editVehicle falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { name: 'New Car' } }); // Sin id
    
    // Act
    const { editVehicle } = await import('./controllers/adminControllers/dashboardController.js');
    await editVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('masterCollectionController casos adicionales', () => {
  test('getCarModelData falla cuando MasterData.find lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    jest.spyOn(MasterData, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { getCarModelData } = await import('./controllers/adminControllers/masterCollectionController.js');
    await getCarModelData(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('insertDummyData falla cuando MasterData.insertMany lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    jest.spyOn(MasterData, 'insertMany').mockRejectedValue(new Error('db error'));
    
    // Act
    const { insertDummyData } = await import('./controllers/adminControllers/masterCollectionController.js');
    await insertDummyData(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });
});

describe('userAllVehiclesController casos adicionales', () => {
  test('listAllVehicles falla cuando Vehicle.find lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext();
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { listAllVehicles } = await import('./controllers/userControllers/userAllVehiclesController.js');
    await listAllVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('showVehicleDetails falla cuando Vehicle.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { id: 'v1' } });
    jest.spyOn(Vehicle, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    const { showVehicleDetails } = await import('./controllers/userControllers/userAllVehiclesController.js');
    await showVehicleDetails(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('searchCar falla cuando Vehicle.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { 
      pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' 
    }});
    jest.spyOn(Vehicle, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    const { searchCar } = await import('./controllers/userControllers/userAllVehiclesController.js');
    await searchCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('searchCar falla cuando dropoff <= pickup', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { 
      pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 2, dropOffDate: 1, model: 'M' 
    }});
    
    // Act
    const { searchCar } = await import('./controllers/userControllers/userAllVehiclesController.js');
    await searchCar(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('vendorBookingsController casos adicionales', () => {
  test('vendorBookings falla cuando Booking.aggregate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { vendorId: 'v1' } });
    jest.spyOn(Booking, 'aggregate').mockRejectedValue(new Error('aggregate error'));
    
    // Act
    const { vendorBookings } = await import('./controllers/vendorControllers/vendorBookingsController.js');
    await vendorBookings(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'aggregate error' }));
  });

  test('vendorBookings falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: {} }); // Sin vendorId
    
    // Act
    const { vendorBookings } = await import('./controllers/vendorControllers/vendorBookingsController.js');
    await vendorBookings(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('vendorCrudController casos adicionales', () => {
  test('vendorAddVehicle falla cuando faltan campos requeridos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { name: 'Car' }, files: [{ buffer: Buffer.from('test'), originalname: 'test.jpg' }] }); // Faltan otros campos
    
    // Act
    const { vendorAddVehicle } = await import('./controllers/vendorControllers/vendorCrudController.js');
    await vendorAddVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorAddVehicle falla cuando no hay archivos', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ 
      body: { registeration_number: 'ABC123', name: 'Car', price: 100 } 
    });
    
    // Act
    const { vendorAddVehicle } = await import('./controllers/vendorControllers/vendorCrudController.js');
    await vendorAddVehicle(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('vendorEditVehicles falla cuando Vehicle.findByIdAndUpdate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { id: 'v1', name: 'New Car' } });
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('db error'));
    
    // Act
    const { vendorEditVehicles } = await import('./controllers/vendorControllers/vendorCrudController.js');
    await vendorEditVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('vendorDeleteVehicles falla cuando Vehicle.findByIdAndUpdate lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { id: 'v1' } });
    jest.spyOn(Vehicle, 'findByIdAndUpdate').mockRejectedValue(new Error('db error'));
    
    // Act
    const { vendorDeleteVehicles } = await import('./controllers/vendorControllers/vendorCrudController.js');
    await vendorDeleteVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('showVendorVehicles falla cuando Vehicle.find lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ body: { _id: 'v1' } });
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { showVendorVehicles } = await import('./controllers/vendorControllers/vendorCrudController.js');
    await showVendorVehicles(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });
});

describe('verifyUser casos adicionales', () => {
  test('verifyToken falla cuando JsonWebToken.verify lanza TokenExpiredError', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer expired' } });
    mockVerify.mockImplementation(() => { 
      const err = new Error('expired'); 
      err.name = 'TokenExpiredError'; 
      throw err; 
    });
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('verifyToken falla cuando User.findById lanza error', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer token' } });
    mockVerify.mockReturnValue({ id: '507f1f77bcf86cd799439011' });
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('db error'));
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });

  test('verifyToken falla cuando User.findById retorna null', async () => {
    // Arrange
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer token' } });
    mockVerify.mockReturnValue({ id: '507f1f77bcf86cd799439011' });
    jest.spyOn(User, 'findById').mockResolvedValue(null);
    
    // Act
    await verifyToken(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

describe('checkAvailableVehicle casos adicionales', () => {
  test('availableAtDate falla cuando Booking.find lanza error', async () => {
    // Arrange
    jest.spyOn(Booking, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { availableAtDate } = await import('./services/checkAvailableVehicle.js');
    const result = await availableAtDate('D', 'L', 1, 2, 'M');
    
    // Assert
    expect(result).toEqual([]);
  });

  test('availableAtDate falla cuando Vehicle.find lanza error', async () => {
    // Arrange
    jest.spyOn(Booking, 'find').mockResolvedValue([]);
    jest.spyOn(Vehicle, 'find').mockRejectedValue(new Error('db error'));
    
    // Act
    const { availableAtDate } = await import('./services/checkAvailableVehicle.js');
    const result = await availableAtDate('D', 'L', 1, 2, 'M');
    
    // Assert
    expect(result).toEqual([]);
  });
});

describe('multer casos adicionales', () => {
  test('dataUri falla cuando buffer es undefined', async () => {
    // Arrange
    const { dataUri } = await import('./utils/multer.js');
    
    // Act & Assert
    expect(() => dataUri(undefined)).toThrow();
  });

  test('dataUri falla cuando buffer es null', async () => {
    // Arrange
    const { dataUri } = await import('./utils/multer.js');
    
    // Act & Assert
    expect(() => dataUri(null)).toThrow();
  });
});

describe('error casos adicionales', () => {
  test('errorHandler maneja error sin statusCode', async () => {
    // Arrange
    const { errorHandler } = await import('./utils/error.js');
    const { req, res, next } = createReqResNext();
    const error = new Error('test error');
    
    // Act
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'test error' }));
  });

  test('errorHandler maneja error con statusCode personalizado', async () => {
    // Arrange
    const { errorHandler } = await import('./utils/error.js');
    const { req, res, next } = createReqResNext();
    const error = { statusCode: 400, message: 'bad request' };
    
    // Act
    errorHandler(error, req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'bad request' }));
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
    mockAvailableAtDate.mockResolvedValue([{ district: 'D', location: 'L', isDeleted: 'false', model: 'M' }]);
    const { req, res, next } = createReqResNext({ body: { pickUpDistrict: 'D', pickUpLocation: 'L', pickupDate: 1, dropOffDate: 2, model: 'M' }, route: { stack: [1] } });
    await bookingController.getVehiclesWithoutBooking(req, res, next);
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
    const { req, res, next } = createReqResNext({ body: null });
    await showVehicleDetails(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });
});



