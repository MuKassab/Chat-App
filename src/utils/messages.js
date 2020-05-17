const generateMessage = (username, text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username, locObj) => {
    return {
        url: `https://www.google.com/maps?q=${locObj.latitude},${locObj.longitude}`, 
        createdAt: new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}