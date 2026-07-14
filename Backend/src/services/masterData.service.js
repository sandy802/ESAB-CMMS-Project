const CrudService = require("./crud.service");

// Each service is just a CrudService instance with its table name
// Asset service has extra logic so it's extended below

const locationService      = new CrudService("locations");
const breakdownTypeService = new CrudService("breakdown_types");
const rootCauseService     = new CrudService("root_causes");
const mttrReasonService    = new CrudService("mttr_reasons");

module.exports = {
  locationService,
  breakdownTypeService,
  rootCauseService,
  mttrReasonService,
};