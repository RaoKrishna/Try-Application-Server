cd ../../$WEB_TRY_CURRENT_DIR/Scratch-Directory

cp -r ./$WEB_TRY_STUDENT_ID/Files/. ../Submission/$WEB_TRY_STUDENT_ID/temp/
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
		if $WEB_TRY_LATE
		then
			if [ -d "LATE" ];
			then
				mv ./LATE Previous-Submission/
			fi
		else
			for file in *; do
	   			if ! [ -d "$file" ]; then
	     				mv -- "$file" Previous-Submission/
	   			fi
			done
		fi
	else
		mkdir "Previous-Submission"	
	fi
	
	if [ -d "LATE" ];
	then
		rm -rf LATE
	fi

	if $WEB_TRY_LATE
	then
		mkdir "LATE"
		cp temp/* ./LATE/
		rm -rf temp
	else
		cp temp/* .
		rm -rf temp
	fi
fi
