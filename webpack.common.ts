import * as path from 'path';
import * as webpack from 'webpack';
import * as glob from 'glob';
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import {exec} from 'child_process';

const calculateEntryObject = () => {
    const fileEndings = ['.entry.jsx', '.entry.tsx', '.entry.js', '.entry.ts']

    const entryArray = glob.sync('./src/**/*.entry.*');
    const entryMap = {};
    entryArray.forEach(entryPath => {
        let sanitizedName = entryPath.replace('./src/', '');
        fileEndings.forEach(ending => {
            sanitizedName = sanitizedName.replace(ending, '.js');
        });
        entryMap[sanitizedName] = entryPath;
    });

    return entryMap;
}

const generateConfig = (env) : webpack.Configuration => {
    const prod = env
        ? env.prod
        : false;
    const version = (env && env.version)
        ? env.version
        : '0.0.0';

    const entry = calculateEntryObject();

    const distDir = 'dist/base';

    const plugins : webpack.Plugin[] = [
        // Running gulp after webpack is done
        {
            apply: compiler => {
                compiler
                    .hooks
                    .done
                    .tap('VSyncWebpackDone', compilation => {
                        exec(`npm run gulp -- -r ${version} ${prod
                            ? ' --prod'
                            : ''}`, (err, stdout, stderr) => {
                            if (stdout) 
                                process.stdout.write(stdout);
                            if (stderr) 
                                process.stderr.write(stderr);
                            }
                        );
                    });
            }
        },
        new CopyWebpackPlugin([
            {
                from: '**/*',
                ignore: [
                    '**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'
                ],
                context: `${__dirname}/src/`
            }
        ], {copyUnmodified: true}),
        new CleanWebpackPlugin([distDir], {watch: true})
    ];

    if (prod) {
        plugins.push(new UglifyJsPlugin({parallel: true}));
    }

    const config : webpack.Configuration = {
        mode: prod
            ? 'production'
            : 'development',
        entry,
        output: {
            path: path.resolve(__dirname, distDir),
            filename: '[name]'
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
                }, {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }, {
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    use: 'url-loader'
                }
            ]
        },
        plugins
    }

    console.log(entry);

    return config;
};

export default generateConfig;