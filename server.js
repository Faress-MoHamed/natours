const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });


const port = 3000;
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected...');
  });




app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
