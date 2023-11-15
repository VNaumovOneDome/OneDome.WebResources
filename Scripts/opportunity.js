"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.updateIframeSource = updateIframeSource;

async function updateIframeSource(executionContext) {
    let formContext = executionContext.getFormContext();
    let dealRoomId = formContext.getAttribute("cmme_od_dealroomuuid").getValue();
    if (dealRoomId == null)
        return;
    let oneDomeSettingValue = await retrieveSettingByKey("OneDomeUrl");
    formContext.getControl("IFRAME_OneDome").setSrc(`${oneDomeSettingValue}/tickets/deal/${dealRoomId}`);
    formContext.ui.tabs.get("OneDome").setVisible(true);
}

async function retrieveSettingByKey(key) {
    let filter = `?$select=cmme_value&$filter=cmme_name eq '${key}'`;
    let value = await Xrm.WebApi.retrieveMultipleRecords("cmme_od_onedomesettings", filter);
    return value.entities[0].cmme_value;
}
