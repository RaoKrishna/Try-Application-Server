cd ../../$WEB_TRY_CURRENT_DIR/Scratch-Directory
mkdir $WEB_TRY_STUDENT_ID

cd $WEB_TRY_STUDENT_ID

#sleep 1
cp ../../../../../TRY_Scripts/* .
cp ../../Submission/$WEB_TRY_STUDENT_ID/temp/* .
cp -r ../../Instructor-Files/Files/. . 
cp ../../Instructor-Files/Scripts/* .
mkdir Files

echomsg() { echo "$@"; }
#echomsg "Msg in copy-script"
#echo "Also this msg"
