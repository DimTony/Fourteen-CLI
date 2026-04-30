import { api } from "../api/client.js";

export async function listProfiles(params: any) {
  const queryParams: Record<string, string> = {};

  const paramMapping: Record<string, string> = {
    gender: "gender",
    country: "country_id",
    ageGroup: "age_group",
    minAge: "min_age",
    maxAge: "max_age",
    minGenderProbability: "min_gender_probability",
    maxGenderProbability: "max_gender_probability",
    minCountryProbability: "min_country_probability",
    sortBy: "sort_by",
    order: "order",
    page: "page",
    limit: "limit",
  };

  // console.log("Params received in service:", params);

  for (const [cliParam, backendParam] of Object.entries(paramMapping)) {
    if (params[cliParam] !== undefined && params[cliParam] !== null) {
      queryParams[backendParam] = String(params[cliParam]);
    }
  }

  const query = new URLSearchParams(queryParams).toString();
  
  // console.log("Generated query:", query);

  return await api.get(`/api/profiles?${query}`);
}

export async function getProfile(id: string) {
  return await api.get(`/api/profiles/${id}`);
}

export async function searchProfiles(
  query: string,
  opts: { page?: string; limit?: string } = {},
) {
  const params = new URLSearchParams({ q: query });
  if (opts.page) params.append("page", opts.page);
  if (opts.limit) params.append("limit", opts.limit);

  return await api.get(`/api/profiles/search?${params.toString()}`);
}

export async function createProfile(opts: {
  name: string;
  gender?: string;
  country?: string;
}) {
  const body: Record<string, string> = { name: opts.name };
  if (opts.gender) body.gender = opts.gender;
  if (opts.country) body.country = opts.country;

  return await api.post(`/api/profiles`, body);
}

export async function exportProfiles(opts: {
  format: string;
  gender?: string;
  country?: string;
  ageGroup?: string;
  minAge?: string;
  maxAge?: string;
  minGenderProbability?: string;
  maxGenderProbability?: string;
  minCountryProbability?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  limit?: string;
}): Promise<string> {
  const params = new URLSearchParams();

  if (opts.format) params.append("format", opts.format);
  if (opts.gender) params.append("gender", opts.gender);
  if (opts.country) params.append("country_id", opts.country);
  if (opts.ageGroup) params.append("age_group", opts.ageGroup);
  if (opts.minAge) params.append("min_age", opts.minAge);
  if (opts.maxAge) params.append("max_age", opts.maxAge);
  if (opts.minGenderProbability) params.append("min_gender_probability", opts.minGenderProbability);
  if (opts.maxGenderProbability) params.append("max_gender_probability", opts.maxGenderProbability);
  if (opts.minCountryProbability) params.append("min_country_probability", opts.minCountryProbability);
  if (opts.sortBy) params.append("sort_by", opts.sortBy);
  if (opts.order) params.append("order", opts.order);
  if (opts.page) params.append("page", opts.page);
  if (opts.limit) params.append("limit", opts.limit);
  
  const query = params.toString();
  return await api.getText(`/api/profiles/export${query ? `?${query}` : ""}`);
}