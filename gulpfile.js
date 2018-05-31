var gulp = require('gulp');
var clean = require('gulp-clean');
var ejs = require('gulp-ejs');
var beautify = require('gulp-beautify');
var jsonFormat = require('gulp-json-format');
var webpack = require('webpack-stream');
var glob = require('glob');
var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var config = require('./config');

var argv = require('yargs')
    .option('target', {
        alias: 't',
        describe: 'Choose build target',
        type: 'array',
        choices: ['chrome', 'firefox', 'opera'],
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
    .option('production', {
        alias: 'prod',
        describe: 'Build in production mode?',
        type: 'boolean',
        default: false
    })
    .argv;

// init args

var version = argv.release;
var production = argv.production;

function createTask(name, depends, exec) {
    function build(target) {
        var tempDir = './distTmp/' + target + '/';
        var distDir = './dist/' + target + '/';

        var targetSuffix = '-' + target;

        var tmpDepends = [];

        if (depends) {
            for (var i = 0; i < depends.length; i++) {
                tmpDepends.push(depends[i] + targetSuffix);
            }
        }

        gulp.task(name + targetSuffix, tmpDepends, () => {
            if (exec) return exec(target, tempDir, distDir);
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
            version: version,
            production: production,
            config: config
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
    const fileEndings = [
        '.entry.jsx',
        '.entry.tsx',
        '.entry.js',
        '.entry.ts'
    ]

    // map files
    var entryArray = glob.sync(tempDir + '/**/*.entry.*');
    var entryObject = entryArray.reduce((acc, item) => {
        let name = item.replace(tempDir + 'src/', '');
        fileEndings.forEach(ending => {
            name = name.replace(ending, '.js');
        })
        acc[name] = item;
        return acc;
    }, {});

    var webpackConfig = {
        entry: entryObject,
        mode: argv.production ? 'production' : 'development',
        output: {
            filename: '[name]',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx']
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    use: 'url-loader'
                }
            ]
        }
    };

    if (argv.production) {
        webpackConfig.plugins = [
            new UglifyJsPlugin({
                parallel: true
            })
        ];
    } else {
        webpackConfig.devtool = 'source-map'
    }

    return gulp.src(tempDir + '/src/**/*.js')
        .pipe(webpack(webpackConfig, require('webpack')))
        .pipe(gulp.dest(distDir))
});

createTask('files', ['webpack'], (target, tempDir, distDir) => {
    return gulp.src(tempDir + '/src/**/*.!(js|entry.js)')
        .pipe(gulp.dest(distDir));
});

createTask('final-build', ['final-locales', 'webpack', 'files']);

// END FINAL-BUILD

createTask('build', ['tmp', 'final-build']);

var buildList = [];

if (argv.target instanceof Array) {
    for (let target of argv.target) {
        buildList.push('build-' + target);
    }
} else {
    var target = argv.target;
    buildList.push('build-' + target);
}

gulp.task('default', buildList);

// Watch
if (argv.watch) {
    console.log('watching files...');
    var watcher = gulp.watch(['src/**/*', 'locales/**/*'], ['default']);
}