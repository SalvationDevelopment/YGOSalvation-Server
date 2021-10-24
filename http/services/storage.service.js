
export function persist(key, value) {
    localStorage.setItem(key, value);
}

export function getStorage() {
    const applicationDefaults = {
        username : '',
        password : '',
        remember : '',
        theme: '',
        imageURL : 'http://127.0.0.1:8080'
    },
    storage = JSON.parse(JSON.stringify(localStorage));
    
    return {...applicationDefaults, ...storage};
}


