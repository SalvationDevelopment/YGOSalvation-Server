"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./news.component.module.scss";

function Pagination({ currentPage, totalPages }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={styles.pagination} aria-label="News pages">
      {pages.map((page) => (
        <Link
          key={page}
          href={page === 1 ? "/news" : `/news?page=${page}`}
          className={`${styles.pageLink}${page === currentPage ? ` ${styles.pageLinkActive}` : ""}`}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}

function ArticleCard({ article }) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h2>
      <div className={styles.content}>{article.excerpt || article.body}</div>
      <div className={styles.footer}>
        <span>{new Date(article.createdAt).toDateString()}</span>
        <Link href={`/news/${article.slug}`}>Read more</Link>
      </div>
    </article>
  );
}

export default function NewsScreen({ initialPage = 1 }) {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/news?page=${initialPage}&pageSize=5`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load news.");
        }

        if (!cancelled) {
          setArticles(Array.isArray(data.posts) ? data.posts : []);
          setPagination({
            page: data.pagination?.page || initialPage,
            totalPages: data.pagination?.totalPages || 1
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setArticles([]);
          setPagination({ page: initialPage, totalPages: 1 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, [initialPage]);

  return (
    <div className={styles.root} id="news">
      {loading ? <article className={styles.card}><div className={styles.content}>Loading news...</div></article> : null}
      {error ? <article className={styles.card}><div className={styles.content}>{error}</div></article> : null}
      {!loading && !error ? articles.map((article) => <ArticleCard key={article.id} article={article} />) : null}
      {!loading && !error && articles.length === 0 ? <article className={styles.card}><div className={styles.content}>No news posts yet.</div></article> : null}
      {!loading && !error ? <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} /> : null}
    </div>
  );
}
