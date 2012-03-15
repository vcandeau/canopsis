#!/bin/bash

SRC="/usr/local/src/canopsis"
REPO_GIT="git://forge.canopsis.org/canopsis.git"
CMD_INSTALL="pkgmgr install --force-yes cmaster"
BRANCH="freeze"

if [ "x$1" != "x" ]; then
	BRANCH=$1
fi

#### Git Pull
echo "-------> Clone repository"
cd /usr/local/src
if [ ! -e canopsis ]; then
	git clone $REPO_GIT
	git submodule init
fi
echo " + Ok"

##### Build
echo "-------> Pull repository"
cd $SRC

git checkout $BRANCH
git pull origin $BRANCH

git submodule update

cd sources

echo "-------> Start Build"
if [ -e $SRC/builded ]; then
	./build-install.sh -cupnd
	if [ $? -ne 0 ]; then exit 1; fi
else
	./build-install.sh -cup
	if [ $? -ne 0 ]; then exit 1; fi
	touch $SRC/builded	
fi


##### Uninstall
echo "-------> Uninstall"
cd $SRC/sources
pkill -u canopsis &> /dev/null || true
./build-install.sh -c

##### Install from package
echo "-------> Install from packages"

echo "---> Make Repo"
cd $SRC/binaries
./mk_repo $SRC/binaries
if [ $? -ne 0 ]; then exit 1; fi

echo "---> Start HTTP Repo"
python -m SimpleHTTPServer 8081 &
WWWCODE=$?
WWWPID=$!
if [ $WWWCODE -ne 0 ]; then exit 1; fi

echo "-----> + PID: $WWWPID"
sleep 2

echo "---> Create User"

## Requirements
useradd -m -d /opt/canopsis -s /bin/bash canopsis

## Install bootstrap
echo "---> Install bootstrap"
su - canopsis -c "mkdir -p tmp"
su - canopsis -c "rm -Rf tmp/* &> /dev/null"
su - canopsis -c "cd tmp && wget http://localhost:8081/canopsis_installer.tgz"
if [ $? -ne 0 ]; then kill -9 $WWWPID; exit 1; fi

su - canopsis -c "cd tmp && tar xvf canopsis_installer.tgz"
if [ $? -ne 0 ]; then kill -9 $WWWPID; exit 1; fi

su - canopsis -c "cd tmp && cd canopsis_installer && ./install.sh"
if [ $? -ne 0 ]; then kill -9 $WWWPID; exit 1; fi

echo "---> Clean bootstrap"
su - canopsis -c "rm -Rf tmp/canopsis_installer*"

## Configure pkgmgr
echo "---> Configure pkgmgr"
sed -i 's#="stable"#=""#g' /opt/canopsis/etc/pkgmgr.conf
sed -i 's#repo.canopsis.org:80#localhost:8081#g' /opt/canopsis/etc/pkgmgr.conf

## Start install
echo "---> Start install ($CMD_INSTALL)"
su - canopsis -c "$CMD_INSTALL"
if [ $? -ne 0 ]; then kill -9 $WWWPID; exit 1; fi

## Check install
echo "---> Check install"
su - canopsis -c "opt/canotools/unittest.sh"
if [ $? -ne 0 ]; then kill -9 $WWWPID; exit 1; fi

echo "---> Clean"
kill -9 $WWWPID
pkill -u canopsis &> /dev/null || true
cd $SRC/sources
./build-install.sh -c

## End
echo "---> Package ready"
echo "+ $SRC/binaries"
