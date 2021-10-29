import React from 'react';


export default function CreditsScreen() {
    const credits = [
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
                name: '"Semicolon"',
                roles: ['Software Development Engineer in Test']
            },{
                name: 'Rebeca "Dark Magician Girl"',
                roles: ['Human Resources', 'Project Planning']
            }, {
                name: 'Jamezs "AccessDenied" Gladney',
                roles: ['Owner', 'Chief Architect', 'Principle Architect']
            }]
        },
        {
            group: 'DevPro Collaborators',
            people: [{
                name: '"Buttys"',
                roles: ['Senior Software Engineer']
            },
            {
                name: '"IceYGO"',
                roles: ['Creator of Windbot',
                    'Senior Server Architect (YGOSharp)',
                    'YGOPro']
            },
            {
                name: '"Rainbow Dashley"',
                roles: ['Community Leader',
                    'Community Management']
            }]
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
            group: 'Dedicated to',
            people: [{
                name: 'Penelope "Allure`Queen`LV1"',
                roles: ['... rest in pease at an oasis of roses.']
            }, {
                name: 'Bell "[-V-]Evangelion"',
                roles: ['... we promise to take care of the little ones.']
            }
            ]
        }];



    function Credits() {
        function Group(group) {
            return group.people.map((person, l) => {
                return <div key={`group-${l}-c`} className='credit'>
                    <span key={`group-${l}-cn`} className='creditsname'> {person.name}</span>
                    <span key={`roles-${l}-cr`} className='creditsroles'>{person.roles.map((role, j) => {
                        return <span className='creditsrolename' key={`role-${role}-${j}`}>{role}</span>;
                    })}</span>
                </div>;
            });
        }
        return credits.map((group, i) => {
            return (
                <>
                    <h2 key={`group-${i}`} className='creditsfield'> {group.group}</h2>
                    <Group group={group} />
                </>
        );
    });
    }

    return <div className='marquee' id='marquee'><Credits /></div>;

}