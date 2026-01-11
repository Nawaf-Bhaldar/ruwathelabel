import { API_BASE_URL } from "/src/config/api.js";

export async function apiGetAllCollectionsById(userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}Collection/GetAllCollections?userId=${userId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { status: false, data: [] };
  }
}
