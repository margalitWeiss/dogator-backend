export type Message = {
    messageId: string;      // מזהה ייחודי להודעה (ב-Firebase זה יכול להיות ה-key)
    senderId: string;       // מזהה המשתמש ששלח את ההודעה
    text?: string;          // טקסט ההודעה (אופציונלי)
    imageUrl?: string;      // קישור לתמונה (אופציונלי)
    timestamp: number;      // זמן שליחה (במילישניות)
};
export type Chat = {
    chatId: string;           // מזהה ייחודי לשיחה
    participants: string[];   // רשימת משתתפים (בד"כ 2, אפשר להרחבה לקבוצה)
    deletedFor?: string[];    // מזהי משתמשים שמחקו את השיחה (למימוש "הסתרה" בלבד)
    lastMessage?: {
        text?: string;
        timestamp: number;
    }|null;                        // תקציר הודעה אחרונה לתצוגה בתיבת צ'אטים
};
