/*global React, ReactDOM, $*/
class RankingScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            ranks: []
        };

        this.store = store;

        fetch(`/ranking`).then((response) => {
            response.json().then(data => {
                this.state.ranks = Array.isArray(data) ? data : [];
                this.store.dispatch({ action: 'RENDER' });
            });

        });

    }


    render() {
        console.log(this.state.ranks);
        return React.createElement('div', { id: 'rankholder' },
            React.createElement('table', {}, [
                React.createElement('thead', { key: 'thead' }, [
                    React.createElement('th', { key: 'rank' }, 'Rank'),
                    React.createElement('th', { key: 'points' }, 'Points'),
                    React.createElement('th', { key: 'elo' }, 'Skill Rating'),
                    React.createElement('th', { key: 'name' }, 'Username')
                ]),
                React.createElement('tbody', { key: 'tbody' }, this.state.ranks.map((user, i) => {
                    return React.createElement('tr', { className: 'rankinguser', key: `ranking-row-${i}` }, [
                        React.createElement('td', { key: `ranking-rank-${i}` }, i + 1),
                        React.createElement('td', { key: `ranking-points-${i}` }, `${user.points}`),
                        React.createElement('td', { key: `ranking-elo-${i}` }, `${user.elo}`),
                        React.createElement('td', { key: `ranking-name-${i}` }, `${user.username}`)
                    ]);
                }))
            ]));
    }
}