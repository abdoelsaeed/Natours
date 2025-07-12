# Natours 🏞️

A full-featured tour booking application built with Node.js, Express, MongoDB, and modern web technologies. This project is designed for learning advanced backend development, security, authentication, and scalable RESTful APIs.

---

## 🚀 Project Overview
Natours is a complete booking platform for adventurous tours. Users can browse, book, review, and manage tours. Admins and guides have advanced management features. The project demonstrates best practices in Node.js, Express, MongoDB, and security.

---

## ✨ Features
- User authentication & authorization (JWT, cookies)
- User roles: user, guide, lead-guide, admin
- Tour CRUD (Create, Read, Update, Delete)
- Tour booking with Stripe payment integration
- Reviews & ratings system
- User profile management (photo upload, update info)
- Favorites (like tours)
- Secure RESTful API (rate limiting, sanitization, helmet, etc.)
- Responsive Pug-based frontend
- Email notifications (welcome, password reset)
- Advanced filtering, sorting, pagination for tours
- Admin dashboard (manage users, tours, reviews, bookings)

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** Pug, Bootstrap, CSS
- **Authentication:** JWT, Cookies
- **Payments:** Stripe
- **Email:** Nodemailer
- **Security:** Helmet, Rate Limiting, XSS Clean, Mongo Sanitize, HPP
- **Dev Tools:** Nodemon, ESLint, Prettier, Parcel

---

## 📁 Folder Structure
```
/after-section-06
  |-- app.js
  |-- server.js
  |-- controllers/
  |-- model/
  |-- routes/
  |-- public/
  |-- views/
  |-- dev-data/
  |-- errFolder/
  |-- findApi/
  |-- package.json
  |-- readme.md
```

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd after-section-06
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `config.env` file in the root directory. Example:
```env
NODE_ENV=development
PORT=3000
DATABASE=<your-mongodb-connection-string>
DATEBASE_PASSWORD=<your-db-password>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=<your-email-username>
EMAIL_PASSWORD=<your-email-password>
EMAIL_HOST=<your-email-host>
EMAIL_PORT=<your-email-port>
EMAIL_FORM=<your-email-from-address>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLIC_KEY=<your-stripe-public-key>
```

### 4. Import sample data (optional)
```bash
node dev-data/data/import-dev-data.js --import
```

### 5. Start the server
- Development: `npm run start:dev`
- Production: `npm run start:prod`

---

## 📜 Scripts
- `npm start` — Start server
- `npm run start:dev` — Start server with nodemon
- `npm run start:prod` — Production mode
- `npm run debug` — Debug mode
- `npm run watch:js` — Watch JS with Parcel
- `npm run build:js` — Build JS with Parcel

---

## 🔗 API Endpoints (REST)

### Users
- `POST   /api/v1/users/signup` — Register
- `POST   /api/v1/users/login` — Login
- `GET    /api/v1/users/logout` — Logout
- `GET    /api/v1/users/me` — Get current user
- `PATCH  /api/v1/users/updateMe` — Update profile
- `DELETE /api/v1/users/deleteMe` — Deactivate account
- `PATCH  /api/v1/users/updateMyPassword` — Change password

### Tours
- `GET    /api/v1/tours` — List all tours
- `GET    /api/v1/tours/:id` — Get tour details
- `POST   /api/v1/tours` — Create tour (admin/lead-guide)
- `PATCH  /api/v1/tours/:id` — Update tour (admin/lead-guide)
- `DELETE /api/v1/tours/:id` — Delete tour (admin/lead-guide)
- `GET    /api/v1/tours/tour-stats` — Tour statistics
- `GET    /api/v1/tours/top-5-cheap` — Top 5 cheap tours
- `GET    /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit` — Tours within distance
- `GET    /api/v1/tours/distances/:latlng/unit/:unit` — Get distances

### Bookings
- `GET    /api/v1/bookings` — List bookings
- `POST   /api/v1/bookings` — Create booking
- `GET    /api/v1/bookings/:id` — Get booking
- `PATCH  /api/v1/bookings/:id` — Update booking
- `DELETE /api/v1/bookings/:id` — Delete booking

### Reviews
- `GET    /api/v1/reviews` — List reviews
- `POST   /api/v1/reviews` — Create review (must book tour)
- `GET    /api/v1/reviews/:id` — Get review
- `PATCH  /api/v1/reviews/:id` — Update review
- `DELETE /api/v1/reviews/:id` — Delete review (admin)

---

## 🔒 Authentication & Authorization
- JWT-based authentication (token in HTTP-only cookie)
- Role-based access control (user, guide, lead-guide, admin)
- Password hashing (bcryptjs)
- Password reset via email
- Secure session management

---

## 🛡️ Security
- HTTP headers (Helmet)
- Rate limiting (express-rate-limit)
- Data sanitization (xss-clean, express-mongo-sanitize)
- Parameter pollution prevention (hpp)
- CORS enabled
- Secure cookies

---

## 🌍 Deployment
- Ready for deployment on Vercel, Heroku, or any Node.js hosting
- See `vercel.json` for Vercel config

---

## 🤝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
ISC License. See [LICENSE](LICENSE) for details.

---

## 👤 Author & Credits
- Developed by Jonas Schmedtmann (original course)
- Modified & maintained by Abdo Elsaeed

---

> **ملاحظة:** هذا المشروع تعليمي ويحتوي على أفضل ممارسات تطوير تطبيقات Node.js وExpress وMongoDB مع الأمان الكامل.
