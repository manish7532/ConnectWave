import express from 'express';
import { Mongoose, User, Organization, Event, Participant, Feedback } from './model/db.js';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { Country } from 'country-state-city';
import otpGenerator from 'otp-generator';
import { sendEmail } from './resetPass/email.js';
import mongoose from 'mongoose';
dotenv.config()

const app = express();

//socket connection

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://192.168.137.1:5173",
        ],
        methods: ["GET", "POST"]
    }
});

const connectedUsers = [];
let connections = {}
let timeOnline = {}
io.on('connection', (socket) => {

    // -------------------------- Video ------------------------------

    socket.on("join-call", (data) => {
        if (connections[data[0]] === undefined) {
            connections[data[0]] = [];
        }

        connections[data[0]].push({ id: socket.id, username: data[1], userID: data[3] });
        timeOnline[socket.id] = new Date();

        for (let a = 0; a < connections[data[0]].length; a++) {
            io.to(connections[data[0]][a].id).emit("user-joined", socket.id, connections[data[0]].map(user => user.id), connections[data[0]].map(user => user.username), connections[data[0]].map(user => user.userID));
        }
    });



    socket.on("signal", (toId, message) => {
        io.to(toId).emit("signal", socket.id, message);
    })



    socket.on('leave', (data) => {
        console.log("disconnection data=========>", data)
        const tempArr = connections[data[0]];
        console.log(tempArr)
        for (let a = 0; a < tempArr.length; ++a) {
            if (tempArr[a].id === socket.id) {
                tempArr.splice(a, 1);
                connections[data[0]] = tempArr;
                console.log("after removing user======>", connections[data[0]])
                break;
            }
        }
    })







    // ------------------ chat , QNA, reactions
    socket.on('joined', (user) => {
        // console.log(`${user} has joined`);
        if (!connectedUsers.includes(user)) {
            connectedUsers.push(user);
            io.emit('userList', connectedUsers);
        }
        socket.user = user;
    });

    socket.on('message', ({ user, message }) => {
        io.emit('sendmessage', { user, message });
    });

    socket.on('emoji', (emojiObject) => {
        io.emit('sendEmoji', { emojiObject });
    });

    socket.on('QueAns', ({ user, QueAns, userID }) => {
        io.emit('response', { user, QueAns, userID });
    })



    socket.on('disconnect', () => {
        console.log('disconnected')
        var diffTime = Math.abs(timeOnline[socket.id] - new Date())

        if (socket.user) {
            const index = connectedUsers.indexOf(socket.user);
            if (index !== -1) {
                const userLeft = connectedUsers.splice(index, 1)[0];
                console.log(`${userLeft} left`);
                io.emit('userList', connectedUsers);
            } else {
                console.log("User not found in connectedUsers array.");
            }
            delete socket.user;
        }
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

Mongoose.connect(process.env.MONGO_URI)

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});


app.get("/", (req, res) => { res.send("hello this is node backend!!!") })

//register form post req
app.post('/api/register', (req, res) => {
    const form = formidable({
        keepExtensions: true,
        allowEmptyFiles: true,
        minFileSize: 0
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable parsing error:', err);
            return res.status(500).send({ error: 'Error parsing form data' });
        }

        const email = fields.email[0];
        const firstname = fields.firstname[0];
        const lastname = fields.lastname[0];
        const countryCode = fields.country[0];
        const type = fields.type[0];
        const password = fields.password[0];
        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            console.log(existingUser)
            return res.json(1)
        }

        if (!email || !firstname || !lastname || !type || !password) {
            return res.status(400).json(2);
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const countryData = Country.getCountryByCode(countryCode);
            const countryName = countryData ? countryData.name : '';
            const timezone = countryData?.timezones ? countryData.timezones[0].gmtOffsetName : '';

            const newUser = new User({
                email,
                firstname,
                lastname,
                country: countryName,
                timezone,
                type,
                password: hashedPassword,
            });

            await newUser.save();

            const userFolderPath = path.join(__dirname, '../uploads', newUser._id.toString());
            if (!fs.existsSync(userFolderPath)) {
                fs.mkdirSync(userFolderPath);
            }

            if (files.profilePhoto) {
                const file = files.profilePhoto;
                const newFilePath = path.join(userFolderPath, file[0].originalFilename);
                await fs.promises.rename(file[0].filepath, newFilePath);
                await User.updateOne({ _id: newUser._id }, { $set: { profilePhoto: newFilePath } })
            }

            res.status(201).json(3);

        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error saving user' });
        }
    });
});

