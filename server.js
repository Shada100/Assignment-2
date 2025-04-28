import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();
const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Path to users.json file
const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from file if it exists
let users = [];
if (fs.existsSync(USERS_FILE)) {
  const data = fs.readFileSync(USERS_FILE);
  users = JSON.parse(data);
  console.log(`Loaded ${users.length} users from file.`);
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Save users to file
const saveUsersToFile = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// API route to save user
app.post('/api/users', (req, res) => {
  const { username, email, dob } = req.body;
  if (!username || !email || !dob) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  users.push({ username, email, dob });
  saveUsersToFile(); // <-- Save immediately after adding
  console.log('User added:', { username, email, dob });
  res.status(201).json({ message: 'User saved successfully!' });
});

// Cron job to send birthday emails
cron.schedule('0 7 * * *', () => {
  console.log('Running birthday check at 7am...');
  const today = new Date();

  users.forEach(user => {
    const dob = new Date(user.dob);
    if (dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: '🎉 Happy Birthday!',
        html: `<h1>Happy Birthday, ${user.username}!</h1><p>Wishing you lots of happiness and success! 🎂🎉</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Birthday email sent:', info.response);
        }
      });
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
