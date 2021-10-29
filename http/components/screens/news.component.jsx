import React, { useState, useEffect } from 'react';

export default function NewsScreen() {
    const [articles, updateArticles] = useState([]);

    useState(() => {
        fetch('/news')
            .then((response) => response.json())
            .then(data => {

                updateArticles(Array.isArray(data) ? data : []);

            });
    }, []);


    function Article({ article }) {
        return <article className='container'>
            <h2 className='title'> article.title</h2>
            <div className='newscontent'>{article.body}</div>
            <div className='newsfooter'>
                {`${article.creator.username} - ${new Date(article.createdAt).toDateString()}`}
            </div>
        </article>;

    }

    function Articles() {
        const element = React.createElement;
        return articles.map((article, i) => {
            return <Article key={i} article={article} />;
        });
    }


    return <div className='faqs' id='faqs'><Articles /></div>;


}