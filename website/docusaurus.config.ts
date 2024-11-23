import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Git Stat Tracker',
  tagline: 'Not production ready...',

  // Set the production url of your site here
  url: 'https://git-stat-tracker.tr00st.co.uk',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tr00st', // Usually your GitHub org/user name.
  projectName: 'git-stat-tracker', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Git Stat Tracker',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/tr00st/git-stat-tracker',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Index',
          items: [
            {
              label: 'Docs',
              to: '/docs/',
            },
            {
              label: 'API',
              to: '/docs/api/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'What community? :)',
              href: '#',
            }
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/tr00st/git-stat-tracker',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} James Cheese. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    [
      'docusaurus-plugin-typedoc',
  
      // Options
      {
        entryPoints: ['../src/'],
        entryPointStrategy: 'expand',
        tsconfig: '../tsconfig.json',
        out: 'docs/api/',
        readme: 'none',
        name: 'API Documentation'
      },
    ],
  ],
};

export default config;
