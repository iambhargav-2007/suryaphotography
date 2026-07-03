# Surya Photography Booking System

This project is a full-stack booking system for Surya Photography. It includes a frontend built with React (Vite) and a backend built with Node.js and Express.

## Features
- **Public Booking Page**: Customers can book photography slots, providing their name, email, phone, year, branch, and preferred location.
- **Admin Dashboard**: Manage your daily and upcoming schedule, block/unblock slots, and accept/reject booking requests.
- **Automated Email Notifications**: Customers automatically receive an email when their booking is accepted or rejected.
- **Slack Notifications**: Admin receives an instant Slack notification with customer details whenever a new booking is submitted.

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via MongoDB Atlas)

## Environment Setup

You need to create a `.env` file in the `backend/` directory. You can copy the provided `.env.example` file and fill in your details:

```bash
cd backend
cp .env.example .env
```

Your `.env` should look like this:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/suryaphotography
JWT_SECRET=supersecretjwtkey
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

### How to get an SMTP App Password (for Gmail)
To allow the backend to send emails on your behalf, you need a Google App Password. **You cannot use your normal Gmail password.**

1. Go to your Google Account management page: [myaccount.google.com](https://myaccount.google.com/)
2. Click on the **Security** tab on the left sidebar.
3. Make sure **2-Step Verification** is turned ON.
4. Search for **App passwords** in the search bar at the top of your Google Account settings.
5. Create a new App Password and name it something like "Surya Photography Backend".
6. Google will give you a **16-character password** (it will look something like `abcd efgh ijkl mnop`).
7. Copy that password, **remove all the spaces**, and paste it into `SMTP_PASS` in your `.env` file (e.g., `SMTP_PASS=abcdefghijklmnop`).
8. **IMPORTANT:** Restart your backend terminal (`npm run dev`) after updating the `.env` file!

---

### How to get a Slack Webhook URL
To receive instant Slack notifications when someone books a slot, you need to create an Incoming Webhook.

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and log into your Slack account.
2. Click **Create New App** -> **From scratch**.
3. Name your app (e.g., "Surya Photography Bot") and select the workspace where you want notifications to appear.
4. On the next page, click on **Incoming Webhooks**.
5. Toggle **Activate Incoming Webhooks** to **On**.
6. Scroll down and click **Add New Webhook to Workspace**.
7. Choose the specific channel (e.g., `#bookings`) where you want the messages to be posted, and click **Allow**.
8. You will be given a Webhook URL for your workspace.
9. Copy that URL and paste it into `SLACK_WEBHOOK_URL` in your `.env` file.
10. **IMPORTANT:** Restart your backend terminal (`npm run dev`) after updating the `.env` file!

---

## Running the Project Locally

Open two separate terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd surya-photography
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend will run on `http://localhost:5000`.
