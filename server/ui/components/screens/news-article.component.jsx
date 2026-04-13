"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./news-article.component.module.scss";

const EMPTY_POST = Object.freeze({
  title: "",
  body: "",
  createdAt: "",
  slug: ""
});

export default function NewsArticleScreen({ slug }) {
  const [post, setPost] = useState(EMPTY_POST);
  const [error, setError] = useState("");
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setLoadStatus("loading");
      setError("");
      setPost(EMPTY_POST);

      try {
        const response = await fetch(`/api/news/${encodeURIComponent(slug)}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success || !data.post) {
          throw new Error(data.error || "Unable to load news post.");
        }

        if (!cancelled) {
          setPost(data.post);
          setLoadStatus("ready");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setLoadStatus("error");
        }
      }
    }

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loadStatus === "loading") {
    return <div className={styles.root} id="news"><article className={styles.card}><div className={styles.content}>Loading news post...</div></article></div>;
  }

  if (loadStatus !== "ready") {
    return (
      <div className={styles.root} id="news">
        <article className={styles.card}>
          <h2 className={styles.title}>News</h2>
          <div className={styles.content}>{error || "Post not found."}</div>
          <div className={styles.footer}>
            <Link href="/news">Back to news</Link>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.root} id="news">
      <article className={styles.card}>
        <h2 className={styles.title}>{post.title}</h2>
        <div className={`${styles.content} ${styles.fullBody}`}>{post.body}</div>
        <div className={styles.footer}>
          <span>{new Date(post.createdAt).toDateString()}</span>
          <Link href="/news">Back to news</Link>
        </div>
      </article>
    </div>
  );
}
