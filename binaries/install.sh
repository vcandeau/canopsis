#!/bin/bash

SRC_PATH=`pwd`
. $SRC_PATH/common.sh

VARLIB_PATH="$PREFIX/var/lib/pkgmgr"
$SUDO mkdir -p $VARLIB_PATH
check_code $?

DB_PATH=$VARLIB_PATH/db

detect_os

function get_ppath(){
	PNAME=$1
	PPATH=""
	#echo "Get path of '$PNAME' ..."
	
	PPATH="$SRC_PATH/$ARCH/$DIST/$DIST_VERS/$PNAME.tgz"
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

	echo "Install package $PNAME ($PPATH) ..."
	cd $SRC_PATH && mkdir -p tmp && cd tmp
	tar xfz $PPATH
	check_code $?
	
	cd $PREFIX
	$SUDO tar xfz $SRC_PATH/tmp/$PNAME/files.tgz
	check_code $?
	
	. $SRC_PATH/tmp/$PNAME/control
	check_code $?
	install
	check_code $?
	$SUDO sh -c "echo '$PNAME~$VERSION~installed' >> $DB_PATH"

	cd $SRC_PATH
}


echo "Install Bootstrap in $PREFIX ..."
#echo " + canohome"
install_package "canohome"

#echo " + pkgmgr"
install_package "pkgmgr"

rm -Rf tmp
