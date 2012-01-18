###################################
# Makefile for NEB2amqp
###################################

INCLUDES=-I../lib/rabbitmq-c/librabbitmq -I../lib/ -I./
SRCPATH=src

CC=gcc
MOD_CFLAGS=-fPIC
CFLAGS=-g -O2 -DHAVE_CONFIG_H
MOD_LDFLAGS=-shared -lstdc++
LDFLAGS=-L../lib/rabbitmq-c/librabbitmq/librabbitmq.la
LIBS=
DBG_FLAGS=-DDEBUG=1

CP=@CP@

all: clean neb2amqp.o

../lib/rabbitmq-c/librabbitmq/librabbitmq.la:
	echo "Build librabbitmq first!" && exit 1

neb2amqp.o: ../lib/rabbitmq-c/librabbitmq/librabbitmq.la
	$(CC) $(MOD_LDFLAGS) $(MOD_CFLAGS) $(CFLAGS) -o $@ module.c logger.c broker.c events.c json.c neb2amqp.c strutil.cc $(LDFLAGS) $(LIBS) $(INCLUDES)

clean:
	rm -f *.o

install:

