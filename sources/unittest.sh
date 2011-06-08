#!/bin/bash

PREFIX="/opt/hypervision"

alias python=$PREFIX/bin/python
export PYTHONPATH=$PREFIX/lib/hyp-libs/

function check_code {
        if [ $1 -ne 0 ]; then
                echo "Error: Code: $1"
                exit $1
        fi
}


sudo su - hypervision -c 'hypcontrol start'

UNITTESTS=`find ./ | grep Myunittest.py`

for UNITTEST in $UNITTESTS; do
	echo "##### Proceed to $UNITTEST"
	python $UNITTEST
	check_code $?
	echo "#### END ####"
	echo
done

sudo su - hypervision -c 'hypcontrol stop'
