import GENERAL from "./general";

export default (workspace) =>
  ({
    development: `http://${workspace}.know.local:55023`,
    staging: `https://${workspace}.know-staging.kdlab.dev/school`,
    preprod: `https://${workspace}.know-preprod.kdlab.dev/school`,
    production: `https://${workspace}.know.studio/school`,
  }[GENERAL.NODE_ENV]);
