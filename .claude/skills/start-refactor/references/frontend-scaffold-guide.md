# Frontend Project Scaffold Guide

## Option A: ASP.NET Core MVC + TailwindCSS

### Create Project

```bash
dotnet new mvc -n Web -o web/
dotnet sln add web/Web.csproj
```

### Add TailwindCSS

```text
cd web
npm init -y
npm install -D tailwindcss @tailwindcss/cli
```

Create `web/Styles/site.css`:

```javascript
@import "tailwindcss";
```

Add build script to `package.json`:

```json
{
  "scripts": {
    "css:build": "npx @tailwindcss/cli -i ./Styles/site.css -o ./wwwroot/css/site.css --minify",
    "css:watch": "npx @tailwindcss/cli -i ./Styles/site.css -o ./wwwroot/css/site.css --watch"
  }
}
```

### Configure API Client

Create `web/Services/ApiClient.cs` to communicate with the WebAPI:

```csharp
public class ApiClient(HttpClient httpClient)
{
    public async Task<T?> GetAsync<T>(string endpoint)
    {
        var response = await httpClient.GetFromJsonAsync<ApiResponse<T>>($"api/{endpoint}");
        return response?.Data;
    }
}
```

Register in `Program.cs`:

```text
builder.Services.AddHttpClient<ApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiBaseUrl"]!);
});
```

---

## Option B: React + TailwindCSS

### Create Project

```bash
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Update `vite.config.ts`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://localhost:7001'
    }
  }
})
```

Add to `src/index.css`:

```javascript
@import "tailwindcss";
```

### Recommended Additional Packages

```bash
npm install react-router-dom @tanstack/react-query axios
npm install -D @types/react-router-dom
```

---

## Option C: Vue + TailwindCSS

### Create Project

```bash
npm create vite@latest web -- --template vue-ts
cd web
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Update `vite.config.ts`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://localhost:7001'
    }
  }
})
```

### Recommended Additional Packages

```bash
npm install vue-router pinia axios
```

---

## Option D: Blazor

### Create Project

```text
# Blazor Server (recommended for internal apps)
dotnet new blazor -n Web -o web/ --interactivity Server

# Or Blazor WebAssembly
dotnet new blazor -n Web -o web/ --interactivity WebAssembly
```

### Add TailwindCSS to Blazor

```text
cd web
npm init -y
npm install -D tailwindcss @tailwindcss/cli
```

---

## Option E: Angular + TailwindCSS

### Create Project

```bash
npx @angular/cli@latest new frontend --style css --ssr false --routing true
cd frontend
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Create or update `postcss.config.json`:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Add to `src/styles.css`:
```css
@import "tailwindcss";
```

Configure API proxy — create `frontend/proxy.conf.json`:
```json
{
  "/api": {
    "target": "https://localhost:7001",
    "secure": false
  }
}
```

Update `angular.json` serve options to include proxy:
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### Recommended Additional Packages

```bash
npm install @angular/cdk
```
