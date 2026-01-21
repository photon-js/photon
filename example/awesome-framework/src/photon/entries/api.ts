export default {
  fetch() {
    return new Response("The API Route", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
};
