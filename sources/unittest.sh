#!/bin/sh

PREFIX="/opt/hypervision"

alias python=$PREFIX/bin/python
export PYTHONPATH=$PREFIX/lib/hyp-libs/


UNITTESTS=`find ./ | grep Myunittest.py`

for UNITTEST in $UNITTESTS; do
	echo "##### Proceed to $UNITTEST"
	python $UNITTEST
	echo "#### END ####"
	echo
done
