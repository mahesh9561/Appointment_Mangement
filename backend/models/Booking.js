// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const BookingSchema = new Schema({
//     session_name: {
//         type: String,
//         immutable: true 
//     },
//     type: {
//         type: String,
//         immutable: true 
//     },
  
//     entries: [
//         {
//             score: {
//                 type: String,  
//             },
//             last_session: {
//                 type: String,  
//             },
//             feedback: {
//                 type: String,
//             },
//             type: {
//                 type: String,
//             },
//             date: {
//                 type: String,
//             },
//             time: {
//                 type: String,
//             },
//         }
//     ],
// });


// module.exports = mongoose.model('Booking', BookingSchema);


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
    score: {
        type: String,  
    },
    last_session: {
        type: String,  
    },
    feedback: {
        type: String,
    },
    type: {
        type: String,
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    },
}, { _id: true }); // Ensures each entry has a unique _id

const BookingSchema = new Schema({
    session_name: {
        type: String,
        immutable: true 
    },
    type: {
        type: String,
        immutable: true 
    },
    entries: [EntrySchema] // Reference EntrySchema for automatic _id generation
});

module.exports = mongoose.model('Booking', BookingSchema);
