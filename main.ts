import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, Notice, TFolder, TFile, Vault } from 'obsidian';
import JSZip from 'jszip';
import md5 from 'md5';

interface ArchiverSettings {
	archivePath: string;
	logFilePath: string;
}

const DEFAULT_SETTINGS: ArchiverSettings = {
	archivePath: 'Archive',
	logFilePath: 'Archive/ArchiverLog.md'
}

export default class ArchiverPlugin extends Plugin {
	settings: ArchiverSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ArchiverSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file: TAbstractFile) => {
				menu.addItem((item) => {
					item
						.setTitle("归档内容 (archive)")
						.setIcon("archive")
						.onClick(async () => {
							await this.archiveContent(file);
						});
				});
			})
		);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async ensureFolderExists(vault: Vault, path: string): Promise<void> {
		if (!path || path === '' || path === '/') return;
		const normalizedPath = path.replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '');
		const folders = normalizedPath.split('/');
		let currentPath = '';

		for (const folder of folders) {
			currentPath = currentPath ? `${currentPath}/${folder}` : folder;
			const exists = vault.getAbstractFileByPath(currentPath);
			if (!exists) {
				await vault.createFolder(currentPath);
			}
		}
	}

	async archiveContent(file: TAbstractFile) {
		new Notice(`开始对应归档: ${file.name}`);
		try {
			const zip = new JSZip();
			const archivedFiles: string[] = [];

			// Helper to recursively add files
			const addFilesToZip = async (currentFile: TAbstractFile, zipFolder: JSZip) => {
				if (currentFile instanceof TFile) {
					const content = await this.app.vault.readBinary(currentFile);
					zipFolder.file(currentFile.name, content);
					archivedFiles.push(currentFile.path);
				} else if (currentFile instanceof TFolder) {
					const newZipFolder = zipFolder.folder(currentFile.name);
					for (const child of currentFile.children) {
						await addFilesToZip(child, newZipFolder!);
					}
				}
			};

			await addFilesToZip(file, zip);

			// Generate zip buffer
			const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
			
			// Generate MD5
			const md5Hash = md5(new Uint8Array(zipBuffer));
			
			// Format Date
			const now = new Date();
			const dateStr = now.toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
			
			const zipFileName = `${dateStr}_${md5Hash}.zip`;

			// Ensure archive path exists
			const archivePath = this.settings.archivePath || '/';
			if (archivePath !== '/') {
				await this.ensureFolderExists(this.app.vault, archivePath);
			}

			// Save zip file
			const fullZipPath = archivePath === '/' ? zipFileName : `${archivePath}/${zipFileName}`;
			await this.app.vault.createBinary(fullZipPath, zipBuffer);

			// Save log
			const logFilePath = this.settings.logFilePath || 'ArchiverLog.md';
			const logDirPath = logFilePath.includes('/') ? logFilePath.substring(0, logFilePath.lastIndexOf('/')) : '';
			if (logDirPath && logDirPath !== '') {
				await this.ensureFolderExists(this.app.vault, logDirPath);
			}

			const header = `### 存档: ${zipFileName}\n`;
			const timeStr = `**归档时间**: ${now.toISOString().replace('T', ' ').split('.')[0]}\n`;
			const fileListStr = `**包含文件**:\n` + archivedFiles.map(path => `- \`${path}\``).join('\n') + `\n\n---\n\n`;
			const logContent = header + timeStr + fileListStr;

			const logFile = this.app.vault.getAbstractFileByPath(logFilePath);
			if (logFile instanceof TFile) {
				await this.app.vault.append(logFile, logContent);
			} else {
				await this.app.vault.create(logFilePath, logContent);
			}

			// Delete original file/folder
			await this.app.vault.trash(file, false);

			new Notice(`归档成功: ${zipFileName}`);

		} catch (error) {
			console.error("Archive Error:", error);
			new Notice(`归档失败: ${(error as Error).message}`);
		}
	}
}

class ArchiverSettingTab extends PluginSettingTab {
	plugin: ArchiverPlugin;

	constructor(app: App, plugin: ArchiverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setName('自动归档插件设置').setHeading();

		new Setting(containerEl)
			.setName('归档目录 (archive directory)')
			.setDesc('归档文件将被压缩到此目录下。留空则存放在 vault 根目录。如果目录不存在将会被自动创建。')
			.addText(text => text
				.setPlaceholder('Archive')
				.setValue(this.plugin.settings.archivePath)
				.onChange(async (value) => {
					this.plugin.settings.archivePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('归档日志文件 (log file)')
			.setDesc('记录每次归档的操作日志。留空则默认为 archiverlog.md（根目录）。请包含扩展名（如 .md）。')
			.addText(text => text
				.setPlaceholder('Archive/archiverlog.md')
				.setValue(this.plugin.settings.logFilePath)
				.onChange(async (value) => {
					this.plugin.settings.logFilePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
