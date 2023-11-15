"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.openDealRoomCreationWebpage = openDealRoomCreationWebpage;
exports.hideCreateDealRoomButton = hideCreateDealRoomButton;

async function openDealRoomCreationWebpage(primaryControl) {
    const recordId = getClearId(primaryControl.data.entity.getId());
    const contactId = primaryControl.getAttribute("parentcontactid").getValue()[0].id;
    const fetchXml = "?$select=firstname,lastname,emailaddress1,mobilephone";
    const opportunityFetchXml = "?$select=cmme_od_dealroomuuid";
    let retrivedOpportunity = await Xrm.WebApi.retrieveRecord("opportunity", recordId, opportunityFetchXml);
    if (retrivedOpportunity.cmme_od_dealroomuuid != null) {
        await openAlertDialog("Opportunity already have linked DealRoom. Please refresh page");
        return;
    }

    let retrivedContact = await Xrm.WebApi.retrieveRecord("contact", contactId, fetchXml);
    let oneDomeSettingValue = await retrieveSettingByKey("OneDomeUrl");
    let URL = `${oneDomeSettingValue}/tickets/deal/create#buyerFirstName=${retrivedContact.firstname}&buyerLastName=${retrivedContact.lastname}&buyerEmail=${retrivedContact.emailaddress1}&buyerPhone=${retrivedContact.mobilephone}&msdcOpportunityUuid=${recordId}`;
    primaryControl.getControl("IFRAME_OneDome").setSrc(URL);
    primaryControl.ui.tabs.get("OneDome").setVisible(true);
    primaryControl.ui.tabs.get("OneDome").setFocus();

    let notification =
    {
        type: 2,
        level: 3, //warning
        message: "Please do not close or update CRM page until DealRoom creation process is finished",
        showCloseButton: true
    }

    await Xrm.App.addGlobalNotification(notification);
}

function hideCreateDealRoomButton(primaryControl) {
    const cmmeAdvisorRoleId = ("BBC43A34-672C-E811-A838-000D3A2A3148").toLowerCase();
    const systemAdminRoleId = ("50E3CE47-9DB3-E711-A82F-000D3A2654F3").toLowerCase();
    let flag = false;
    let formLabel = primaryControl.ui.formSelector.getCurrentItem().getLabel();
    let isUserRoleAdmin = checkCurrentUserRole(systemAdminRoleId);
    let isUserRoleCmmeAdvisor = checkCurrentUserRole(cmmeAdvisorRoleId);
    if (formLabel == "CMME: Opportunity (Mortgages)" && isUserRoleAdmin && isUserRoleCmmeAdvisor)
        flag = true;

    return flag;
}

function checkCurrentUserRole(userRoleId) {
    let flag = false;
    let userSecurityRoleIds = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
    for (var i = 0; i < userSecurityRoleIds.length; i++) {
        if (userSecurityRoleIds[i].toLowerCase() == userRoleId)
            flag = true;
    }
    return flag;
}

function getClearId(id) {
    return id.replace("{", "").replace("}", "")
}

async function openAlertDialog(text) {
    const alertStrings = {
        confirmButtonLabel: "Ok",
        text: text,
        title: "Business Process Error"
    };
    const alertOptions = { height: 200, width: 450 };
    await Xrm.Navigation.openAlertDialog(alertStrings, alertOptions)
};

async function retrieveSettingByKey(key) {
    let filter = `?$select=cmme_value&$filter=cmme_name eq '${key}'`;
    let value = await Xrm.WebApi.retrieveMultipleRecords("cmme_od_onedomesettings", filter);
    return value.entities[0].cmme_value;
}
