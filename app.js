const createError = require('http-error');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookies = require('cookie-parser')
const router = require('./routes/index');
const books = require('./routes/books');
const sequelize = require('./models/index.js').sequelize;

const app = express();

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    
        console.log("Connection to the database successful!");
    
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const errors = error.errors.map((err) => err.message);
          console.error("Connection to the database was unsuccessful.", errors);
        }
      }
    
    })();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.use('/books', books);

app.use(function(req, res, next) {
  next(createError(404));
});
app.use((err, res) => {
  if (err) {
    if (err.status === 404) {
      res.status(404)
      render(err.message, { err });
    } else {
      err.message = "Oh no! There was an error.";
      res.status(500).render('error', { err });
    }
  }
}); 

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;