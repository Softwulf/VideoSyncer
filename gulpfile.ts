/*
 * This gulpfile is being used to finalize the build after webpack is done, it does the following:
 * - merge platform specific manifests
 * - enrich manifest with the version
 * - copy webpack output into a directory for each target
 * - zip the assets if this is run in production mode
 */

import * as gulp from 'gulp';
import * as yargs from 'yargs';
import * as merge from 'gulp-merge-json';
import * as fs from 'fs';
import * as replace from 'gulp-replace';
import * as del from 'del';
import * as gulpZip from 'gulp-zip';

const argv = yargs
    .option('release', {
        alias: 'r',
        describe: 'Version to build',
        type: 'string',
        default: '0.0.0'
    }).option('production', {
        alias: 'prod',
        describe: 'Build in production mode?',
        type: 'boolean',
        default: false
    })
    .argv;

const targetList = [
    'chrome',
    'firefox',
    'opera'
]

const version: string = argv.release;

const distBase = 'dist/base';

export const clean = () => {
    return Promise.all(targetList.map(target => {
        return del([`dist/${target}`]);
    }));
}

export const merge_manifests = () => {
    return Promise.all(targetList.map(target => {
        return new Promise((resolve, reject) => {
            console.log(`[${target}] Merging manifests ...`)
            gulp.src(`${distBase}/manifest.${target}.json`)
                .on('error', (err) => {
                    console.error(`[${target}] Merging manifests FAILED`);
                    reject(err);
                })
                .pipe(merge({
                    fileName: 'manifest.json',
                    startObj: JSON.parse(fs.readFileSync(distBase+'/manifest.json').toString('utf-8')),
                    endObj: {
                        version
                    }
                }))
                .pipe(replace('@@VS_version', version))
                .pipe(gulp.dest(`dist/${target}`))
                .on('end', () => {
                    console.log(`[${target}] Merging manifests DONE`);
                    resolve();
                });
        });
    }));
}

export const copy_webpack_results = () => {
    return Promise.all(targetList.map(target => {
        return new Promise((resolve, reject) => {
            console.log(`[${target}] Copying webpack results ...`)
            gulp.src(`${distBase}/**/*`, {
                    ignore: `${distBase}/manifest*.json`
                })
                .on('error', (err) => {
                    console.error(`[${target}] Copying webpack results FAILED`);
                    reject(err);
                })
                .pipe(gulp.dest(`dist/${target}`))
                .on('end', () => {
                    console.log(`[${target}] Copying webpack results DONE`);
                    resolve();
                })
        });
    }));
}

export const zip = () => {
    const zipFormats = ['zip', 'xpi'];

    if(!argv.production) {
        return (async () => {
            console.log('Skipping zipping');
        })();
    }
    return Promise.all(targetList.map(target => {
        return Promise.all(zipFormats.map(format => {
            return Promise.all([version, 'latest'].map(tag => {
                return new Promise((resolve, reject) => {
                    console.log(`[${target}] Zipping ${tag}.${format} ...`)
                    gulp.src(`dist/${target}/**/*`)
                        .on('error', (err) => {
                            console.error(`[${target}] Zipping ${tag}.${format} FAILED`);
                            reject(err);
                        })
                        .pipe(gulpZip(`VideoSyncer_v${tag}_${target}.${format}`))
                        .pipe(gulp.dest(`dist/archives`))
                        .on('end', () => {
                            console.log(`[${target}] Zipping ${tag}.${format} DONE`);
                            resolve();
                        })
                });
            }));
        }));
    }));
}

const defaultTask =  gulp.series(clean,
                        gulp.parallel(
                            merge_manifests,
                            copy_webpack_results
                        ),
                        zip
)

gulp.task('default', defaultTask);