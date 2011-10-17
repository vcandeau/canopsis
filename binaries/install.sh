#!/bin/bash

SRC_PATH=`pwd`
. $SRC_PATH/common.sh
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
	check_code $?
	
	cd $PREFIX
	$SUDO tar xfz $SRC_PATH/tmp/$PNAME/files.tgz
	check_code $?

	. $SRC_PATH/tmp/$PNAME/control	
	$SUDO bash -c ". $SRC_PATH/common.sh && . $SRC_PATH/tmp/$PNAME/control && install && echo '$PNAME|$VERSION-$RELEASE|installed|' >> $DB_PATH"
	check_code $?

	rm -Rf $SRC_PATH/tmp
	cd $SRC_PATH
}

echo "Install Bootstrap in $PREFIX ..."
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
