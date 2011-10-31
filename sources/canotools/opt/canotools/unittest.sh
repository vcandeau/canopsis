#!/bin/bash

SRC_PATH=`pwd`
if [ -e ~/lib/common.sh ]; then
	. ~/lib/common.sh
else
	echo "Impossible to find common's lib ..."
	exit 1
fi

export HOME=$PREFIX

hypcontrol stop &> /dev/null
hypcontrol start
sleep 1

cd $HOME
UNITTESTS=`find ./ | grep Myunittest.py`

for UNITTEST in $UNITTESTS; do 
        echo "##### Proceed to $UNITTEST" 
        python $UNITTEST
	EXCODE=$?
	if [ $EXCODE -ne 0 ]; then 
		hypcontrol stop
       		check_code $EXCODE
	fi
        echo "#### END ####" 
        echo 
done 

hypcontrol stop
