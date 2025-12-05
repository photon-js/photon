import { enhance } from "@universal-middleware/core";

function foo() {
  return new Response("foo");
}

export default enhance(foo, {
  name: "foo",
  path: "/foo",
  method: "GET",
});
