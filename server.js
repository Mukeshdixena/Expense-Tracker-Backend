require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const user = require('./src/models/user.js')
const expense = require('./src/models/expense.js')
const Passwords = require('./src/models/passwords.js')
const ExpenseDownload = require('./src/models/expensesDownload.js')


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/view')));


const PORT = process.env.PORT || 3000;

const sequelize = require('./src/util/database.js');
const expenseRouter = require('./src/router/expenseRouter.js');
const userRouter = require('./src/router/userRouter.js');
const paymentService = require('./src/router/paymentService.js');
const expenseDownloadRouter = require("./src/router/expenseDownloadRouter.js");

app.use(expenseRouter);
app.use(userRouter);
app.use(paymentService);
app.use(expenseDownloadRouter);

user.hasMany(expense);
expense.belongsTo(user);

user.hasMany(Passwords);
Passwords.belongsTo(user);

user.hasMany(ExpenseDownload);
ExpenseDownload.belongsTo(user);

app.get("/test", (req, res) => {
    res.send("Hello, Express!");
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view', 'index.html'));
});

sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error(err));
