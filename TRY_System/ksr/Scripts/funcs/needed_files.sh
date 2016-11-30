#!/bin/sh

result=0

for e in $*; do
    if ! ls $e > /dev/null 2>&1; then
        echo Expected file $e is missing.
        result=1
    fi
done

exit $result

