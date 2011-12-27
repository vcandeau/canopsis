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

######################################
#  functions
######################################
function pkg_options () {
	if [ $NO_ARCH == true ]; then
		P_ARCH="noarch"
	fi
	if [ $NO_DIST == true ]; then
		P_DIST="nodist"
	fi
	if [ $NO_DISTVERS == true ]; then
		P_DISTVERS="novers"
	fi

}

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
		check_code $? "Extract archive failure"
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
				echo "Impossible to find archive ..."
				exit 1
			fi
		fi
		cd $BASE
		echo " + Install $BASE ..."
		$PY_BIN setup.py install --prefix=$PREFIX 1>> $LOG 2>> $LOG
		check_code $? "Setup.py install failure"
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
		check_code $? "Copy init file into init.d failure"
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/init.d/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/init.d/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/init.d/$1

		check_code $? "Sed \$PREFIX,\$HUSER and \$HGROUP in init.d failure"
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
		check_code $? "Copy conf into etc failure"
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/$1
		check_code $? "Sed \$PREFIX,\$HUSER and \$HGROUP in etc failure"
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
		check_code $? "Copy bin into bin failure"
		sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/bin/$1
		sed "s#@HUSER@#$HUSER#g" -i $PREFIX/bin/$1
		sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/bin/$1
		check_code $? "Sed \$PREFIX,\$HUSER and \$HGROUP in bin failure"
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
	check_code $? "Remove init.d script failure"
	ln -s $PREFIX/opt/canotools/daemon $PREFIX/etc/init.d/$DAEMON_NAME
	check_code $? "Symbolic link creation of daemon script failure"
}

function make_package_archive(){
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME

	echo "    + Make Package archive ..."
	cd $PREFIX &> /dev/null
	tar cfj $PPATH/files.bz2 -T $PPATH/files.lst
	check_code $? "Files archive creation failure"
	cd - &> /dev/null
	
	echo "    + Check control script ..."
	touch $PPATH/control
	chmod +x $PPATH/control

	echo "    + Make final archive ..."
	cd $SRC_PATH/packages/
	tar cf $PNAME.tar $PNAME
	check_code $? "Package archive creation failure"

	echo "    + Move to binaries directory ..."
	BPATH=$SRC_PATH/../binaries/$P_ARCH/$P_DIST/$P_DISTVERS
	mkdir -p $BPATH
	check_code $? "Create Build folder failure"
	cat /proc/version > $BPATH/build.info
	mv $PNAME.tar $BPATH/
	check_code $? "Move binaries into build folder failure"

	echo "    + Clean ..."
	rm -f $PPATH/files.bz2
	check_code $? "Remove files archive failure"
}

function update_packages_list() {
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME
	echo "    + Update Packages list Db ..."
	
	PKGLIST=$SRC_PATH/../binaries/Packages.list
	touch $PKGLIST

	. $PPATH/control
	check_code $? "Source control file failure"
	
	PKGMD5=$(md5sum $SRC_PATH/../binaries/$P_ARCH/$P_DIST/$P_DISTVERS/$PNAME.tar | awk '{ print $1 }')

	sed "/^$PNAME/d" -i $PKGLIST
	echo "$PNAME|$VERSION-$RELEASE||$PKGMD5|$REQUIRES|$P_ARCH|$P_DIST|$P_DISTVERS" >> $PKGLIST
}

function files_listing(){
	local DST=$1
	if [ "x$DST" == "x" ]; then
		echo "You must specify destination ..."
		exit 1
	fi
	echo "    + Files listing in $DST ..."
	mkdir -p $PREFIX
	cd $PREFIX &> /dev/null
	find ./ -type f > $DST
	find ./ -type l >> $DST
	cd - &> /dev/null|| true
	#check_code $? "List files with find failure"
}

function make_package(){
	PNAME=$1
		
	echo " + Make package $PNAME ..."
	PPATH=$SRC_PATH/packages/$PNAME
	FLIST=$SRC_PATH/packages/files.lst
	FLIST_TMP=$SRC_PATH/packages/files.tmp
	
	mkdir -p $PPATH

	echo "    + Purge old build ..."
	rm -f $PPATH.tar &> /dev/null

	#if [ ! -f $PPATH/files.lst ]; then
		echo "    + Make files listing ..."
		files_listing "$FLIST_TMP"
	
		diff $FLIST $FLIST_TMP  | grep ">" | grep -v "\.pid$" | sed 's#> ##g' > $PPATH/files.lst
		check_code $?

		if [ -f $PPATH/blacklist ]; then
			echo "    + Blacklist files in listing ..."
			## blacklist files
			for line in $(cat $PPATH/blacklist); do
				cat $PPATH/files.lst | grep -v "$line" > $PPATH/files.lst.tmp
				mv $PPATH/files.lst.tmp $PPATH/files.lst
			done
		fi

		rm $FLIST_TMP
		check_code $? 'Impossible to delete tmp files listing ...'
	#fi
		
	make_package_archive "$PNAME"	
	update_packages_list "$PNAME"	
}

