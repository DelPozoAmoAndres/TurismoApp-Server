import { mongo } from "mongoose"
import { Review } from "@customTypes/review";
import Activity from "@models/activitySchema";
import User from "@models/userSchema";

export default class ReviewService {

    getReviewFromReservation = async (reservationId: string) => {
        try {
            if (!mongo.ObjectId.isValid(reservationId))
                throw {
                    status: 400,
                    message: "El id de la reserva no es válido"
                }
            const activity = await Activity.findOne({ 'reviews.reservationId': reservationId })
            if (!activity)
                throw {
                    status: 404,
                    message: "No hay comentario asociado a esta reserva"
                }
            let review = activity.reviews.find((review) => review.reservationId === reservationId)
            const user = await User.findById(review.author);
            const { score, comment, author, _id } = review;
            return {
                _id,
                score,
                comment,
                author,
                authorName: user.name,
                authorImage: '',
                activityId: activity._id,
                reservationId: review.reservationId
            }
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    addReview = async (activityId: string, review: Review, userId: string) => {
        if (!mongo.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: "El id de la actividad no es válido"
            }
        try {
            const activity = await Activity.findById(activityId);
            if (!activity)
                throw {
                    status: 404,
                    message: "La actividad no existe"
                }

            review.author = userId;
            activity?.reviews ? activity.reviews.push(review) : activity.reviews = [review]
            console.log(activity.reviews,review,userId)
            if (activity.validateSync())
                throw {
                    status: 400,
                    message: "El comentario no es válido"
                }

            activity.save()
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    editReview = async (reviewId: string, review: Review, userId: string) => {
        if (!mongo.ObjectId.isValid(reviewId))
            throw {
                status: 400,
                message: "El id del comentario no es válido"
            }
        try {
            const activity = await Activity.findOne({ 'reviews.author': userId, 'reviews._id': reviewId })
            if (!activity)
                throw {
                    status: 404,
                    message: "El comentario no existe"
                }
            const reviewIndex = activity.reviews.findIndex((review) => String(review._id) === reviewId)
            activity.reviews[reviewIndex] = review;
            activity.save();
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    deleteReview = async (reviewId: string, userId: string) => {
        if (!mongo.ObjectId.isValid(reviewId))
            throw {
                status: 400,
                message: "El id del comentario no es válido"
            }
        try {
            const activity = await Activity.findOne({ 'reviews.author': userId, 'reviews._id': reviewId })
            if (!activity)
                throw {
                    status: 404,
                    message: "El comentario no existe"
                }
            const reviews = activity.reviews.filter((review) => String(review._id) !== reviewId)
            activity.reviews = reviews;
            activity.save();
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}