#!/bin/bash
# create build package and deploy a new skill

# create temp zip file with build package contents
echo 'zipping up files'
zip -r pianobot.zip index.js node_modules/ > temp.log
echo 'build file created'

# stage the temp file in s3
aws s3 cp pianobot.zip s3://pianoplayerskill/binary/

# remove the temporary file
rm pianobot.zip

# update the lambda function with the binaries that have been staged
aws lambda update-function-code --function-name pianoPlayerGreen --s3-bucket pianoplayerskill --s3-key binary/pianobot.zip
