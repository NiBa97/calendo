import PocketBase from "pocketbase";
const pb = new PocketBase("http://192.168.0.84:8080/");
export function checkIfLoggedIn(): boolean {
  return pb.authStore.isValid;
}
export function logout() {
  alert("logged out");
  pb.authStore.clear();
}
export function getPb() {
  return pb;
}
