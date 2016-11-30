echo "Hello"
echo "World"
echo $WD_BACKPATH2
echoerr() { echo "$@" 1>&2; }
echoerr hello world error
exit 0


#!/bin/sh

THE_CLASSPATH=
PROGRAM_NAME=MainProgram.java
cd src
for i in `ls ../lib/*.jar`
  do
  THE_CLASSPATH=${THE_CLASSPATH}:${i}
done

javac -classpath ".:${THE_CLASSPATH}" $PROGRAM_NAME

if [ $? -eq 0 ]
then
  echo "compile worked!"
fi
