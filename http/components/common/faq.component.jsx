import React from 'react';

export default function FAQs({list}) {
    return list.map((group, i) => {
        return <>
            <h2 key={`group-${i}`} className='questionheader'> {group.group}</h2>
            {group.questions.map((question, l) => {
                return <>

                    <p key={`group-${l}`} className='question'>{question.question}</p>
                    <p key={`roles-${l}`} className='answer'>{question.answer}</p>
                </>;
            })}
        </>;
    });
}