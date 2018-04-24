var gulp = require('gulp');
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

var version = argv.release;

function createTask(name, depends, exec) {
    function build(target) {
        var tempDir = './distTmp/' + target + '/';
        var distDir = './dist/' + target + '/';

        var targetSuffix = '-' + target;

        var tmpDepends = [];

        if (depends) {
            for (var i = 0; i < depends.length; i++) {
                tmpDepends.push(depends[i]+targetSuffix);
            }
        }

        gulp.task(name + targetSuffix, tmpDepends, () => {
            if(exec) return exec(target, tempDir, distDir);
        })
    }

    if (argv.target instanceof Array) {
        for (let target of argv.target) {
            build(target);
        }
    } else {
        var target = argv.target;
        build(target);
    }
}

// BEGIN TMP

createTask('clean', null, (target, tempDir, distDir) => {
    return gulp.src([distDir, tempDir], {
        read: false
    }).pipe(clean());
});

createTask('raw', ['clean'], (target, tempDir, distDir) => {
    return gulp.src('src/**/*.!(js|entry.js|json|css|html)')
        .pipe(gulp.dest(tempDir + 'src'));
});

createTask('ejs', ['raw'], (target, tempDir, distDir) => {
    return gulp.src('src/**/*.@(js|entry.js|json|css|html)')
        .pipe(ejs({
            target: target,
            version: version
        }))
        .pipe(gulp.dest(tempDir + 'src'));
});

createTask('beautify-js', ['ejs'], (target, tempDir, distDir) => {
    return gulp.src(tempDir + 'src/**/*.js')
        .pipe(beautify({
            indent_with_tabs: true
        }))
        .pipe(gulp.dest(tempDir + 'src'));
});

createTask('beautify-json', ['ejs'], (target, tempDir, distDir) => {
    return gulp.src(tempDir + 'src/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir + 'src'));
});

createTask('tmp-locales', ['ejs'], (target, tempDir, distDir) => {
    return gulp.src('locales/**/*.json')
        .pipe(jsonFormat(4))
        .pipe(gulp.dest(tempDir + 'locales'));
})

createTask('tmp', ['clean', 'raw', 'ejs', 'beautify-js', 'beautify-json', 'tmp-locales'], null);

// END TMP

// BEGIN FINAL-BUILD

createTask('final-locales', ['tmp'], (target, tempDir, distDir) => {
    return gulp.src(tempDir + 'locales/**/*')
        .pipe(gulp.dest(distDir + '_locales'));
});

createTask('webpack', ['tmp'], (target, tempDir, distDir) => {
    // map files
    var entryArray = glob.sync(tempDir + '/**/*.entry.js');
    var entryObject = entryArray.reduce((acc, item) => {
        const name = item.replace(tempDir + 'src/', '').replace('.entry.js', '.js');
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

createTask('files', ['webpack'], (target, tempDir, distDir) => {
    return gulp.src(tempDir + '/src/**/*.!(js)')
        .pipe(gulp.dest(distDir));
});

createTask('final-build', ['final-locales', 'webpack', 'files']);

// END FINAL-BUILD

createTask('build', ['tmp', 'final-build']);

var buildList = [];

if (argv.target instanceof Array) {
    for (let target of argv.target) {
        buildList.push('build-'+target);
    }
} else {
    var target = argv.target;
    buildList.push('build-'+target);
}

gulp.task('default', buildList);

// Watch
if (argv.watch) {
    console.log('watching files...');
    var watcher = gulp.watch(['src/**/*', 'locales/**/*'], ['default']);
}