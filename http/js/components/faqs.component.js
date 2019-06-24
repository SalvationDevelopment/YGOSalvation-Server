/*global React, ReactDOM, $*/
class FAQsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
        };
        this.questions = [
            {
                group: 'Basics',
                questions: [{
                    q: 'Is this YGOPro?',
                    a: 'Technically. YGOSalvation is a fork of YGOPro DevPro which is a fork of an older version of YGOPro Dawn of a New Era, which is a fork of YGOPro Percy, which is a fork of YGOPro. We use the "ygopro-core" engine and the accompaining scripts.'
                },
                {
                    q: 'Where are the Images?',
                    a: 'We can not host images for you for a number of reasons. The application looks for them at `http://localhost:8887/<8-digit-passcode>.jpg`.'
                },
                {
                    q: 'Ranking?',
                    a: 'This is planned. After each unique competitive automated duel you gain a certain amount of points. When a banlist is released your points are halved and the users you\'ve dueled against reset. Participating in events will net you bonus points.'
                }, {
                    q: 'Where is the AI?',
                    a: 'We are developing one.'
                }, {
                    q: 'Manual Duels?',
                    a: 'Its being revamped. After Automatic dueling and Ranking are stable we will release it. There are no foreseeable blockers of it at the moment.'
                }
                ]
            }
        ];
    }

    generateFAQs() {
        const element = React.createElement;
        return this.questions.map((group, i) => {
            return [element('h2', { key: `group-${i}`, className: 'questionheader' }, group.group)].concat(
                group.questions.map((question, l) => {
                    return [
                        element('p', { key: `group-${l}`, className: 'question' }, question.q),
                        element('p', { key: `roles-${l}`, className: 'answer' }, question.a)
                    ]
                }));
        });
    }

    render() {
        const element = React.createElement;
        return element('div', { className: 'faqs', id: 'faqs' }, this.generateFAQs());

    }
}