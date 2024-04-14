import express from 'express';
import { Mongoose, User, Organization } from './model/db.js';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';
import { Country } from 'country-state-city';

dotenv.config();

const app = express();

Mongoose.connect(process.env.MONGO_URI);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});


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
                console.log(file)
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

