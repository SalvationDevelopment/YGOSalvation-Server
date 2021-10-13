export default function Post({ post }) {
    if (post) {
        return <div>{post.Title}</div>
    }
    return (<>404</>)

}

export async function getStaticPaths() {
    try {
        const res = await fetch('http://localhost:1337/posts');
        const post = await res.json();
        const paths = post.map((post) => ({
            params: { slug: post.Slug }
        }));

        return {
            paths,
            fallback: true
        }
    } catch (error) {
        return {
            paths: [],
            fallback: true
        }
    }

}

export async function getStaticProps({ params }) {
    try {
        const { slug } = params;
        const res = await fetch(`http://localhost:1337/posts?Slug=${slug}`);
        const post = await res.json()[0];

        return {
            props: { post }
        }
    } catch (error) {
        return {
            props: {  }
        }
    }
}
