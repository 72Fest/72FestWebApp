#!/bin/bash
BACKUP_FILE=`hostname`-72fest-backup.zip
mongodump --db 72Fest --out backup
zip -r ${BACKUP_FILE} backup/72Fest/
rm -rf backup
aws s3 cp ${BACKUP_FILE} s3://72fest-backups/prod/mongo/2017/
rm ${BACKUP_FILE}
