async function getMessage() {
    let url = '/api/message';
    let response = await fetch(url);

    let json = await response.json();

    document.getElementById('message').value = json.message;
}

async function getMessageButton() {

    let url = '/api/button';
    let response = await fetch(url);

    let json = await response.json();
    alert(json.message);
}

getMessage();