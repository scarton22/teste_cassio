
      import { MongoClient } from 'mongodb';
      var url = "mongodb://localhost:27017/";
      
      function validaBanco ()

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mongodb");
        var query = { address: /^S/ };
        dbo.collection("customers").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();

        
        });
    
     
    });