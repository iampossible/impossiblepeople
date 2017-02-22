This document contains information we found useful for deploying the application.

## Database
The database is Neo4j 3.0.0. In the staging environment it was installed by:

 1. Upgrading to Java 8

    sudo add-apt-repository ppa:openjdk-r/ppa
    sudo apt-get update
    sudo apt-get install openjdk-8-jdk
    sudo update-alternatives --config java

 2. Uninstalling Neo4j then installing Neo4j 3.0.0 with

    sudo apt-get purge -f neo4j
    sudo apt-get install neo4j=3.0.0

 3. Configuring for online browsing by editing `neo4j.conf` to uncomment the line

    dbms.connector.http.address=0.0.0.0:7474
