import React from 'react';
import styles from './faq.component.module.scss';

/**
 * Render contract
 * Purpose:
 * Renders grouped FAQ content from a plain input list.
 *
 * Render Props:
 * - `list`: array of groups shaped like
 *   `{ group: string, questions: Array<{ question: string, answer: string }> }`
 *
 * Feed Inputs:
 * - none
 *
 * Feed Outputs:
 * - none
 *
 * Ambient Dependencies:
 * - none
 *
 * Refactor target:
 * - keep this component fully prop-driven
 */
export default function FAQs({list}) {
    return <div className={styles.root}>
        {list.map((group, i) => {
            return <section className={styles.group} key={`faq-group-${i}`}>
                <h2 className={styles.questionHeader}> {group.group}</h2>
                {group.questions.map((question, l) => {
                    return <React.Fragment key={`faq-question-${i}-${l}`}>
                        <p className={styles.question}>{question.question}</p>
                        <p className={styles.answer}>{question.answer}</p>
                    </React.Fragment>;
                })}
            </section>;
        })}
    </div>;
}
