const bcrypt = require('bcrypt');
const UserModel = require('../models/Appointment');
const BookingModel = require('../models/Booking')


exports.registerUser = (async (req, res) => {
    const { name, email, mobile, pass } = req.body;
    const hashedPassword = bcrypt.hashSync(pass, 10);
    const userEmail = await UserModel.findOne({ email });
    if (userEmail) {
        return res.status(400).json({ message: "Email already Exist" });
    }
    const userData = new UserModel({
        name,
        email,
        mobile,
        pass: hashedPassword
    });
    try {
        await userData.save();
        return res.status(200).json({ message: "Register successfull" })
    } catch (error) {
        return res.status(400).json({ message: "Register Failed" });
    }
})

exports.loginUser = (async (req, res) => {
    const { email, pass } = req.body;
    const userEmail = await UserModel.findOne({ email });
    if (!userEmail) {
        return res.status(400).json({ message: "Email not available please login first" });
    }
    const isMatch = await bcrypt.compare(pass, userEmail.pass);
    if (!isMatch) {
        return res.status(200).json({ message: "Password not correct" });
    }
    req.session.userId = userEmail._id;
    req.session.email = userEmail.email;
    req.session.name = userEmail.name;
    req.session.mobile = userEmail.mobile;
    return res.status(200).json({ message: 'Login successful', session: req.session });
});

exports.logoutUser = (req, res) => {
    const userEmail = req.session.email;
    req.session.destroy((err) => {
        if (err) {
            return res.status(400).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
};

exports.addClass = async (req, res) => {
    const { session_name, entries, type } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "User not logged in" });
    }
    if (!session_name || !entries || !Array.isArray(entries) || entries.length === 0 || !type) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    for (const entry of entries) {
        const { score, last_session, feedback } = entry;
        if (!score || !last_session || !feedback || !type) {
            return res.status(400).json({ message: "Missing required fields in entry" });
        }
    }

    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }
    const userData = new BookingModel({
        session_name,
        type,
        entries,
    });
    try {
        await userData.save();
        return res.status(200).json({ message: "Booking successful" });
    } catch (error) {
        return res.status(400).json({ message: "Booking Failed", error: error.message });
    }
};


exports.updateClass = async (req, res) => {
    const { session_name, entries, type } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "User not logged in" });
    }
    if (!session_name || !entries || !Array.isArray(entries) || entries.length === 0 || !type) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const booking = await BookingModel.findOne({ session_name });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const isDuplicate = entries.some(entry => 
            booking.entries.some(existingEntry => 
                existingEntry.date === entry.date && existingEntry.time === entry.time
            )
        );
        if (isDuplicate) {
            return res.status(400).json({ message: "Date and time are already booked" });
        }
        booking.entries.push(...entries);
        await booking.save();
        return res.status(200).json({ message: "Booking updated successfully" });
    } catch (error) {
        return res.status(400).json({ message: "Failed to update booking", error: error.message });
    }
};

exports.getClassSessions = (async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not Exist" });
        }
        const sessions = await BookingModel.find({});
        return res.status(200).json(sessions);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch sessions" });
    }
});

exports.getSessionDetails = async (req, res) => {
    try {  
        const { sessionId } = req.params;
        const { date, time } = req.query;
        const sessionQuery = { _id: sessionId };
        let session;
        const userDate = await BookingModel.findOne({ date, time });
        if (userDate) {
            return res.status(400).json({ message: "Date and time already booked" });
        }
        if (date) {
            session = await BookingModel.findOne(
                sessionQuery,
                {
                    entries: {
                        $elemMatch: { date: date }
                    }
                }
            );
        } else {
            session = await BookingModel.findById(sessionId);
        }
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        return res.status(200).json(session);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch session details" });
    }
};

exports.getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { date } = req.query;
        const sessionQuery = { _id: sessionId };
        let session;
        if (date) {
            session = await BookingModel.findOne(
                sessionQuery,
                {
                    entries: {
                        $elemMatch: { date: date }
                    }
                }
            );
        } else {
            session = await BookingModel.findById(sessionId);
        }
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        return res.status(200).json(session);
    } catch (error) {
        console.error("Failed to fetch session details:", error);
        return res.status(500).json({ message: "Failed to fetch session details" });
    }
};
