import TournamentDetailScreen from '../../../components/screens/tournament-detail.component';

export default async function TournamentDetailPage({ params }) {
    const { slug } = await params;
    return <TournamentDetailScreen slug={slug} />;
}
