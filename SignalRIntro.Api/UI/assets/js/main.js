const userColors = {};
const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080", "#ffffff", "#000000"];
const messageSound = document.getElementById("messageSound");
let token = ""
var connection = null;
var curentUser = null;
var reply = null;
var selectedMessage = null;

var clientInfo = {
	client_id : 'KBMessenger',
	redirect_uri : 'http://192.168.100.129:5193/index.html'
};
var providerInfo = OIDC.discover('http://192.168.100.129:6011');

let isOpenSetting = false;
 const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    // Convert audio blob to an array buffer and send it
                    event.data.arrayBuffer().then(buffer => {
                        sendAudio("User", buffer);
                    });
                }
            };

            mediaRecorder.start();
        } catch (err) {
            console.error('Error capturing audio: ', err);
        }
    };	
	 const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playAudio(audioData) {
        audioContext.decodeAudioData(audioData).then(buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        }).catch(err => console.error('Error playing audio: ', err));
    }
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function CheckPermission(){
	if(OIDC && OIDC.getAccessToken()) {
		  token=OIDC.getAccessToken();
		 connection = new signalR.HubConnectionBuilder()
		 .withUrl("http://192.168.100.129:5192/chathub?token="+ token)
		 .build();
		 checkUser();
	} else {
		redirect();
	}
	
}
function redirect(){

	OIDC.setClientInfo( clientInfo );
	OIDC.setProviderInfo( providerInfo );
	OIDC.storeInfo(providerInfo, clientInfo);
	// Remove State and Nonce from previous session
	sessionStorage.removeItem('state');
	sessionStorage.removeItem('nonce');
	loginRequest = OIDC.generateLoginRequest({scope : 'openid profile',
	response_type : 'token id_token'});
	OIDC.login( {scope : 'openid profile email', response_type : 'token id_token'} );
}

function logOut(){
var idToken = sessionStorage.getItem('id_token');

sessionStorage.removeItem('access_token');
sessionStorage.removeItem('id_token');
sessionStorage.removeItem('state');
sessionStorage.removeItem('nonce');

var logoutUrl = 
    providerInfo.end_session_endpoint+'?id_token_hint=' + encodeURIComponent(idToken) +
    '&post_logout_redirect_uri=' + encodeURIComponent(clientInfo.redirect_uri);

window.location.href = logoutUrl;
}
function timeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    return "";
}

function isRTL(s) {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/; // Hebrew, Arabic, and other RTL languages
  return rtlChars.test(s);
}


function debounce(func, wait) {
	let timeout;
	return function(...args) {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), wait);
	};
}


function timoutDebounce(func, wait) {
	let timeout=0;
	return function(...args) {
		const context = this;
		const time = new Date().getTime()
		if(timeout + wait < time) {
			timeout = time;
			 func.apply(context, args)
		}
	};
}

	
function getColorForUsername(username) {
    if (!userColors[username]) {
        userColors[username] = colors[Object.keys(userColors).length % colors.length];
    }
    return userColors[username];
}



    // Send audio data
    function sendAudio(user, audioData) {
        connection.invoke("SendVoice", user, audioData).catch(err => console.error(err.toString()));
    }
	    // Handle receiving messages
    // connection.on("ReceiveVoice", (user, audioData) => {
        // playAudio(audioData);
    // });
