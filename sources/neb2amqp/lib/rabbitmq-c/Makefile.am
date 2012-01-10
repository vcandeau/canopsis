SUBDIRS=librabbitmq 

squeakyclean: maintainer-clean
	rm -f Makefile.in librabbitmq/Makefile.in 
	rm -f aclocal.m4
	rm -f config.guess config.h.in* config.sub configure
	rm -f depcomp install-sh ltmain.sh missing
	rm -rf codegen

codegen:
	mkdir -p $@
	cp -r "$(top_srcdir)/$(AMQP_CODEGEN_DIR)"/* $@
	$(MAKE) -C $@ clean

EXTRA_DIST=codegen LICENSE-MPL-RabbitMQ LICENSE-GPL-2.0
