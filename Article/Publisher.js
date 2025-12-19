
const site = "https://actualitesportif.com/";
const username = "anis55345";
const appPassword = "vVB1 wL03 oVG5 Pjso wwm0 cEuK";

const auth = Buffer
  .from(`${username}:${appPassword}`)
  .toString("base64");

async function publishPost(title, content, imageTag,des) {

  try {

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let res;
    try {
      res = await fetch(
        `${site}/wp-json/wp/v2/posts`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            content: `${imageTag}\n${content}`,
            status: "publish",
            categories: [150],
            meta:{
              "_wpseo_metadesc": des, 

            }
          })
        }
      );
      clearTimeout(timeout);
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        console.error("⏱️ Publish timeout: Server took too long to respond");
      } else {
        console.error("❌ Publish fetch error:", fetchErr.message);
      }
      return;
    }

    let post;
    try {
      post = await res.json();
    } catch (parseErr) {
      console.error("❌ Failed to parse publish response:", parseErr.message);
      return;
    }

    if (!res.ok) {
      return;
    }

    console.log("✅ Published: Post ID", post.id);
  } catch (err) {
    console.error("❌ Unexpected error in publishPost:", err.message);
  }
}

export default publishPost;
