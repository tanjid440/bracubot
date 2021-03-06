let util = require('util');
let debug = require('debug')('bracubot:server');
let DB = require('./db/conn');
let SS = require('./special_search');
let failcases = require('./failcases');

let populate = function(pattern, matched, reply){
    if(pattern.query){
        if(pattern.query.indexOf("SPECIAL(") > -1){
            let specialFunc = pattern.query.match(/SPECIAL\((\w+)\)/i);
            matched[1] = SS.run(specialFunc[1], matched[1]); // Special parameter is always the second one
            pattern.query = pattern.query.replace(/SPECIAL\(\w*\)/i, "?");
        }
        matched = matched + "";
        console.log(matched);
        DB.query(pattern.query, matched.split(","), callback);
    } else {
        console.error("Query is not defined for pattern: ");
        console.log(pattern);
        reply(pattern.template);
    }
    function callback(data, err){
        if(!data) throw err;
        if(!pattern.template){
            console.error("Template is not defined.");
        }
        console.log(data);
        if(!data.length){
            reply("There is no information found regarding your query.", "NP");
            return;
        }
        if(!pattern.multi){
            if(data.length > 1){
                console.log(data);
                console.error("Multiple result found for single type query");
            }
            data = data[0];
        } else {
            let teacher;
            let resultingData = {};
            resultingData[pattern.asking] = [];
            for(teacher in data){
                resultingData[pattern.asking].push(data[teacher][pattern.asking]);
            }
            data = data[0];
            data[pattern.asking] = resultingData[pattern.asking];
        }
        let property;
        let str = pattern.template;
        let resultingStr = str;
        for(property in data){
            let prevStr = str;
            resultingStr = resultingStr.replace("%" + property + "%", data[property]);
            if(prevStr == resultingStr) console.error('Something wrong while replacing.');
        }
        reply(resultingStr);
    };
};

module.exports.populate = function (tagged, values, reply) {
    populate(tagged, values ,reply);
};