//Retrieving the query string
const { username, room } = Qs.parse(location.search,{ignoreQueryPrefix:true})
if(!username || !room){
    return window.location.href = '/'
}

const socket = io()

const $errorSuccessMessage = document.querySelector('#errorSuccessMessage')
const $messageForm         = document.querySelector('#chatForm')
const $messageInput        = document.querySelector('#message')
const $messageSubmit       = document.querySelector('#submitButton')
const $chatArea            = document.querySelector('#chat-area')
const $sendLocationButton  = document.querySelector('#send-location')
const $sidebar             = document.querySelector('#sidebar')

//Templates
const $templateMessage     = document.querySelector('#template-message').innerHTML
const $templateLocation    = document.querySelector('#template-location').innerHTML
const $templateSidebar     = document.querySelector('#template-sidebar').innerHTML


//Auto scroll

const scrollToTop = ()=>{
    $chatArea.scrollTop = $chatArea.scrollHeight
}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageSubmit.setAttribute('disabled','disabled')
    $errorSuccessMessage.innerHTML =''

    if(message.value==''){
        $errorSuccessMessage.innerHTML ='<span class="text-danger">Please type in message box</span>'
        $messageSubmit.removeAttribute('disabled')
        return false
    }

    socket.emit('message',$messageInput.value,(error)=>{
        if(error){
            return console.log(error)
        }

        $messageSubmit.removeAttribute('disabled')
        $messageInput.value=''
        $messageInput.focus()
        console.log('Message delivered!')
    })

})

$sendLocationButton.addEventListener('click',()=>{
    $errorSuccessMessage.innerHTML =''
    if(!navigator.geolocation)
    {
        $errorSuccessMessage.innerHTML ='<span class="text-danger">Your browser does not support location sharing</span>'
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })

})

socket.on('sendMessage',(message)=>{
    const html = Mustache.render($templateMessage,
        {
            message:message.text,
            createdAt:moment(message.createdAt).format('h:mm A'),
            username:message.username
        })
    $chatArea.insertAdjacentHTML('beforeend',html)
    scrollToTop()
})

socket.on('locationMessage',(location)=>{
    const html = Mustache.render($templateLocation,
        {
            location:location.url,
            createdAt:moment(location.createdAt).format('h:mm A'),
            username:location.username
        })
    $chatArea.insertAdjacentHTML('beforeend',html)
    scrollToTop()
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        return location.href = '/'
    }
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($templateSidebar,{
        room,
        users
    })

    $sidebar.innerHTML= html
})

