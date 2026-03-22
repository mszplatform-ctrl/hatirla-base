export default async function handler(req, res) {
  const { id } = req.query;
  const backendUrl = `https://hatirla-base.onrender.com/api/share/${id}`;

  const response = await fetch(backendUrl);
  const html = await response.text();

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
