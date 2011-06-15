#!/bin/bash

SRC_PATH=`pwd`
. $SRC_PATH/extra/profile/lib/common.sh

export HOME=$PREFIX

alias python=$PREFIX/bin/python
export PYTHONPATH=$PREFIX/lib/hyp-libs/

sudo su - hypervision -c 'hypcontrol start'

UNITTESTS=`find ./ | grep Myunittest.py`

for UNITTEST in $UNITTESTS; do 
        echo "##### Proceed to $UNITTEST" 
        sudo mkdir -p $PREFIX/tmp 
        cp $SRC_PATH/$UNITTEST $PREFIX/tmp/ 
        sudo su - hypervision -c "python $PREFIX/tmp/Myunittest.py" 
        check_code $? 
        echo "#### END ####" 
        echo 
done 
sudo rm -Rf $PREFIX/tmp &> /dev/null

sudo su - hypervision -c 'hypcontrol stop'
