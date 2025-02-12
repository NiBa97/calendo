import PocketBase from "pocketbase";
import { useNavigate } from "react-router-dom";
const pb = new PocketBase("http://192.168.0.84:8080/");
export function checkIfLoggedIn(): boolean {
  return pb.authStore.isValid;
}
export function logout() {
  pb.authStore.clear();
}
export function getPb() {
  return pb;
}
