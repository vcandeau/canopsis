#!/bin/bash

### Check user
if [ `id -u` -ne 0 ]; then
    echo "You must be root ..."
    exit 1
fi

### Configurations
SRC_PATH=`pwd`
if [ -e $SRC_PATH/canohome/lib/common.sh ]; then
    . $SRC_PATH/canohome/lib/common.sh
else
    echo "Impossible to find common's lib ..."
    exit 1
fi
VARLIB_PATH="$PREFIX/var/lib/pkgmgr"
$SUDO mkdir -p $VARLIB_PATH
check_code $?
DB_PATH=$VARLIB_PATH/local_db

echo
echo "#========================#"
echo "|   Canopsis Installer   |"
echo "#========================#"
echo

detect_os
echo

function get_ppath(){
	PNAME=$1
	PPATH="$SRC_PATH/bootstrap/$PNAME.tgz"
	if [ -e $CPPATH ]; then
		echo $PPATH
	else
		echo "Package $PNAME not found"
		exit 1
	fi
}

function install_package(){
	PNAME=$1
	PPATH=$(get_ppath "$PNAME")

	echo "Install package $PNAME ..."
	cd $SRC_PATH && mkdir -p tmp && cd tmp
	tar xfz $PPATH
	check_code $? "Untar package failure"
	
	cd $PREFIX
	. $SRC_PATH/tmp/$PNAME/control
	echo "  + Pre-install"
	pre_install
	check_code $? "Pre-install step failure"
	echo "  + Copy files"
	tar xfz $SRC_PATH/tmp/$PNAME/files.tgz
	check_code $? "Untar files.tgz failure"
	echo "  + Post-install"
	post_install
	check_code $? "Post-install step failure"
	echo "  + Update Local packages database"
	echo '$PNAME|$VERSION-$RELEASE|installed||$REQUIRES' >> $DB_PATH
	check_code $? "Echo package informations in db_local failure"

	rm -Rf $SRC_PATH/tmp
	cd $SRC_PATH
}

echo "Install Bootstrap in $PREFIX"
install_package "canohome"
install_package "canotools"
install_package "canolibs"
install_package "pkgmgr"

cd $SRC_PATH

echo "Copy packages ..."
$SUDO cp -R $SRC_PATH/bootstrap/* $PREFIX/var/lib/pkgmgr/packages/

echo "Fix permissions ..."
$SUDO chown $HUSER:$HGROUP -R $PREFIX

echo
echo " :: Run sudo su - canopsis to start using Canopsis"
echo
