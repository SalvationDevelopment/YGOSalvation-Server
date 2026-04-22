import NewsScreen from "../../components/screens/news.component";

export default async function NewsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number.parseInt(resolvedSearchParams?.page || "1", 10) || 1);
  return <NewsScreen initialPage={page} />;
}
