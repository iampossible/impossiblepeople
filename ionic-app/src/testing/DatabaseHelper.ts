export class DatabaseHelper {

  private static instance:DatabaseHelper

  public static getInstance():DatabaseHelper {
    if (DatabaseHelper.instance == null) {
      const seraph = require('../../../node_modules/seraph')
      var neo4j_creds = (process.env.NEO4J_AUTH || 'neo4j/neo4j').split('/');
      var neo4j_user = neo4j_creds[0], neo4j_password = neo4j_creds[1];

      var db = seraph({
        server: (process.env.NEO4J_HOST || 'http://localhost:7474'),
        user: neo4j_user,
        pass: neo4j_password,
      })

      DatabaseHelper.instance = new DatabaseHelper(db)
    }
    return DatabaseHelper.instance
  }

  private db:any

  constructor(db) {
    this.db = db
  }

  public static runCypher(cypherQuery:string, queryParams:any) {
    return new Promise((resolve, reject) => {
      DatabaseHelper.getInstance().db.query(cypherQuery, queryParams, function (err, result) {
        if (err) return reject(err)
        resolve(result)
      })
    }).catch(err => console.error(err))
  }

}