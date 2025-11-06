import { apply, type UniversalHandler, UniversalRouter, universalSymbol } from "@universal-middleware/core";
import awesomeFramework from "awesome-framework/universal-middleware";

// TODO create new util in UM
const router = new UniversalRouter(true, true);
apply(router, awesomeFramework);
const handler = router[universalSymbol] as UniversalHandler;

export default {
  fetch(request: Request) {
    return handler(request, {}, { adapter: "other", runtime: "other", params: undefined });
  },
};
