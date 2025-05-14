# Link Abyss 🔗🕳️

![Link Abyss Header](/show.png)

<div align="center">
  
[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet.svg)](https://github.com/R3DHULK/link-abyss)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/)

**Dive into the depths of your website and discover the broken links lurking below the surface**

</div>

## ✨ Features

- **🔎 Elegant Detection** - Find broken links on any webpage with a single click
- **🖤 Dark Glassmorphism UI** - Beautiful modern interface with blur effects and transparency
- **🕰️ Complete History** - Track all your previous scans with detailed statistics
- **⚙️ Customizable Settings** - Configure scanning behavior to your specific needs
- **⚡ Lightweight & Fast** - Minimal impact on browser performance

## 📸 Screenshots

<div align="center">
  <img src="/tabs/detection.png" width="280" alt="Broken Links Tab">
  <img src="/tabs/history.png" width="280" alt="History Tab">
  <img src="/tabs/settings.png" width="280" alt="Settings Tab">
</div>

## 🚀 Installation

### From Firefox Add-ons Store

1. Visit the [Link Abyss Firefox Add-on page](https://addons.mozilla.org/en-US/firefox/addon/link-abyss-broken-link-detecto/)
2. Click "Add to Firefox"
3. Follow the installation prompts

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/R3DHULK/link-abyss/releases)
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the downloaded `.xpi` file

## 🔧 How It Works

Link Abyss scans through all the links on a webpage and verifies their validity by sending requests to each URL. The extension cleverly differentiates between internal and external links, provides detailed status codes, and remembers your scanning history for future reference.

## 💎 Key Features

### Link Scanning

- **Comprehensive Detection** - Finds broken links across the entire webpage
- **Status Codes** - Displays HTTP status codes for precise diagnosis
- **Internal/External Classification** - Easily identify whether broken links are within your site or external

### History Tracking

- **Scan Archive** - Review previously scanned pages with timestamps
- **Quick Access** - Click on history items to revisit pages
- **Statistics** - See the number of broken links found per scan

### Custom Settings

- **Link Type Filtering** - Choose to scan only internal links, only external links, or both
- **Timeout Control** - Set how long to wait for responses from slow servers
- **History Management** - Control how many history entries to keep

## 🎨 Dark Glassmorphism UI

Link Abyss features a stunning dark glassmorphism interface with:

- **Frosted Glass Effect** - Semi-transparent UI elements with blur effects
- **Subtle Gradients** - Beautiful color transitions for visual appeal
- **Purple Accent Colors** - Modern aesthetic with carefully chosen highlights
- **Responsive Design** - Clean and usable interface at any size

## 🛠️ For Developers

### Tech Stack

- JavaScript
- Firefox WebExtensions API
- Modern CSS (Glassmorphism, Flexbox)

### Project Structure

```
link-abyss/
├── manifest.json         # Extension configuration
├── background/           # Background scripts
├── content/              # Content scripts
├── popup/                # UI components
│   ├── popup.html        # Popup HTML structure
│   ├── popup.css         # Styling with glassmorphism
│   └── popup.js          # UI logic
└── icons/                # Extension icons
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📣 Acknowledgments

- Icons created by R3DHULK
- Special thanks to all contributors and testers

---

<div align="center">
  
💻 Developed with ❤️ by [R3DHULK](https://github.com/R3DHULK)

[Report an Issue](https://github.com/R3DHULK/link-abyss/issues) | [Request a Feature](https://github.com/R3DHULK/link-abyss/issues)

</div>