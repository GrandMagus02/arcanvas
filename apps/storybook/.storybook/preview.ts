import type { Preview } from "@storybook/html";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen", // Remove padding and make fullscreen
  },
  decorators: [
    (story) => {
      // Remove padding from Storybook main container
      const style = document.createElement("style");
      style.textContent = `
        .sb-show-main.sb-main-padded {
          padding: 0 !important;
        }
        .sb-main-padded {
          padding: 0 !important;
        }
      `;
      document.head.appendChild(style);
      return story();
    },
  ],
};

export default preview;
