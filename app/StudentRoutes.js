/**
 * Created by Krishna Rao on 3/23/2016.
 */

var express = require('express');
var studentRouter = express.Router();
var extract = require('./runScript');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var jwt = require('jsonwebtoken');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            var instructorId = req.params.instructorId;
            var courseId = req.params.courseId;
            var assignmentId = req.params.assignmentId;
            var token = req.headers['authorization'];
            var user = jwt.decode(token.replace('Bearer ', ''));
            var username = user.username;
            var path = `TRY_System/${instructorId}/${courseId}/${assignmentId}/Submission/${username}/`;
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, 0o766, function (err) {
                    if (err) {
                        return Promise.reject(err);
                    }
                });
                createTempFolder(path);
            } else {
                createTempFolder(path);
            }
            cb(null, path + "temp/");
        } catch (err) {
            return Promise.reject(err);
        }
    },
    filename: function (req, file, cb) {
        cb(null, 'Temp-File-Of-Node-Service-' + Date.now())
    }
});
var upload = multer({ storage: storage});
var exec = require('child_process').exec;

function createTempFolder(path) {
    try {
        path = path + "temp/";
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, 0o766, function (err) {
                if (err) {
                    console.log(err);
                    console.log("ERROR! Can't create the directory! \n");
                }
            });
        }
    } catch(err) {
        throw err;
    }
}

