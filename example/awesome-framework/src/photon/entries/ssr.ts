import indexHtml from "virtual:awesome-plugin:index-js";

export default {
  fetch() {
    return new Response(indexHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
};
