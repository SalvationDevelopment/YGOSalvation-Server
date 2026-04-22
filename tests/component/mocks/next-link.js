export default function Link({ href, children, ...props }) {
  return (
    <a href={String(href)} {...props}>
      {children}
    </a>
  );
}
// Run with: npm run test:component
