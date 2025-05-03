const express = require("express");

const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const db = require("./config/Database.js");
const SequelizeStore = require("connect-session-sequelize");
const UserRoute = require("./routes/UserRoute.js");
const AuthRoute = require("./routes/AuthRoute.js");
const associateModels = require('./models/association.js');
const Representative = require("./routes/RepresentativeRoutes.js");
const Vendor = require("./routes/VendorRoute.js");
const Lead = require("./routes/LeadRoute.js");

dotenv.config();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

const app = express();
app.use(express.json());
(async () => {
    await db.sync();
})();
associateModels();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true, //true
    store: store,
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: 'auto'
    }
}));


app.use(cors());
app.use("", express.static("uploads"));
app.use(express.json());
app.use(UserRoute);
app.use(AuthRoute);
app.use(Representative);
app.use(Vendor);
app.use(Lead);

app.use("../uploads", express.static("uploads"));
store.sync();

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}...`);
});
