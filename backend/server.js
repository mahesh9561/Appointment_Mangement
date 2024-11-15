const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const { PORT, DB_URL, SESSION_SECRET } = require('./config/keys')
const appointmentRouter = require('./routes/appointmentRoutes');

// Middleware 
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: DB_URL,
        collectionName: 'sessions'
    })
}));


connectDB();

app.use('/api/appointment', appointmentRouter);
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the application!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})