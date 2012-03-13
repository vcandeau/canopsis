#!/bin/bash

SRC="/usr/local/src/canopsis"
REPO_URL="http://repo.canopsis.org/daily"
REPO_GIT=
CMD_INSTALL="pkgmgr install --force-yes cmaster"

#### Git Pull
echo "-------> Clone repository"
cd /usr/local/src
if [ ! -e canopsis ]; then
	git clone git://forge.canopsis.org/canopsis.git
	git submodule init
fi
echo " + Ok"

##### Build
echo "-------> Pull repository"
cd $SRC

git pull origin develop

git submodule update

cd sources

echo "-------> Start Build"
if [ -e $SRC/builded ]; then
	./build-install.sh -cupn
	if [ $? -ne 0 ]; then exit 1; fi
else
	./build-install.sh -cup
	if [ $? -ne 0 ]; then exit 1; fi*
	touch $SRC/builded	
fi


##### Uninstall
echo "-------> Uninstall"
cd $SRC/sources
pkill -u canopsis &> /dev/null || true
./build-install.sh -c

exit

##### Install from package
echo "-------> Install from packages"

echo "---> Create User"

## Requirements
useradd -m -d /opt/canopsis -s /bin/bash canopsis

## Install bootstrap
echo "---> Install bootstrap"
su - canopsis -c "mkdir -p tmp"
su - canopsis -c "rm -Rf tmp/* &> /dev/null"
su - canopsis -c "cd tmp && wget $REPO_URL/../canopsis_installer.tgz"
su - canopsis -c "cd tmp && tar xvf canopsis_installer.tgz"
su - canopsis -c "cd tmp && cd canopsis_installer && ./install.sh"

if [ $? -ne 0 ]; then exit 1; fi

echo "---> Clean bootstrap"
su - canopsis -c "rm -Rf tmp/canopsis_installer*"

echo "---> Start HTTP Repo"
cd $SRC/binaries
./mk_repo ./
python -m SimpleHTTPServer 80 &
WWWPID=$!

## Configure pkgmgr
echo "---> Configure pkgmgr"
sed -i 's#="stable"#=""#g' /opt/canopsis/etc/pkgmgr.conf
sed -i 's#repo.canopsis.org#localhost#g' /opt/canopsis/etc/pkgmgr.conf

## Start install
echo "---> Start install ($CMD_INSTALL)"
su - canopsis -c "$CMD_INSTALL"
if [ $? -ne 0 ]; then exit 1; kill -9 $WWWPID; fi

## Check install
echo "---> Check install"
su - canopsis -c "opt/canotools/unittest.sh"
if [ $? -ne 0 ]; then exit 1; kill -9 $WWWPID; fi

echo "---> Clean"
kill -9 $WWWPID
pkill -u canopsis &> /dev/null || true
cd $SRC/sources
./build-install.sh -c
