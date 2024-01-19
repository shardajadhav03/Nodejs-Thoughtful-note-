const express = require('express')
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const Note = require("./models/Note")
const User = require("./models/User")
const app = express()
const port = 3000

app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));


const dbUrl = 'mongodb+srv://sharda03:zwMFdS7gKo1obX3B@cluster0.l1ltq.mongodb.net/';

async function connectToMongoDB() {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tls: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

connectToMongoDB();



//Endpoints to server the HTML
app.get('/', (req, res) => {
    res.sendFile('/pages/index.html', { root: __dirname })
})
app.get('/login', (req, res) => {
    res.sendFile('/pages/login.html', { root: __dirname })
})
app.get('/signup', (req, res) => {
    res.sendFile('/pages/signup.html', { root: __dirname })
})
app.get('/dashboard', (req, res) => {
    res.sendFile('/pages/dashboard.html', { root: __dirname })
})
app.get('/notepage', (req, res) => {
    res.sendFile('/pages/notepage.html', { root: __dirname })
})

//Endpoints for APIs
app.post('/getnotes', async (req, res) => {
    // const { userToken } = req.body
    let notes = await Note.find({ email: req.body.email })
    res.status(200).json({ success: true, notes })
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        let existingUser = await User.findOne({ email });

        // If the user is not found, return an error
        if (!existingUser) {
            return res.status(200).json({ success: false, message: 'No user found' });
        }
        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.status(200).json({ success: false, message: 'Incorrect password' });
        }
        res.status(200).json({ success: true, user: { email: existingUser.email }, redirectTo: '/dashboard' });
        
        // return res.send('Redirecting to /dashboard');
        // res.redirect('/dashboard')
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json({ success: false, message: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(200).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/addnote', async (req, res) => {
    // const { userToken } = req.body
    let newNote = await Note.create(req.body)
    res.status(200).json({ success: true, newNote })
})

app.post('/deletenote', async (req, res) => {
    try {
        const { noteId } = req.body;

        // Check if the noteId is provided
        if (!noteId) {
            return res.status(400).json({ success: false, message: 'Note ID is required for deletion' });
        }

        // Assuming you have the user's email associated with the note
        const userEmail = req.body.email;

        // Check if the note exists and belongs to the logged-in user
        const existingNote = await Note.findOne({ _id: noteId, email: userEmail });

        if (!existingNote) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Delete the note
        await Note.deleteOne({ _id: noteId });

        res.status(200).json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`)
})