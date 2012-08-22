#!/bin/bash

### Configurations
BPATH=$(pwd)
LOG="$BPATH/install.log"

if [ $(id -u) -eq 0 ]; then
	echo "Impossible to install with 'root' user ..."
	exit 1
fi

if [ -e common.sh ]; then
    . common.sh
else
	echo "Impossible to find common's lib ..."
	exit 1
fi

if [ ! -e ubik.tgz ]; then
	echo "Impossible to find ubik ...."
	exit 1
fi

if [ ! -e ubik.conf ]; then
	echo "Impossible to find ubik configuration ...."
	exit 1
fi


echo
echo "#========================#"
echo "|   Canopsis Installer   |"
echo "#========================#"
echo

cd $HOME
echo > $LOG

detect_os
echo

echo " + Make directories and init environement ..."
mkdir -p etc lib var/log &>> $LOG
check_code $? "Impossible to make directories (check log: $LOG)"

cp $BPATH/common.sh lib/ &>> $LOG
check_code $? "Impossible to init environement (check log: $LOG)"

echo "   - Ok"

echo " + Install Ubik (pakage manager) ..."
easy_install --user $BPATH/ubik.tgz &>> $LOG
check_code $? "Impossible to install Ubik (check log: $LOG)"
echo "   - Ok"

echo " + Configure Ubik ..."
export UBIK_CONF=$HOME/etc/ubik.conf
export PATH=$PATH:$HOME/bin:$HOME/.local/bin
cp $BPATH/ubik.conf etc/ &>> $LOG
check_code $? "Impossible to configure Ubik (check log: $LOG)"
echo "   - Ok"

echo " + Install Canohome from canopsis package ..."
ubik install --force canohome
check_code $? "Impossible to install packages"
. .bash_profile
echo "   - Ok"

echo " + Install Ubik from canopsis package ..."
ubik install --force-yes ubik
check_code $? "Impossible to install packages"
echo "   - Ok"

echo " + Clean old Ubik"
rm -Rf .local &>> $LOG
check_code $? "Impossible to clean ubik"
echo "   - Ok"

echo
echo " :: Canopsis installed"
echo

echo '   ***  /!\  Please re-login for re-load shell environement  /!\ ***'
echo
