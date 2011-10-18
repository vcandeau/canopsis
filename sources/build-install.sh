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

PY_BIN=$PREFIX"/bin/python"
INC_DIRS="/usr/include"
LOG_PATH="$SRC_PATH/log/"
INST_CONF="$SRC_PATH/build.d/"

export MAKEFLAGS="-j$((`cat /proc/cpuinfo  | grep processor | wc -l` + 1))"

######################################
#  functions
######################################
function extract_archive(){
	if [ ! -e $1 ]; then
		echo "Error: Impossible to find '$1' ..."
		exit 1
	fi

	if [ `echo $1 | grep 'tar.bz2$' | wc -l` -eq 1 ]; then EXTCMD="tar xfj"; fi
	if [ `echo $1 | grep 'tar.gz$' | wc -l` -eq 1 ]; then EXTCMD="tar xfz"; fi
	if [ `echo $1 | grep 'tgz$' | wc -l` -eq 1 ]; then EXTCMD="tar xfz"; fi
	
	if [ "$EXTCMD" != "" ]; then
		echo " + Extract '$1' ('$EXTCMD') ..."
		$EXTCMD $1
		check_code $?
	else
		echo "Error: Impossible to extract '$1', no command ..."
		exit 1
	fi
}


function install_pylib(){
	cd $SRC_PATH/externals/
	BASE=$1-$2
	VERS=$2
	echo "Install Python Library: $BASE ..."
	LOG="$LOG_PATH/$BASE.log"

	rm -f $LOG &> /dev/null

	#remplace '-' by '.'
	FBASE=`echo "$BASE" | sed s#-#\.#g`

	FCHECK=`ls $PREFIX/lib/python2.7/site-packages/ | grep "$FBASE-py2.7" | wc -l`
	#echo " + Check $FCHEK ..."
	if [ $FCHECK -eq 0 ]; then
		cd pylibs
		if [ ! -e $BASE ]; then
			if [ -e "$BASE.tar.gz" ]; then
				extract_archive "$BASE.tar.gz"
			elif [ -e "$BASE.tgz" ]; then
				extract_archive "$BASE.tgz"
			elif [ -e "$BASE.tar.bz2" ]; then
				extract_archive "$BASE.tar.bz2"
			else
				print "Impossible to find archive ..."
				exit 1
			fi
		fi
		cd $BASE
		echo " + Install $BASE ..."
		$PY_BIN setup.py install --prefix=$PREFIX 1>> $LOG 2>> $LOG
		check_code $?
		cd ../
		rm -Rf $BASE  &> /dev/null
		cd $SRC_PATH
	else
		echo " + Allready install"
	fi
}

