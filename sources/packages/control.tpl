#!/bin/bash

NAME="<NAME>"
VERSION=1
RELEASE=0
DESCRIPTION=""
REQUIRES="canohome pkgmgr"

function install(){
	echo "Install $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function remove(){
	echo "Remove $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function purge(){
	echo "Purge $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function update(){
	echo "Update $NAME $VERSION-$RELEASE ..."
	check_code $?
}