function install_basic_source(){
	cd $SRC_PATH
	NAME=$1
	#echo "Install $NAME ..."
	#echo " + Install ..."

	#CTRLFILE="$SRC_PATH/packages/$NAME/control"

	if [ -e "$NAME" ]; then
		## Install file
		cp -Rf $NAME/* $PREFIX/
		check_code $?
		cp -Rf $NAME/.[a-zA-Z0-9]* $PREFIX/ &> /dev/null || true
	else
		echo "Error: Impossible to find '$NAME'"
		exit 1
	fi
	
}

function extra_deps(){
    echo "Install OS dependencies for $DIST $DIST_VERS ..."
    if [ -e "extra/dependencies/"$DIST"_"$DIST_VERS ]; then
        bash "extra/dependencies/"$DIST"_"$DIST_VERS
    else
        echo " + Impossible to find dependencies file ..." 
    fi
    check_code $? "Install extra dependencies failure"
}

function run_clean(){
    echo "Clean $PREFIX ..."
    echo " + kill all canopsis process ..."
    if [ -e $PREFIX/opt/canotools/hypcontrol ]; then
        su - $HUSER -c ". .bash_profile; hypcontrol stop"
        check_code $? "Run hypcontrol stop failure"
    fi
    pkill -9 -u $HUSER
    sleep 1

    . $SRC_PATH/packages/canohome/control
    pre_remove
    post_remove
    purge

    rm -f $SRC_PATH/packages/files.lst &> /dev/null
}

function export_env(){
	echo " + Fix env vars ..."
	export PATH="$PREFIX/bin:$PATH"
	export TARGET_DIR="$PREFIX/opt/rabbitmq-server"
	export SBIN_DIR="$PREFIX/bin/"
	export MAN_DIR="$PREFIX/share/man/"
}

function pkgondemand(){
    PNAME=$1
    echo "Make package $PNAME ..."
    if [ -e $SRC_PATH/packages/$PNAME/files.lst ]; then
        make_package_archive "$PNAME"
    else
        echo " + Impossible to find file.lst ..."
        exit 1
    fi
    exit 0
}

function show_help(){
	echo "Usage : ./build-install.sh [OPTION]"
	echo
	echo "     Install build deps, build and install Canopsis"
	echo
	echo "Options:"
	echo "    -c		->  Uninstall"
	echo "    -n		->  Don't build sources if possible"
	echo "    -u		->  Run unittest and the end"
#	echo "    -m [ARGUMENT]       ->  Install deps, build and make a package"
	echo "    -p 		->  Make packages"
	echo "    -d		->  Don't check dependencies"
	echo "    -h, help	->  Print this help"
	exit 1
}

###########
### RUN ###
###########
ARG1=$1
ARG2=$2

if [ "x$ARG1" == "xhelp" ]; then
	show_help	
fi

OPT_CLEAN=0
OPT_NOBUILD=0
OPT_WUT=0
OPT_MPKG=0
OPT_DCD=0

while getopts "cnupdh" opt; do
	case $opt in
		c) OPT_CLEAN=1 ;;
		n) OPT_NOBUILD=1 ;;
		u) OPT_WUT=1 ;;
		p) OPT_MPKG=1 ;;
		d) OPT_DCD=1;;
		h) show_help ;;
		\?)
			echo "Invalid option: -$OPTARG" >&2
			show_help
		;;
	esac
done

if [ $OPT_CLEAN -eq 1 ]; then
	run_clean
	if [ "x$ARG1" == "x-c" ]; then
		exit 0
	fi
fi

export_env
detect_os

if [ $OPT_DCD -ne 1 ]; then
	extra_deps
fi

######################################
#  Init file listing
######################################
#echo "Init files listing ..."
#mkdir -p $PREFIX
#cd $PREFIX &> /dev/null
#find ./ -type f > $SRC_PATH/packages/files.lst
#find ./ -type l >> $SRC_PATH/packages/files.lst
#cd - &> /dev/null|| true

VARLIB_PATH="$PREFIX/var/lib/pkgmgr/packages"
mkdir -p $VARLIB_PATH
touch $PREFIX/var/lib/pkgmgr/local_db

######################################
#  Build all packages
######################################

ITEMS=`ls -1 $INST_CONF | grep ".install$"`

for ITEM in $ITEMS; do
	cd $SRC_PATH

	export MAKEFLAGS="-j$((`cat /proc/cpuinfo  | grep processor | wc -l` + 1))"

	NAME="x"
	VERSION="0.1"
	RELEASE="0"
	FCHECK="/tmp/notexist"
	P_ARCH=$ARCH
	P_DIST=$DIST
	P_DISTVERS=$DIST_VERS

	NO_ARCH=false
	NO_DIST=false
	NO_DISTVERS=false

	function pre_install(){	true; }
	function post_install(){ true; }

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
			sed "s#@RELEASE@#$RELEASE#g" -i packages/$NAME/control
			. packages/$NAME/control
		fi

		pkg_options

		function install(){ true; }
		function build(){ true; }

		. /$INST_CONF/$ITEM

		echo "################################"
		echo "# $NAME $VERSION"
		echo "################################"	

		## Build and install
		if [ ! -e $FCHECK ]; then

			if [ $OPT_NOBUILD -ne 1 ]; then
				echo " + Build ..."
				build
				check_code $? "Build failure"
			fi

			if [ $OPT_MPKG -eq 1 ]; then
				files_listing "$SRC_PATH/packages/files.lst"
			fi
	
			echo " + Pre-install ..."	
			pre_install

			echo " + Install ..."
			install
			check_code $? "Install failure"

			echo " + Update local pkgmgr database"
			PKGLIST=$PREFIX/var/lib/pkgmgr/local_db
			sed "/^$NAME/d" -i $PKGLIST
			echo "$NAME|$VERSION-$RELEASE|installed||$REQUIRES|$P_ARCH|$P_DIST|$P_DISTVERS" >> $PKGLIST
			check_code $? "Package entrie insertion in local pkgmgr database failure"

			echo " + Post-install ..."
			post_install
			
			if [ $OPT_MPKG -eq 1 ]; then
				make_package $NAME
				check_code $? "Make package failure"
			fi
		else
			echo " + Allready install"
		fi
	else
		echo "Impossible to build $NAME ..."
		exit 1
	fi
done

echo "################################"
echo "# Fix permissions"
echo "################################"
chown $HUSER:$HGROUP -R $PREFIX
check_code $?
echo " + Ok"

if [ $OPT_WUT -eq 1 ]; then
	echo "################################"
	echo "# Launch Unit Tests"
	echo "################################"
	cd $SRC_PATH
	echo
	echo "Unit tests ..."
	LOG=$PREFIX/var/log/unittest.log
	launch_cmd 0 $PREFIX/opt/canotools/unittest.sh 2> $LOG 1> $LOG
	EXCODE=$?
	cp $LOG $SRC_PATH/log
	if [ $EXCODE -ne 0 ]; then
		cat $LOG
	fi
	check_code $EXCODE "Unit tests failed ..."
	echo " + Ok"
fi

if [ $OPT_MPKG -eq 1 ]; then
	echo "################################"
	echo "# Make installer"
	echo "################################"
	INSTALLER_PATH="$SRC_PATH/../binaries/canopsis_installer"
	BSTRAP_PATH="$INSTALLER_PATH/bootstrap"

	INSTALLER_PKGS="canohome canotools pkgmgr"	
	
	cp $SRC_PATH/canohome/lib/common.sh $SRC_PATH/../binaries

	echo "Create tarball installer ..."
	echo "  + Create bootstrap env"
	mkdir -p $BSTRAP_PATH
	echo "  + Copy install script"
	cp $SRC_PATH/../binaries/{install.sh,common.sh} $INSTALLER_PATH
	echo "  + Copy packages ..."
	for PKG in $INSTALLER_PKGS; do
		if [ -e $SRC_PATH/packages/$PKG/control ]; then
			. $SRC_PATH/packages/$PKG/control
			pkg_options
			cp $SRC_PATH/../binaries/$P_ARCH/$P_DIST/$P_DISTVERS/$PKG.tar $BSTRAP_PATH
		else
			cp $SRC_PATH/../binaries/$P_ARCH/$P_DIST/$P_DISTVERS/$PKG.tar $BSTRAP_PATH
		fi	
	done
	echo "  + Make archive"
	cd $SRC_PATH/../binaries
	tar cfz canopsis_installer.tgz canopsis_installer
	echo "  + Clean tmp files"
	rm -Rf $INSTALLER_PATH $BSTRAP_PATH
	echo "  + Done"
fi
