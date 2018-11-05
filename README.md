[![Dependency Status](https://david-dm.org/ElectronicManuel/VideoSyncer/status.svg)](https://david-dm.org/ElectronicManuel/VideoSyncer)
[![Dev Dependency Status](https://david-dm.org/ElectronicManuel/VideoSyncer/dev-status.svg)](https://david-dm.org/ElectronicManuel/VideoSyncer?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/ElectronicManuel/VideoSyncer/badge.svg)](https://snyk.io/test/github/ElectronicManuel/VideoSyncer)

# Documentation
Documentation can be found [here](https://doc.vsync.ch)

# How to build
## Local (already downloaded source)
```shell
#!/bin/bash
npm i
npm run build
cd dist/archives
```
## Checkout from github
```shell
#!/bin/bash
git clone https://github.com/SoftWulf/VideoSyncer.git
cd VideoSyncer
git checkout "tags/v$VERSION"
npm i
npm run build
cd dist/archives
```