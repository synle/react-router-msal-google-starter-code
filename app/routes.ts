import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

//@ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

export default flatRoutes() satisfies RouteConfig;
