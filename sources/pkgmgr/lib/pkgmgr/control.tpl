#!/bin/bash

NAME="@NAME@"
VERSION=@VERSION@
RELEASE=0
DESCRIPTION=""
REQUIRES=""

function pre_install(){
	echo "Pre-install $NAME $VERSION-$RELEASE ..."
	check_code $? 
}

function post_install(){
	eho "Post-install $NAME $VERSION-$RELEASE ..."
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
