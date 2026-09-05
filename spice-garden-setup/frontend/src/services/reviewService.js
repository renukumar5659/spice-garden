import api from "./api";

export async function fetchReviews() {
  const { data } = await api.get("/reviews/");
  return data.results ?? data;
}

export async function submitReview(payload) {
  const { data } = await api.post("/reviews/", payload);
  return data;
}
