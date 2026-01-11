import { API_BASE_URL } from "/src/config/api.js";

export async function CreateVoucher(object) {
  try {
    const response = await fetch(API_BASE_URL + "Voucher/AddVoucher", {
      method: "POST",
      body: JSON.stringify(object),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    var data = await response.json();
    return data;
  } catch (ex) {
    console.log(ex);
  }
}

export async function GetVouchers(code) {
  const response = await fetch(
    API_BASE_URL + `Voucher/GetVouchersByCode?code=${code}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  return data;
}

export async function GetAllVouchers(vendorId) {
  const response = await fetch(
    API_BASE_URL + `Voucher/GetVouchersByVendorId?vendorId=${vendorId}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  return data;
}

export async function toggleVoucherStatus(status, id) {
  const response = await fetch(
    `${API_BASE_URL}Voucher/ToggleVoucherStatus?id=${id}&status=${status}`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );

  const data = await response.json();
  return data;
}

export const deleteVoucher = async (voucherId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}Voucher/DeleteVoucher?id=${voucherId}`,
      {
        method: "delete",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Delete error", error);
    return { status: false };
  }
};
