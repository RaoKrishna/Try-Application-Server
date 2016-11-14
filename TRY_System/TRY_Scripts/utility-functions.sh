echoErrorMessage() { 
  echo "$@" 1>&2; 
}

comment() {
  echo "Comment added by instructor - $@";
}
