import React from 'react';
import FAQs from '../common/faq.component';

export default function DownloadsPage() {
    const list = [
        {
            group: 'Basics',
            questions: [{
                question: <a
                    href= 'https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en'
                    target= '_blank'
                    key= 'chrome-extension-dl' rel="noreferrer"
                >Chrome Extension for Images</a>,
                answer: 'Host local images from your browser, YGOSalvation looks for the images on port 8887'
            }
            ]
        }
    ];

    return <div className='faqs' id='faqs'><FAQs list={list}/></div>;


}