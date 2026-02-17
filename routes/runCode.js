const express = require("express");
const axios = require("axios");
// require("dotenv").config();

const router = express.Router();

const langMap = {
  python: { language: "python3", versionIndex: "4" },
  javascript: { language: "nodejs", versionIndex: "4" },
  c: { language: "c", versionIndex: "5" },
  "c++": { language: "cpp17", versionIndex: "1" },
  java: { language: "java", versionIndex: "4" },
  bash: { language: "bash", versionIndex: "4" }
};

router.post("/run", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || code.trim() === "") {
      return res.json({ success:false, output:"Code is empty" });
    }

    const config = langMap[language] || langMap["javascript"];

    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_ID,
      clientSecret: process.env.JDOODLE_SECRET,
      script: code,
      stdin: input || "",
      language: config.language,
      versionIndex: config.versionIndex
    });

    res.json({
      success: true,
      output: response.data.output || "No Output"
    });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.json({ success:false, output:"Execution failed" });
  }
});

module.exports = router;