function convertText(_text){
	const _link = new RegExp(/(https?:\/\/[^\s]+)/g);
	const _emojiList = ["happy","happy2","test","yeah"];
	
	_text = _text.replace(_link,`<a href="$1" target="_blank"> [${isRTL(_text) ? 'لینک' : 'link'}] </a>`);
	
	for(let i=0;i<_emojiList.length;i++){
		
		const _e = new RegExp(":"+_emojiList[i]+":");
		if(_e.test(_text)){
			_text = _text.replace(_e,`<picture>
    <source srcset="/assets/emoji/${_emojiList[i]}.gif" type="image/gif">
    <source srcset="/assets/emoji/${_emojiList[i]}.svg" type="image/svg+xml">
    <source srcset="/assets/emoji/${_emojiList[i]}.png" type="image/png">
    <source srcset="/assets/emoji/${_emojiList[i]}.jpg" type="image/jpeg">
    <img src="/assets/emoji/404.png" alt="${_emojiList[i]}" width="150">
</picture>`);
		}
	}
	/*
	const _voice = ["Iran",".*\.mp3"];	
	for(let i=0;i<_voice.length;i++){
		
		const _e = new RegExp("&("+_voice[i]+")&");
		if(_e.test(_text)){
			const f = _text.match(_e);
			if(f && f[0]) {
			_text = _text.replace(_e,`<audio controls>
    <source src="${f[1] ? f[1] : f[0]}" type="audio/mpeg">
    <!-- <source src="/assets/mp3/Iran.mp3" type="audio/mpeg"-->
</audio>`);
			}
		}
	}
	
	*/
	
	
	
	
	
	return _text;
	
}	
function sendMessage() {
    let _text = document.getElementById("messageInput").value;
	
	let div = document.createElement("div");
	div.innerHTML = _text;
	let message = div.textContent || div.innerText || "";
	
	
	let msg = "";
	let code = false;
	try {
		msg = JSON.stringify(JSON.parse(message), null,"\t");
		code = true;
	} catch (e){
		msg = _text;
	}
	if(!code) {
		msg = convertText(msg)
	}
	
	message = `<div dir="${isRTL(msg) && !code ? "rtl" : "ltr"}">${code ? `<pre>${msg}</pre>` : msg}</div>`
	
    if (message) {
		if(reply && reply.id) {
			message = `<a href="#msg-${reply.id}" class="r-msg"><span>${reply.name}:</span><span>${reply.msg}</span></a><span style="display:none">@@@@</span> `+message;
		}
		if(selectedMessage && selectedMessage.id){
			
			let tools = null;
			try{
				if(typeof selectedMessage.tools === "string")
					tools = JSON.parse(selectedMessage.tools || "{}") || {};
				else 
					tools = selectedMessage.tools || {}
			} catch(e){
				tools = {};
			}
			tools["edit"] = true;
			
			const msgList = selectedMessage.allMsg ? selectedMessage.allMsg.split('@@@@') : [];
			const newMessage = (msgList[1] ? msgList[0]+'@@@@<span> ':'')+message;
			
			connection.invoke("UpdateMessage", selectedMessage.id, newMessage, JSON.stringify(tools)).catch(err => console.error(err.toString()));
		} else {
			connection.invoke("SendMessage", message, reply && reply.id ? reply.id : "", "{}").catch(err => {
				console.error(err.toString());
				connection.invoke("SendMessage", message, reply && reply.id ? reply.id : "").catch(err => console.error(err.toString()));
			});
			
		}
	    closereplaymessage();
        document.getElementById("messageInput").value = '';
    }
}
function UpdateStatus(event="") {
    connection.invoke("UpdateStatus", event).catch(err => console.error(err.toString()));
}

function checkUser(){
    if (connection) {
        document.querySelector('#usernameModal').style.display = 'none';
        document.querySelector('.chat-box').style.display = 'block';

		addConcectionEvents();
		
        connection.start().then(() => {
            connection.invoke("GetMessageHistory",50);
        }).catch(err => console.error(err.toString()));
    }
}



if(document.getElementById("sendButton")){
	document.getElementById("sendButton").addEventListener("click", sendMessage);
}
if(document.getElementById("messageInput")){
	document.getElementById("messageInput").addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			sendMessage();
			event.preventDefault(); // Prevent the default action to avoid newline in input
		}
	});
	document.getElementById("messageInput").addEventListener('input', debounce(()=>{UpdateStatus("")}, 3000));
	document.getElementById("messageInput").addEventListener('input', timoutDebounce(()=>{UpdateStatus(document.getElementById("messageInput").value ? "typing" : "")}, 2000));
}


const emojiList = document.getElementById('list-emoji');

if (emojiList) {
  // Select all li elements within the ul
  const emojiItems = emojiList.getElementsByTagName('li');

  // Iterate over each li element and add a click event listener
  Array.from(emojiItems).forEach((item) => {
    item.addEventListener('click', () => {
		document.getElementById("messageInput").value += item.textContent;
    });
  });
}

function openSetting(){
	if(isOpenSetting) {
		isOpenSetting = false;
	} else {
		isOpenSetting = true;
	}
	document.getElementById("settings-user").style.display = isOpenSetting ? 'block' :'none'
	document.getElementById("setting-icon").innerHTML = isOpenSetting ? '<i class="fa fa-close" ></i>' :'<i class="fa fa-cog" ></i>'
	
	
}
	