//org form post req
app.post('/api/organization', (req, res) => {

    const form = formidable({
        keepExtensions: true,
        allowEmptyFiles: true,
        minFileSize: 0,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable parsing error:', err);
            return res.status(500).send({ error: 'Error parsing form data' });
        }

        const { email, org_Name, domain } = fields;
        const logoFile = files.logo ? files.logo[0] : null;

        if (!email || !org_Name || !domain) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email: email[0] });

        if (!existingUser) {
            return res.status(202).json({ message: "User not found" });
        }

        try {

            const newOrganization = new Organization({
                userID: existingUser._id,
                org_Name: org_Name[0],
                domain: domain[0],
                logo: '',
            });

            await newOrganization.save();

            const orgFolderPath = path.join(__dirname, '../Org_logo', newOrganization._id.toString());
            if (!fs.existsSync(orgFolderPath)) {
                fs.mkdirSync(orgFolderPath);
            }

            if (logoFile) {
                const logoFilePath = path.join(orgFolderPath, logoFile.originalFilename);
                await fs.promises.rename(logoFile.filepath, logoFilePath);

                newOrganization.logo = logoFilePath;
                await newOrganization.save();
            }

            res.status(201).json({ message: 'Organization registered successfully', organization: newOrganization });

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error saving organization' });
        }
    });
});

const jwtSecret = process.env.SECRET;

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Incorrect username" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '10d' });

        return res.status(200).json({ message: "Login success", token, user });
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Middleware to verify JWT token
function isAuthenticated(req, res, next) {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenWithoutBearer = token.split(' ')[1];
    const decode = jwt.verify(tokenWithoutBearer, jwtSecret)
    req.userID = decode.userId
    next();
}

//login verification route
app.get('/api/verify', isAuthenticated, (req, res) => {
    res.status(200).json({ message: "User authorized" });
});

