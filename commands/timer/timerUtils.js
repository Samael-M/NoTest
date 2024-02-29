
//quick function to get Quotien and remainder
const modulo = (dividend, divisor) => [Math.floor(dividend / divisor), dividend % divisor];

//split large number of miliseconds into Hours, Minutes and Seconds
function splitTime(timeInMiliseconds) {
    const hours = modulo(timeInMiliseconds, 3600000);
    const minutes = modulo(hours[1], 60000);
    const seconds = minutes[1] / 1000;

    const time = {
        hours: hours[0],
        minutes: minutes[0],
        seconds: seconds
    };
    return time;
}

//takes time in hours, minutes, and seconds and builds message depending on whether the first hour or minute has been passed
function dynamicReply(splitTime) {
    var reply = [];
    if(splitTime.hours > 0) {
        reply.push(`${splitTime.hours} hour${splitTime.hours > 1 ? 's' : ''}`);
    }
    if(splitTime.minutes > 0) {
        reply.push(`${splitTime.minutes} minute${splitTime.minutes > 1 ? 's' : ''}`);
    }
    if(splitTime.seconds > 0) { 
        reply.push(`${splitTime.seconds} second${splitTime.seconds > 1 ? 's' : ''}`);
    }
    let message = `${reply.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`;
    return message;
}

module.exports = { dynamicReply };

//What if seconds = 0? User will just see hours and minutes passed, and may potentially wonder if they just don't get to see how many seconds
//Although I'd be VERY impressed if anyone ever stopped the timer EXACTLY when seconds = 0, so this scenario in all likelyhood won't ever happen