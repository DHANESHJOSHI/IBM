const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Google Drive API configuration
const CLIENT_ID =
  "792094517387-3pt0gd275h18lj99erqt5lr5bl2numcm.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04qwmiyPpMSFvCgYIARAAGAQSNwF-L9IrEkVhsAGYD9GrWn9Rk_KnMy9NPrwtk5qHl0aszBhzxaV-_sk-j41lndikg-zYYzuiXK4";

// Set up the Google Drive API client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const dataAnalyticsFolderId = "1WlrAfwmqlx2UBBESeRWyppefQwOm7Sbq";
const webDevFolderId = "1rEb5I_Tn5ULI4tb8MOOKUyv1czwviHTD";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/folders", async (req, res) => {
  const category = req.query.category;

  if (!category) {
    res.json([]);
    return;
  }

  let folderId;
  if (category === '0') {
    folderId = webDevFolderId;
  } else if (category === '1') {
    folderId = dataAnalyticsFolderId;
  } else {
    // Invalid category selected
    res.status(400).send("Invalid category");
    return;
  }

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      pageSize: 1000,
      fields: 'files(name, webViewLink, mimeType)'
    });

    const folders = response.data.files;
    const dataTableData = folders.map(folder => {
      if (folder.mimeType === 'application/vnd.google-apps.folder') {
        return [folder.name, `<a href="${folder.webViewLink}" target="_blank">Open</a>`];
      } else {
        return [folder.name, ''];
      }
    });

    res.json(dataTableData);
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
