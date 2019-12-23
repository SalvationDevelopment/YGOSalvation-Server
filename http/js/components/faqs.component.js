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
                    a: 'Technically. YGOSalvation is a team fork of YGOPro DevPro which is a software and team fork of an older version of YGOPro Dawn of a New Era, which is a software wrapper of YGOPro Percy, which is a fork of YGOPro. We use the "ygopro-core" engine and the accompaining scripts which are sub parts of YGOPro proper.'
                },
                {
                    q: 'Where are the Images?',
                    a: 'We can not host images for you for a number of reasons. You have to have them a locally in your own possession. The application looks for them at `http://localhost:8887/<8-digit-passcode>.jpg`.'
                },
                {
                    q: 'How do I host images?',
                    a: 'We recommend the light weight server in the downloads section'
                },
                {
                    q: 'Where do I get images from?',
                    a: 'No idea.'
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
                },
                {
                    q: 'Can I help out?',
                    a: 'Sure. We run a mentoring program; we will teach you how to code at our level as you help out, this is the equvilant as paid technical training. You have to follow directions and be polite.'
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