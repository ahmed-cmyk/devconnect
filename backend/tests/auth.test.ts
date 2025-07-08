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
    const res = await request(app).post('/auth/register').send({
      name: 'john doe',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should allow users to login', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
