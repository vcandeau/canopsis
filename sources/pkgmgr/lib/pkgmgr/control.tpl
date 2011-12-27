#!/bin/bash

NAME="@NAME@"
VERSION=@VERSION@
RELEASE=@RELEASE@
DESCRIPTION=""
REQUIRES=""

P_ARCH="@P_ARCH@"
P_DIST="@P_DIST@"
P_DISTVERS="@P_DISTVERS@"

function pre_install(){
	echo "Pre-install $NAME $VERSION-$RELEASE ..."
	check_code $? 
}

function post_install(){
	echo "Post-install $NAME $VERSION-$RELEASE ..."
	check_code $? 
}

function pre_remove(){
	echo "Pre-remove $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function post_remove(){
	echo "Post-remove $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function pre_update(){
	echo "Pre-update $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function post_update(){
	echo "Post-update $NAME $VERSION-$RELEASE ..."
	check_code $?
}

function purge(){
	echo "Purge $NAME $VERSION-$RELEASE ..."
	check_code $?
}
