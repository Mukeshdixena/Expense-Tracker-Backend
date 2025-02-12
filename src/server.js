const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const user = require('./models/user.js')
const expense = require('./models/expense.js')


app.use(cors({
    origin: '*',  // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allows all standard methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Include authorization if needed
    credentials: true // Allows credentials (cookies, authorization headers)
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const sequelize = require('./util/database.js');
const expenseRouter = require('./router/expenseRouter');
const userRouter = require('./router/userRouter');

app.use(expenseRouter);
app.use(userRouter);

user.hasMany(expense);
expense.belongsTo(user);

app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

sequelize
    .sync({ force: true })
    // .sync()
    .then(result => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.log(err));
