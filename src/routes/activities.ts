import Activity from '../models/activity';
import express, { Request, Response } from 'express';

const router = express.Router();

// Obtener la lista de actividades
router.get('/admin/activities', async (req, res) => {
  try {
    const query = {
      $and: [
          req.query.searchString ? {
              $or: [
                  { name: { $regex: req.query.searchString } }, // Buscar en la propiedad "name"
                  { description: { $regex: req.query.searchString } },// Buscar en la propiedad "description"
              ]
          } : {},
      ],
  };
    const activities = await Activity.find(query);
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de actividades' });
  }
});

// Obtener la información de una actividad específica
router.get('/activity/:id', async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await Activity.findById(activityId);

    if (activity) {
      res.status(200).json(activity);
    } else {
      res.status(404).json({ message: 'Actividad no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la información de la actividad' });
  }
});

// Añadir una nueva actividad
router.post('/admin/activity', async (req, res) => {
  try {
    const newActivity = req.body;
    const createdActivity = new Activity(newActivity);
    await createdActivity.save()
    console.log(createdActivity)
    res.status(201).json({ message: 'Actividad registrada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al añadir la actividad' });
  }
});

// Modificar una actividad existente
router.put('/activity/', async (req, res) => {
  try {
    const updatedActivity = req.body;
    const result = await Activity.findByIdAndUpdate(updatedActivity._id, updatedActivity);
    console.log(updatedActivity)

    if (result) {
      res.status(200).json({ message: 'Actividad actualizada correctamente' });
    } else {
      res.status(404).json({ message: 'Actividad no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al modificar la actividad' });
  }
});

// Eliminar una actividad
router.delete('/activity/:id', async (req, res) => {
  try {
    const activityId = req.params.id;
    const result = await Activity.findByIdAndDelete(activityId);

    if (result) {
      res.status(200).json({ message: 'Actividad eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Actividad no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la actividad' });
  }
});

export default router
