// JSX intrinsic element declarations for the project's custom elements.
// Allows using <aem-article-list />, <aem-article-detail />, <aem-headless-app /> in TSX.

import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "aem-article-list": HTMLAttributes<HTMLElement> & {
        "aem-host"?: string;
        "graphql-endpoint"?: string;
      };
      "aem-article-detail": HTMLAttributes<HTMLElement> & {
        path?: string;
        "aem-host"?: string;
        "graphql-endpoint"?: string;
      };
      "aem-headless-app": HTMLAttributes<HTMLElement> & {
        "aem-host"?: string;
        "graphql-endpoint"?: string;
        "base-path"?: string;
      };
    }
  }
}
