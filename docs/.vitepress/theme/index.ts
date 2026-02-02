import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import BasicShapesExample from "../components/BasicShapesExample.vue";
import GettingStartedExample from "../components/GettingStartedExample.vue";
import GridExample from "../components/GridExample.vue";
import MSDFGeneratorExample from "../components/MSDFGeneratorExample.vue";
import SelectionExample from "../components/SelectionExample.vue";
import SelectionGridExample from "../components/SelectionGridExample.vue";
import TypographyExample from "../components/TypographyExample.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("BasicShapesExample", BasicShapesExample);
    app.component("GettingStartedExample", GettingStartedExample);
    app.component("GridExample", GridExample);
    app.component("MSDFGeneratorExample", MSDFGeneratorExample);
    app.component("SelectionExample", SelectionExample);
    app.component("SelectionGridExample", SelectionGridExample);
    app.component("TypographyExample", TypographyExample);
  },
} satisfies Theme;
