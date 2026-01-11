import { API_BASE_URL } from "/src/config/api.js";

let localStorageObject = localStorage.getItem("User_Full_Info");
let userFulInfo = JSON.parse(localStorageObject);

export async function GetAllShippingCosts() {
  const response = await fetch(API_BASE_URL + `Account/GetAllShippingCosts`, {
    method: "GET",
  });
  const data = await response.json();

  return data;
}

export async function addShippingCost(object) {
  const response = await fetch(API_BASE_URL + "Account/AddShippingCost", {
    method: "POST",
    body: JSON.stringify(object),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      // "Authorization": 'Bearer '+user
    },
  });
  var data = await response.json();

  return data;
}

export async function apiDeleteCost(id) {
  const response = await fetch(
    API_BASE_URL + `Account/DeleteShippingCost?Id=${id}`,
    {
      method: "Delete",
      headers: {
        // "key": user.id,
        // "orgId": user.organizationId,
        // "Authorization": 'Bearer '+user
      },
    }
  );
  const data = await response.json();

  return data;
}

export async function GetShippingCostById(id) {
  const response = await fetch(
    API_BASE_URL + `Account/GetShippingCostById?Id=${id}`,
    {
      method: "GET",
      headers: {
        // "key": user.id,
        // "orgId": user.organizationId,
        // "Authorization": 'Bearer ' + user.token
      },
    }
  );
  const data = await response.json();

  return data;
}

export async function UpdateShippingCost(object) {
  const response = await fetch(API_BASE_URL + "Account/UpdateShippingCost", {
    method: "POST",
    body: JSON.stringify(object),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      // "Authorization": 'Bearer '+user
    },
  });
  var data = await response.json();

  return data;
}

export async function apiCalculateShippingCost(object) {
  const response = await fetch(
    API_BASE_URL + "Account/GetShippingChargesByCountry",
    {
      method: "POST",
      body: JSON.stringify(object),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        // "Authorization": 'Bearer '+user
      },
    }
  );
  var data = await response.json();

  return data;
}
