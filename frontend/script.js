/* NAVIGATION BETWEEN SECTIONS */

function showEncode(){

document.getElementById("encodeSection").style.display="block"
document.getElementById("decodeSection").style.display="none"

}

function showDecode(){

document.getElementById("encodeSection").style.display="none"
document.getElementById("decodeSection").style.display="block"

}


async function encode(){

let image = document.getElementById("encodeImage").files[0];
let message = document.getElementById("message").value;
let email = document.getElementById("receiverEmail").value;

if(!image || !message || !email){
alert("Please fill all fields");
return;
}

let formData = new FormData();
formData.append("image", image);
formData.append("message", message);
formData.append("email", email);

try{

let response = await fetch("http://localhost:3000/encode",{
method:"POST",
body:formData
});

let data = await response.json();

alert(data.message);

}catch(error){

console.error(error);
alert("Encode failed");

}

}


/* SEND OTP FUNCTION */

async function sendOTP(){

let email=document.getElementById("decodeEmail").value

if(!email){
alert("Enter email")
return
}

try{

let res=await fetch("http://localhost:3000/sendOTP",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({email})

})

let data=await res.json()

alert(data.message)

}catch(error){

console.log(error)
alert("OTP sending failed")

}

}


/* DECODE FUNCTION */

async function decode(){

let image=document.getElementById("decodeImage").files[0]
let otp=document.getElementById("otp").value

if(!image || !otp){
alert("Upload image and enter OTP")
return
}

let formData=new FormData()

formData.append("image",image)
formData.append("otp",otp)

try{

let res=await fetch("http://localhost:3000/decode",{
method:"POST",
body:formData
})

let data=await res.json()

if(data.status==="success"){

document.getElementById("result").innerText="Hidden Message: "+data.message

}else{

alert(data.message)

}

}catch(error){

console.log(error)
alert("Decode failed")

}

}




