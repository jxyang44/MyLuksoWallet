
<br />
<div align="center">
  <a href="https://myluksowallet-hackathon.netlify.app">
    <img src="https://user-images.githubusercontent.com/58372066/186786266-d6c1365e-66ff-46fe-aae2-6ac92156f462.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MyLuksoWallet</h3>

  <p align="center">
    A frontend management tool for Lukso Standard Proposals.
    <br />
    Submission for LUKSO Build UP! #1
    <br />
    <a href="https://myluksowallet-hackathon.netlify.app"><strong>Hackathon Submission (8/31/22)</strong></a>
    <br />
    ·
    <a href="https://www.myluksowallet.com">Working Public Website</a>
    ·
    <a href="https://docs.google.com/presentation/d/1KGlWPiMQu9HsbDDt2WgSXEF9vcHWhigdcR9-jILy12k/edit?usp=sharing">Presentation</a>
    ·
    <a href="https://myluksowallet-hackathon.netlify.app/getstarted">Tutorials from Website</a>
    ·
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

MyLuksoWallet is a front-end asset management tool to visualize Universal Profiles, LSP7 Tokens, LSP8 NFTs, and LSP9 Vaults. 
<br/>
Functionality includes:
<ul>
  <li>Universal Profiles - Create a profile, manage standard profile metadata, choose profile themes (stored as metadata), manage permissions, transfer tokens</li>
  <li>LSP7 Tokens - Deploy a contract, mint, transfer</li>
  <li>LSP8 NFTs - Deploy a contract, mint, transfer</li>
  <li>LSP9 Vaults - Deploy a vault (w/ universal receiver delegate), add vault to UP, manage vault permissions, transfer assets to vault</li>
</ul>
<br/>
Link to the required video submission: https://www.youtube.com/watch?v=nronIM7Lgxc&t=57s
<br/>
Additional documentation on MyLuksoWallet can be found at:
<ul>  
  <li><a href="https://myluksowallet-hackathon.netlify.app/getstarted">Tutorials from Website</a></li>
  <li><a href="https://docs.google.com/presentation/d/1KGlWPiMQu9HsbDDt2WgSXEF9vcHWhigdcR9-jILy12k/edit?usp=sharing">Presentation Slides</a></li>
  <li><a href="https://www.youtube.com/watch?v=Fcii2svh6KY&list=PLFBtxrByZXCQ195uSM921M6CGcAUf3k6O">Youtube Tutorials</a></li>
</ul>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation


1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter your private key in `.env` (The private key is only used to deploy LSP7/LSP8 contracts using LSPFactory in `CreateLSPForm.js`. I was not able to get LSPFactory to work using the window in time, but this should be a quick change in the future. The private key is not used for anything else.)
   ```js
   const REACT_APP_METAMASK_MY_DEV_PRIVATE_KEY= 'ENTER YOUR PRIVATE KEY';
   
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Add Changelog
- [x] Add back to top links
- [ ] Add Additional Templates w/ Examples
- [ ] Add "components" document to easily copy & paste sections of the readme
- [ ] Multi-language Support
    - [ ] Chinese
    - [ ] Spanish

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Your Name - [@your_twitter](https://twitter.com/your_username) - email@example.com

Project Link: [https://github.com/your_username/repo_name](https://github.com/your_username/repo_name)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

* [Choose an Open Source License](https://choosealicense.com)
* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
* [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
* [Malven's Grid Cheatsheet](https://grid.malven.co/)
* [Img Shields](https://shields.io)
* [GitHub Pages](https://pages.github.com)
* [Font Awesome](https://fontawesome.com)
* [React Icons](https://react-icons.github.io/react-icons/search)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
