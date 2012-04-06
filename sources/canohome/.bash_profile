# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

export LD_LIBRARY_PATH="$HOME/lib:$LD_LIBRARY_PATH"
export PATH="$HOME/bin:$HOME/sbin:$PATH"
export PYTHONPATH="$HOME/lib/canolibs:$HOME/lib:$HOME/etc:$HOME/etc/tasks.d:$HOME/etc/tasks-cron.d"
