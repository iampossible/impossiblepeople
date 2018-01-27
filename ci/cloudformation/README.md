This directory contains the cloudformation files for the necessary infrastructure. 

If you need to change something, simply change the file and then update the stack. Keep these files updated on Git for future reference.

```aws cloudformation {create-stack, update-stack} --stack-name weareone-db --template-body file://./ci/cloudformation/weareone-db.json --parameters ParameterKey=SSHKeyName,ParameterValue=weareone-db ParameterKey=Neo4jPassword,ParameterValue=XYZ```
