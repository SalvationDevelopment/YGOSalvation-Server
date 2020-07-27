class ForumService {
    constructor(session) {
        this.session = session;
    }

    get(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const forums = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.session}`
                    }
                });
                return resolve(forums);
            } catch (error) {
                return resolve([]);
            }
        });
    }

    post(url, content) {
        return new Promise(async (resolve, reject) => {
            try {
                const forums = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(content),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.session}`
                    }
                });
                return resolve(forums);
            } catch (error) {
                reject(error);
            }
        });
    }

    delete(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const forums = await fetch(url);
                return resolve(forums);
            } catch (error) {
                reject(error);
            }
        });
    }

    put(url, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const forums = await fetch(url, {
                    method: 'PUT',
                    body: JSON.stringify(update),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.session}`
                    }
                });
                return resolve(forums);
            } catch (error) {
                reject(error);
            }
        });
    }

    async comments(thread) {
        return this.get(`/comments?thread=${thread}`);
    }

    async forum(id) {
        return this.get(`/forums?id=${id}`);
    }

    async sections() {
        return this.get('/sections');

    }

    async threads(forum) {
        return this.get(`/threads?forum=${forum}`);
    }
}