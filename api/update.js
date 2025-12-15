export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { products } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const USERNAME = 'streamvac-alt'; // ← твой GitHub username
  const REPO = 'vape-shop-data';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const fileRes = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO}/contents/db.json`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      }
    );

    if (!fileRes.ok) throw new Error('Failed to fetch file');
    const fileData = await fileRes.json();

    const newContent = Buffer.from(JSON.stringify({ products }, null, 2)).toString('base64');

    const updateRes = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO}/contents/db.json`,
      {
        method: 'PUT',
        headers: { 
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update products via admin panel',
          content: newContent,
          sha: fileData.sha
        })
      }
    );

    if (updateRes.ok) {
      res.status(200).json({ success: true });
    } else {
      const err = await updateRes.text();
      throw new Error(err);
    }
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
}
