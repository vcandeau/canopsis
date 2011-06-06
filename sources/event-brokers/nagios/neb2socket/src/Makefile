###################################
# Makefile for NEB2Socket
###################################

INCLUDES=-I../ -I./
SRCPATH=src

CC=gcc
MOD_CFLAGS=-fPIC
CFLAGS=-g -O2 -DHAVE_CONFIG_H
MOD_LDFLAGS=-shared
LDFLAGS=
LIBS=
DBG_FLAGS= -DDEBUG=1

CP=@CP@

all: clean neb2socket.o

neb2socket.o:
	$(CC) $(MOD_LDFLAGS) $(MOD_CFLAGS) $(CFLAGS) -o $@ module.c logger.c broker.c events.c json.c socket.c strutil.cc $(LDFLAGS) $(LIBS) $(INCLUDES)

clean:
	rm -f *.o
	#rm -f *~ *.*~

install:

