
PREFIX="/opt/hypervision"
HUSER="hypervision"
HGROUP="hypervision"
ARCH=`uname -m`
SUDO="sudo -E"



function check_code {
	if [ $1 -ne 0 ]; then
		echo "Error: Code: $1"
		exit $1
	fi
}

function detect_os(){
	echo "Linux Distribution:"
	VERSION=`cat /proc/version`
	check_code $?
	DEBIAN=`echo "$VERSION" | grep -i debian | wc -l`
	UBUNTU=`echo "$VERSION" | grep -i ubuntu | wc -l`
	REDHAT=`echo "$VERSION" | grep -i redhat | wc -l`
	CENTOS=`echo "$VERSION" | grep -i centos | wc -l`

	DIST_VERS=""
	
	if [ $DEBIAN -ne 0 ]; then
		DIST="DEBIAN"
		DIST_VERS=`cat /etc/debian_version`
		echo " + $DIST $DIST_VERS"
	elif [ $UBUNTU -ne 0 ]; then
		DIST="UBUNTU"
		DIST_VERS=`lsb_release -r | cut -f2`
		echo " + $DIST $DIST_VERS"
	elif [ $REDHAT -ne 0 ]; then
		DIST="REDHAT"
		DIST_VERS=`lsb_release -r | cut -f2`
		echo " + $DIST $DIST_VERS"
	elif [ $CENTOS -ne 0 ]; then
		DIST="CENTOS"
		DIST_VERS=`lsb_release -r | cut -f2`
		echo " + $DIST $DIST_VERS"
	else
		echo " + Impossible to find distribution ..."
		exit 1
	fi
}

