import TournamentCalendarScreen from '../../components/screens/tournament-calendar.component';

export default function TournamentCalendarPage() {
    const today = new Date();

    return (
        <TournamentCalendarScreen
            initialCalendarDate={{
                year: today.getFullYear(),
                month: today.getMonth(),
                day: today.getDate(),
            }}
        />
    );
}
