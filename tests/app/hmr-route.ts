export default {
  fetch() {
    return new Response("BEFORE HMR", {
      status: 200,
    });
  },
};
