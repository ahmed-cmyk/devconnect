import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { channel as Channel } from '../src/models/channel.model';

let mongo: MongoMemoryServer;
let authToken: string;
let adminAuthToken: string;
let userId: string;
let adminUserId: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to in-memory MongoDB');

  // Register and login a regular user
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  });

  const userRes = await request(app).post('/api/auth/login').send({
    email: 'testuser@example.com',
    password: 'password123',
  });

  authToken = userRes.body.token;
  userId = userRes.body.user._id;

  // Register and login an admin user (for channel admin tests)
  await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'adminuser@example.com',
    password: 'adminpassword123',
  });

  const adminUserRes = await request(app).post('/api/auth/login').send({
    email: 'adminuser@example.com',
    password: 'adminpassword123',
  });

  adminAuthToken = adminUserRes.body.token;
  adminUserId = adminUserRes.body.user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Channel Routes', () => {
  // Clear the database before each test to ensure isolation
  beforeEach(async () => {
    await User.deleteMany({});
    await Channel.deleteMany({});
  });

  it('should create a new channel', async () => {
    const res = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Channel',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test Channel');
    expect(res.body.admins).toContain(userId);
    expect(res.body.members).toContain(userId);
  });

  it('should not create a channel without authentication', async () => {
    const res = await request(app)
      .post('/api/channels')
      .send({
        name: 'Unauthorized Channel',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });

  it('should not create a channel with invalid data', async () => {
    const res = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '', // Invalid name
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should get all channels', async () => {
    // Create a channel first
    await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Channel 1',
      });

    await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Channel 2',
      });

    const res = await request(app)
      .get('/api/channels')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Channel 1');
    expect(res.body[1].name).toBe('Channel 2');
  });

  it('should not get channels without authentication', async () => {
    const res = await request(app).get('/api/channels');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });

  it('should get a channel by ID', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Single Channel',
      });

    const channelId = createRes.body._id;

    const getRes = await request(app)
      .get(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('Single Channel');
  });

  it('should return 404 for a non-existent channel ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid-looking but non-existent ID
    const res = await request(app)
      .get(`/api/channels/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Channel not found');
  });

  it('should not get a channel by ID without authentication', async () => {
    const res = await request(app).get('/api/channels/someid'); // ID doesn't matter here

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });

  it('should update a channel as an admin', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Channel to Update',
      });

    const channelId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Updated Channel Name',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('Updated Channel Name');
  });

  it('should not update a channel as a non-admin user', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Admin Channel',
      });

    const channelId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${authToken}`) // Regular user token
      .send({
        name: 'Attempted Update',
      });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body).toHaveProperty('message', 'You are not an admin of this channel');
  });

  it('should not update a non-existent channel', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/channels/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Non Existent',
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Channel not found');
  });

  it('should not update a channel with invalid data', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Channel for Invalid Update',
      });

    const channelId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: '', // Invalid name
      });

    expect(updateRes.status).toBe(400);
    expect(updateRes.body).toHaveProperty('message');
  });

  it('should not update a channel without authentication', async () => {
    const res = await request(app)
      .put('/api/channels/someid')
      .send({
        name: 'No Auth Update',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });

  it('should delete a channel as an admin', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Channel to Delete',
      });

    const channelId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Channel deleted successfully');

    // Verify channel is actually deleted
    const getRes = await request(app)
      .get(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);
    expect(getRes.status).toBe(404);
  });

  it('should not delete a channel as a non-admin user', async () => {
    const createRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Admin Channel for Delete',
      });

    const channelId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/channels/${channelId}`)
      .set('Authorization', `Bearer ${authToken}`); // Regular user token

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body).toHaveProperty('message', 'You are not an admin of this channel');
  });

  it('should not delete a non-existent channel', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/channels/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Channel not found');
  });

  it('should not delete a channel without authentication', async () => {
    const res = await request(app).delete('/api/channels/someid');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });
});
