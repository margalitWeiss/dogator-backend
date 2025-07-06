
import { NextFunction, Request, Response } from 'express';
import { pool } from '../config/db';

// יצירת פידבק חדש על דיווח קיים
export const addFeedbackReply = async (req: Request, res: Response, next: NextFunction) => {
const reportId = req.params.id;
  console.log("addFeedbackReply function called 💃", reportId);

  const { content } = req.body;

  if (!reportId || typeof reportId !== 'string') {
    return res.status(400).json({ error: 'invalid or missing report id' });
  }

  if (!content) {
    return res.status(400).json({ error: 'missing content' });
  }

  try {
    const [reportRows] = await pool.query('SELECT * FROM reports WHERE report_id = ?', [reportId]);
    if ((reportRows as any[]).length == 0) {
      return res.status(404).json({ error: 'report not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO feedback_replies (report_id, content) VALUES (?,?)',
      [reportId, content]
    );

    return res.status(201).json({
      message: 'reply saved successfully',
      replyId: (result as any).insertId,
      reportId: reportId,
      content: content
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
};


// החזרת פידבק לפי מזהה מדווח
export const getFeedbackReplyByID = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log("getFeedbackReplyByID function called ❤️")

  const { user_id } = req.params;

  try {

    const sql = "SELECT af.feedback_replies_id AS feedback_replies_id, af.content, r.report_id AS report_id, r.description AS report_content FROM reports r INNER JOIN feedback_replies af ON r.report_id = af.report_id WHERE r.reported_by = ? ORDER BY af.created_at DESC";
    const [feedbackReplies]: any = await pool.query(sql, [user_id]);

    if (feedbackReplies.length == 0) {
      return res.status(404).json({ title: "not found", message: "no feedback reply with such id" });
    }

    res.status(200).json(feedbackReplies[0]);
  } catch (err: any) {
    console.error("error fetching feedback reply by id:", err.message);
    res.status(500).json({ title: "server error", message: "something went wrong. please try again later." });
  }
}
export default { getFeedbackReplyByID, addFeedbackReply };