var router = function() {

    studentRouter.route('/instructors/')
        .get(function(req, res){
            try {
                var child = exec(`find * -maxdepth 0 -type d`, {cwd: `TRY_System/`},
                    function (error, stdout, stderr) {
                        if (stderr) {
                            res.status(500).json(stderr);
                        } else {
                            var instructors = stdout;
                            instructors = instructors.split('\n');
                            var index = instructors.indexOf("TRY_Scripts");
                            instructors.splice(index, 1);
                            res.status(200).json(instructors.slice(0, instructors.length - 1));
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                        }
                    });
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }

        });

    studentRouter.route('/:instructorId/courses/')
        .get(function(req, res){
            try {
                var instructorId = req.params.instructorId;
                var child = exec(`find * -maxdepth 0 -type d`, {cwd: `TRY_System/${instructorId}/`},
                    function (error, stdout, stderr) {
                        if (stderr) {
                            res.status(500).json(stderr);
                        } else {
                            var courses = stdout;
                            courses = courses.split('\n');
                            var index = courses.indexOf("TRY_Scripts");
                            courses.splice(index, 1);
                            res.status(200).json(courses.slice(0, courses.length - 1));
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                        }
                    });
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }
        });

    studentRouter.route('/:instructorId/:courseId/assignments/')
        .get(function(req, res){
            try {
                var instructorId = req.params.instructorId;
                var courseId = req.params.courseId;
                var child = exec(`find * -maxdepth 0 -type d`, {cwd: `TRY_System/${instructorId}/${courseId}/`},
                    function (error, stdout, stderr) {
                        if (stderr) {
                            res.status(500).json(stderr);
                        } else {
                            var assignments = stdout;
                            assignments = assignments.split('\n');
                            res.status(200).json(assignments.slice(0, assignments.length - 1));
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                        }
                    });
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }
        });

    studentRouter.route('/:instructorId/:courseId/:assignmentId/fileformat/')
        .get(function(req, res){
            try {
                var instructorId = req.params.instructorId;
                var courseId = req.params.courseId;
                var assignmentId = req.params.assignmentId;

                fs.readFile(`TRY_System/${instructorId}/${courseId}/${assignmentId}/submission-details.txt`, 'utf8',
                    function read(err, data) {
                        if (err) {
                            console.log("Error occured: ", err);
                            res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + err});
                        }  else {
                            var lines = data.split('\n');
                            lines = lines.reduce(function (fileTypeArray, line) {
                                if (line.trim().indexOf("Restricted") == 0 || line.trim().indexOf("Mandatory") == 0) {
                                    fileTypeArray.push(line.trim());
                                }

                                // Date comparison for checking due date
                                if (line.trim().indexOf("Due date") == 0) {
                                    var dueDate = new Date(line);
                                    var todayDate = new Date();

                                    // This variable keeps track of the submission status of the assignment.
                                    // If its late this value will be set to true
                                    if (todayDate > dueDate) {
                                        process.env[`WEB_TRY_LATE`] = true;
                                    } else {
                                        process.env[`WEB_TRY_LATE`] = false;
                                    }
                                }
                                return fileTypeArray;
                            }, []);
                            if (lines.length == 0) {
                                res.status(200).json([]);
                            } else {
                                res.status(200).json(lines);
                            }
                        }
                    });
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }
        });

    studentRouter.route('/submission/:instructorId/:courseId/:assignmentId/')
        .post(upload.single('file'), function(req, res){
            try {
                var file = req.file;
                var tmp_path = file.path;
                var instructorId = req.params.instructorId;
                var courseId = req.params.courseId;
                var assignmentId = req.params.assignmentId;
                var token = req.headers['authorization'];
                var user = jwt.decode(token.replace('Bearer ', ''));
                var username = user.username;
                var path = `TRY_System/${instructorId}/${courseId}/${assignmentId}/Submission/${username}/temp/`;
                var target_path = path + file.originalname;
                var src = fs.createReadStream(tmp_path);
                var dest = fs.createWriteStream(target_path);
                dest.on('error', function (err) {
                    fs.unlink(tmp_path);
                    res.status(500).send(err);
                });
                dest.on('finish', function () {
                    fs.unlink(tmp_path);
                    res.status(200).json({done: 'done'});
                });
                src.pipe(dest);
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }
        });

    studentRouter.route('/submission/:instructorId/:courseId/:assignmentId/runScript/')
        .get(function (req, res) {
            try {
                var instructorId = req.params.instructorId;
                var courseId = req.params.courseId;
                var assignmentId = req.params.assignmentId;
                var token = req.headers['authorization'];
                var user = jwt.decode(token.replace('Bearer ', ''));
                var username = user.username;
                var logPath = `TRY_System/${instructorId}/${courseId}/${assignmentId}/Log-Directory/${username}`;
                var currentdate = new Date();
                var datetime = (currentdate.getMonth() + 1) + "/" +
                    currentdate.getDate() + "/"
                    + currentdate.getFullYear() + " @ "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
                if (!fs.existsSync(logPath)) {
                    fs.writeFile(logPath, `Log recorded for ${username} at ${datetime}\n`, function (error) {
                        if (error) {
                            console.log(error);
                        }
                    })
                } else {
                    fs.appendFile(logPath, `Log recorded for ${username} at ${datetime}\n`, function (error) {
                        if (error) {
                            console.log(error);
                        }
                    })
                }

                // This can be used to access common instructor scripts from
                // assignment specific scripts
                process.env[`WEB_TRY_INSTRUCTOR_DIR`] = "../../../../";

                // This is used in TRY Scripts to access the current assignment directory
                process.env[`WEB_TRY_CURRENT_DIR`] = `TRY_System/${instructorId}/${courseId}/${assignmentId}/`;

                // This stores the student id
                process.env[`WEB_TRY_STUDENT_ID`] = username;

                // This variable tracks error in the execution of any phase
                process.env[`WEB_TRY_ERROR`] = false;

                var path = `TRY_System/${instructorId}/${courseId}/${assignmentId}/Scratch-Directory/${username}/`;
                exec(`bash copy-script.sh`, {cwd: `TRY_System/TRY_Scripts/`},
                    invoke_init);

                var studentMessage = "";

                function invoke_init(error, stdout, stderr) {
                    if (!error && !stderr) {
                        log(stdout + "\n");
                        studentMessage += stdout;
                        exec(`bash try-init.sh`, {cwd: path},
                            invoke_build);
                    } else {
                        console.log("error stdout is =>", stdout);
                        console.log("error stderr is =>", stderr);
                        console.log("error is =>", error);
                        log(stdout + "\n" + stderr + "\n");
                        studentMessage += stdout;
                        studentMessage += stderr;
                        process.env[`WEB_TRY_ERROR`] = true;
                        runPostExecutionScript();
                    }
                    studentMessage += "\n";
                }

                function invoke_build(error, stdout, stderr) {
                    if (!error && !stderr) {
                        studentMessage += stdout;
                        log(stdout + "\n");
                        log("Init phase completed successfully!\n");
                        studentMessage += "Init phase completed successfully!\n";
                        exec(`bash try-build.sh`, {cwd: path},
                            invoke_run);
                    } else {
                        console.log("error stdout is =>", stdout);
                        console.log("error stderr is =>", stderr);
                        console.log("error is =>", error);
                        log(stdout + "\n" + stderr + "\n");
                        process.env[`WEB_TRY_ERROR`] = true;
                        studentMessage += stdout;
                        studentMessage += stderr;
                        studentMessage += "Init phase failed!\n";
                        log("Init phase failed!\n");
                        runPostExecutionScript();
                    }
                    studentMessage += "\n";
                }

                function invoke_run(error, stdout, stderr) {
                    if (!error && !stderr) {
                        studentMessage += stdout;
                        log(stdout + "\n");
                        log("Build phase completed successfully!\n");
                        studentMessage += "Build phase completed successfully!\n";
                        exec(`bash try-run.sh`, {cwd: path},
                            invoke_cleanup);
                    } else {
                        console.log("error stdout is =>", stdout);
                        console.log("error stderr is =>", stderr);
                        console.log("error is =>", error);
                        log(stdout + "\n" + stderr + "\n");
                        studentMessage += stdout;
                        studentMessage += stderr;
                        studentMessage += "Build phase failed!\n";
                        process.env[`WEB_TRY_ERROR`] = true;
                        log("Build phase failed!\n");
                        runPostExecutionScript();
                    }
                    studentMessage += "\n";
                }

                function invoke_cleanup(error, stdout, stderr) {
                    if (!error && !stderr) {
                        studentMessage += stdout;
                        log(stdout + "\n");
                        log("Run phase completed successfully!\n");
                        studentMessage += "Run phase completed successfully!\n";
                        exec(`bash try-cleanup.sh`, {cwd: path},
                            invoke_post_try);
                    } else {
                        console.log("error stdout is =>", stdout);
                        console.log("error stderr is =>", stderr);
                        console.log("error is =>", error);
                        log(stdout + "\n" + stderr + "\n");
                        studentMessage += stdout;
                        studentMessage += stderr;
                        studentMessage += "Run phase failed!\n";
                        process.env[`WEB_TRY_ERROR`] = true;
                        log("Run phase failed!\n");
                        runPostExecutionScript();
                    }
                    studentMessage += "\n";
                }

                function invoke_post_try(error, stdout, stderr) {
                    if (!error && !stderr) {
                        log(stdout + "\n");
                        log("Cleanup phase completed successfully!\n");
                        studentMessage += "Cleanup phase completed successfully!\n";
                        studentMessage += stdout;
                        runPostExecutionScript();
                    } else {
                        console.log("error stdout is =>", stdout);
                        console.log("error stderr is =>", stderr);
                        console.log("error is =>", error);
                        studentMessage += stdout;
                        studentMessage += stderr;
                        studentMessage += "Cleanup phase failed!\n";
                        log(stdout + "\n" + stderr + "\n");
                        log("Cleanup phase failed!\n");
                        //process.env[`WEB_TRY_ERROR`] = true;
                        runPostExecutionScript();
                    }
                    studentMessage += "\n";
                    log("********************************************************\n");
                }

                function log(message) {
                    fs.appendFile(logPath, message, function (error) {
                        if (error) {
                            console.log("Log file error: ", error);
                        }
                    });
                }

                function runPostExecutionScript() {
                    exec(`bash post-execution.sh`, {cwd: `TRY_System/TRY_Scripts/`},
                        function (error, stdout, stderr) {
                            if (!error) {
                                console.log('Scripts executed! Temporary directories deleted successfully!');
                                res.status(200).json(studentMessage);
                            } else {
                                console.log('exec error: ' + error);
                            }
                        });
                }
            } catch (exception) {
                console.log(exception);
                res.status(500).json({errorMessage: "There was an internal error. Please contact your instructor.\n" + exception});
            }

        });

    return studentRouter;
};

module.exports = router;
