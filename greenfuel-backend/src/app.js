require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/db');
const Admin = require('./models/Admin');
const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to DB:', err));

sequelize.sync({ alter: true }) // adjust in dev only
  .then(() => console.log('All models synced.'))
  .catch(err => console.error('Sync error:', err));


app.get('/', (req, res) => {
    res.send('GreenFuel Asset Management Backend is running.');
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})