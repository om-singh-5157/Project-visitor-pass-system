# 🛂 Visitor Pass System

A full-stack web application designed to streamline and secure visitor registration and approval for institutions like offices, universities, or factories. Built with **Node.js**, **Express**, **MongoDB**, and **Bootstrap**, this project supports multiple user roles with PDF pass generation, email alerts, and secure dashboards.

---

## 🚀 Features

- 🔐 **Role-based authentication** (Visitor, Approver, Admin)
- 📝 **Visitor registration** with date limits and form validation
- ✉️ **Email notifications** to both visitor and approver
- 🧾 **PDF pass generation** upon approval
- 📥 **Download pass** from user history
- 📋 **Approver dashboard** for approving/rejecting requests with remarks
- 🔍 **Admin dashboard** to view all users, approvers, and visitor data
- 🎨 Clean, responsive UI with Bootstrap 5 and Font Awesome

---

## 🧠 Tech Stack

| Tech | Description |
|------|-------------|
| **Node.js** | Backend runtime environment |
| **Express.js** | Web framework for Node.js |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **EJS** | Templating engine |
| **Bootstrap 5** | UI styling |
| **Font Awesome** | Icons |
| **Nodemailer** | Email API |
| **PDFKit** | PDF generation |
| **JOI** | Form validation |
| **Express-Session & Passport.js** | Auth/session management |

---

## 📁 Folder Structure
project/
├── models/ # Mongoose schemas
├── routes/ # Route handlers
├── controllers/ # Route logic
├── views/ # EJS templates
├── public/ # CSS, JS, images
├── utils/ # Utility functions
├── middleware.js # Middleware logic
├── app.js # Main entry point
├── .env # Environment variables
└── README.md # Project description

## 🧪 How to Run Locally

1.**Clone the repo**-
   git clone https://github.com/YOUR_USERNAME/Project-visitor-pass-system.git
   cd Project-visitor-pass-system
   
2.Install dependencies-
npm install

3.Set up .env file-
PORT=3000
DB_URL=mongodb://localhost:27017/visitor-system
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password

4.Run the server-
node app.js

5.Open http://localhost:3000 in your browser

👤 User Roles
Visitor → Register new visits and download passes
Approver → Approve/reject visitor requests with remarks
Admin → Monitor all activity across visitors and approvers

📝 License
This project is licensed under the MIT License.

🙌 Acknowledgments
Tata Steel Internship Project 2025
Express, Bootstrap, and MongoDB communities
Font Awesome & Bootstrap Icons for UI polish.
