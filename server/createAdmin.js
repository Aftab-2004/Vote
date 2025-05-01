const mongoose = require('mongoose');
const admin = require('./src/models/admin');
const md5 = require('md5');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/elections', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    
    // Create admin user
    const newAdmin = new admin({
        username: 'admin',
        password: md5('admin123')
    });

    newAdmin.save()
        .then(() => {
            console.log('Admin user created successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error creating admin user:', err);
            process.exit(1);
        });
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
}); 