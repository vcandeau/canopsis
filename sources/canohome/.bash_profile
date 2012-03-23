# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

export PATH="$HOME/bin:$HOME/sbin:$PATH"
export PYTHONPATH="$HOME/lib/canolibs:$HOME/etc:$HOME/etc/tasks.d:$HOME/etc/tasks-cron.d"
