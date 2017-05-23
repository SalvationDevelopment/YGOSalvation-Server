var gulp   = require( 'gulp' );
var rename = require('gulp-rename');
var mocha  = require('gulp-mocha');
var babel  = require('gulp-babel');
require( 'gulp-watch' );

gulp.task( 'babel', function()
{
  return gulp.src( 'src/*.js' )
    .pipe( babel(
    {
      experimental: true,
      modules: 'umd'
    } ) )
    .pipe( rename(
    {
      extname: '.js'
    } ) )
    .pipe( gulp.dest( './' ) );
});

gulp.task( 'test', ['babel'], function()
{
  return gulp.src( 'tests.js' )
    .pipe( mocha() );
});

gulp.task( 'default', ['test'], function()
{
  gulp.watch( ['src/*.js', 'tests.js'], ['test'] );
} );