function install_init(){
	if [ -e "$SRC_PATH/extra/init/$1.$DIST" ]; then
		IFILE="$SRC_PATH/extra/init/$1.$DIST"
	else
		IFILE="$SRC_PATH/extra/init/$1"
	fi

	if [ -e $IFILE ]; then
		echo " + Install init script '$1' ..."
		cp $IFILE $PREFIX/etc/init.d/$1
		check_code $?
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/init.d/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/init.d/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/init.d/$1

		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_conf(){
	IFILE="$SRC_PATH/extra/conf/$1"
	if [ -e $IFILE ]; then
		echo " + Install conf file '$1' ..."
		cp $IFILE $PREFIX/etc/$1
		check_code $?
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/$1
		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_bin(){
	IFILE="$SRC_PATH/extra/bin/$1"
	if [ -e $IFILE ]; then
		echo " + Install bin file '$1' ..."
		cp $IFILE $PREFIX/bin/$1
		check_code $?
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/bin/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/bin/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/bin/$1
		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_python_daemon(){
	DPATH=$1
	DAEMON_NAME=`basename $DPATH .py`
	#rm -f $PREFIX/opt/hyp-daemons/$DAEMON_NAME.py &>/dev/null
	#ln -s $DPATH $PREFIX/opt/hyp-daemons/

	rm -f $PREFIX/etc/init.d/$DAEMON_NAME &>/dev/null
	ln -s $PREFIX/opt/canotools/daemon $PREFIX/etc/init.d/$DAEMON_NAME
	check_code $?
}

function make_package_archive(){
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME

	echo "    + Make Package archive ..."
	cd $PREFIX &> /dev/null
	tar cfz $PPATH/files.tgz -T $PPATH/files.lst
	check_code $?
	cd - &> /dev/null
	
	echo "    + Check control script ..."
	touch $PPATH/control
	chmod +x $PPATH/control

	echo "    + Make final archive ..."
	cd $SRC_PATH/packages/
	tar cfz $PNAME.tgz $PNAME
	check_code $?

	echo "    + Move to binaries directory ..."
	BPATH=$SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS
	mkdir -p $BPATH
	cat /proc/version > $BPATH/build.info
	mkdir -p $BPATH
	mv $PNAME.tgz $BPATH/
	check_code $?

	echo "    + Clean ..."
	rm -f $PPATH/files.tgz
	#rm -f $PPATH/files.lst
	check_code $?
}

function update_packages_list() {
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME
	echo "    + Update Packages list Db ..."
	
    PKGLIST=$SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS/Packages.list
	touch $PKGLIST

	. $PPATH/control
	
	PKGMD5=$(md5sum $SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS/$PNAME.tgz | awk '{ print $1 }')

	sed "/$PNAME/d" -i $PKGLIST
    echo "$PNAME|$VERSION-$RELEASE||$PKGMD5|$REQUIRES" >> $PKGLIST
}

function make_package(){
	PNAME=$1
	if [ "$ARG1" = "pkg" ]; then
		echo " + Make package $PNAME ..."
		PPATH=$SRC_PATH/packages/$PNAME
		FLIST=$SRC_PATH/packages/files.lst
		FLIST_TMP=$SRC_PATH/packages/files.tmp
	
		echo "    + Purge old build ..."
		#rm -Rf $PPATH &> /dev/null
		rm -f $PPATH.tgz &> /dev/null
	
		echo "    + Make files listing ..."
		mkdir -p $PPATH
		touch $FLIST
		check_code $?
	
		cd $PREFIX &> /dev/null
		find ./ -type f > $FLIST_TMP
		find ./ -type l >> $FLIST_TMP
		check_code $?
	
		diff $FLIST $FLIST_TMP  | grep ">" | sed 's#> ##g' > $PPATH/files.lst
		check_code $?
		
		make_package_archive "$PNAME"	
		update_packages_list "$PNAME"	

		echo "    + Re-init initial listing ..."
		mv $FLIST_TMP $FLIST
		check_code $?
	fi
}

function install_basic_source(){
	cd $SRC_PATH
	NAME=$1
	#echo "Install $NAME ..."
	#echo " + Install ..."

	CTRLFILE="$SRC_PATH/packages/$NAME/control"
	function pre_install(){	true; }
	function post_install(){ true; }

	if [ -e "$NAME" ]; then
		## Pre install
		if [ -e $CTRLFILE ]; then
			. $CTRLFILE
			pre_install
		fi

		## Install file
		cp -Rf $NAME/* $PREFIX/
		check_code $?
		cp -Rf $NAME/.[a-zA-Z0-9]* $PREFIX/ &> /dev/null

		## Post install
		if [ -e $CTRLFILE ]; then
			post_install
		fi
	else
		echo "Error: Impossible to find '$NAME'"
		exit 1
	fi
	
}

######################################
# Check help if asked
######################################
if [[ "$1" =~ ^(-h|help|--help)$ ]]; then
    echo "Usage : ./build-install.sh [OPTION]"
    echo "     pkg                ->  Build, install and make packages"
    echo "     clean              ->  Uninstall Canopsis"
    echo "     nocheckdeps        ->  Don't check dependencies"
    echo "     help               ->  Print this help"
    exit 1
fi

######################################
#  Pre Check
######################################
detect_os

######################################
#  Clean Arguments
######################################
ARG1=$1
ARG2=$2

if [ "$ARG1" = "clean" ]; then
	echo "Clean $PREFIX ..."
	echo " + kill all canopsis process ..."
	if [ -e $PREFIX/opt/canotools/hypcontrol ]; then
		su - $HUSER -c "hypcontrol stop"
		check_code $?
	fi
	PIDS=`ps h -eo pid:1,command | grep "$PREFIX" | grep -v grep | cut -d ' ' -f1`
	for PID in $PIDS; do
		echo "  + Kill $PID"
		kill -9 $PID || true
		#check_code $?
	done
	sleep 1

	. $SRC_PATH/packages/canohome/control
	pre_remove
	post_remove
	purge

	rm -f $SRC_PATH/packages/files.lst &> /dev/null
	exit 0
fi

######################################
#  Init file listing
######################################
echo "Init files listing ..."
mkdir -p $PREFIX
cd $PREFIX &> /dev/null
find ./ -type f > $SRC_PATH/packages/files.lst
find ./ -type l >> $SRC_PATH/packages/files.lst
cd - &> /dev/null

######################################
# Check other arguments
######################################
if [ "$ARG1" = "mkpkg" ]; then
	PNAME=$ARG2
	echo "Make package $PNAME ..."
	if [ -e $SRC_PATH/packages/$PNAME/files.lst ]; then
		make_package_archive "$PNAME"
	else
		echo " + Impossible to find file.lst ..."
		exit 1
	fi
	exit 0
fi

if [ "$ARG1" != "nocheckdeps" ]; then
	echo "Install OS dependencies for $DIST $DIST_VERS ..."
	if [ -e "extra/dependencies/"$DIST"_"$DIST_VERS ]; then
		bash "extra/dependencies/"$DIST"_"$DIST_VERS
	else
		echo " + Impossible to find dependencies file ..." 
	fi
	check_code $?
fi

######################################
#  Build all packages
######################################

ITEMS=`ls -1 $INST_CONF | grep ".install$"`

for ITEM in $ITEMS; do
	cd $SRC_PATH

	NAME="x"
	VERSION="0.1"
	FCHECK="/tmp/notexist"

	. /$INST_CONF/$ITEM
	if [ "$NAME" != 'x' ]; then
		## Check package sources
		if [ -e packages/$NAME/control ]; then
			. packages/$NAME/control
		else
			mkdir -p packages/$NAME
			cp pkgmgr/lib/pkgmgr/control.tpl packages/$NAME/control
			sed "s#@NAME@#$NAME#g" -i packages/$NAME/control
			sed "s#@VERSION@#$VERSION#g" -i packages/$NAME/control
			. packages/$NAME/control
		fi

		function install(){ true; }
		function build(){ true; }

		. /$INST_CONF/$ITEM

		echo "################################"
		echo "# $NAME $VERSION"
		echo "################################"	

		## Build and install
		if [ ! -e $FCHECK ]; then

			echo " + Build ..."
			build
			check_code $?

			echo " + Install ..."
			install
			check_code $?

			make_package $NAME
			check_code $?
		else
			echo " + Allready install"
		fi
	else
		echo "Impossible to build $NAME ..."
		exit 1
	fi
done


######################################
#  Fix permissions
######################################
echo "################################"
echo "# Fix permissions"
echo "################################"
chown $HUSER:$HGROUP -R $PREFIX
check_code $?
echo " + Ok"

if [ "$ARG1" = "wut" ]; then
	echo "################################"
	echo "# Launch Unit Tests"
	echo "################################"
	cd $SRC_PATH
	echo
	echo "Unit tests ..."
	LOG=$LOG_PATH/unittest.log
	./unittest.sh 2> $LOG 1> $LOG
	UTR=$?
	if [ $UTR -ne 0 ]; then
		cat $LOG
	fi
	check_code $UTR
	echo " + Ok"
fi

if [ "$1" = "pkg" ]; then
	echo "################################"
	echo "# Make installer"
	echo "################################"
	INSTALLER_PATH="$SRC_PATH/../binaries/canopsis_installer"
	BSTRAP_PATH="$INSTALLER_PATH/bootstrap"
	PKGS_PATH="$SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS"

	cp $SRC_PATH/canohome/lib/common.sh $SRC_PATH/../binaries

	echo "Create tarball installer ..."
	echo "  + Create bootstrap env"
	mkdir -p $BSTRAP_PATH
	echo "  + Copy install script"
	cp $SRC_PATH/../binaries/{install.sh,common.sh} $INSTALLER_PATH
	echo "  + Copy packages ..."
	cp $PKGS_PATH/{canohome.tgz,canolibs.tgz,canotools.tgz,pkgmgr.tgz} $BSTRAP_PATH
	echo "  + Make archive"
	cd $SRC_PATH/../binaries
	tar cfz canopsis_installer.tgz canopsis_installer
	echo "  + Clean tmp files"
	rm -Rf $INSTALLER_PATH $BSTRAP_PATH
	echo "  + Done"
fi
