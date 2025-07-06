import express from "express";
import {addFeedbackReply,getFeedbackReplyByID} from "../controllers/feedbackReply";
import isAdmin from "../middlewares/isAdmin";


function asyncHandler(fn: Function): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const router = express.Router();

type middlewareH = (req: express.Request, res: express.Response) => Promise<void>;
router.post('/admin/feedback/:id/reply',  asyncHandler(addFeedbackReply));
router.get('/feedback/:user_id/reply', asyncHandler(getFeedbackReplyByID));
export default router;
