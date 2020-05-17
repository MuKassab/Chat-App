const users = []

//Add New users
const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'Username & room are required!'
        }
    }

    const prevUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(prevUser) {
        return {
            error: 'Username is taken!'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//Removing User
const removeUser = id => {
    const index = users.findIndex(user => {
        return user.id === id
    })

    if(index === -1) {
        return {
            error: 'ID is not found!'
        }
    }

    return users.splice(index, 1)[0]
}

//Get a user's data
const getUser = id => {
    return users.find(user => user.id === id)
}

//get Users In a specific Room
const getUsersInRoom = room => {
    const usersInRoom = users.filter(user => {
        return user.room === room
    })
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}