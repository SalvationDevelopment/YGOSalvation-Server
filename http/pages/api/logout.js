import { destroyCookie } from 'nookies'

export default async function logout(req, res) {
  destroyCookie({ res }, 'jwt', {
    path: '/',
  });

  res.status(200).end();
}