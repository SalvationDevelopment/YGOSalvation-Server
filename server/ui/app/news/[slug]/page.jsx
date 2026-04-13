import NewsArticleScreen from "../../../components/screens/news-article.component";

export default async function NewsArticlePage({ params }) {
  const { slug } = await params;
  return <NewsArticleScreen slug={slug} />;
}