function setProfile(imageId){
	let config  = null;
	try{
		config = curentUser ? JSON.parse(curentUser.config || "{}") : {};
	} catch(e){
		config = {};
	}
	
	config.profile = imageId;
	config = JSON.stringify(config);
    connection.invoke("UpdateConfigs", config).catch(err => console.error(err.toString()));
	
}
function createUser(user={}, event="", status="") {
	let config = null;
	try{
		config = JSON.parse(user.config) || {};
	} catch(e){
		config = {};
	}
	const _status = status ? `<span class="user-status ${status}"></span>` : '';
	const _event = event ? `<span class="user-event ${event}">${event}</span>` : '';
	const _lastseen = event || status ?  `<span class="user-last-sean">${timeSince(user.lastSeen)}</span>`: ''
	
	const r= `
	<div class="user-item ${status}">
		<div class="profile-circle" style="background-color: ${getColorForUsername(user.userName)};  ${config.profile ? `background-image: url(/assets/avatar/users-${config.profile}.svg)` : ''}">
			${!config.profile ? user && user.firstName ? user.firstName.charAt(0).toUpperCase() : '-' : ''}
		</div>
		<div>
			<strong>${user.firstName} ${user.lastName}</strong> 
			<!-- <em style="font-size:10px; color:#ccc">@${user.userName}</em> -->
				${_status}
				${_lastseen}
				${_event}
		</div>
	</div>`;
	return r;
}
function replaymessage(id,name,msg){
	let div = document.createElement("div");
	div.innerHTML = msg;
	let mainmsg = div.textContent || div.innerText || "";
	mainmsg = mainmsg.split('@@@@');
	mainmsg = mainmsg[mainmsg.length - 1]
	
	mainmsg = mainmsg.replace(/\-/g,"").replace(/\s+/g," ");
	reply = {"id":id,"name":name,"msg":mainmsg};
	
	document.getElementById("reply-msg").innerHTML = `<div class="reply-msg"><i class="fa fa-close" onclick="closereplaymessage()" ></i><div class="reply-msg-content"><b>${name}:</b> ${mainmsg}</div></div>`
}
function closereplaymessage(){
	reply = null;
	selectedMessage = null;
	document.getElementById("reply-msg").innerHTML = '';
}
function editMessage(id, msg, tools={}, allMsg){
	let div = document.createElement("div");
	div.innerHTML = msg;
	let mainmsg = div.textContent || div.innerText || "";
	mainmsg = mainmsg.split('@@@@');
	mainmsg = mainmsg[mainmsg.length - 1]
	
	mainmsg = mainmsg.replace(/\-/g,"").replace(/\s+/g," ");
	
	selectedMessage = {
		"id": id,
		"msg": mainmsg,
		"allMsg": allMsg,
		"tools":tools
	}
	document.getElementById("messageInput").value= mainmsg;
	document.getElementById("reply-msg").innerHTML = `<div class="reply-msg"><i class="fa fa-close" onclick="closereplaymessage()" ></i><div class="reply-msg-content">${mainmsg}</div></div>`
}

