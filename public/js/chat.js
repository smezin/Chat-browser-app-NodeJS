const socket = io()
//elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButtom = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationUrlTemplate = document.querySelector('#location-url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
//
const autoscroll = () => {
    //this func auto scrolls only if the user is at the bottom
    const $newMessage = $messages.lastElementChild

    //get message height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of message container
    const contentHeight = $messages.scrollHeight
    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        //if at the bottom 
        $messages.scrollTop = $messages.scrollHeight
    }

    

}

socket.on('message', (message) => {
    console.log('server says: ', message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationUrlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(location.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

let form = document.querySelector('#messageForm').addEventListener('submit', (e) => {

    e.preventDefault() //prevent refresh
    $messageFormButtom.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButtom.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('got it')
    })
})
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported on this device')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
        
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})
