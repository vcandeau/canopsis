###################################
# Makefile for NEB2amqp
###################################

all: clean neb2amqp.o librabbitmq.la

librabbitmq.la:
	cd lib/rabbitmq-c && autoreconf -i && ./configure && make

neb2amqp.o: librabbitmq.la
	cd src && make

clean:
	cd src && make clean
	rm -f *.o

install:

