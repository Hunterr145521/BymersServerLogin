const express  =  require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

// connection with database server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}
).then(() => {
    console.log("DB Connected")
})
.catch(err => {
    console.log("DB Connected Error: ", err);
})

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

// app middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(cors()); // allows all origins 

if((process.env.NODE_ENV = 'developmment')) {
    app.use(cors({origin: `http://localhost:3000`}));
}

// middleware
app.use('/api',authRoutes)
app.use('/api',userRoutes)

const port = process.env.PORT || 3030;

app.listen(port, () => {
    console.log(`Server running on port ${port} 🔥`);
});