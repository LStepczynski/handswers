export const logOut = () => {
  localStorage.removeItem("user");
  window.location.reload();
};
