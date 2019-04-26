const socket = io()

// Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormButtonSend = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//const $locations = document.querySelector('#locations')

// Templates 

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options 

const {username, room} = Qs.parse( location.search, { ignoreQueryPrefix : true })

//console.log(username + '   ' + room)

// getting data from server on client side 

socket.on('messageServer', (message) => {
    console.log(message)
})

const autoscroll = ()=> {
    // new message element

    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height 

    const visibleHeight = $messages.offsetHeight

    // Height of messages container 

    const containerHeight = $messages.scrollHeight 

    // How far have i scrolled 

    const scrollOffSet = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => { 
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username : message.username,  
        message  : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log('Url',message)
    const html = Mustache.render(locationTemplate, {
        username : message.username, 
        url : message.url, 
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable form 

    $messageFormButton.setAttribute('disabled', 'disabled')


    // e.target - links to the form. Elements - all elements of the forms
    // message - the name of input field 
    const message = e.target.elements.message.value
    // callback aftre message allow us to send acknowledgemnet message to the client that message was sent 
    socket.emit('messageCLient', message, (error) =>{
        // enabled 

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error){
            return console.log(error)
        }
        console.log('Message delivered')
    })  
})

$messageFormButtonSend.addEventListener('click', () => {
    
    $messageFormButtonSend.setAttribute('disabled', 'disabled')

    if (!navigator.geolocation) {
        return alert('Geolacation is not supported by your browser')
    } 
    socket.emit('sendLocation', {
        latitude : 60, 
        longitude : 60 
        //latitude : position.coords.latitude, 
        //longitude : position.coords.longitude 
    }, ()=> {
        $messageFormButtonSend.setAttribute('disabled', 'disabled')
        $messageFormButtonSend.removeAttribute('disabled')
        console.log('Location shared')
    })
    //navigator.geolocation.getCurrentPosition(getCoor, errorCoor, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
    navigator.geolocation.getCurrentPosition((position) => { 
        console.log('Position is ',   position)
        socket.emit({
            latitude : 60, 
            longitude : 60 
        //latitude : position.coords.latitude, 
        //longitude : position.coords.longitude 
        })
    }), 
    () => {
        console.log()
    },  {maximumAge:60000, timeout:5000, enableHighAccuracy:true}
})

socket.emit('join', {username, room}, (error) => {
      if (error){
          alert(error)
          // redirect use to home page 
          location.href = '/'
      }
})

/* socket.on('countUpdated', (count) => {
    console.log('THe count has been updated', count )
})
 */


/* document.querySelector('#increment').addEventListener('click', ()=> {
    console.log('Clicked')
    // send data back to the server 
    socket.emit('increment')
}) */

