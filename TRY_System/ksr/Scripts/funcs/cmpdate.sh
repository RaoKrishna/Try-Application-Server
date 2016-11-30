#!/bin/sh

# Compare a date to the current time, or two dates.

# If 1 date argument is given, it is as if this script
#   was called with the current time was provided as the second argument.

# Return
#   0 if the two dates are equal,
#   1 if the first date is after the second date,
#   -1 otherwise.

# The date format is anything accepted by the `date' program
#  on this computer.

# If the verbose option -v is set, a message is also printed with the
#   result (for error checking).

# The script only fails on bad arguments.

if [ $# -eq 0 -o $# -gt 3 ]; then
    echo Usage: `basename $0` \[ -v \] date-string \[ date-string \] 1>&2
    exit 1
fi

if [ "$1" = "-v" -o "$1" = "--verbose" ]; then
    verbose=true
    shift
else
    verbose=false
fi

if [ $# -eq 1 ]; then set "$1" "`date`"; fi

if ! date1=`date --date "$1" +%s`; then exit $?; fi
if ! date2=`date --date "$2" +%s`; then exit $?; fi

result=`expr $date1 - $date2`

if $verbose; then
    date1_str=`date --date "$1" +%c%Z`
    date2_str=`date --date "$2" +%c%Z`

    if [ $result -eq 0 ]; then
        echo $date1_str is equal to $date2_str
    elif [ $result -lt 0 ]; then
        echo $date1_str is before $date2_str
    else
        echo $date1_str is after $date2_str
    fi
fi

echo $result

exit 0
