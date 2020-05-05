const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username, position) => {
    return {
        username,
        url: `https://google.com/maps?q=${position.lat},${position.long}`,
        craetedAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}