const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

// User Registration, Login, and Logout
router.post('/register', appointmentController.registerUser);
router.post('/login', appointmentController.loginUser);
router.post('/logout', appointmentController.logoutUser);
router.post('/addClass', appointmentController.addClass);
router.get('/getClassSessions', appointmentController.getClassSessions);
router.get('/getSessionDetails/:sessionId', appointmentController.getSessionDetails);
router.put('/updateSession', appointmentController.updateClass);

// Protected Dashboard Route
router.get('/dashboard', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Authenticated' });
});

// Check Authentication Status
router.get('/checkAuth', (req, res) => {
    if (req.session && req.session.userId) {
        res.status(200).json({ isAuthenticated: true });
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
});

module.exports = router;
