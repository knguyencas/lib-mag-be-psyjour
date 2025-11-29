var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books.route');
var authorsRouter = require('./routes/authors.route');
const epubSplitRoute = require('./routes/epubSplit.route');
const authRoutes = require('./routes/auth.route');
const adminMetaRoutes = require('./routes/adminMeta.route');
const adminBookRoutes = require('./routes/adminBooks.route');
const adminUserRoutes = require('./routes/adminUser.route');
const errorHandler = require('./middleware/errorHandler');

var app = express();

var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./config/swagger');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api', epubSplitRoute);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminMetaRoutes);
app.use('/api/admin', adminBookRoutes);
app.use('/api/admin', adminUserRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;