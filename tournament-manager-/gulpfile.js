var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var htmlmin = require('gulp-htmlmin');
var jsonminify = require('gulp-jsonminify');
var del = require('del');
var bower = require('gulp-bower');
var imageop = require('gulp-image-optimization');
var ngmin = require('gulp-ngmin');
var nodemon = require('gulp-nodemon');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');  //prevent watch crash
var gulpsync = require('gulp-sync')(gulp);

gulp.task('server', function () {
  nodemon({
    script: 'app.js'
  , ext: 'js html css scss'
  , env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('sass', function () {
  return gulp.src('./src/style/**/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('clean:public', function() {
  return del('./public/**/*');
});

gulp.task('scripts', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(plumber())
    .pipe(ngmin())
  	.pipe(uglify({mangle: false}))
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('images', function(cb) {
  gulp.src(['src/**/*.png','src/**/*.jpg','src/**/*.gif','src/**/*.jpeg'])
        .pipe(gulp.dest('./public')).on('end', cb).on('error', cb);
});

gulp.task('bower', function() {
  return gulp.src('./src/bower_components/**/*')
  .pipe(gulp.dest('./public/dep/'));
});

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(plumber())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./public/'))
});

gulp.task('locales', function () {
    return gulp.src(['./src/locales/*.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest('./public/locales/'));
});

gulp.task('autoprefixer', function () {
  return gulp.src('./src/style/**/*.scss')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('install-src-dependencies', function() {
  return bower({ cwd: './src' });
});

gulp.task('watch', function () {
  gulp.watch('./src/style/**/*.scss', ['sass']);
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/**/*.js', ['scripts']);
});

gulp.task('default', gulpsync.sync([
    ['prepare-dev-env'],
    ['server'],
    ['watch']
]));

gulp.task('prepare-dev-env', gulpsync.sync([
    // sync
    'clean:public',
    ['install-src-dependencies'],
    [
        // async
        'sass',
        'scripts',
        'html',
        'bower',
        'images',
        'locales'
    ]
]));
