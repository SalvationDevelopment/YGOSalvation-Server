/*global React, ReactDOM, $*/
class CreditsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
        };
        this.credits = [
            {
                group: 'YGOSalvation Team',
                people: [{
                    name: 'Adriano Soares',
                    roles: ['Software Developer']
                },
                {
                    name: 'Alex "Tsundere"',
                    roles: ['Quality Assurance']
                },
                {
                    name: 'Andry "Dragunlegend" Duarte"',
                    roles: ['Quality Assurance']
                },
                {
                    name: '"Chibi Chan Nyan"',
                    roles: ['Senior Software Engineer',
                        'Senior Database Administrator',
                        'System Administator'
                    ]
                },
                {
                    name: '"OmniMage"',
                    roles: ['Community Management', 'Junior Software Developer']

                },
                {
                    name: 'Karla "Guybrush"',
                    roles: ['Junior Software Engineer']
                },
                {
                    name: 'Bonnie "Laughing Luna"',
                    roles: ['Quality Assurance']
                },
                {
                    name: '"Black Ballista"',
                    roles: ['Quality Assurance']
                },
                {
                    name: '"Ragna"',
                    roles: ['Quality Assurance']
                },
                {
                    name: 'Ferrin "Irate" Braatz',
                    roles: ['Senior Software Engineer']
                }, {
                    name: 'Jeff "Stormwolf" Falberg',
                    roles: ['Senior Software Engineer', 'Senior Database Administrator']
                }, {
                    name: 'Rebeca "Dark Magician Girl"',
                    roles: ['Human Resources', 'Project Planning']
                }, {
                    name: 'Jamezs "AccessDenied" Gladney',
                    roles: ['Owner', 'Chief Architect', 'Principle Architect']
                },]
            },
            {
                group: 'Special Thanks',
                people: [{
                    name: '"Valkyra"',
                    roles: ['Community Leader']
                }, {
                    name: '"Starstrike" Ryder',
                    roles: ['Community Leader',
                        'Funding',
                        'Project Planning',
                        'Advertising',
                        'Community Management',
                        'Business Management']
                },
                {
                    name: '"Rainbow Dashley"',
                    roles: ['Community Leader',
                        'Community Management']
                },
                {
                    name: 'Crimson Wind Acadamy',
                    roles: ['Emergency Funding']
                },
                {
                    name: 'Amanda Lapalme',
                    roles: ['Artist']
                },
                {
                    name: '"Freezy"',
                    roles: ['Artist']
                },
                {
                    name: '"Nhadala", "CounterstrikerGS"',
                    roles: ['Greek Translation']
                },
                {
                    name: '"IceYGO"',
                    roles: ['Creator of Windbot',
                        'Senior Server Architect (YGOSharp)',
                        'YGOPro']
                },
                {
                    name: 'Adam Parker',
                    roles: ['Quality Assurance']
                },
                {
                    name: 'Azaad "WestCoastKiwi" Zimmermann"',
                    roles: ['Quality Assurance', 'Junior Developer', 'Linquistics']
                },
                {
                    name: '"OneShot"',
                    roles: ['Software Develoepr']
                },
                {
                    name: 'Jesse "Reach"',
                    roles: [' System Administrator', 'Graphic Designer', 'Community Managment']
                },
                {
                    name: '"Parry Dox"',
                    roles: ['Graphic Designer', 'Inter-Community Liason']
                }]
            },
            {
                group: 'DevPro Collaborators',
                people: [{
                    name: '"Buttys"',
                    roles: ['Senior Software Engineer']
                }]
            }];
    }

    generateCredits() {
        const element = React.createElement;
        return this.credits.map((group, i) => {
            return [element('h2', { key: `group-${i}`, className: 'creditsfield' }, group.group)].concat(
                group.people.map((person, l) => {
                    return element('div', { key: `group-${l}`, className: 'credit' }, [
                        element('span', { key: `group-${l}`, className: 'creditsname' }, person.name),
                        element('span', { key: `roles-${l}`, className: 'creditsroles' }, person.roles.map((role, j) => {
                            return element('span', { key: `role-${j}`, className: 'creditsrolename' }, role)
                        }))
                    ]);
                }));
        });
    }

    render() {
        const element = React.createElement;
        return element('div', { className: 'marquee', id: 'marquee' }, this.generateCredits());

    }
}