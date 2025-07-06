import { database } from '../config/firebase';


//ChatId will be both users id sorted with an underline in middle them
export const getChatId = (user1Id: string, user2Id: string): string => {
  return [user1Id, user2Id].sort().join('_');
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text?: string,
  imageUrl?: string
) => {
  //Make the chat id
  const chatId = getChatId(senderId, receiverId);

  const message = {
    senderId,
    receiverId,
    text,
    imageUrl: imageUrl || null,
    timestamp: Date.now(),
  };
  //בדיקה אם הסטטוס של הצאט מחוק למשתמש הזה

  const deletedRef = database.ref(`deletedChats/${senderId}/${chatId}`);
  const deletedSnap = await deletedRef.once('value');
  if (deletedSnap.val()) {
    return { error: "Chat is deleted for you" };
  }
  //make the massage ref
  const messageRef = database.ref(`chats/${chatId}/messages`).push();
  //Insert the massage to the ref
  await messageRef.set(message);
  return { id: messageRef.key, ...message };
};


// The chat will have a deleted status ' and the user wont can see the chat
export const setChatDeletedForUser = async (
  userId: string,
  otherUserId: string,
  shouldDelete: boolean
) => {
  const chatId = getChatId(userId, otherUserId);//The chat id
  const ref = database.ref(`deletedChats/${userId}/${chatId}`);//The massage ref
  if (shouldDelete) {
    await ref.set(true);
  } else {
    await ref.remove();
  }
};


// Get your chat with another user
export const getChatMessages = async (user1Id: string, user2Id: string) => {
  const chatId = getChatId(user1Id, user2Id);

  // check if the chat is deleted for you
  const deletedRef = database.ref(`deletedChats/${user1Id}/${chatId}`);
  const deletedSnap = await deletedRef.once('value');
  if (deletedSnap.val()) {
    return []; // This user deleted this chat
  }

  const messagesRef = database.ref(`chats/${chatId}/messages`);
  const snapshot = await messagesRef.once('value');
  const messages = snapshot.val() || {};
  return Object.keys(messages).map(key => ({ id: key, ...messages[key] }));
};

//send an auto message for the blocked or unblocked user
export const sendBlockNotification = async (
  blockerId: string,
  blockedId: string,
  action: "block" | "unblock"
) => {
  const chatId = getChatId(blockerId, blockedId);

  const text =
    action === "block"
      ? "I blocked you. YoI have blocked you in the system. You cannot send me any more messages until further notice."
      : "I unblocked you. We can chat again.";

  const message = {
    senderId: blockerId,
    receiverId: blockedId,
    text,
    imageUrl: null,
    timestamp: Date.now(),
    system: true,
  };

  const messageRef = database.ref(`chats/${chatId}/messages`).push();
  await messageRef.set(message);
};


export const getUserChats = async (userId: string) => {
    console.log('getUserChats: התחלה', userId);
  // שלוף את כל הצ'אטים מהפיירבייס
  const chatsRef = database.ref('chats');
  const snapshot = await chatsRef.once('value');
    console.log('getUserChats: קיבלנו snapshot');
  const chats = snapshot.val() || {};
  // סנן רק צ'אטים שמזהה הצ'אט שלהם כולל את מזהה המשתמש
  const userChats = Object.keys(chats)
    .filter(chatId => chatId.includes(userId))
    .map(chatId => ({ chatId, ...chats[chatId] }));
      console.log('getUserChats: סיום', userChats.length);
  return userChats;
}

//פעולה לספירת מספר ההודעות שיש למשתמש הנוכחי בכל הצאטים שלו ביחד
export const countMessagesInAllChats = async (userId: string): Promise<number> => {
  const chatsRef = database.ref(`chats`);
  const snapshot = await chatsRef.once('value');
  const chats = snapshot.val() || {};

  let totalMessages = 0;

  for (const chatId in chats) {
    const messages = chats[chatId].messages || {};
    for (const messageId in messages) {
      const message = messages[messageId];
      if (message.senderId === userId || message.receiverId === userId) {
        totalMessages++;
      }
    }
  }

  return totalMessages;
};

