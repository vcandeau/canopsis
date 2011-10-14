#!/bin/bash

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


### Archives version
VERS_PYTHON="2.7.1"
VERS_ERLANG="R14B02"
VERS_RABBITMQ="2.4.1"
VERS_MONGODB="1.8.1"
VERS_NODEJS="v0.4.8"
VERS_NGINX="1.0.4"
VERS_EXTJS="4.0.2a"

### functions
function extract_archive {
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


function install_pylib {
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
		$SUDO $PY_BIN setup.py install --prefix=$PREFIX 1>> $LOG 2>> $LOG
		check_code $?
		cd ../
		$SUDO rm -Rf $BASE  &> /dev/null
		cd $SRC_PATH
	else
		echo " + Allready install"
	fi
}

function install_init {
	if [ -e "$SRC_PATH/extra/init/$1.$DIST" ]; then
		IFILE="$SRC_PATH/extra/init/$1.$DIST"
	else
		IFILE="$SRC_PATH/extra/init/$1"
	fi

	if [ -e $IFILE ]; then
		echo " + Install init script '$1' ..."
		$SUDO cp $IFILE $PREFIX/etc/init.d/$1
		check_code $?
		$SUDO sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/init.d/$1
		$SUDO sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/init.d/$1
		$SUDO sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/init.d/$1

		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_conf {
	IFILE="$SRC_PATH/extra/conf/$1"
	if [ -e $IFILE ]; then
		echo " + Install conf file '$1' ..."
		$SUDO cp $IFILE $PREFIX/etc/$1
		check_code $?
		$SUDO sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/etc/$1
		$SUDO sed "s#@HUSER@#$HUSER#g" -i $PREFIX/etc/$1
		$SUDO sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/etc/$1
		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_bin {
	IFILE="$SRC_PATH/extra/bin/$1"
	if [ -e $IFILE ]; then
		echo " + Install bin file '$1' ..."
		$SUDO cp $IFILE $PREFIX/bin/$1
		check_code $?
		$SUDO sed "s#@PREFIX@#$PREFIX#g" -i $PREFIX/bin/$1
		$SUDO sed "s#@HUSER@#$HUSER#g" -i $PREFIX/bin/$1
		$SUDO sed "s#@HGROUP@#$HGROUP#g" -i $PREFIX/bin/$1
		check_code $?
	else
		echo "Error: Impossible to find '$IFILE'"
		exit 1
	fi
}

function install_python_daemon(){
	DPATH=$1
	DAEMON_NAME=`basename $DPATH .py`
	#$SUDO rm -f $PREFIX/opt/hyp-daemons/$DAEMON_NAME.py &>/dev/null
	#$SUDO ln -s $DPATH $PREFIX/opt/hyp-daemons/

	$SUDO rm -f $PREFIX/etc/init.d/$DAEMON_NAME &>/dev/null
	$SUDO ln -s $PREFIX/opt/canotools/daemon $PREFIX/etc/init.d/$DAEMON_NAME
	check_code $?
}

function make_package_archive(){
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME

	echo "    + Make Package archive ..."
	cd $PREFIX &> /dev/null
	$SUDO tar cfz $PPATH/files.tgz -T $PPATH/files.lst
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
	$SUDO mkdir -p $BPATH
	cat /proc/version > $BPATH/build.info
	mkdir -p $BPATH
	mv $PNAME.tgz $BPATH/
	check_code $?

	echo "    + Clean ..."
	$SUDO rm -f $PPATH/files.tgz
	#rm -f $PPATH/files.lst
	check_code $?
}

function update_packages_list() {
	PNAME=$1
	PPATH=$SRC_PATH/packages/$PNAME
	echo "    + Update Packages list Db ..."
	
    PKGLIST=$SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS/Packages.list

	. $PPATH/control
	
	PKGMD5=$(md5sum $SRC_PATH/../binaries/$ARCH/$DIST/$DIST_VERS/$PNAME.tgz | awk '{ print $1 }')

	sed "/$PNAME/d" -i $PKGLIST
    echo "$PNAME|$VERSION-$RELEASE||$PKGMD5" >> $PKGLIST
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
	echo "Install $NAME ..."
	echo " + Install ..."
	if [ -e "$NAME" ]; then
		$SUDO cp -Rf $NAME/* $PREFIX/
		check_code $?
		$SUDO cp -Rf $NAME/.[a-zA-Z0-9]* $PREFIX/ &> /dev/null
		if [ -e $SRC_PATH/packages/$NAME/control ]; then
			. $SRC_PATH/packages/$NAME/control
			echo " + launch install from package control script ..."
			install
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
    echo "     mkpkg [PKGNAME]    ->  Create specific package"
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
	if [ -e $PREFIX/opt/hyp-tools/hypcontrol ]; then
		$SUDO su - $HUSER -c "hypcontrol stop"
		check_code $?
	fi
	PIDS=`ps h -eo pid:1,command | grep "$PREFIX" | grep -v grep | cut -d ' ' -f1`
	for PID in $PIDS; do
		echo "  + Kill $PID"
		$SUDO kill -9 $PID || true
		#check_code $?
	done
	sleep 1

	. $SRC_PATH/packages/canohome/control
	remove
	purge

	rm -f $SRC_PATH/packages/files.lst &> /dev/null
	exit 0
fi

######################################
#  Init file listing
######################################
echo "Init files listing ..."
$SUDO mkdir -p $PREFIX
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
		$SUDO bash "extra/dependencies/"$DIST"_"$DIST_VERS
	else
		echo " + Impossible to find dependencies file ..." 
	fi
	check_code $?
fi


######################################
#  CanoHome
######################################
install_basic_source "canohome"
make_package "canohome"

######################################
#  pkgmgr
######################################
install_basic_source "pkgmgr"
make_package "pkgmgr"

######################################
#  Python
######################################
cd $SRC_PATH/externals
echo "Install Python $VERS_PYTHON ..."
BASE="Python-$VERS_PYTHON"
LOG="$LOG_PATH/$BASE.log"
rm -f $LOG &> /dev/null
FCHECK="$PREFIX/bin/python"
if [ ! -e $FCHECK ]; then
	if [ ! -e $BASE ]; then
		extract_archive "$BASE.tar.bz2"
	fi
	cd $BASE

	echo " + Fix env vars"
	DEB_HOST_MULTIARCH=`dpkg-architecture -qDEB_HOST_MULTIARCH 2>> /dev/null`
	if [ $? -eq 0 ]; then
		export LDFLAGS="$LDFLAGS -L/usr/lib/$DEB_HOST_MULTIARCH"
		check_code $?
	fi

	if [ -e Makefile ]; then
		echo " + Clean ..."
		make clean 1>> $LOG 2>> $LOG
		#check_code $?
	fi
	
	echo " + Configure ..."
	./configure --prefix=$PREFIX 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Build ..."
	make 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Install ..."
	$SUDO make install 1>> $LOG 2>> $LOG
	check_code $?

	cd - > /dev/null
else
	echo " + Allready install"
fi

######################################
#  Lib Python
######################################
cd $SRC_PATH/externals
install_pylib "setuptools" "0.6c11"
install_pylib "simplejson" "2.1.6"
install_pylib "pika" "0.9.5"
install_pylib "amqplib" "0.6.1"
install_pylib "kombu" "1.1.3"
install_pylib "sysv_ipc" "0.6.3"
install_pylib "pymongo" "2.0.1"
# For debian
install_pylib "pycurl" "7.18.2"
install_pylib "tornado" "1.2.1"
install_pylib "python-daemon" "1.5.5"

install_pylib "Twisted" "11.0.0"
install_pylib "txAMQP" "0.4"
install_pylib "txamqp-helpers" "0.5"

install_pylib "pycha" "0.6.0"

install_pylib "bottle" "0.9.6"
install_pylib "Beaker" "1.5.4"

install_pylib "gevent" "0.13.6"
install_pylib "gevent-websocket" "0.2.3"

if [ ! -e $PREFIX/lib/python2.7/site-packages/txAMQP-0.4-py2.7.egg/txamqp/codec.py.orig ]; then
	echo " + Patch python-txamqp ..."
	# https://bugs.launchpad.net/txamqp/+bug/741147
	cd $PREFIX
	$SUDO rm lib/python2.7/site-packages/txAMQP-0.4-py2.7.egg/txamqp/codec.pyc &> /dev/null
	$SUDO patch -b -p0 < $SRC_PATH/extra/patch/txamqp_codec-py.patch
	check_code $?
	cd - &> /dev/null
fi

make_package "python"

######################################
#  Erlang
######################################
cd $SRC_PATH/externals
echo "Install Erlang $VERS_ERLANG ..."
BASE="otp_src_$VERS_ERLANG"
LOG="$LOG_PATH/$BASE.log"
rm -f $LOG &> /dev/null
FCHECK="$PREFIX/bin/erl"
if [ ! -e $FCHECK ]; then
	if [ ! -e $BASE ]; then
		extract_archive "$BASE.tar.gz"
	fi
	cd  $BASE

	echo " + Clean ..."
	make clean 1>> $LOG 2>> $LOG
	#check_code $?

	echo " + Configure ..."
	./configure --prefix=$PREFIX 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Build ..."
	make 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Install ..."
	$SUDO make install 1>> $LOG 2>> $LOG
	check_code $?

	cd - > /dev/null
else
	echo " + Allready install"
fi

make_package "erlang"

######################################
#  RabbitMQ
######################################
cd $SRC_PATH/externals
echo "Install RabbitMQ-Server $VERS_RABBITMQ ..."
BASE="rabbitmq-server-$VERS_RABBITMQ"
LOG="$LOG_PATH/$BASE.log"
rm -f $LOG &> /dev/null
FCHECK="$PREFIX/bin/rabbitmq-env"
if [ ! -e $FCHECK ]; then
	if [ ! -e $BASE ]; then
		extract_archive "$BASE.tar.gz"
	fi
	cd  $BASE
	echo " + Clean ..."
	make clean 1>> $LOG 2>> $LOG
	#check_code $?

	echo " + Fix env vars ..."
	export PATH="$PATH:$PREFIX/bin"
	export TARGET_DIR="$PREFIX/opt/rabbitmq-server"
	export SBIN_DIR="$PREFIX/bin/"
	export MAN_DIR="$PREFIX/share/man/"

	#echo " + Configure ..."
	#./configure --prefix=$PREFIX 1>> $LOG 2>> $LOG
	#check_code $?

	echo " + Build ..."
	make all 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Install ..."
	$SUDO make install 1>> $LOG 2>> $LOG
	check_code $?

	echo " + Post install configurations ..."
	$SUDO cp $SRC_PATH/externals/rabbitmq-plugins/* $PREFIX/opt/rabbitmq-server/plugins
	$SUDO sed -i s#/etc/rabbitmq#$PREFIX/etc#g $PREFIX/bin/rabbitmq-env
	check_code $?

	install_init "rabbitmq-server"
	install_bin "rabbitmqadmin"
	install_conf "rabbitmq.conf"
	install_conf "rabbitmq-env.conf"

	echo " + Exec install script from package's control ..."
	. $SRC_PATH/packages/rabbitmq-server/control
	install

	cd - > /dev/null
else
	echo " + Allready install"
fi

make_package "rabbitmq-server"

######################################
#  MongoDB
######################################
cd $SRC_PATH/externals
echo "Install MongoDB $VERS_MONGODB ..."
BASE="mongodb-linux-$ARCH-static-$VERS_MONGODB"
LOG="$LOG_PATH/$BASE.log"
rm -f $LOG &> /dev/null
FCHECK="$PREFIX/bin/mongod"
if [ ! -e $FCHECK ]; then
	if [ ! -e $BASE ]; then
		extract_archive "$BASE.tgz"
	fi
	cd $BASE

	echo " + Install ..."
	$SUDO cp -R bin/* $PREFIX/bin/
	check_code $?

	echo " + Post install configurations ..."
	#$SUDO mkdir -p $PREFIX/var/log/mongodb
	#$SUDO mkdir -p $PREFIX/var/lib/mongodb
	. $SRC_PATH/packages/mongodb/control
        install

	install_init "mongodb"
	install_conf "mongodb.conf"

	cd - > /dev/null
else
	echo " + Allready install"
fi

make_package "mongodb"

######################################
#  NodeJS
######################################
#cd $SRC_PATH/externals
#echo "Install NodeJS $VERS_NODEJS ..."
#BASE="node-$VERS_NODEJS"
#LOG="$LOG_PATH/$BASE.log"
#rm -f $LOG &> /dev/null
#FCHECK="$PREFIX/bin/node"
#if [ ! -e $FCHECK ]; then
#	if [ ! -e $BASE ]; then
#		extract_archive "$BASE.tar.gz"
#	fi
#	cd $BASE
#
#	echo " + Configure ..."
#	./configure --prefix=$PREFIX 1>> $LOG 2>> $LOG
#	check_code $?
#
#	echo " + Build ..."
#	make 1>> $LOG 2>> $LOG
#	check_code $?

#	echo " + Install ..."
#	$SUDO make install 1>> $LOG 2>> $LOG
#	check_code $?

#	echo "Install NPM for NodeJS ..."
#	echo "Install NPM for NodeJS ..." 1>> $LOG 2>> $LOG
#	cd ..
#	echo " + Git clone ..."
#	if [ -e npm ]; then
#		cd npm
#		git pull 1>> $LOG 2>> $LOG
#	else
#		git clone http://github.com/isaacs/npm.git 1>> $LOG 2>> $LOG
#		cd npm
#	fi
#	echo " + Install ..."
#	$SUDO make 1>> $LOG 2>> $LOG
#	$SUDO $PREFIX/bin/node cli.js install -g -f 1>> $LOG 2>> $LOG
#	check_code $?
#
#	echo "Install Socket.IO for NodeJS ..."
#	echo "Install Socket.IO for NodeJS ..." 1>> $LOG 2>> $LOG
#	echo " + Install ..."
#	$SUDO $PREFIX/bin/node $PREFIX/bin/npm install socket.io 1>> $LOG 2>> $LOG
#	check_code $?
#	
#	#echo " + Post install configurations ..."
#	#check_code $?
#else
#	echo " + Allready install"
#fi

#make_package "nodejs"

######################################
#  canotools
######################################
install_basic_source "canotools"
make_package "canotools"

######################################
#  canolibs
######################################
install_basic_source "canolibs"
make_package "canolibs"

######################################
#  ccli
######################################
install_basic_source "ccli"
make_package "ccli"

######################################
#  sla2mongodb
######################################
install_basic_source "sla2mongodb"
install_python_daemon "$PREFIX/opt/sla2mongodb/sla2mongodb.py"
make_package "sla2mongodb"

######################################
#  amqp2brule
######################################
install_basic_source "amqp2brule"
install_python_daemon "$PREFIX/opt/amqp2brule/amqp2brule.py"
make_package "amqp2brule"


######################################
#  Event-brokers
######################################
cd $SRC_PATH
echo "Install Event Brokers: Neb2socket ..."
$SUDO mkdir -p $PREFIX/opt/event-brokers/nagios/
LOG="$LOG_PATH/neb2socket.log"

cd event-brokers/nagios/neb2socket
check_code $?

FCHECK="$PREFIX/opt/event-brokers/nagios/neb2socket.o"
if [ ! -e $FCHECK ]; then
	echo " + Clean  ..."
	make clean 1>> $LOG 2>> $LOG
	echo " + Build ..."
	make 1>> $LOG 2>> $LOG
	check_code $?
	echo " + Install ..."
	$SUDO cp src/neb2socket.o $PREFIX/opt/event-brokers/nagios/
	$SUDO cp -R api/ $PREFIX/opt/event-brokers/nagios/

	echo " + Configuration ..."
	echo "    - nagios.cfg: broker_module=$PREFIX/opt/event-brokers/nagios/neb2socket.o name=Central"
	check_code $?
else
	echo " + Allready install"
fi

make_package "neb2socket"

######################################
#  nagios2amqp
######################################
install_basic_source "nagios2amqp"
install_python_daemon "$PREFIX/opt/nagios2amqp/nagios2amqp.py"
make_package "nagios2amqp"

######################################
#  Graphite
#    Dont install Graphite
######################################
cd $SRC_PATH
echo "Install Graphite ..."
LOG="$LOG_PATH/graphite.log"

FCHECK="$PREFIX/opt/graphite"
FCHECK="/dev/null"
if [ ! -e $FCHECK ]; then

	cd $SRC_PATH/externals

	install_pylib "Django" "1.3"
	install_pylib "pysqlite" "2.6.3"
	if [ -e $PREFIX/pysqlite2-doc ]; then
		$SUDO mkdir -p $PREFIX/share/doc/
		$SUDO mv $PREFIX/pysqlite2-doc $PREFIX/share/doc/
		check_code $?
	fi

	echo " + Install pycairo ..."
	echo " + Install pycairo ..." 1>> $LOG 2>> $LOG
	cd $SRC_PATH/externals/pylibs
	tar xfz pycairo-1.6.4.tar.gz
	check_code $?
	cd pycairo-1.6.4
	echo "   + Configure ..."
	export PATH=$PREFIX/bin:$PATH
	#./autogen.sh --prefix=$PREFIX 1>> $LOG 2>> $LOG
	./configure --prefix=$PREFIX 1>> $LOG 2>> $LOG
	check_code $?
	echo "   + Make ..."
	make 1>> $LOG 2>> $LOG
	check_code $?
	echo "   + Make Install ..."
	$SUDO make install 1>> $LOG 2>> $LOG
	check_code $?
	$SUDO rm -Rf $SRC_PATH/externals/pylibs/pycairo-1.6.4 &> /dev/null
	cd - &> /dev/null

	install_pylib "whisper" "0.9.8"

	CARBON_VERS="0.9.8"
	echo "Install carbon $CARBON_VERS ..."
	if [ ! -e "$PREFIX/lib/python2.7/site-packages/carbon-$CARBON_VERS-py2.7.egg-info" ]; then
		cd $SRC_PATH/externals
		$SUDO mkdir -p $PREFIX/var/log/graphite/carbon-cache
	
		echo " + Patch setup.cfg of carbon-$CARBON_VERS"
		$SUDO rm -Rf pylibs/carbon-$CARBON_VERS &> /dev/null
		cd pylibs && tar xfz carbon-$CARBON_VERS.tar.gz 
		check_code $?
		sed -i "s#/opt/graphite#$PREFIX#" carbon-$CARBON_VERS/setup.cfg
		check_code $?
		cd ..
	
		install_pylib "carbon" "$CARBON_VERS"
		$SUDO rm -Rf $PREFIX/etc/graphite $PREFIX/var/lib/graphite
	
		$SUDO mv $PREFIX/storage $PREFIX/var/lib/graphite
		check_code $?
		$SUDO mv $PREFIX/conf $PREFIX/etc/graphite
		check_code $?
	
		install_conf "carbon.conf"
		$SUDO mv $PREFIX/etc/carbon.conf $PREFIX/etc/graphite/
		check_code $?
	
		install_conf "storage-schemas.conf"
		$SUDO mv $PREFIX/etc/storage-schemas.conf $PREFIX/etc/graphite/
		check_code $?
	
		echo " + Post install of carbon ..."
		$SUDO rm -Rf $PREFIX/lib/python2.7/site-packages/carbon*
		$SUDO mv $PREFIX/lib/carbon* $PREFIX/lib/python2.7/site-packages/
	
		$SUDO ln -fs $PREFIX/bin/carbon-cache.py $PREFIX/etc/init.d/carbon-cache
	
		check_code $?
		echo " + Patch path of carbon ..."
		$SUDO sed -i "/# Figure out where/a\\ROOT_DIR = '$PREFIX'" $PREFIX/bin/carbon-cache.py
		$SUDO sed -i "/BIN_DIR/a\\BIN_DIR = join(ROOT_DIR, 'bin')" $PREFIX/bin/carbon-cache.py
		$SUDO sed -i "/STORAGE_DIR/a\\STORAGE_DIR = join(ROOT_DIR, 'var','lib','graphite')" $PREFIX/bin/carbon-cache.py
		$SUDO sed -i "/LOG_DIR/a\\LOG_DIR = join(STORAGE_DIR, 'var','log', 'graphite', 'carbon-cache')" $PREFIX/bin/carbon-cache.py
		$SUDO sed -i "/LIB_DIR/a\\LIB_DIR = join(ROOT_DIR, 'lib')" $PREFIX/bin/carbon-cache.py
		$SUDO sed -i "/CONF_DIR/a\\CONF_DIR = join(ROOT_DIR, 'etc', 'graphite')" $PREFIX/bin/carbon-cache.py
	
		cd - &> /dev/null
			
		echo " + Configuration ..."
		check_code $?
	else
		echo " + Allready install"
	fi

	cd $SRC_PATH/externals
	GRAPHITE_VERS="0.9.8"
	echo "Install graphite-web $GRAPHITE_VERS"
	rm -Rf pylibs/graphite-web-$GRAPHITE_VERS &> /dev/null
	cd pylibs && tar xfz graphite-web-$GRAPHITE_VERS.tar.gz 
	check_code $?
	sed -i "s#/opt/graphite#$PREFIX/opt/graphite#" graphite-web-$GRAPHITE_VERS/setup.cfg
	check_code $?
	cd ..
	install_pylib "graphite-web" "$GRAPHITE_VERS"
	$SUDO cp -R $PREFIX/conf/* $PREFIX/etc/graphite/
	$SUDO rm -Rf $PREFIX/conf
	check_code $?

	$SUDO cp -R $PREFIX/storage/* $PREFIX/var/lib/graphite/
	$SUDO rm -Rf $PREFIX/storage
	check_code $?

	$SUDO cp -R $PREFIX/webapp/* $PREFIX/opt/graphite/webapp/
	$SUDO rm -Rf $PREFIX/webapp
	check_code $?

	
	echo " + Patch path of graphite-web  ..."
	$SUDO sed -i "/^GRAPHITE_ROOT =/d" $PREFIX/opt/graphite/webapp/graphite/settings.py
	$SUDO sed -i "/# Filesystem layout/a\\GRAPHITE_ROOT = '$PREFIX/opt/graphite/'" $PREFIX/opt/graphite/webapp/graphite/settings.py
	$SUDO sed -i "/^WEB_DIR/a\\WEB_DIR = GRAPHITE_ROOT + '/webapp/graphite/'" $PREFIX/opt/graphite/webapp/graphite/settings.py
	$SUDO sed -i "/^WEBAPP_DIR/a\\WEBAPP_DIR = GRAPHITE_ROOT + '/webapp/'" $PREFIX/opt/graphite/webapp/graphite/settings.py

	$SUDO sed -i "/^#TIME_ZONE =/a\\TIME_ZONE = 'Europe/Paris'" $PREFIX/opt/graphite/webapp/graphite/settings.py

	$SUDO ln -fs $PREFIX/var/lib/graphite $PREFIX/opt/graphite/storage
	$SUDO ln -fs $PREFIX/etc/graphite $PREFIX/opt/graphite/conf

	$SUDO cp $SRC_PATH/extra/conf/graphite.db $PREFIX/opt/graphite/storage
	check_code $?

	install_conf "dashboard.conf"
	$SUDO mv $PREFIX/etc/dashboard.conf $PREFIX/etc/graphite/
	check_code $?

	install_basic_source "graphite_webserver"
	install_python_daemon "$PREFIX/opt/graphite/graphite_webserver.py"
	
else
	echo " + Allready install"
fi

make_package "graphite"

######################################
#  amqp2graphite
######################################
#install_basic_source "amqp2graphite"
#install_python_daemon "$PREFIX/opt/amqp2graphite/amqp2graphite.py"
#make_package "amqp2graphite"

######################################
#  NGinx
######################################
#cd $SRC_PATH/externals
#echo "Install Nginx $VERS_NGINX ..."
#BASE="nginx-$VERS_NGINX"
#LOG="$LOG_PATH/$BASE.log"
#rm -f $LOG &> /dev/null
#FCHECK="$PREFIX/bin/nginx"
#if [ ! -e $FCHECK ]; then
#	if [ ! -e $BASE ]; then
#		extract_archive "$BASE.tar.gz"
#	fi
#	cd  $BASE
#
#	echo " + Clean ..."
#	make clean 1>> $LOG 2>> $LOG
#	#check_code $?
#
#	echo " + Configure ..."
#	./configure --prefix=$PREFIX  \
# --sbin-path=$PREFIX/bin/ \
# --lock-path=$PREFIX/var/run/nginx.pid \
# --pid-path=$PREFIX/var/run/nginx.lock \
# --conf-path=$PREFIX/etc/nginx/nginx.conf \
# --error-log-path=$PREFIX/var/log/nginx/error.log \
# --http-log-path=$PREFIX/var/log/nginx/access.log \
# --http-client-body-temp-path=$PREFIX/var/lib/nginx/client_body_temp \
# --http-proxy-temp-path=$PREFIX/var/lib/nginx/proxy_temp \
# --http-fastcgi-temp-path=$PREFIX/var/lib/nginx/fastcgi_temp \
# --http-uwsgi-temp-path=$PREFIX/var/lib/nginx/uwsgi_temp \
# --http-scgi-temp-path=$PREFIX/var/lib/nginx/scgi_temp \
# --user=$HUSER \
# --group=$HGROUP 1>> $LOG 2>> $LOG
#	check_code $?
#
#	echo " + Build ..."
#	make 1>> $LOG 2>> $LOG
#	check_code $?
#
#	echo " + Install ..."
#	$SUDO killall nginx &> /dev/null
#	$SUDO make install 1>> $LOG 2>> $LOG
#	check_code $?
#
#	echo " + Configuration ..."
#	$SUDO mkdir -p $PREFIX/etc/nginx/conf.d $PREFIX/etc/nginx/sites-enabled $PREFIX/var/lib/nginx
#	check_code $?
#	$SUDO mv $PREFIX/etc/nginx/nginx.conf $PREFIX/etc/nginx/nginx.ori
#	check_code $?
#
#	install_conf "nginx.conf"
#
#	$SUDO ln -s $PREFIX/etc/nginx.conf $PREFIX/etc/nginx/nginx.conf
#	check_code $?
#
#	$SUDO mkdir -p $PREFIX/var/www/html
#	$SUDO mv $PREFIX/html/* $PREFIX/var/www/html
#	check_code $?
#	$SUDO rmdir $PREFIX/html
#	check_code $?
#
#	install_conf "adm-external.conf"
#	$SUDO mv $PREFIX/etc/adm-external.conf $PREFIX/etc/nginx/sites-enabled/
#
#	cd - > /dev/null
#else
#	echo " + Allready install"
#fi
#
#make_package "nginx"

######################################
#  amqp2mongodb
######################################
install_basic_source "amqp2mongodb"
install_python_daemon "$PREFIX/opt/amqp2mongodb/amqp2mongodb.py"
make_package "amqp2mongodb"

######################################
#  amqp2perfstore
######################################
cd $src_path
install_basic_source "amqp2perfstore"
install_python_daemon "$PREFIX/opt/amqp2perfstore/amqp2perfstore.py"
make_package "amqp2perfstore"

######################################
#  webcore
######################################
cd $src_path
install_basic_source "webcore"
install_python_daemon "$PREFIX/opt/webcore/webserver.py"
install_python_daemon "$PREFIX/opt/webcore/amqp2websocket.py"
make_package "webcore"

######################################
#  Fix permissions
######################################
echo "Fix permissions ..."
#$SUDO chown $HUSER:$HGROUP -R $PREFIX/var
#$SUDO chown $HUSER:$HGROUP -R $PREFIX/etc
#$SUDO chown $HUSER:$HGROUP $PREFIX
$SUDO chown $HUSER:$HGROUP -R $PREFIX
check_code $?
echo " + Ok"

if [ "$ARG1" = "wut" ]; then
	######################################
	# Unit Test
	#####################################
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
