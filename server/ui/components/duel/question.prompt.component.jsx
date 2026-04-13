import React from 'react';
import styles from './question.prompt.component.module.scss';

export default function QuestionPrompt({ text }) {
    if (typeof text !== 'string' || !text.trim()) {
        return null;
    }

    return (
        <div className={styles.root} id='duelquestionprompt'>
            <p
                className='duelquestionprompt-text'
                style={{
                    whiteSpace: 'pre-line'
                }}
            >
                {text}
            </p>
        </div>
    );
}
