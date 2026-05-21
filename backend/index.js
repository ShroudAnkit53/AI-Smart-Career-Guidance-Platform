require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const interviewRoutes = require("./routes/interviewRoutes");
const aiRoutes = require("./routes/aiRoutes");
const industryRoutes = require("./routes/industryRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const userRoutes = require('./routes/userRoutes');

app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/user', userRoutes);
app.use("/interview", interviewRoutes);
app.use("/ai", aiRoutes);
app.use("/api", industryRoutes);
app.use("/chat", chatRoutes);

mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.error('Could not connect to MongoDB', err))

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});