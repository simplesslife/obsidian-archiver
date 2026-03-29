# Obsidian Archiver

![Obsidian Archiver](https://img.shields.io/badge/Plugin-Archiver-brightgreen)

**Archiver** is a simple yet powerful plugin for Obsidian that helps you back up and compress your files or folders into a `.zip` archive. It ensures data traceability with MD5 hashing and automatically generates a structured Markdown log. After successful archiving, the original files are safely moved to the trash to free up space.

## Features

- **One-Click Archiving:** Right-click on any file or folder in Obsidian's file explorer and select `归档内容 (Archive)` to instantly compress it.
- **Secure Compression:** All files inside your target folder are recursively added to a `.zip` file. The output file is named with the current date and an MD5 hashed signature (e.g., `2026-03-29_101530_3b92c8...d1.zip`).
- **Automatic Logging:** Appends a structured log entry into a specific Markdown file containing the archive timestamp and the exact Vault relative paths to all the original nested files.
- **Auto Cleanup:** Original files or folders are automatically sent to the Vault's recycle bin once the zip and the log are generated successfully.
- **Smart Directory Creation:** Automatically detects and creates missing destination archive folders or logging directories if they do not already exist.

## Installation

### Community Plugins (Pending Approval)
Once the plugin is officially joined into the Obsidian plugin ecosystem:
1. Open Obsidian **Settings** > **Community plugins**.
2. Turn off Safe mode (if enabled).
3. Click "Browse" and search for **Archiver** (by simplesslife).
4. Click "Install" and then "Enable".

### Manual Installation
1. Go to the **Releases** page of this GitHub repository.
2. Download the latest `main.js` and `manifest.json`.
3. Create a folder named `obsidian-archiver` in your vault's `.obsidian/plugins/` directory.
4. Move the downloaded files into that folder.
5. In Obsidian, go to Settings > Community plugins, click the "Reload plugins" button, and toggle **Archiver** on.

## Usage

1. **Configure Settings (Settings > Archiver):**
   - **Archive Directory:** The destination folder where the `.zip` files will go (Leave blank for the vault's root directory).
   - **Log File:** The `.md` file path acting as a record ledger (e.g., `Archive/ArchiverLog.md`).
2. **Start Archiving:**
   - On the left sidebar (File Explorer), right-click any file or folder.
   - Select **归档内容 (Archive)** from the context menu.
   - A success notification will show up, creating the `.zip` archive and adding a new log entry.

## License
MIT License
