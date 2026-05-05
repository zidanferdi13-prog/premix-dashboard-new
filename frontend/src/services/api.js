import { API_PRINT_URL, API_BASE_URL } from '../constants'
import moment from 'moment';
import axios from "axios";

export const nomorMO = async ({ nomor }) => {
  const response = await axios.get(`${API_BASE_URL}/timbangan/nomorMo?nomor_mo=${nomor}`);
  return response;
};
export const findMoPlant = async (tgl) => {
  console.log(tgl, "tgl");

  const response = await axios.get(`${API_BASE_URL}/timbangan/findMoPlant?tgl=${tgl}`);
  return response;
};

export const refreshDataWeight = async (t_mo_id) => {
  const response = await axios.get(
    `${API_BASE_URL}/timbangan/refreshDataWeight?t_mo_id=${t_mo_id}`,
  );
  return response;
};
export const resetDataWeight = async (t_mo_id) => {
  const response = await axios.get(
    `${API_BASE_URL}/timbangan/resetWeightPlant?t_mo_id=${t_mo_id}`,
  );
  return response;
};
export const findOneWeight = async (t_mo_id) => {
  const response = await axios.get(
    `${API_BASE_URL}/timbangan/findOneWeight?t_mo_id=${t_mo_id}`,
  );
  return response;
};
export const endProcesWeight = async (t_mo_id) => {
  const response = await axios.get(
    `${API_BASE_URL}/timbangan/endProcesWeight?t_mo_id=${t_mo_id}`,
  );
  return response;
};
export const addTransactionPlant = async (obj) => {
  const response = await axios.post(`${API_BASE_URL}/timbangan/addTransactionPlant`, obj);
  // const response = await axios.post(`http://localhost:8002/timbangan/addTransactionPlant`, obj);
  return response;
};
export const printHasil = async (obj) => {
  const response = await axios.post(`${API_PRINT_URL}`, obj);
  return response;
};

export const getMO = async () => {
  let now = moment().format("YYYY-MM-DD");
  let obj = {
    planning_date_start: now,
    location: "WAN",
    company: "AMA1",
    kyw: "GENERATE MTECH",
  };
  const response = await axios.post(`${API_BASE_URL}/newKanban/findMO`, obj);
  console.log("getMO response:", response);
  return response;
};
