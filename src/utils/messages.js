const generateMessage = (username,text) =>{
    return {
        text,
        username:username.toUpperCase(),
        createdAt : new Date().getTime()
    }
}

const generateLocationMessage = (username,url) =>{
    return {
        url,
        username:username.toUpperCase(),
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}