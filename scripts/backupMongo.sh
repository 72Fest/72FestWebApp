#!/bin/bash
BACKUP_FILE=`hostname`-72fest-backup.zip
S3_PATH="s3://72fest-backups/prod/mongo/2017"

# dump contents of db
mongodump --db 72Fest --out backup
zip -r ${BACKUP_FILE} backup/72Fest/
rm -rf backup
# save in s3
aws s3 cp ${BACKUP_FILE} ${S3_PATH}/
# copy file to latests which other EC2 instances will use
aws s3 cp ${S3_PATH}/${BACKUP_FILE} ${S3_PATH}/latest-72fest-backup.zip
rm ${BACKUP_FILE}
