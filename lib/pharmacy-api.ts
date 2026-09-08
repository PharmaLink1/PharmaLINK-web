// Data access for the pharmacy / inventory / admin-catalogue screens.
//
// These are re-exported from the central api-client so every screen keeps a single
// import site while the real endpoints live alongside auth/search/notify. The former
// in-memory mock has been removed now that the backend is wired.

export { pharmacyApi, pharmacyAdminApi, medicineApi, inventoryApi } from "./api-client";
