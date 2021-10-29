import React from 'react';
import FAQs from '../common/faq.component';

export default function FAQsScreen () {
    const questions = [
            {
                group: 'Basics',
                questions: [{
                    question: 'Is this YGOPro?',
                    answer: 'Technically. YGOSalvation is a team fork of YGOPro DevPro which is a software and team fork of an older version of YGOPro Dawn of a New Era, which is a software wrapper of YGOPro Percy, which is a fork of YGOPro. We use the "ygopro-core" engine and the accompaining scripts which are sub parts of YGOPro proper.'
                },
                {
                    question: 'Where are the Images?',
                    answer: 'We can not host images for you for a number of reasons. You have to have them a locally in your own possession. The application looks for them at `http://localhost:8887/<8-digit-passcode>.jpg`.'
                },
                {
                    question: 'How do I host images?',
                    answer: 'We recommend the light weight server in the downloads section'
                },
                {
                    question: 'Where do I get images from?',
                    answer: 'No idea.'
                },
                {
                    question: 'Ranking?',
                    answer: 'This is planned. After each unique competitive automated duel you gain a certain amount of points. When a banlist is released your points are halved and the users you\'ve dueled against reset. Participating in events will net you bonus points.'
                }, {
                    question: 'Where is the AI?',
                    answer: 'We are developing one.'
                }, {
                    question: 'Manual Duels?',
                    answer: 'Its being revamped. After Automatic dueling and Ranking are stable we will release it. There are no foreseeable blockers of it at the moment.'
                },
                {
                    question: 'Can I help out?',
                    answer: 'Sure. We run a mentoring program; we will teach you how to code at our level as you help out, this is the equvilant as paid technical training. You have to follow directions and be polite.'
                }
                ]
            }
        ];
    
    return <div className='faqs' id='faqs'><FAQs list={questions}/></div>;
}