import type { AppState } from "@auth0/auth0-react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";


export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();


  //Handles redirect to admin page on login
  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || "/");
  };

  return (
    <Auth0Provider
      domain="dev-oayu8epftihuelj1.us.auth0.com"
      clientId="dxRIYZwKz8Zh790ccHzAwctQ3JcqJe1T"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}