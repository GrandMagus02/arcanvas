import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import BasicShapesExample from "../components/BasicShapesExample.vue";
import GettingStartedExample from "../components/GettingStartedExample.vue";
import GridExample from "../components/GridExample.vue";
import InteractionExample from "../components/InteractionExample.vue";
import MSDFGeneratorExample from "../components/MSDFGeneratorExample.vue";
import SelectionExample from "../components/SelectionExample.vue";
import SelectionGridExample from "../components/SelectionGridExample.vue";
import TypographyExample from "../components/TypographyExample.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Manual registration (keep for backward compatibility)
    app.component("BasicShapesExample", BasicShapesExample);
    app.component("GettingStartedExample", GettingStartedExample);
    app.component("GridExample", GridExample);
    app.component("InteractionExample", InteractionExample);
    app.component("MSDFGeneratorExample", MSDFGeneratorExample);
    app.component("SelectionExample", SelectionExample);
    app.component("SelectionGridExample", SelectionGridExample);
    app.component("TypographyExample", TypographyExample);

    // Auto-registration of package components
    // Scans ../../../packages/*/docs/**/*.vue
    const packageComponents = import.meta.glob("../../../packages/*/docs/**/*.vue", { eager: true });

    for (const path in packageComponents) {
      const component = (packageComponents[path] as any).default;
      // Extract component name from filename
      // path is like "../../../packages/interaction/docs/examples/basic/InteractionExample.vue"
      const filename = path.split("/").pop();
      if (filename) {
        const name = filename.replace(".vue", "");
        // Register component if not already registered (manual takes precedence?)
        // Actually, let's allow overwriting or unique names.
        // For now, simple filename registration is consistent with existing patterns.
        if (!app._context.components[name]) {
          app.component(name, component);
        }
      }
    }
  },
} satisfies Theme;
