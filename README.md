[![Known Vulnerabilities](https://snyk.io/test/github/ElectronicManuel/VideoSyncer/badge.svg)](https://snyk.io/test/github/ElectronicManuel/VideoSyncer)

# Project moved to https://gitlab.com/Softwulf/VideoSyncer

# Documentation
Documentation can be found [here](https://doc.vsync.ch)

# How to build
## Local (already downloaded source)
```shell
#!/bin/bash
VERSION="" # insert version here (eg. 1.2.3)
SENTRY_RELEASE=VideoSyncer@v$VERSION
SENTRY_PROJECT=videosyncer
SENTRY_ENV=production
npm install
npm run build -- --env.prod --env.version=v$VERSION
cd dist/archives
```
## Checkout from github
```shell
#!/bin/bash
VERSION="" # insert version here (eg. 1.2.3)
git clone https://github.com/SoftWulf/VideoSyncer.git
cd VideoSyncer
git checkout "tags/v$VERSION"
SENTRY_RELEASE=VideoSyncer@v$VERSION
SENTRY_PROJECT=videosyncer
SENTRY_ENV=production
npm install
npm run build -- --env.prod --env.version=v$VERSION
cd dist/archives
```
