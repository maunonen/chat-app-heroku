const users = []

// addUser, removeUser, getUser, getUserInRoom

const addUser = ({ id, username, room }) => {
    
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data 
    if(!username || !room){
        return {
            error : 'Username and room are requierd'
        }
    }

    // check for existing user 
    const existingUser = users.find( (user) => {
        return user.room === room && user.username === username 
    })

    // validate username 
    if (existingUser){
        return {
            error : 'Username is in use!'
        }
    }
    // Store user
    console.log(users)
    const user = { id, username, room }
    users.push(user)
    console.log(users)
    return { user  }
}

const removeUser = (id) => {
    const index = users.findIndex((user) =>  user.id === id)
    if (!index !== -1){
        // remove object by id and access first element 
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    console.log(users)
    return users.find((user) => user.id === id) 
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
}