// Logout route 
app.get('/api/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

//generate otp function defination
const generateOTP = () => {
    return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
};

//otp generate route
app.post('/api/resetPass', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p>`,
        };
        sendEmail(mailOptions);
        return res.status(200).json({ otp: otp });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//change pass route 
app.post('/api/changePass', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



// POST route to handle feedback submission
app.post('/api/feedback', async (req, res) => {
    const { eventID, userID, rating, audioQuality, videoQuality, suggestion } = req.body;


    try {
        if (rating && audioQuality && videoQuality) {
            const audienceSatisfaction = (audioQuality + videoQuality + rating) / 3;
            const newFeedback = new Feedback({
                eventID,
                userID,
                rating,
                audioQuality,
                videoQuality,
                audienceSatisfaction,
                suggestion
            });

            await newFeedback.save();

            res.status(201).json({ message: 'Feedback submitted successfully' });
        }
        else {
            res.status(404).json({ message: "Ratings are required" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
});

//---------schedule a new meeting------------------------
app.post('/api/schedule', async (req, res) => {
    const {
        userID,
        meetingTitle,
        description,
        participants,
        duration,
        recordingsOption,
        Q_AOption,
        waitingRoomOption,
        selectedCountryIsoCode,
        meetingStartDate,
        meetingStartTime,
        meetingEndDate
    } = req.body;

    try {
        const startDateTime = new Date(meetingStartDate);
        const endDateTime = new Date(meetingEndDate);

        const newMeeting = new Event({
            organizerId: userID,
            title: meetingTitle,
            description,
            startDate: startDateTime,
            endDate: endDateTime,
            duration: Number(duration),
            time: startDateTime,
            timeZone: Country.getCountryByCode(selectedCountryIsoCode).timezones[0].gmtOffsetName,
            recordings: recordingsOption,
            QnA: Q_AOption,
            waitingRoom: waitingRoomOption,
            participantLimit: Number(participants)
        });

        await newMeeting.save();

        return res.status(201).json({ message: 'Meeting scheduled successfully', meeting: newMeeting });
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        return res.status(500).json({ error: 'Failed to schedule meeting' });
    }
});




//---------------new instant meeting---------------------
app.post('/api/event', async (req, res) => {
    try {
        const d = new Date()
        const userID = new mongoose.Types.ObjectId(req.body.userID);
        const newEvent = new Event({ title: 'Instant Meeting', organizerId: userID, startDate: d, endDate: d, Time: d, Recordings: true, QnA: true, Feedback: true, WaitingRoom: true, timeZone: 'UTC+05:30' });
        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        console.log(error);
        res.status(400).send("something went wrong")
    }
})




// ---------------- get event details ----------------
app.post('/api/getEvent', async (req, res) => {
    try {
        const roomID = new mongoose.Types.ObjectId(req.body.roomID)
        const event = await Event.findOne({ _id: roomID })
        if (event) {
            res.status(201).json({ message: 'Event Found', event: event });
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(400).json("something went wrong")
    }
})


//------------show scheduled events------------
app.get('/api/smeetings', async (req, res) => {
    try {
        const meetings = await Event.find();
        return res.status(200).json({ meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// --------------------delete Event--------------
app.post('/api/deleteEvent', async (req, res) => {
    try {
        const id = req.body.id;
        const deletedMeeting = await Event.deleteOne({ _id: id });
        if (!deletedMeeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.status(200).json({ message: 'Meeting deleted successfully', deletedMeeting });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




//---------------- saving evnt participants ------------------------
app.post('/api/participants', async (req, res) => {
    try {
        const d = new Date()
        const data = [req.body.userID, req.body.eventID, req.body.role]
        if (data) {
            const user = await User.findOne({ _id: data[0] });
            const event = await Event.findOne({ _id: data[1] });
            const participant = await Participant.findOne({ userID: data[0], eventID: data[1] });
            if (participant) {
                const tempArray = participant.joinedAt;
                tempArray.push(d)
                await Participant.updateOne({ userID: data[0], eventID: data[1] }, { $set: { joinedAt: tempArray } })
            }
            else {
                const participant = new Participant({
                    userID: data[0],
                    eventID: data[1],
                    joinedAt: [d],
                    role: data[2] ? 'host' : 'user',
                    duration: 0
                })
                await participant.save();
            }
            res.send("Everything OK! 👍")
        }
    } catch (error) {
        res.status(404).send({ message: 'somethihng went wrong' });
        console.log(error)
    }
})


app.post('/api/participants-left', async (req, res) => {
    try {
        const data = [req.body.userID, req.body.eventID];
        let participant = await Participant.findOne({ userID: data[0], eventID: data[1] });
        let joinArray = participant.joinedAt;
        let leftArray = participant.leftAt;
        let duration = participant.duration;
        leftArray.push(new Date());
        const i = joinArray.length - 1;
        duration += parseInt(Math.round((leftArray[i] - joinArray[i]) / 60000));
        await Participant.updateOne({ userID: data[0], eventID: data[1] }, {
            $set: {
                leftAt: leftArray,
                duration: duration
            }
        })
        res.status(201).json({ message: 'success' });
    } catch (error) {
        console.log(error);
        res.status(404).send({ message: 'somethihng went wrong' });
    }
})


// ------------ finding user participated eventts-----------
app.post('/api/getMyMeetings', async (req, res) => {
    try {
        const userID = req.body.userID;
        const meetings = await Participant.find({ userID: userID });
        res.status(201).json({ meetings });
    } catch (error) {
        res.status(404).send('Something went wrong');
    }
})



//----------------remove previous photos form filesystem----------------
function removeAllFilesSync(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        fs.unlinkSync(filePath);
    }
}



// ------------------ profile photo update ----------------
app.post('/api/profilePhoto', (req, res) => {
    const form = formidable({
        keepExtensions: true,
        allowEmptyFiles: false,
        minFileSize: 1
    });

    form.parse(req, async (err, fields, files) => {

        if (err) {
            console.error('Formidable parsing error:', err);
            return res.status(500).send({ error: 'Error parsing form data' });
        }

        if (!files.profilePhoto) {
            return res.status(400).send({ error: 'No file uploaded' });
        }
        const userId = fields.userID[0]
        try {
            const user = await User.findById({ _id: userId });
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }

            const file = files.profilePhoto;
            const userFolderPath = path.join(__dirname, '../uploads', userId);
            const newFileName = file[0].originalFilename;
            const newFilePath = path.join(userFolderPath, newFileName);

            if (!fs.existsSync(userFolderPath)) {
                fs.mkdirSync(userFolderPath, { recursive: true });
            }
            removeAllFilesSync(userFolderPath) // deleting previous files
            await fs.promises.rename(file[0].filepath, newFilePath);
            user.profilePhoto = newFileName;
            await user.save();

            res.status(200).json({ user });

        } catch (error) {
            console.error('Error uploading profile photo:', error);
            res.status(500).send({ error: 'Error uploading profile photo' });
        }
    });
});