function likeMessage (id, _tools){
	let likeList = null;
	try{
		likeList = JSON.parse(localStorage.getItem("likeList") || "[]") || []
	} catch(e){
		likeList = {};
	}

	
	let tools = null;
	try{
		if(typeof _tools === "string")
			tools = JSON.parse(_tools || "{}") || {};
		else 
			tools = _tools || {}
	} catch(e){
		tools = {};
	}
	
	
	const liked = likeList.indexOf(id);
	if(!(tools && tools.like)) {
		tools["like"] = 0;
	}
	if(liked > -1) {
		likeList.splice(liked,1);
		if(!tools.like) {
		    tools["like"] = 0;
		} else {
			tools.like -=1;
		}
	} else {
		likeList.push(id)
		tools["like"] +=1;
	}
	localStorage.setItem("likeList",JSON.stringify(likeList));
	
	
	connection.invoke("UpdateTools", id, JSON.stringify(tools)).catch(err => console.error(err.toString()));
}
function createPost(user, message) {
	const li = document.createElement("div");
	const _text= message.message; 
	li.className = user && curentUser && user.userId === curentUser.userId ? "message user" : `message other U-${user.userName}`;
	li.id = "msg-"+message.id;
	
	let config = null;
	try{
		config = JSON.parse(user.config || "{}") || {}
	} catch(e){
		config = {};
	}
	
	let tools = null;
	try{
		if(typeof message.tools === "string")
			tools = JSON.parse(message.tools || "{}") || {};
		else 
			tools = message.tools || {}
	} catch(e){
		tools = {};
	}
	
	let likeList = null;
	try{
		likeList = JSON.parse(localStorage.getItem("likeList") || "[]") || []
	} catch(e){
		likeList = {};
	}
	
	const liked = likeList.indexOf(message.id) > -1;
	
	let div = document.createElement("div");
	div.innerHTML = message.message;
	let mainmsg = div.textContent || div.innerText || "";
	mainmsg = mainmsg.split('@@@@');
	mainmsg = mainmsg[mainmsg.length - 1]
	
	mainmsg = mainmsg.replace(/\-/g,"");
	let date = new Date(message.timestamp).toLocaleString();  
	let color = getColorForUsername(user.userName);
	if(!(user && curentUser && user.userId === curentUser.userId)){
		li.style.background = `${color}05`; 
		li.style.borderLeft = `4px solid ${color}55`; 
	}
	
	li.innerHTML = `
		<div class="profile-circle" style="background-color: ${color}; ${config.profile ? `background-image: url(/assets/avatar/users-${config.profile}.svg)` : ''}">
			${!config.profile ? user.firstName.charAt(0).toUpperCase() : ''}
		</div>
		<div class="message-content" >
			 <a name="msg-${message.id}" id="msg-${message.id}"></a>
			<strong>${user.firstName} ${user.lastName}</strong> 
			<!-- <em style="font-size:10px; color:#ccc">@${user.userName}</em> -->
			${_text}
			<div style="direction: ltr;opacity: 0.4;font-size: 12px;margin: 10px 0 0 0;min-width: 130px; float: left;">${date} ${tools && tools.edit ? '<span>edited</span>' : ''}</div>
			<div style="clear:both"></div>
		</div>
		<div class="message-tools">
			<i onclick='replaymessage("${message.id}","${user.firstName} ${user.lastName}",${JSON.stringify(mainmsg)})' class="fa fa-reply"></i>
			${user && curentUser && user.userId === curentUser.userId ? `<i onclick='editMessage("${message.id}",${JSON.stringify(mainmsg)},${JSON.stringify(tools || {})})' class="fa fa-edit"></i>` : ``}
			${user && curentUser && user.userId === curentUser.userId ? `<i style="color:${liked ? '#f00' : null}" class="fa fa-heart"> ${tools.like || 0} </i>` : `<i onclick='likeMessage("${message.id}", ${JSON.stringify(tools)})' style="color:${liked ? '#f00' : null}" class="fa fa-heart"> ${tools.like || 0} </i>`}
		</div>
	`;
			
	return li;
}


function addConcectionEvents(){
	if(connection) {
		connection.on("ReceiveMessage", (user, message) => {
			const li = createPost(user, message);
			document.getElementById("messagesList").appendChild(li);
			document.getElementById("messagesList").scrollTop = document.getElementById("messagesList").scrollHeight;
			messageSound.play();
			
		});
		
		
		connection.on("ReceiveMessageHistory", (messages) => {
			    document.getElementById("messagesList").innerHTML = '';
				for(let j=messages.length - 1;j>=0;j--) {
					
				   document.getElementById("messagesList").appendChild(createPost(messages[j].user, messages[j]));
				}
				
				document.getElementById("messagesList").scrollTop = document.getElementById("messagesList").scrollHeight;
			
		});
		
		
		
		connection.on("ReceiveMessageHistoryById", (messages) => {
			const li = createPost(messages.user, messages);
			if(document.getElementById("msg-"+messages.id)) {
				document.getElementById("msg-"+messages.id).innerHTML = li.innerHTML
			} else {
				document.getElementById("messagesList").appendChild(li);
				document.getElementById("messagesList").scrollTop = document.getElementById("messagesList").scrollHeight; 
			}
		});
		
		connection.on("Profile", (user) => {
			curentUser = user;
			document.getElementById("chat-user-me").innerHTML = createUser(user)+ "<span id='setting-icon' onclick='openSetting()'><i class='fa fa-cog'></i></span>";
		});

		connection.on("UpdateUserList", (usersObject) => {
			let users = Object.values(usersObject || {}).sort((a,b)=> a.status > b.status ? -1 : 1);

			users = users.filter(_i=>!(curentUser && _i.user && _i.user.userId === curentUser.userId))
			
			let list = "";
			
			for(let k=0;k<users.length; k++){
				
				list += createUser(users[k].user, users[k].event, users[k].status)
				
			}
			document.getElementById("chat-user-list").innerHTML = list;
		});
	}
}



// Handle the visibilitychange event
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Browser is minimized or tab is hidden');
        UpdateStatus("busy")
    } else {
        console.log('Browser is active');
        UpdateStatus("")
    }
});
