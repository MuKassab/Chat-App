const socket = io()

//HTML Elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.elements['userMessage']
const $formSubmitBtn = $messageForm.elements['submitButton']
const $locationBtn = document.querySelector('#locationBtn')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    //Get new message element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom )
    const newMsgHeight = $newMessage.offsetHeight + newMessageMargin


    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages conatiner
    const contentHeight = $messages.scrollHeight

    //Scroll location
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (contentHeight - newMsgHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', message => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', url => {
    console.log(url)
    const html = Mustache.render(urlTemplate, {
        url: url.url,
        createdAt: moment(url.createdAt).format('hh:mm A'),
        username: url.username
    })
    console.log(html)
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const messageText = $messageInput.value
    $formSubmitBtn.disabled = true
    if(messageText.trim().length == 0){
        console.log('Empty Message! Skipped!')
        $formSubmitBtn.disabled = false
        $messageInput.focus()
        return
    }
    $formSubmitBtn.disabled = false
    $messageInput.value = ''
    $messageInput.focus()
    socket.emit('sendMessage', messageText, msg => {
        console.log("Message Delieverd!", msg)
    })
})

$locationBtn.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Geolocations isn't supported in your browser")
    }

    $locationBtn.disabled = true
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationBtn.disabled = false
            console.log('Location Shared')
        })
    }, () => {}, {enableHighAccuracy:true, maximumAge:0})
})

socket.emit('join', {username, room}, error => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    const LogoImg = "<img src='/img/logo.png' alt='ShC Logo' style='width:200px;height:200px;'>"
    document.querySelector('#sidebar').innerHTML = LogoImg + html
})