const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const { signToken } = require("../src/services/tokenService")
import Activity, { ActivityState } from '../src/models/activity';
const app = require('../src/app');

describe('Admin Activities API', () => {
  let mongoServer: any;
  let mongoUri: string;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    
});
  beforeEach(async () => {
    await Activity.deleteMany({});
    token = signToken({ userId: "1", isAdmin: true })
  });

  describe('POST /api/admin/activity', () => {
    it('should return an error when a non-logged in user tries to add a new activity', async () => {
      const mockActivity = {
        name: 'Activity 1',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      };

      const response = await request(app)
        .post('/api/admin/activity')
        .send(mockActivity);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Usuario debe registrarse');

      const savedActivity = await Activity.findOne({ name: 'Activity 1' });
      expect(savedActivity).toBeNull();
    });
    it('should register a new activity', async () => {
      const mockActivity = {
        name: 'Activity 1',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      };

      const response = await request(app)
        .post('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(mockActivity);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Actividad registrada correctamente');

      const savedActivity = await Activity.findOne({ name: 'Activity 1' });
      expect(savedActivity).not.toBeNull();
    });
    it('should return an error when required fields are missing', async () => {
      const mockActivity = {
        name: 'Activity 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      };

      const response = await request(app)
        .post('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(mockActivity);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Error al registrar la actividad. Faltan datos requeridos');
    });
    it('should return an error when a user without admin role tries to add a new activity', async () => {
      const mockActivity = {
        name: 'Activity 1',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      };
      const tokenNoAdmin = signToken({ userId: "1", isAdmin: false })
      const response = await request(app)
        .post('/api/admin/activity')
        .set('Authorization', `Bearer ${tokenNoAdmin}`)
        .send(mockActivity);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No tienes permisos para hacer esto');

      const savedActivity = await Activity.findOne({ name: 'Activity 1' });
      expect(savedActivity).toBeNull();
    });
  });

  describe('PUT /api/admin/activity', () => {
    it('should return an error when a non-logged in user tries to update an activity', async () => {
      const existingActivity =new Activity({
        name: 'Activity 1',
        location: 'Location 2',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      existingActivity.save();

      const mockActivity = {
        name: 'Activity 1',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      };

      const response = await request(app)
        .put('/api/admin/activity')
        .send(mockActivity);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Usuario debe registrarse');

      const savedActivity = await Activity.findOne({ name: 'Activity 1' });
      expect(savedActivity).not.toBeNull();
      expect(savedActivity.location).toBe('Location 2')
    });
    it('should update an existing activity', async () => {
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        events: [],
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const savedActivity=await existingActivity.save();

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id:savedActivity._id
      };

      const response = await request(app)
        .put(`/api/admin/activity`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActivity);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Actividad actualizada correctamente');

      const activity = await Activity.findById(savedActivity._id);
      expect(activity?.name).toBe('Updated Activity');
      expect(activity?.location).toBe('Location 2');
      expect(activity?.duration).toBe(90);
    });
    it('should return an error when trying to update a non-existing activity', async () => {
      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id:"6357c4736c9084bcac72eced"
      };

      const response = await request(app)
        .put('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActivity);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');
      
      const activity = await Activity.findOne({_id:updatedActivity._id});
      expect(activity).toBeNull();
    });
    it('should return an error when a user without admin role tries to update an activity', async () => {
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        events: [],
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const savedActivity=await existingActivity.save();

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id:savedActivity._id
      };
      const tokenNoAdmin = signToken({ userId: "1", isAdmin: false })
      const response = await request(app)
        .post('/api/admin/activity')
        .set('Authorization', `Bearer ${tokenNoAdmin}`)
        .send(updatedActivity);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No tienes permisos para hacer esto');

      const activity = await Activity.findById(savedActivity._id);
      expect(activity).not.toBeNull();
      expect(activity.name).toBe("Existing Activity");
    });
  });

  describe('DELETE /api/admin/activity/:id', () => {
    it('should return an error when a non-logged in user tries to update an activity', async () => {
      const existingActivity =new Activity({
        name: 'Activity 1',
        location: 'Location 2',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const  savedActivity = await existingActivity.save();

      const response = await request(app)
        .delete('/api/admin/activity/'+savedActivity._id)

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Usuario debe registrarse');

      const activity = await Activity.findOne({ name: 'Activity 1' });
      expect(activity).not.toBeNull();
    });
    it('should delete an existing activity', async () => {
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        events: [],
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const savedActivity=await existingActivity.save();

      const response = await request(app)
      .delete(`/api/admin/activity/${savedActivity._id}`)
      .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Actividad eliminada correctamente');

      const activity = await Activity.findById(existingActivity._id);
      expect(activity).toBeNull();
    });
    it('should return an error when trying to delete a non-existing activity', async () => {
      const response = await request(app)
      .delete('/api/admin/activity/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');
    });
    it('should return an error when a user without admin role tries to delete an activity', async () => {
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        events: [],
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const savedActivity=await existingActivity.save();

      const tokenNoAdmin = signToken({ userId: "1", isAdmin: false })
      const response = await request(app)
        .post('/api/admin/activity')
        .set('Authorization', `Bearer ${tokenNoAdmin}`)
        .send(existingActivity);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No tienes permisos para hacer esto');

      const activity = await Activity.findById(savedActivity._id);
      expect(activity).not.toBeNull();
      expect(activity.name).toBe("Existing Activity");
    });
  });
});
