#!/bin/bash

SRC_PATH=`pwd`
if [ -e $SRC_PATH/canohome/lib/common.sh ]; then
	. $SRC_PATH/canohome/lib/common.sh
else
	echo "Impossible to find common's lib ..."
	exit 1
fi

export HOME=$PREFIX

alias python=$PREFIX/bin/python
export PYTHONPATH=$PREFIX/lib/hyp-libs/

$SUDO su - $HUSER -c 'hypcontrol start'

UNITTESTS=`find ./ | grep Myunittest.py`

for UNITTEST in $UNITTESTS; do 
        echo "##### Proceed to $UNITTEST" 
        $SUDO mkdir -p $PREFIX/tmp 
        $SUDO cp $SRC_PATH/$UNITTEST $PREFIX/tmp/Myunittest.py 
        $SUDO su - $HUSER -c "python $PREFIX/tmp/Myunittest.py" 
        check_code $? 
        echo "#### END ####" 
        echo 
done 
$SUDO rm -Rf $PREFIX/tmp &> /dev/null

sudo su - $HUSER -c 'hypcontrol stop'
