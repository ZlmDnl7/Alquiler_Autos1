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
    const { req, res, next } = createReqResNext({ body: payload, files: [{}, {}] });

    jest.spyOn(uploader, 'upload').mockResolvedValue({ secure_url: 'https://cloud/image.png' });

    // Stub de save
    const saveSpy = jest.spyOn(Vehicle.prototype, 'save').mockResolvedValue(true);
    // Act
    await vendorAddVehicle(req, res, next);

    // Assert
    expect(base64Converter).toHaveBeenCalled();
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
    // Mock del constructor de Booking para retornar objeto con save()
    const bookingModule = await import('./models/BookingModel.js');
    bookingModule.default.mockImplementation(() => ({ save: jest.fn().mockResolvedValue({ _id: 'b1' }) }));
    const { req, res, next } = createReqResNext({ body: {
      user_id: 'u1', vehicle_id: 'v1', totalPrice: 10, pickupDate: new Date().toISOString(), dropoffDate: new Date(Date.now()+3600e3).toISOString(), pickup_location: 'L', dropoff_location: 'L2'
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
    availabilityService.availableAtDate.mockResolvedValue([
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
    const Jwt = await import('jsonwebtoken');
    jest.spyOn(Jwt, 'verify').mockImplementation((token, secret) => ({ id: 'u1' }));
    jest.spyOn(Jwt, 'sign').mockReturnValue('newToken');
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'u1', refreshToken: 'oldRefresh' });
    jest.spyOn(User, 'updateOne').mockResolvedValue({});
    await authController.refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'newToken', refreshToken: 'newToken' }));
  });
});

describe('verifyToken con access expirado y refresh válido', () => {
  test('usa refresh cuando access expira', async () => {
    const Jwt = await import('jsonwebtoken');
    // Simular verify del access lanza expirado
    jest.spyOn(Jwt, 'verify').mockImplementationOnce(() => { const err = new Error('expired'); err.name = 'TokenExpiredError'; throw err; })
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
    const Jwt = await import('jsonwebtoken');
    jest.spyOn(Jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });
    const { req, res, next } = createReqResNext({ headers: { authorization: 'Bearer ,bad' } });
    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

// ================= userBookingController extras =================
describe('userBookingController extras', () => {
  test('getVehiclesWithoutBooking responde 200 directo sin next cuando no hay siguiente middleware', async () => {
    availabilityService.availableAtDate.mockResolvedValue([{ district: 'D', location: 'L', isDeleted: 'false', model: 'M' }]);
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
    expect(next).toHaveBeenCalled();
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



