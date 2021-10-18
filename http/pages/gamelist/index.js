import Screen from '../../components/screens/screen';
import GamelistScreen  from './../../components/screens/gamelist.component';
import { React } from 'react';


export default function DeckEditer() {
    return (
        <Screen>
            <GamelistScreen />,
        </Screen>
    );
}