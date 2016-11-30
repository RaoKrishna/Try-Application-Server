#!/bin/sh

if [ -z $JEH_JAVA_MAIN ]; then
    echo GHAHA # !!!!
    find . \
        -name '*.java' \
        -exec grep -iq \
            '^[ 	]*public * static * void * main *( *String *\[' \
            {} \; \
        -print \
        | sed -e 's/^..//' \
        > /tmp/main$$
    if [ `cat /tmp/main$$ | wc -l` -ne 1 ]; then
        echo This assignment did not specify a main class, and 1>&2
        echo there is no main class, or there are multiple main classes. 1>&2
        echo Aborting. 1>&2
        exit 1
    fi
    src=`cat /tmp/main$$`
    /bin/rm -f /tmp/main$$
else
    src=${JEH_JAVA_MAIN}.java
fi

if [ -z $JEH_JCOMPILER ]; then
    JAVAC=javac
else
    JAVAC=$JEH_JCOMPILER
fi

if [ "`basename $JAVAC`" = "ajc" ] ; then # Prepend Aspect files
    if false; then # AspectJ Compiler is a Tricky Beast. I Give Up.
        main=`basename $src`
        aspects="`find . \( \( -name \*.aj -o -name \*.java \) -a ! -name $main \) -exec grep -iq '^[a-zA-Z_ ]*aspect .*{' {} \; -print`"
        src="-1.8 $aspects $src"
    else
        src="-1.8 -sourceroots ."
    fi
fi

stat=0

if ! $JAVAC $src; then
    echo "Compilation failed. Exiting." 1>&2
    stat=1
else

    # Double-check...

    for f in $src; do
        if [ ! -f "$f" ]; then continue; fi
        base=`basename $f .java`
        dir=`dirname $f`
        if [ $dir = . ]; then
            if grep -q '^package.*;' $f; then
                echo $f has a package declaration but is not in its directory. \
                    1>&2
                echo "Compilation failed. Exiting." 1>&2
                stat=3
            fi
        else
            if ! ( grep '^package.*;' $f | grep -q $dir ); then
                echo $f is in $dir but has no package declaration. 1>&2
                echo "Compilation failed. Exiting." 1>&2
                stat=4
            fi
        fi
        if [ ! -f $dir/$base.class ]; then
            echo "Compilation failed. Exiting." 1>&2
            stat=2
        fi
    done

fi

if [ $stat != 0 ]; then
    find . -name \*.class -exec /bin/rm {} \;
fi

exit $stat

