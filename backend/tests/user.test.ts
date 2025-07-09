import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/user.model';

let mongo: MongoMemoryServer;
let token: string;
let userId: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to in-memory MongoDB');

  // Register a user for testing user routes
  await request(app).post('/api/auth/register').send({
    name: 'test user',
    email: 'testuser@example.com',
    password: 'password123'
  });

  // Login the user to get the token
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'testuser@example.com',
    password: 'password123'
  });
  token = loginRes.body.token;
  console.log('login body', loginRes.body);
  userId = loginRes.body.user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('User Routes', () => {
  it('should get user profile', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', userId);
    expect(res.body.email).toBe('testuser@example.com');
  });

  it('should not get user profile without token', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`);

    expect(res.status).toBe(401);
  });

  it('should not get user profile with invalid token', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.status).toBe(401);
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'updated user',
        email: 'updateduser@example.com'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'updated user');
    expect(res.body).toHaveProperty('email', 'updateduser@example.com');
  });

  it('should not update user profile with invalid data', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email'
      });

    expect(res.status).toBe(400);
  });

  it('should not update user profile without token', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        name: 'another user'
      });

    expect(res.status).toBe(401);
  });

  it('should not update user profile with invalid token', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer invalidtoken`)
      .send({
        name: 'another user'
      });

    expect(res.status).toBe(401);
  });
});
