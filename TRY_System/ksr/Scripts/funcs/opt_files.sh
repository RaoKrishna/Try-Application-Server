#!/bin/sh

expected="$1"
optional="$2"

result=0

for s in *; do
    if [ -d $s ]; then continue; fi
    wrong=true
    for e in $expected; do
        if [ $s = $e ]; then # submitted file is expected
            wrong=false
            break
        fi
    done
    for o in $optional; do
        if [ $s = $o ]; then # submitted file is optional
            wrong=false
            break
        fi
    done
    if $wrong; then
        echo Unexpected file ${s}.
        result=1
    fi
done

exit $result

