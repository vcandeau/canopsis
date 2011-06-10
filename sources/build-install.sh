#!/bin/bash

### Configurations
PREFIX="/opt/hypervision"
PY_BIN=$PREFIX"/bin/python"
SUDO="sudo -E"
INC_DIRS="/usr/include"
SRC_PATH=`pwd`
LOG_PATH="$SRC_PATH/log/"
HUSER="hypervision"
HGROUP="hypervision"
ARCH=`uname -m`


### Archives version
VERS_PYTHON="2.7.1"
VERS_ERLANG="R14B02"
VERS_RABBITMQ="2.4.1"
VERS_MONGODB="1.8.1"


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

function check_code {
	if [ $1 -ne 0 ]; then
		echo "Error: Code: $1"
		exit $1
	fi
}

function install_pylib {
	BASE=$1-$2
	VERS=$2
	echo "Install Python Library: $BASE ..."
	LOG="$LOG_PATH/$BASE.log"

	rm -f $LOG &> /dev/null
	FCHECK=`ls $PREFIX/lib/python2.7/site-packages/ | grep "$BASE-py2.7" | wc -l`
	if [ $FCHECK -eq 0 ]; then
		cd pylibs
		if [ ! -e $BASE ]; then
			extract_archive "$BASE.tar.gz"
		fi
		cd $BASE
		echo " + Install $BASE ..."
		$SUDO $PY_BIN setup.py install --prefix=$PREFIX 1>> $LOG 2>> $LOG
		check_code $?
		cd ../../
	else
		echo " + Allready install"
	fi
}

function install_init {
	IFILE="$SRC_PATH/extra/init/$1"
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

function install_python_daemon(){
	DPATH=$1
	DAEMON_NAME=`basename $DPATH .py`
	$SUDO rm -f $PREFIX/opt/hyp-daemons/$DAEMON_NAME.py &>/dev/null
	$SUDO ln -s $DPATH $PREFIX/opt/hyp-daemons/

	$SUDO rm -f $PREFIX/etc/init.d/$DAEMON_NAME &>/dev/null
	$SUDO ln -s $PREFIX/lib/hyp-libs/daemon-python.py $PREFIX/etc/init.d/$DAEMON_NAME
}

#### MAIN

echo "Make directories ..."
$SUDO mkdir -p $PREFIX/etc/init.d $PREFIX/var/log $PREFIX/var/run $PREFIX/var/www $PREFIX/bin
check_code $?


echo "Create Hypervision user ('$HUSER')..."
$SUDO groupadd $HGROUP &> /dev/null
$SUDO useradd -s /bin/bash -d $PREFIX -g $HGROUP $HUSER &> /dev/null
$SUDO cp -R $SRC_PATH/extra/profile/.bash_* $PREFIX/
export PATH="$PREFIX/bin/:$PATH"
check_code $?

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
	cd  $BASE

	echo " + Fix env vars"
	export LDFLAGS="$LDFLAGS -L/usr/lib/`dpkg-architecture -qDEB_HOST_MULTIARCH`"
	check_code $?

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
install_pylib "pymongo" "1.11"
# For debian
install_pylib "pycurl" "7.18.2"
install_pylib "tornado" "1.2.1"
install_pylib "python-daemon" "1.5.5"


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
	$SUDO mkdir -p $PREFIX/var/lib/rabbitmq $PREFIX/var/log/rabbitmq
	$SUDO sed -i s#/etc/rabbitmq#$PREFIX/etc#g $PREFIX/bin/rabbitmq-env
	check_code $?

	install_init "rabbitmq-server"
	install_conf "rabbitmq.conf"
	install_conf "rabbitmq-env.conf"

	cd - > /dev/null
else
	echo " + Allready install"
fi

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
	$SUDO mkdir -p $PREFIX/var/log/mongodb

	install_init "mongodb"
	install_conf "mongodb.conf"

	cd - > /dev/null
else
	echo " + Allready install"
fi


######################################
#  Hyp-tools
######################################
cd $SRC_PATH
echo "Install Hyp-tools ..."
echo " + Install ..."
BASE="hyp-tools"
DST="/opt/"
if [ -e $BASE ]; then
	$SUDO mkdir -p $PREFIX/$DST
	$SUDO rm -Rf $PREFIX/$DST/$BASE
	$SUDO cp -R $BASE $PREFIX/$DST
	check_code $?
else
	echo "Error: Impossible to find '$BASE'"
	exit 1
fi

######################################
#  Hyp-deamons
######################################
cd $SRC_PATH
echo "Install Hyp-daemons ..."
echo " + Install ..."
BASE="hyp-daemons"
DST="/opt/"
#if [ -e $BASE ]; then
	$SUDO mkdir -p $PREFIX/$DST/$BASE
	#$SUDO rm -Rf $PREFIX/$DST/$BASE
	#$SUDO cp -R $BASE $PREFIX/$DST
	check_code $?
#else
#	echo "Error: Impossible to find '$BASE'"
#	exit 1
#fi

######################################
#  Hyp-libs
######################################
cd $SRC_PATH
echo "Install Hyp-libs ..."
echo " + Install ..."
DST="/lib/hyp-libs"
if [ -e $BASE ]; then
	$SUDO mkdir -p $PREFIX/$DST
	$SUDO rm -Rf $PREFIX/$DST
	$SUDO mkdir -p $PREFIX/$DST
	$SUDO cp -R hyp-libs/hypamqp/hypamqp.py $PREFIX/$DST
	$SUDO cp -R hyp-libs/hypamqp/hypamqp2.py $PREFIX/$DST
	$SUDO cp -R hyp-libs/*.py $PREFIX/$DST
	check_code $?
else
	echo "Error: Impossible to find '$DST'"
	exit 1
fi

######################################
#  Event-brokers
######################################
cd $SRC_PATH
$SUDO mkdir -p $PREFIX/opt/event-brokers/nagios/

echo "Install Event Brokers: Neb2socket ..."
LOG="$LOG_PATH/neb2socket.log"
echo " + Clean  ..."
cd event-brokers/nagios/neb2socket
make clean 1>> $LOG 2>> $LOG
echo " + Build ..."
make 1>> $LOG 2>> $LOG
check_code $?
echo " + Install ..."
$SUDO cp src/neb2socket.o $PREFIX/opt/event-brokers/nagios/
$SUDO cp nagios2amqp/nagios2amqp.py $PREFIX/opt/event-brokers/nagios/
$SUDO cp nagios2amqp/pyamqp.conf $PREFIX/etc/
$SUDO cp api/neb2socket.py $PREFIX/lib/hyp-libs/

install_python_daemon "$PREFIX/opt/event-brokers/nagios/nagios2amqp.py"

echo " + Configuration ..."
echo "    - nagios.cfg: broker_module=$PREFIX/opt/event-brokers/nagios/neb2socket.o name=Central"
check_code $?

######################################
#  Webcore
######################################
cd $SRC_PATH
$SUDO mkdir -p $PREFIX/var/www/ $PREFIX/var/www/html

echo "Install Webcore ..."
LOG="$LOG_PATH/webcore.log"
echo " + Install ..."
$SUDO cp -R www/* $PREFIX/var/www/ 1>> $LOG 2>> $LOG
check_code $?


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


######################################
# Unit Test
#####################################
cd $SRC_PATH
echo
echo "Unit tests ..."
LOG=$LOG_PATH/unittest.log
./unittest.sh 2> $LOG 1> $LOG
check_code $?
echo " + Ok"
