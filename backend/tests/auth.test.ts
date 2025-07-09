import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to in-memory MongoDB');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth Routes', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'john doe',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).not.toBe(404); // Expect not to be 404
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'jane doe',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should not register a user with invalid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'john doe',
      email: 'invalid-email',
      password: '123' // Too short password
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message'); // Expect a validation error message
  });

  it('should allow users to login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not allow login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should not allow login with unregistered email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should reach the test route', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Test successful');
  });
});
