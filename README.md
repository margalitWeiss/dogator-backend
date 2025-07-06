# 🐾 Dogator

**Dogator** is a location-based mobile app designed to help dog owners connect and arrange playdates for their dogs. With personalized dog profiles, a messaging system, and built-in safety tools, Dogator makes it easy to build a local community for your pup.

---

## 📱 Product Overview

### Purpose
Dogator creates a platform for dog owners to meet based on their location. Users can add detailed profiles for multiple dogs, message other owners, and schedule meetups. The app fosters real-life connections — for both dogs and their humans.

---

## 🎯 Core Features

### 🐕 Dog Profiles
- Add multiple dogs under one account
- Include name, breed (selectable), age, temperament, bio, and photos

### 📍 Location-Based Discovery
- Discover nearby dogs
- Filter by breed, size, distance, and temperament

### 💬 Messaging
- In-app messaging between users
- Image support
- Reporting/blocking users directly from chat

### 🚩 Reporting System
- Report users or messages
- Reports sent to a moderation database for admin review

### (🔜 Coming Soon)
- Playdate scheduling
- Verified user badges

---

## 🧭 App Flow Overview

### 1. Onboarding Flow
```
Splash Screen ➝ Welcome Screen ➝ Sign Up / Login ➝ Location Permission ➝ Main Dashboard
```

### 2. Main Tabs Navigation
```
[ Home ]  [ Messages ]  [ Add Dog ]  [ Discover ]  [ Profile ]
```

---

## 🗄️ Backend Database Schema

### Users
| Field          | Type         | Description                        |
|----------------|--------------|------------------------------------|
| user_id        | String (UUID)| Unique identifier                  |
| name           | String       | Full name                          |
| email          | String       | Email address                      |
| profile_image  | String (URL) | Profile picture                    |
| location       | GeoPoint     | Latitude & Longitude               |
| created_at     | Timestamp    | Account creation                   |
| last_active    | Timestamp    | Last login                         |
| is_banned      | Boolean      | Flag for banning users             |

### Dogs
| Field         | Type           | Description                        |
|----------------|----------------|-----------------------------------|
| dog_id        | String (UUID)  | Unique dog ID                      |
| user_id       | String         | Foreign key to Users               |
| name          | String         | Dog's name                         |
| breed         | String         | Selected from list                 |
| age           | Integer        | Dog's age                          |
| gender        | String         | Male / Female                      |
| temperament   | Array[String]  | Tags like ["Friendly", "Shy"]      |
| bio           | Text           | Description about the dog          |
| photos        | Array[String]  | Image URLs                         |
| created_at    | Timestamp      | Profile creation date              |

### Messages
| Field         | Type           | Description                        |
|----------------|----------------|------------------------------------|
| message_id    | String (UUID)  | Unique message ID                  |
| sender_id     | String         | User who sent                      |
| receiver_id   | String         | User who received                  |
| content       | String         | Message body                       |
| timestamp     | Timestamp      | Sent time                          |
| seen          | Boolean        | Message read status                |
| type          | String         | "text", "image", etc.              |
| media_url     | String         | Optional image URL                 |

### Reports
| Field            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| report_id        | String      | Unique ID                          |
| reported_by      | String      | Reporter user ID                   |
| reported_user    | String      | Reported user ID                   |
| context_type     | String      | "profile" or "chat"                |
| message_id       | String      | Optional - for chat reports        |
| reason           | String      | Report reason                      |
| description      | Text        | Additional info                    |
| timestamp        | Timestamp   | Submitted at                       |
| status           | String      | "open", "reviewed", "closed"       |

### Playdates (Future)
| Field           | Type         | Description                        |
|----------------|--------------|------------------------------------|
| playdate_id    | String        | Unique ID                         |
| host_user_id   | String        | Creator                            |
| participant_user_id | String  | Guest                              |
| location       | GeoPoint      | Location                           |
| scheduled_time | Timestamp     | When it’s happening                |
| status         | String        | Status (pending, confirmed, etc.) |

### Breeds
| Field     | Type     | Description            |
|-----------|----------|------------------------|
| breed_id  | String   | Unique ID              |
| name      | String   | Breed name             |
| size      | String   | Small / Medium / Large |

---

## 🌐 API Endpoints

### 🔐 Auth
| Method | Endpoint        | Description             |
|--------|------------------|-------------------------|
| POST   | `/auth/signup`   | Register new user       |
| POST   | `/auth/login`    | User login              |
| POST   | `/auth/logout`   | Logout session          |
| GET    | `/auth/me`       | Get current user info   |

### 👤 Users
| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| GET    | `/users/:id`      | Get user by ID          |
| PUT    | `/users/:id`      | Update user             |
| DELETE | `/users/:id`      | Delete user             |
| GET    | `/users/me/dogs`  | Get owned dogs          |

### 🐶 Dogs
| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| POST   | `/dogs`            | Add a dog                          |
| GET    | `/dogs`            | Get nearby dogs                    |
| GET    | `/dogs/:id`        | Get dog by ID                      |
| PUT    | `/dogs/:id`        | Update dog                         |
| DELETE | `/dogs/:id`        | Remove dog                         |

**Nearby Dogs Example:**
```
GET /dogs?lat=32.1&lng=34.8&radius=10&breed=Poodle
```

### 💬 Messages
| Method | Endpoint                 | Description                      |
|--------|--------------------------|----------------------------------|
| GET    | `/messages/conversations`| Get user's chats                 |
| GET    | `/messages/:userId`      | Chat with a user                 |
| POST   | `/messages/:userId`      | Send a message                   |

**Send Message Body Example:**
```json
{
  "content": "Wanna meet up?",
  "type": "text"
}
```

### 🚩 Reports
| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| POST   | `/reports`          | Submit report                      |
| GET    | `/admin/reports`    | (Admin) List all reports           |
| PUT    | `/admin/reports/:id`| (Admin) Update report status       |

### 📅 Playdates
| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| POST   | `/playdates`       | Create a playdate                  |
| GET    | `/playdates`       | View user’s playdates              |
| PUT    | `/playdates/:id`   | Confirm/Update playdate            |
| DELETE | `/playdates/:id`   | Delete playdate                    |

### 🐕 Breeds
| Method | Endpoint  | Description              |
|--------|-----------|--------------------------|
| GET    | `/breeds` | List of dog breeds       |

---

## 🔒 Security Notes
- Use JWT or OAuth2 for authentication
- Protect all routes using `Authorization` headers
- Admin routes should check for proper role
- Rate limit `/reports` and `/messages` for abuse prevention

---

## 🛠️ Tech Stack Suggestions
- **Frontend:** React Native
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Maps:** Google Maps API
- **Storage:** Firebase Storage
- **Auth:** Firebase Auth

---

## 🐾 Let’s find a friend, for your best friend!
