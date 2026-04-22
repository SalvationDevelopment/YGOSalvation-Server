import ResetPasswordForm from "@/components/reset-password-form";

/**
 * Renders the Reset Page component and returns the UI used by the reset view.
 * @param {Object} pageProps The pageProps object supplies the structured input used by the reset module, including the `searchParams` property.
 * @param {(Object|Promise<*>)} pageProps.searchParams The `searchParams` property supplies structured input used by the reset module.
 * @param {string} pageProps.searchParams.token The `searchParams.token` property supplies structured input used by the reset module.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the reset view.
 */
export default async function ResetPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token || "";

  return <ResetPasswordForm token={token} />;
}
