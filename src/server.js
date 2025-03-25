const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const user = require('./models/user.js')
const expense = require('./models/expense.js')
const Passwords = require('./models/passwords.js')
const ExpenseDownload = require('./models/expensesDownload.js')
require('dotenv').config();


app.use(cors({
    origin: '*',  // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allows all standard methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Include authorization if needed
    credentials: true // Allows credentials (cookies, authorization headers)
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const sequelize = require('./util/database.js');
const expenseRouter = require('./router/expenseRouter');
const userRouter = require('./router/userRouter');
const paymentService = require('./router/paymentService.js');
const expenseDownloadRouter = require("./router/expenseDownloadRouter.js");

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

app.get("/", (req, res) => {
    res.send("jenkins Development, Express!");
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
