/*global React, ReactDOM, $*/
class FAQsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
        };
        this.questions = [
            {
                group: 'Basics',
                questions: []
            }
        ];
    }

    generateFAQs() {
        const element = React.createElement;
        return this.questions.map((group, i) => {
            return [element('h2', { key: `group-${i}`, className: 'questionheader' }, group.group)].concat(
                group.questions.map((person, l) => {
                    return element('div', { key: `group-${l}`, className: 'question' }, [
                        element('span', { key: `group-${l}`, className: 'question' }, person.name),
                        element('span', { key: `roles-${l}`, className: 'answer' }
                        )
                    ]);
                }));
        });
    }

    render() {
        const element = React.createElement;
        return element('div', { className: 'mafaqsrquee', id: 'faqs' }, this.generateFAQs());

    }
}