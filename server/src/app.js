const express = require('express');
const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const expressValidator = require('express-validator');
const electionName = require('./models/electionName');
const admin = require('./models/admin');
const User = require('./models/user');
const md5 = require('md5');
require('./db/mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

// Helper function for API responses
const sendResponse = (res, status, success, data, message) => {
    res.status(status).json({
        success,
        data,
        message
    });
};

// Basic middleware to check if required fields are present
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        for (let field of requiredFields) {
            if (!req.body[field]) {
                return sendResponse(res, 400, false, null, `${field} is required`);
            }
        }
        next();
    };
};

app.get('/', function(req, res) {
    sendResponse(res, 200, true, 'Works!', 'Server is running');
});

// Admin Login
app.post('/api/adminLogin', validateFields(['username', 'password']), async function(req, res) {
    try {
        const adminUser = await admin.findOne({
            username: req.body.username,
            password: md5(req.body.password)
        });
        
        if (!adminUser) {
            return sendResponse(res, 401, false, null, 'Invalid admin credentials');
        }
        
        sendResponse(res, 200, true, { username: adminUser.username }, 'Admin login successful');
    } catch (error) {
        sendResponse(res, 500, false, null, 'Error during admin login');
    }
});

// User Registration
app.post('/api/register', validateFields(['username', 'password', 'voterID']), async (req, res) => {
    try {
        const existingUser = await User.findOne({ 
            $or: [
                { username: req.body.username },
                { voterID: req.body.voterID }
            ]
        });

        if (existingUser) {
            return sendResponse(res, 400, false, null, 'Username or VoterID already exists');
        }

        const user = new User({
            username: req.body.username,
            password: md5(req.body.password),
            voterID: req.body.voterID
        });

        await user.save();
        sendResponse(res, 201, true, { username: user.username }, 'User registered successfully');
    } catch (error) {
        sendResponse(res, 500, false, null, 'Error registering user');
    }
});

// User Login
app.post('/api/login', validateFields(['username', 'password']), async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
            password: md5(req.body.password)
        });

        if (!user) {
            return sendResponse(res, 401, false, null, 'Invalid credentials');
        }

        sendResponse(res, 200, true, {
            username: user.username,
            role: user.role,
            voterID: user.voterID
        }, 'Login successful');
    } catch (error) {
        sendResponse(res, 500, false, null, 'Error during login');
    }
});

// Election Routes
app.get('/api/electionName', async function(req, res) {
    try {
        const elections = await electionName.find({});
        sendResponse(res, 200, true, elections, 'Elections retrieved successfully');
    } catch (error) {
        sendResponse(res, 500, false, null, 'Error retrieving elections');
    }
});

app.post('/api/electionName', validateFields(['election_name', 'election_organizer', 'election_password']), async function(req, res) {
    try {
        const election = await electionName.create({
            election_id: Math.floor(Math.random() * 100),
            election_name: req.body.election_name,
            election_organizer: req.body.election_organizer,
            election_password: md5(req.body.election_password),
        });
        sendResponse(res, 201, true, election, 'Election created successfully');
    } catch (error) {
        sendResponse(res, 500, false, null, 'Error creating election');
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server is up on port " + port);
}); 