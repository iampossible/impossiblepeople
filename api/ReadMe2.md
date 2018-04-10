# gnome-app api Linux 

##List of errors may faceyou in Linux 

first issue:curl: (7) Failed to connect to 192.168.99.100 port 80: Connection refused

Steps to fix this issue 

a-Go TO: impossible-gnome/api/src/config

Open File:server.dev.json

Change 
"neo4j": {
        "host": "http://neo4j:7474"
    },

to

"neo4j": {
        "host": "http://localhost:7474"
    },

b-in directory: impossible-gnome/api/src/config

Open File:server.js

change 
let processedHost = process.env.GNOME_HOST || rawConfig.host || "172.18.0.3";

to
let processedHost = process.env.GNOME_HOST || rawConfig.host || "localhost";


b-Go To:impossible-gnome/api

open file : before-test.sh

Change
 echo ${NEO4J_HOST:="http://172.18.0.3:7474/"}
To
echo ${NEO4J_HOST:=http://localhost:7474}


c-Go To: impossible-gnome/api/test/
open file:DataHelper.js

comment
const neo4jBatchEndpoint = `http://neo4j:RJHTFzJWQWVJT2L3EudP@127.0.0.1:7474/db/data/batch`;
const neo4jQueryEndpoint=`http://neo4j:RJHTFzJWQWVJT2L3EudP@127.0.0.1:7474/db/data/transaction/commit`;

then add 
const neo4jAuth = `http://${config.neo4j.user}:${config.neo4j.pass}@`;
const neo4jBatchEndpoint = `${config.neo4j.host.replace('http://', neo4jAuth)}/db/data/batch`;
const neo4jQueryEndpoint = `${config.neo4j.host.replace('http://', neo4jAuth)}/db/data/transaction/commit`;

and uncomment
var config = require('../src/config/server');


Second issue:curl successffull and you can see the Database in browser but the app will crash if you try to get or post to db.

a-you need to delete your local database 
open localhost:7474

run:
match (n)  
with n limit 10000  
DETACH DELETE n;  

b-You need to  populate the dabase manually.

Go To: impossible-gnome/api/test/
copy environment file from immpossible-gnome folder to this folder

open termenal 
run command:source environment 
then do:npm install
then node DataHelper.js



