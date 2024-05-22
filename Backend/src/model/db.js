import Mongoose from 'mongoose';
const Schema = Mongoose.Schema;

// Users Schema
const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    profilePhoto: { type: String, default: '' },
    country: { type: String },
    timezone: { type: String },
    type: { type: String, enum: ['Organization', 'Individual'], required: true },
    password: {
        type: String,
        required: true
    }
});

// Organizations Schema
const organizationSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    org_Name: { type: String, required: true },
    domain: { type: String },
    logo: { type: String },
    theme: { type: String }
});

// Events Schema
const eventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: Number },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    Time: { type: Date },
    timeZone: { type: String },
    registrationCriteria: { type: String },
    Recordings: { type: Boolean },
    QnA: { type: Boolean },
    chatType: { type: String, enum: ['All', 'Host', 'Persontoperson'] },
    Feedback: { type: Boolean },
    WaitingRoom: { type: Boolean },
    privacySetting: { type: String, enum: ['public', 'private'] },
    participantLimit: { type: Number }
});

// Participants Schema
const participantSchema = new Schema({
    eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: [{ type: Date }],
    leftAt: [{ type: Date }],
    duration: { type: Number },
    matchCriteria: { type: Boolean },
    role: { type: String, enum: ['host', 'co-host', 'moderator', 'user'] }
});

// InteractiveFeatures Schema
const interactiveFeaturesSchema = new Schema({
    eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responsesToPoll: { type: Boolean },
    noOfQuestions: { type: Boolean },
    liveReactions: { type: Boolean },
    engagementMetrics: { type: Boolean }
});

// Recordings Schema
const recordingSchema = new Schema({
    eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    pathToVideo: { type: String },
    Date: { type: Date }
});

// Feedbacks Schema
const feedbackSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true },
    audioQuality: { type: Number, required: true },
    videoQuality: { type: Number, required: true },
    audienceSatisfaction: { type: Number },
    suggestion: { type: String }
});

// Analytics Schema
const analyticsSchema = new Schema({
    eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    successRate: { type: String }
});

// models
const User = Mongoose.model('User', userSchema);
const Organization = Mongoose.model('Organization', organizationSchema);
const Event = Mongoose.model('Event', eventSchema);
const Participant = Mongoose.model('Participant', participantSchema);
const InteractiveFeatures = Mongoose.model('InteractiveFeatures', interactiveFeaturesSchema);
const Recording = Mongoose.model('Recording', recordingSchema);
const Feedback = Mongoose.model('Feedback', feedbackSchema);
const Analytics = Mongoose.model('Analytics', analyticsSchema);

//exporting models
export {
    Mongoose,
    User,
    Organization,
    Event,
    Participant,
    InteractiveFeatures,
    Recording,
    Feedback,
    Analytics
};
