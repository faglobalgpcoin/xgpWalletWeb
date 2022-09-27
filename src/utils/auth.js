function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');

    if (parts.length == 2)
        return parts
            .pop()
            .split(';')
            .shift();
}

function decodeCookieData(data) {
    // decode base64 & parse json
    return JSON.parse(atob(data));
}

function resetCookie() {
    const initialData = {
        isLoggedIn: false,
        email: '',
        username: '',
        accessToken: '',
    };

    document.cookie = 'key=' + btoa(JSON.stringify(initialData));
}

export { getCookie, decodeCookieData, resetCookie };
