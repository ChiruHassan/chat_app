
const moment = require('moment');

function formatMessagge(username,text){
    return {
        username,
        text,
        time: moment().format('h:mm a'),
    }
}

module.exports = formatMessagge;