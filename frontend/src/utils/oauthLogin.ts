export const oauthRedirect = () => {
  const googleLoginUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=1031230524711-arrd1ooagqbk9oovk1baoibam5afj84t.apps.googleusercontent.com` +
    `&redirect_uri=http://localhost:3000/dev/auth/google` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  return () => {
    window.location.href = googleLoginUrl;
  };
};
