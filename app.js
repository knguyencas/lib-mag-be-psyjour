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
const adminManageBooksRoutes = require('./routes/adminManageBooks.route');
const adminManagePostsRoutes = require('./routes/adminManagePosts.route');
const visualPostRoute = require('./routes/visualPost.route');
const perspectivePostRoute = require('./routes/perspectivePost.route');
const userPerspectivePostsRoutes = require('./routes/userPerspectivePosts.route');
const userVotesRoutes = require('./routes/userVotes.route');
const userReadingProgressRouter = require('./routes/userReadingProgress.route');
const userBooksRoutes = require('./routes/userBooks.route');
const userFavoritesRoutes = require('./routes/userFavorites.route');

const errorHandler = require('./middleware/errorHandler');

var app = express();

var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./config/swagger');

const allowedOrigins = [
  'http://localhost:5173',
  'https://lib-mag.vercel.app',
  
  'https://lib-mag-be-psyjour.onrender.com',
  'http://localhost:3000',
  
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://127.0.0.1:5502',
  'http://localhost:5502',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      console.log('CORS: No origin (same-origin or non-browser request)');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Allowed origin:', origin);
      return callback(null, true);
    }
    
    if (origin.endsWith('.vercel.app')) {
      console.log('CORS: Vercel deployment:', origin);
      return callback(null, true);
    }
    
    if (origin.includes('render.com')) {
      console.log('CORS: Render domain:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Blocked origin:', origin);
    var msg = 'The CORS policy for this site does not allow access from the specified origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/admin/books', adminManageBooksRoutes);
app.use('/api/admin/posts', adminManagePostsRoutes);
app.use('/api/visualpost', visualPostRoute);
app.use('/api/perspectivepost', perspectivePostRoute);
app.use('/api/perspective-posts', userPerspectivePostsRoutes);
app.use('/api/votes', userVotesRoutes);
app.use('/api/favorites', userFavoritesRoutes);
app.use('/api', userReadingProgressRouter);

app.use('/api/books', userBooksRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { 
      display: none; 
    }
    .swagger-ui .info { 
      margin: 20px 0; 
    }
  `,
  customSiteTitle: 'PsycheJournal API Documentation',
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true,
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

app.use(errorHandler);

module.exports = app;