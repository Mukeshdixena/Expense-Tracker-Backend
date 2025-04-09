require('dotenv').config();
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const expenseRouter = require('./src/router/expenseRouter.js');
const userRouter = require('./src/router/userRouter.js');
const paymentService = require('./src/router/paymentService.js');
const expenseDownloadRouter = require("./src/router/expenseDownloadRouter.js");

const User = require('./src/models/user.js');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.use(expenseRouter);
app.use(userRouter);
app.use(paymentService);
app.use(expenseDownloadRouter);

app.get("/", (req, res) => {
    res.send("Hello, Express + MongoDB!");
});

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("MongoDB Connected");


        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });
