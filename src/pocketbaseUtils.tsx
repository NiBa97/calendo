import PocketBase from "pocketbase";
export const pb = new PocketBase("https://pocketbase-calendo.niklas-bauer.dev");
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
