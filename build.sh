#!/bin/bash
# create build package and deploy a new skill

# create temp zip file with build package contents
echo 'zipping up files'
zip -r pianobot.zip index.js data/songs.json data/lessons.json node_modules/ > temp.log
echo 'build file created'

# stage the temp file in s3
aws s3 cp pianobot.zip s3://pianoplayerskill/binary/

# remove the temporary file
rm pianobot.zip

# set which lambda function is being updated
lambdaruntime='pianoPlayerBlue'
echo 'deploying new function to' $lambdaruntime

# update the lambda function with the binaries that have been staged
aws lambda update-function-code --function-name "$lambdaruntime" --s3-bucket pianoplayerskill --s3-key binary/pianobot.zip > temp.log

# read in test data required to invoke the lambda function
echo 'test case 1 - basic request'
cd testing
request=$(<request.json)
output=$(<outputTC1.json)
cd ..

# invoke the new lambda function
aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json >> temp.log

# read response file into local variable then print on the console
response=$(<testOutput.json)
echo $response
echo 'test case 1 complete'

# read in test data required to invoke the lambda function
echo 'test case 2 - begin game request'
cd testing
request=$(<beginGameRequest.json)
cd ..

# invoke the new lambda function
aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json >> temp.log

# read response file into local variable then print on the console
response=$(<testOutput.json)
echo $response
echo 'test case 2 complete'

# read in test data required to invoke the lambda function
echo 'test case 3 - guess game request'
cd testing
request=$(<guessGameRequest.json)
cd ..

# invoke the new lambda function
aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json >> temp.log

# read response file into local variable then print on the console
response=$(<testOutput.json)
echo $response
echo 'test case 3 complete'

# read in test data required to invoke the lambda function
echo 'test case 4 - list lessons request'
cd testing
request=$(<listLessonsRequest.json)
cd ..

# invoke the new lambda function
aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json >> temp.log

# read response file into local variable then print on the console
response=$(<testOutput.json)
echo $response
echo 'test case 4 complete'

# read in test data required to invoke the lambda function
echo 'test case 5 - list songs request'
cd testing
request=$(<listSongsRequest.json)
cd ..

# invoke the new lambda function
aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json >> temp.log

# read response file into local variable then print on the console
response=$(<testOutput.json)
echo $response
echo 'test case 5 complete'
