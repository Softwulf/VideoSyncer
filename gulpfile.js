var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var ejs = require('gulp-ejs');
var beautify = require('gulp-beautify');
var jsonFormat = require('gulp-json-format');
var webpack = require('webpack-stream');
var glob = require('glob');
var path = require('path');

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
var tempDir = './distTmp/' + target + '/';
var distDir = './dist/' + target + '/';

// BEGIN TMP

gulp.task('clean', () => {
    return gulp.src([distDir, tempDir], {
        read: false
    }).pipe(clean());
});

gulp.task('raw', ['clean'], () => {
    return gulp.src('src/**/*.!(js|entry.js|json|css|html)')
        .pipe(gulp.dest(tempDir + 'src'));
});

gulp.task('ejs', ['raw'], () => {
    return gulp.src('src/**/*.@(js|entry.js|json|css|html)')
        .pipe(ejs({
            target: target,
            version: version
        }))
        .pipe(gulp.dest(tempDir + 'src'));
});

gulp.task('beautify-js', ['ejs'], () => {
    return gulp.src(tempDir + 'src/**/*.js')
        .pipe(beautify({
            indent_with_tabs: true
        }))
        .pipe(gulp.dest(tempDir + 'src'));
});

gulp.task('beautify-json', ['ejs'], () => {
    return gulp.src(tempDir + 'src/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir + 'src'));
});

gulp.task('tmp-locales', ['ejs'], () => {
    return gulp.src('locales/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir + 'locales'));
})

gulp.task('tmp', ['clean', 'raw', 'ejs', 'beautify-js', 'beautify-json', 'tmp-locales']);

// END TMP

// BEGIN FINAL-BUILD

gulp.task('final-locales', ['tmp'], () => {
    return gulp.src(tempDir + 'locales/**/*')
        .pipe(gulp.dest(distDir + '_locales'));
});

gulp.task('webpack', ['tmp'], () => {
    // map files
    var entryArray = glob.sync(tempDir + '/**/*.entry.js');
    var entryObject = entryArray.reduce((acc, item) => {
        const name = item.replace(tempDir+'src/', '').replace('.entry.js', '.js');
        acc[name] = item;
        return acc;
    }, {});

    return gulp.src(tempDir + '/src/**/*.js')
        .pipe(webpack({
            devtool: 'source-map',
            entry: entryObject,
            output: {
                filename: '[name]',
            },
            module: {
                loaders: [
                    {
                        test: /\.js?$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015', 'react', 'stage-0'],
                        },
                    },
                    {
                        test: /\.css$/,
                        loader: ['style-loader', 'css-loader']
					},
                    {
                        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                        use: {
                            loader: 'url-loader',
                            options: {
                                limit: 0
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(distDir))
});

gulp.task('files', ['webpack'], () => {
    return gulp.src(tempDir + '/src/**/*.!(js)')
        .pipe(gulp.dest(distDir));
});

gulp.task('final-build', ['final-locales', 'webpack', 'files']);

// END FINAL-BUILD

gulp.task('default', ['tmp', 'final-build']);

// Watch
if (argv.watch) {
    console.log('watching files...');
    var watcher = gulp.watch(['src/**/*', 'locales/**/*'], ['default']);
}