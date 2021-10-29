import React, { useState, useEffect } from 'react';
export default function RankingScreen() {
    const [ranks, setRanks] = useState([]);

    useEffect(() => {
        fetch('/ranking').then((response) => {
            response.json().then(data => {
                setRanks(Array.isArray(data) ? data : []);
            });
        });
    });

    function Row({ user, rank }) {
        return <tr className='rankinguser'>
            <td>{rank}</td>
            <td>{user.points}</td>
            <td>{user.elo}</td>
            <td>{user.username}</td>
        </tr>;
    }

    return <div>
        <table>
            <thead>
                <th>Rank</th>
                <th>Points</th>
                <th>Skill Rating</th>
                <th>Username</th>
            </thead>
            <tbody>
                {ranks.map((user, i) => <Row user={user} key={i} rank={i + 1}/>)}
            </tbody>
        </table>
    </div>;
}