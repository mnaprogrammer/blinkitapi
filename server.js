const app = require("./src/app");
const PORT = process.env.PORT || 5000;
const SITE_URL = process.env.SITE_URL || "http://localhost";

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${SITE_URL}:${PORT}`);
});