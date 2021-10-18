
export function persist(key, value) {
    localStorage.setItem(key, value);
}

export function getData() {
    const applicationDefaults = {
        username : '',
        password : '',
        remember : '',
        theme: ''
    };
    return JSON.parse(JSON.stringify(localStorage));
}


