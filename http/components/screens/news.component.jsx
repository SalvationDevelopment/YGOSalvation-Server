import React from 'react';

export default class  NewsScreen extends React.Component {
    constructor(store) {
        super();
        this.store = store;
        this.articles = [];
        fetch('/news')
            .then((response) => response.json())
            .then(data => {
                console.log('news', data)
            this.articles = Array.isArray(data) ? data : [];
            this.store.hey({action: 'RENDER'});
        });
    }

    generateFAQs() {
        const element = React.createElement;
        return this.articles.map((article, i) => {
            return element('article', {key: `group-${i}`, className: 'container'},
                [
                    element('h2', {key: `title-${i}`, className: 'title'}, article.title),
                    element('div', {key: `body-${i}`, className: 'newscontent'}, article.body),
                    element('div', {
                        key: `sig-${i}`,
                        className: 'newsfooter'
                    }, `${article.creator.username} - ${new Date(article.createdAt).toDateString()}`)
                ]
            );
        });
    }

    render() {
        const element = React.createElement;
        return element('div', {className: 'faqs', id: 'faqs'}, this.generateFAQs());

    }
}