/*global React, ReactDOM, $*/
class DownloadsPage extends React.Component {
    constructor() {
        super();
        const element = React.createElement;
        this.state = {
        };
        this.downloads = [
            {
                group: 'Basics',
                downloads: [{
                    title: element('a', {
                        href: 'https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en',
                        target : '_blank',
                        key: 'chrome-extension-dl'
                    }, 'Chrome Extension for Images'),
                    link: 'Host local images from your browser, YGOSalvation looks for the images on port 8887'
                }
                ]
            }
        ];
    }

    generateFAQs() {
        const element = React.createElement;
        return this.downloads.map((group, i) => {
            return [element('h2', { key: `group-${i}`, className: 'questionheader' }, group.group)].concat(
                group.downloads.map((download, l) => {
                    return [
                        element('p', { key: `group-${l}`, className: 'question' }, download.title),
                        element('p', { key: `roles-${l}`, className: 'answer' }, download.link)
                    ]
                }));
        });
    }

    render() {
        const element = React.createElement;
        return element('div', { className: 'faqs', id: 'faqs' }, this.generateFAQs());

    }
}