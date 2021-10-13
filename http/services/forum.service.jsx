/* eslint-disable no-underscore-dangle */
export default class ForumService {
    constructor(session) {
        this.session = session;
    }

    async get(url) {

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.session}`
                }
            });
            return response.json();
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    post(url, content) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(content),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.session}`
                    }
                });
                return resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    delete(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                return resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    put(url, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    body: JSON.stringify(update),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.session}`
                    }
                });
                return resolve(response);
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

    async homepage() {
        console.log('homecalled');
        const sections = await this.sections();
        console.log(sections);
        for (const section in sections) {
            for (const forum in section.forums) {
                forum.threads = await this.threads(forum._id);
            }    
        }
        return sections;
    }
}