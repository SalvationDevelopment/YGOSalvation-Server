import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "YGO CMS",
  description: "Admin CMS for user management"
};

/**
 * Renders the Root Layout component and returns the UI used by the app view.
 * @param {Object} props The props object supplies the structured input used by the app module, including the `children` property.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the app module.
 * @returns {React.ReactNode} Returns the rendered UI used by the app view.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
