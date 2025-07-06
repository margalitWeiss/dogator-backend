import { Request, Response } from 'express';
import { isUUID } from 'validator';
import { sendMessage, getChatMessages, setChatDeletedForUser, countMessagesInAllChats,getUserChats} from '../services/chatService';
import {validate as uuid} from "uuid"

export const postMessage = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { senderId, receiverId, text, imageUrl } = req.body;
    if (!senderId || !uuid(senderId) || !receiverId || !uuid(receiverId)) {
      res.status(400).json({ error: "one or both user id is invalid" });
    }
    if (!text && !imageUrl) {
      res.status(400).json({ error: "The massage must contain an text or image" });
    }
    const message = await sendMessage(senderId, receiverId, text, imageUrl);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};


export const getMessages = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user1Id = req.query.user1Id;
    const user2Id = req.query.user2Id;
    if (!user1Id || !uuid(user1Id) || !user2Id || !uuid(user2Id)) {
      return res.status(400).json({ error:"one or both user id is invalid" });
    }

    const messages = await getChatMessages(user1Id as string, user2Id as string);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const deleteChatController = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user1Id = req.query.user1Id as string | undefined;
    const user2Id = req.query.user2Id as string | undefined;
    if (!user1Id || !isUUID(user1Id) || !user2Id || !uuid(user2Id)) {
      return res.status(400).json({ error: "one or both user id is invalid" });
    }

    await setChatDeletedForUser(user1Id, user2Id, true);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};


//קונטרולר לספירת כמות ההודעות שיש למשתמש בכל הצאטים
export const countMessagesController = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = req.params.userId as string;
    if (!userId || !uuid(userId)) {
      return res.status(400).json({ error: "user id is invalid" });
    }

    // Assuming you have a function to count messages for a user
    const messageCount = await countMessagesInAllChats(userId);
    res.status(200).json({ messageCount });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};


export const getChatsForUser = async (req: Request, res: Response): Promise<Response|void> => {
  console.log("getChatsForUser called with query: 🐶", req.query);
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const chats = await getUserChats(userId);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};
