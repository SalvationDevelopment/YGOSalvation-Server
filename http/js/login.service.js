/*global store */
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

store.register('REGISTER_ACCOUNT', (action) => {
    var username = $('#new_username').val(),
        email = $('#new_email').val(),
        password = $('#new_password').val(),
        repeatedPassword = $('#repeat_new_password').val();

    if (password.length < 7) {
        alert('Stronger Password Required');
        return false;
    }

    if (repeatedPassword !== password) {
        alert('Passwords do not match');
        return false;
    }

    if (!validateEmail(email)) {
        alert('Invalid Email address');
        return false;
    }

    $.post('/register', { email: email, username: username, password: password }, function (result, networkStatus) {
        console.log(result);
        if (result.error) {
            alert(result.error);
        } else {
            alert('Account Created. Please check your email.');
        }
    });
});