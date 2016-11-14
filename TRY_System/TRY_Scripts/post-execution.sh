cd ../../$WEB_TRY_CURRENT_DIR/Scratch-Directory

rm -rf $WEB_TRY_STUDENT_ID

if $WEB_TRY_ERROR 
then
	cd ../Submission/$WEB_TRY_STUDENT_ID/
	rm -rf temp
else
	cd ../Submission/$WEB_TRY_STUDENT_ID/
	if [ -d "Previous-Submission" ];
	then
		rm -rf Previous-Submission/*
		for file in *; do
   			if ! [ -d "$file" ]; then
     				mv -- "$file" Previous-Submission/
   			fi
		done
	else
		mkdir "Previous-Submission"	
	fi
	
	cp temp/* .
	rm -rf temp
fi
