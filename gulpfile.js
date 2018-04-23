var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var ejs = require('gulp-ejs');
var beautify = require('gulp-beautify');
var jsonFormat = require('gulp-json-format');
const webpack = require('webpack-stream');

var argv = require('yargs')
    .option('target', {
        alias: 't',
        describe: 'Choose build target',
        type: 'array',
        choices: ['chrome', 'firefox'],
        default: 'chrome'
    })
    .option('release', {
        alias: 'r',
        describe: 'Version to build',
        type: 'string',
        default: '0.0.0'
    })
    .option('watch', {
        alias: 'w',
        describe: 'Watch files for changes',
        type: 'boolean',
        default: false
    })
    .argv;

// init args
var target = argv.target;
var version = argv.release;
var tempDir = './distTmp/'+target+'/';
var distDir = './dist/'+target+'/';

// BEGIN TMP

gulp.task('clean', () => {
    return gulp.src([distDir, tempDir], {
        read: false
    }).pipe(clean());
});

gulp.task('ejs', ['clean'], () => {
    return gulp.src('src/**/*')
        .pipe(ejs({
            target: target,
            version: version
        }))
        .pipe(gulp.dest(tempDir+'src'));
});

gulp.task('beautify-js', ['ejs'], () => {
    return gulp.src(tempDir+'src/**/*.js')
        .pipe(beautify({indent_with_tabs: true}))
        .pipe(gulp.dest(tempDir+'src'));
});

gulp.task('beautify-json', ['ejs'], () => {
    return gulp.src(tempDir+'src/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir+'src'));
});

gulp.task('tmp-locales', ['ejs'], () => {
    return gulp.src('locales/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir+'locales'));
})

gulp.task('tmp', ['clean', 'ejs', 'beautify-js', 'beautify-json', 'tmp-locales']);

// END TMP

// BEGIN FINAL-BUILD

gulp.task('final-locales', ['tmp'], () => {
    return gulp.src(tempDir+'locales/**/*')
        .pipe(gulp.dest(distDir+'_locales'));
});

gulp.task('webpack', ['tmp'], () => {
    return gulp.src(tempDir+'/src/**/*.js')
        .pipe(webpack({
            devtool: 'source-map'
          }))
        .pipe(gulp.dest(distDir))
});

gulp.task('html', ['tmp'], () => {
    return gulp.src(tempDir+'/src/**/*.[!js]')
        .pipe(gulp.dest(distDir));
});

gulp.task('final-build', ['final-locales', 'webpack', 'html']);

// END FINAL-BUILD

gulp.task('default', ['tmp', 'final-build']);

// Watch
if (argv.watch) {
    console.log('watching files...');
    var watcher = gulp.watch(['src/**/*', 'locales/**/*'], ['default']);
}