var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
        hosts: [
                'https://[username]:[password]@[server]:[port]/',
                'https://[username]:[password]@[server]:[port]/'
        ]        
});
var inputFile = require('./wa_cities.json');
var bulkArr = [];

client.indices.putMapping({
  index: 'wa_cities_shapes',
  type: 'cities',
  body: {
    properties: {
      "location": {
        "type": "geo_shape",
      },
      "name": {
        "type": "string"
      }
    }
  }
}, function(err, resp, status) {
    if (err) {
      console.log(err);
    } else {
      console.log(resp);
    }
});


function makeBulk(input, callback) {
        let j = 1;
        for (let i in input) {
                bulkArr.push(
                        {index: {_index: 'wa_cities_shapes', _type: 'cities', _id: j++}},
                        {
                                'name': input[i].properties.NAME,
                                'location': input[i].geometry
                        }
                );
        }
        console.log(bulkArr);
        callback(bulkArr);
}


function indexAll(bulkDocs, callback) {
        client.bulk({
                index: 'wa_cities_shapes',
                type: 'cities',
                body: bulkDocs
        }, function(err, resp, status) {
                if (err) console.log(err);
                callback(resp);
        });
}

makeBulk(inputFile, function(resp) {
        indexAll(resp, function(resp) {
                console.log(resp.items);
        });
});
