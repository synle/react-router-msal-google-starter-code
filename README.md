# react-router-msal-starter-code

## Auth notes

### AAD Auth notes

Register this login callback `/api/auth/login_callback` for your AAD App Registration

- http://localhost:3000/api/auth/login_callback
- https://yourdomain.com/api/auth/login_callback

### Google Auth notes

Go to Google Cloud Console and register this login callback `/api/auth/login_callback` for your webapp.

- http://localhost:3000/api/auth/login_callback
- https://yourdomain.com/api/auth/login_callback

## Generate from template

```
npx create-react-router@latest --template remix-run/react-router-templates/node-custom-server
```
