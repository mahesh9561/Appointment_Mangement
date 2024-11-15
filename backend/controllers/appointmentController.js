const bcrypt = require('bcrypt');
const UserModel = require('../models/Appointment');
const BookingModel = require('../models/Booking')


exports.registerUser = (async (req, res) => {
    const { name, email, mobile, pass } = req.body;
    // console.log(req.body)
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
        // console.log("Register successfull")
        return res.status(200).json({ message: "Register successfull" })
    } catch (error) {
        // console.log(error, "Register Failed")
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
    // console.log(req.session.email)
    // console.log(userEmail)
    req.session.destroy((err) => {
        if (err) {
            return res.status(400).json({ message: 'Logout failed' });
        }
        // console.log(userEmail, "Logout successful");
        res.status(200).json({ message: 'Logout successful' });
    });
};

exports.addClass = async (req, res) => {
    const { session_name, entries, type } = req.body;
    const userId = req.session.userId;
// console.log(userId)
    if (!userId) {
        return res.status(401).json({ message: "User not logged in" });
    }

    if (!session_name || !entries || !Array.isArray(entries) || entries.length === 0 || !type) {
        // console.log("Missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
    }

    for (const entry of entries) {
        const { score, last_session, feedback } = entry;
        if (!score || !last_session || !feedback || !type) {
            // console.log("Missing required fields in entry");
            return res.status(400).json({ message: "Missing required fields in entry" });
        }
    }

    const user = await UserModel.findById(userId);
    if (!user) {
        // console.log("User does not exist");
        return res.status(400).json({ message: "User does not exist" });
    }
    const userData = new BookingModel({
        session_name,
        type,
        entries,
    });

    try {
        // console.log("Booking Data:", userData);
        await userData.save();
        console.log("Booking successful");
        return res.status(200).json({ message: "Booking successful" });
    } catch (error) {
        // console.error("Booking Failed:", error);
        return res.status(400).json({ message: "Booking Failed", error: error.message });
    }
};

// exports.updateClass = async (req, res) => {
//     const { session_name, entries, type } = req.body;
//     const userId = req.session.userId;

//     if (!userId) {
//         return res.status(401).json({ message: "User not logged in" });
//     }

//     if (!session_name || !entries || !Array.isArray(entries) || entries.length === 0 || !type) {
//         console.log("Missing required fields");
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     for (const entry of entries) {
//         const { score, last_session, feedback } = entry;
//         if (!score || !last_session || !feedback || !type) {
//             console.log("Missing required fields in entry");
//             return res.status(400).json({ message: "Missing required fields in entry" });
//         }
//     }

//     try {
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             console.log("User does not exist");
//             return res.status(400).json({ message: "User does not exist" });
//         }

//         // Find existing booking by user and session_name
//         const booking = await BookingModel.findOne({ userId, session_name, type });

//         if (!booking) {
//             // If no existing booking, return an error or create a new one based on your requirements
//             return res.status(404).json({ message: "Booking not found" });
//         }

//         // Update entries field
//         booking.entries.push(...entries); // Add new entries to existing ones

//         await booking.save();
//         console.log("Booking updated successfully");
//         return res.status(200).json({ message: "Booking updated successfully" });
//     } catch (error) {
//         console.error("Failed to update booking:", error);
//         return res.status(400).json({ message: "Failed to update booking", error: error.message });
//     }
// };

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

        // Check for duplicate date and time
        const isDuplicate = entries.some(entry => 
            booking.entries.some(existingEntry => 
                existingEntry.date === entry.date && existingEntry.time === entry.time
            )
        );

        if (isDuplicate) {
            console.log("Date and time are already booked")
            return res.status(400).json({ message: "Date and time are already booked" });
        }

        // Add new entries since there’s no conflict
        booking.entries.push(...entries);
        await booking.save();
        
        return res.status(200).json({ message: "Booking updated successfully" });
    } catch (error) {
        console.error("Failed to update booking:", error);
        return res.status(400).json({ message: "Failed to update booking", error: error.message });
    }
};

exports.getClassSessions = (async (req, res) => {
    try {
        const userId = req.session.userId;
        // console.log("Session userId:", userId);
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not Exist" });
        }
        const sessions = await BookingModel.find({});
        // console.log("Fetched sessions:", sessions);
        return res.status(200).json(sessions);
    } catch (error) {
        // console.error("Failed to fetch sessions:", error);
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
        // console.log(userDate)
        if (userDate) {
            return res.status(400).json({ message: "Date and time already booked" });
        }

        if (date) {
            // Fetch session details for the specific date
            session = await BookingModel.findOne(
                sessionQuery,
                {
                    entries: {
                        $elemMatch: { date: date }
                    }
                }
            );
        } else {
            // Fetch session by ID only
            session = await BookingModel.findById(sessionId);
        }

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json(session);
    } catch (error) {
        // console.error("Failed to fetch session details:", error);
        return res.status(500).json({ message: "Failed to fetch session details" });
    }
};

exports.getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { date } = req.query;

        // Query to match session ID
        const sessionQuery = { _id: sessionId };

        let session;
        
        if (date) {
            // If date is provided, filter the entries array by that date
            session = await BookingModel.findOne(
                sessionQuery,
                {
                    entries: {
                        $elemMatch: { date: date }
                    }
                }
            );
        } else {
            // If no date is provided, fetch the entire session
            session = await BookingModel.findById(sessionId);
        }
        console.log(session);
        console.log(date)

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        console.log("session",session);
        console.log("date",date)
        return res.status(200).json(session);
    } catch (error) {
        console.error("Failed to fetch session details:", error);
        return res.status(500).json({ message: "Failed to fetch session details" });
    }
};

// exports.getLatestSessionDetails = async (req, res) => {
//     try {
//         // Fetch the latest session based on the created date
//         const latestSession = await BookingModel.findOne().sort({ createdAt: -1 });

//         if (!latestSession) {
//             return res.status(404).json({ message: "No sessions found" });
//         }
        
//         console.log(latestSession);
//         return res.status(200).json(latestSession);
//     } catch (error) {
//         console.error("Failed to fetch the latest session details:", error);
//         return res.status(500).json({ message: "Failed to fetch the latest session details" });
//     }
// };


// exports.getSessionDetails = (async (req, res) => {
//     try {
//         const { sessionId } = req.params;
        
//         const session = await BookingModel.findById(sessionId);

//         if (!session) {
//             return res.status(404).json({ message: "Session not found" });
//         }
//         // console.log(session)
//         return res.status(200).json(session);
//     } catch (error) {
//         console.error("Failed to fetch session details:", error);
//         return res.status(500).json({ message: "Failed to fetch session details" });
//     }
// });