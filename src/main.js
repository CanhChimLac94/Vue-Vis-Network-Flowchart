import Vue from "vue";
import App from "./App.vue";

// createApp(App).mount('#app')

new Vue({
  el: "#app",
  // Attach the Vue instance to the window,
  // so it's available globally.
  created: function () {
    window.Vue = this;
  },
  render: (h) => h(App)
});
