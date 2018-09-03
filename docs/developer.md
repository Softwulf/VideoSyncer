# Developer Guide
{:.no_toc}

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

# How to build
## Local (already downloaded source)
```shell
#!/bin/bash
#Set version here
VERSION="X.X.X"
npm i
npm run build -- -r $VERSION
cd dist/archives
```
## Checkout from github
```shell
#!/bin/bash
git clone https://github.com/ElectronicManuel/VideoSyncer.git
cd VideoSyncer
#Set version here
VERSION="X.X.X"
git checkout "tags/v$VERSION"
npm i
npm run build -- -r $VERSION
cd dist/archives
```