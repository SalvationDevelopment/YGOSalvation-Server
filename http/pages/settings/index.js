import { React } from 'react';
import Screen from '../../components/screens/screen';
import SettingsScreen from './../../components/screens/settings.component';


export default function DeckEditer() {
    return (
        <Screen>
            <SettingsScreen />,
        </Screen>
    );
}