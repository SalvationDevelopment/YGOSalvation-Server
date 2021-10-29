
export function persist(key, value) {
    localStorage.setItem(key, value);
}

export function getStorage() {
    const applicationDefaults = {
        username : '',
        password : '',
        remember : '',
        imageURL : 'http://127.0.0.1:8080',
        theme: '../img/magimagipinkshadow.jpg',
        cover: '../img/textures/cover.jpg',
        hide_banlist: true,
        language: 'en'
    },
    storage = (typeof window !== 'undefined') ? JSON.parse(JSON.stringify(localStorage)) : {};
    
    return {...applicationDefaults, ...storage};
}


