var gulp = require('gulp'),
  jade = require('jade'),
  less = require('gulp-less'),
  mocha = require('gulp-mocha'),
  Server = require('karma').Server,
  browserSync = require('browser-sync'),
  stripeDebug = require('gulp-strip-debug'),
  istanbul = require('gulp-istanbul'),
  nodemon = require('gulp-nodemon'),
  change = require('gulp-changed'),
  rename = require('gulp-rename'),
  del = require('del'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  notify = require('gulp-notify'),
  usemin = require('gulp-usemin'),
  imagemin = require('gulp-imagemin'),
  concat = require('gulp-concat'),
  stylish = require('jshint-stylish'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  cache = require('gulp-cache'),
  coveralls = require('gulp-coveralls'),
  rev = require('rev');

// define jshint lint
gulp.task('jshint', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// define clean task
gulp.task('clean', function() {
  return del(['dist/']);
});
// minify css
gulp.task('less', ['jshint'], function() {
  return gulp.src('.../public/css/application.jade')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dis/css'))
    .pipe(notify({
      message: 'less task completed'
    }));
});

// task to minify css and js
gulp.task('usemin', function() {
  return gulp.src()
})

// define task for imagemin
gulp.task('imagemin', function() {
  return del(['dist/images']),
    gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({
      message: 'Images task completed'
    }));
});
// define coverage report
gulp.task('test-coverage', function() {
  return gulp.src('./coverage/lcov/info')
    .pipe(istanbul())
   // .pipe(coveralls())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

//  task for back end test
gulp.task('test:bend', function() {
  return gulp.src('spec/*', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 80%
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: 80
      }
    }));
});

// task for front end test
gulp.task('test:fend', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
  }, done).start();
});

// task to watch files
gulp.task('watch', function() {
  gulp.watch();
  gulp.watch();
})
// task for nodemon
gulp.task('nodemon', function() {
  nodemon({
    ext: 'jade js css',
    script: '',
  })
    .on('watch', ['watch'])
    .on('start', ['watch'])
    .on('restart', function() {
      console.log('Restarted..');
    });
});
 // register default tasks
  gulp.task('default', ['clean'], function() {
    gulp.start('usemin', 'imagemin', 'nodemon', 'build');
  });
// register test task
gulp.task('test', ['test:fend', 'test:bend', 'test-coverage',])