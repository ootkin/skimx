import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'SkimX',
  base: '/skimx/',
  description: 'Create web applications using OpenAPI schemas',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/introduction' },
    ],
    sidebar: [
      {
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Examples', link: '/examples' },
          { text: 'Generate OAS', link: '/generate-openapi-spec' },
          { text: 'About', link: '/about' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ootkin/skimx' },
    ],
  },
});
