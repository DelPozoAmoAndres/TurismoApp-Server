import User from '../models/user';
import Activity from '../models/activity';
import express, { Request, Response } from 'express';
const { getUserId } = require('../services/tokenService');
const router = express.Router();

// Obtener la lista de actividades
router.get('/activities', async (req, res) => {
  try {
    const query = {
      $and: [
        req.query.searchString ? {
          $or: [
            { name: { $regex: req.query.searchString, $options: 'i' } },
            { description: { $regex: req.query.searchString, $options: 'i' } },
            { location: { $regex: req.query.searchString, $options: 'i' } }
          ]
        } : {},
        req.query.duration ? { duration: { $lt: Number(req.query.duration) * 60 } } : {},
        req.query.petsPermited ? { petsPermited: req.query.petsPermited } : {},
        req.query.state ? { state: req.query.state } : {}
      ],
    };
    const activities = req.query.precio ? await Activity.find(query)
      .select('events')
      .where('events.price')
      .lt(Number(req.query.precio)) : await Activity.find(query);

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de actividades' });
  }
});

// Obtener la información de una actividad específica
router.get('/activity/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
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

//Obtener los eventos de una actividad
router.get('/activity/:id/events', async (req: Request, res: Response) => {
  try {
    // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
    const activity = (await Activity.findById(req.params.id));
    const events = activity?.events ? activity?.events : []
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Añadir comentarios
router.post('/activity/:id/review', async (req: Request, res: Response) => {
  getUserId(req, res, async (userId: string) => {
    try {
      // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
      const activity = (await Activity.findById(req.params.id));
      const reviews = activity?.reviews ? activity?.reviews : []
      let review = req.body;
      review.author = userId;
      reviews.push(review)
      activity.save()
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
  })
});

//Obtener comentarios
router.get('/activity/:id/reviews', async (req: Request, res: Response) => {
  try {
    // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
    const activity = await Activity.findById(req.params.id);
    let reviews = activity?.reviews ? activity?.reviews : []

    const updatedReviews = await Promise.all(reviews.map(async (review) => {
      const user = await User.findById(review.author);
      const { score, comment, author, _id } = review;
      return {
        _id,
        score,
        comment,
        author,
        authorName: user.name,
        authorImage: ''
      }
    }))
    res.status(200).json(updatedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Eliminar comentario
router.delete('/review', async (req: Request, res: Response) => {
  getUserId(req, res, async (userId: string) => {
    try {
      // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
      let activity=await Activity.findOne(
        { 'reviews.author': userId, 'reviews._id': req.query.id })
        const reviews=activity.reviews.filter((review)=>String(review._id)!==req.query.id)
        activity.reviews=reviews;
        activity.save();
        console.log(activity.reviews)
      res.status(200).json({ message: "Ha sido eliminado el comentario" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
  })
});
export default router
