var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
        hosts: [
                'https://[username]:[password]@[server]:[port]/',
                'https://[username]:[password]@[server]:[port]/'
        ],
        requestTimeout: Infinity
        
});
var inputFile = require('./wa_county.json');
var bulkArr = [];


client.indices.putMapping({
  index: 'wa_counties',
  type: 'county',
  body: {
    properties: {
      "location": {
        "type": "geo_shape",
      },
      "county_name": {
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
                        {index: {_index: 'wa_counties', _type: 'county', _id: input[i].properties.NAME10}},
                        {
                                'county_name': input[i].properties.NAME10,
                                'location': input[i].geometry                        
                        }
                );
        }
        console.log(bulkArr);
        callback(bulkArr);
}


function indexAll(bulkDocs, callback) {
        client.bulk({
                index: 'wa_counties',
                type: 'county',
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
