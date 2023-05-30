const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const { signToken } = require("../src/services/tokenService")
import User, { Role } from '../src/models/user';
import Activity, { ActivityState, ActivityDoc } from '../src/models/activity';
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
    await User.deleteMany({});
    token = signToken({ userId: "1", isAdmin: true })
  });

  describe('POST /api/admin/activity', () => {
    beforeEach(() => {
      jest.resetAllMocks();
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
    it('should return 401 when a non-logged in user tries to add a new activity', async () => {
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
    it('should return 400 when required fields are missing', async () => {
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
    it('should return 403 when a user without admin role tries to add a new activity', async () => {
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
    it('should return 500 when there is a server error', async () => {
      jest.spyOn(Activity.prototype, "save").mockImplementation(() => {
        throw new Error('Server error');
      });

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

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Ha habido un error en el servidor.');
    });
  });

  describe('PUT /api/admin/activity', () => {
    beforeEach(() => {
      jest.resetAllMocks();
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
      const savedActivity = await existingActivity.save();

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id: savedActivity._id
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
    it('should return 401 when a non-logged in user tries to update an activity', async () => {
      const existingActivity = new Activity({
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
    it('should return 403 when a user without admin role tries to update an activity', async () => {
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
      const savedActivity = await existingActivity.save();

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id: savedActivity._id
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
    it('should return 404 when trying to update a non-existing activity', async () => {
      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id: "6357c4736c9084bcac72eced"
      };

      const response = await request(app)
        .put('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActivity);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');

      const activity = await Activity.findOne({ _id: updatedActivity._id });
      expect(activity).toBeNull();
    });
    it('should return 404 when trying to update an activity with an invalid id format', async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockImplementation(() => false);

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id: "6357c4736c9084bcac72eced"
      };

      const response = await request(app)
        .put('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActivity);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');

      const activity = await Activity.findOne({ _id: updatedActivity._id });
      expect(activity).toBeNull();
    });
    it('should return 500 when there is a server error', async () => {
      jest.spyOn(Activity, "findByIdAndUpdate").mockImplementation(() => {
        throw new Error('Server error');
      });

      const updatedActivity = {
        name: 'Updated Activity',
        location: 'Location 2',
        duration: 90,
        description: 'Description 2',
        accesibility: 'Not Accessible',
        petsPermited: false,
        state: ActivityState['parada temporalmente'],
        _id: "6357c4736c9084bcac72eced"
      };

      const response = await request(app)
        .put('/api/admin/activity')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActivity);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Ha habido un error en el servidor.');
    });

  });

  describe('DELETE /api/admin/activity/:id', () => {
    beforeEach(() => {
      jest.resetAllMocks();
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
      const savedActivity = await existingActivity.save();

      const response = await request(app)
        .delete(`/api/admin/activity/${savedActivity._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Actividad eliminada correctamente');

      const activity = await Activity.findById(existingActivity._id);
      expect(activity).toBeNull();
    });
    it('should return 401 when a non-logged in user tries to update an activity', async () => {
      const existingActivity = new Activity({
        name: 'Activity 1',
        location: 'Location 2',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });
      const savedActivity = await existingActivity.save();

      const response = await request(app)
        .delete('/api/admin/activity/' + savedActivity._id)

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Usuario debe registrarse');

      const activity = await Activity.findOne({ name: 'Activity 1' });
      expect(activity).not.toBeNull();
    });
    it('should return 403 when a user without admin role tries to delete an activity', async () => {
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
      const savedActivity = await existingActivity.save();

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
    it('should return 404 when trying to delete a non-existing activity', async () => {
      const response = await request(app)
        .delete('/api/admin/activity/6357c4736c9084bcac72eced')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');
    });
    it('should return 404 when trying to delete an activity with an invalid id format', async () => {
      const response = await request(app)
        .delete('/api/admin/activity/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');
    });
    it('should return 500 when there is a server error', async () => {
      jest.spyOn(Activity, "findByIdAndDelete").mockImplementation(() => {
        throw new Error('Server error');
      });

      const response = await request(app)
        .delete('/api/admin/activity/6357c4736c9084bcac72eced')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Ha habido un error en el servidor.');
    });
  });

  describe('POST /api/admin/event', () => {
    beforeEach(async () => {
      jest.resetAllMocks();
    });
    it('should create an event', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      });

      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Eventos añadidos con exito');

      const activity = await Activity.findById(existingActivity._id);
      expect(activity.events).not.toBeNull();
      expect(activity.events.length).toBe(1);
    });
    it('should create events with a range of dates', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        },
        repeatInfo: {
          repeatType: "range",
          repeatStartDate: "2023-05-31T00:00:00Z",
          repeatDays:[0,1,2,3,4,5,6],
          repeatEndDate: "2023-06-01T00:00:00Z",
          time: "20:00"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Eventos añadidos con exito');

      const activity = await Activity.findById(existingActivity._id);
      expect(activity.events).not.toBeNull();
      expect(activity.events.length).toBe(2);
    });
    it('should create events with a list of dates', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        },
        repeatInfo: {
          repeatType: "days",
          repeatDays: ["2023-05-31", "2023-06-1"],
          time: "20:00"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Eventos añadidos con exito');

      const activity = await Activity.findById(existingActivity._id);
      expect(activity.events).not.toBeNull();
      expect(activity.events.length).toBe(2);
    });
    it('should return 401 when a non-logged in user tries to create an event', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .send(mockedObject);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Usuario debe registrarse');

      const activity = await Activity.findById(savedActivity._id);
      expect(activity.events.length).toBe(0);
    });
    it('should return 403 when a user without admin role tries to create an event', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        }
      }
      const tokenNoAdmin = signToken({ userId: "1", isAdmin: false })
      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${tokenNoAdmin}`)
        .send(mockedObject);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No tienes permisos para hacer esto');

      const activity = await Activity.findById(savedActivity._id);
      expect(activity.events.length).toBe(0);
    });
    it('should return 404 when trying to creat an event of a non-existing activity', async () => {
      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const savedGuide = await guide.save();

      const mockedObject = {
        activityId: "6357c4736c9084bcac72eced",
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Actividad no encontrada');
    });
    it('should return 404 when trying to creat an event whos guide non-exist', async () => {
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save();

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: "6357c4736c9084bcac72eced",
          date: "2023-05-31T09:00:00Z"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Guía no encontrado');
    });
    it('should return 500 when there is a server error', async () => {
      jest.spyOn(Activity, "findById").mockImplementation(() => {
        throw new Error('Server error');
      });

      const guide = new User({
        name: "Guide 1",
        email: "email@email.es",
        role: Role.guía,
        password: "password123"
      })
      const existingActivity = new Activity({
        name: 'Existing Activity',
        location: 'Location 1',
        duration: 60,
        description: 'Description 1',
        accesibility: 'Accessible',
        petsPermited: true,
        state: ActivityState.abierta,
      });

      const savedActivity = await existingActivity.save()
      const savedGuide = await guide.save()

      const mockedObject = {
        activityId: savedActivity._id,
        event: {
          language: "Español",
          price: 10,
          seats: 10,
          guide: savedGuide._id,
          date: "2023-05-31T09:00:00Z"
        }
      }

      const response = await request(app)
        .post(`/api/admin/event`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockedObject);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Ha habido un error en el servidor.');
    });
  });
});
