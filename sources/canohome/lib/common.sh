
PREFIX="/opt/canopsis"
HUSER="canopsis"
HGROUP="canopsis"
ARCH=`uname -m`
SUDO="sudo -E"

function check_code {
	if [ $1 -ne 0 ]; then
		echo "Error: Code: $1"
		echo "Output: $2"
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
	ARCHL=`if [ -e /etc/arch-release ]; then echo 1; fi`
	DIST_VERS=""
	
	if [ $DEBIAN -ne 0 ]; then
		DIST="DEBIAN"
		DIST_VERS=`cat /etc/debian_version | cut -d '.' -f1`
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
	elif [ $ARCHL -ne 0 ]; then
		DIST="ARCHLINUX"
		DIST_VERS=`pacman -Q glibc | cut -d ' ' -f2 | cut -d '-' -f1`
		echo " + $DIST $DIST_VERS"
	else
		echo " + Impossible to find distribution ..."
		exit 1
	fi
}

function launch_cmd() {
    CHECK=$1
    shift
    MYCMD=$*
    if [ "x$MYCMD" != "x" ]; then
        if [ "x`id -un`" == "x$HUSER" ]; then
            $MYCMD
            EXCODE=$?
            if [ $CHECK -eq 1 ]; then
                check_code $EXCODE "Error in command '$MYCMD'..."
            else
                return $EXCODE
            fi
        else
            if [ `id -u` -eq 0 ]; then
                su - $HUSER -c ". .bash_profile && $MYCMD"
                EXCODE=$?
                if [ $CHECK -eq 1 ]; then
                    check_code $EXCODE "Error in command '$MYCMD'..."
                else
                    return $EXCODE
                fi
            else
                echo "Impossible to launch command with '`id -un`' ..."
                exit 1
            fi
        fi
    fi
}
