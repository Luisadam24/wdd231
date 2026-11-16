# Weather setup for the published chamber page

The site uses a GitHub Actions secret to request Harare weather from OpenWeatherMap. The key stays out of the source files and Git history. The action publishes only the returned weather data; the browser does not receive the API key.

1. In the `wdd231` repository on GitHub, open **Settings → Secrets and variables → Actions**.
2. Select **New repository secret**. Set the name to `OPENWEATHER_API_KEY` and paste your OpenWeatherMap key as the value.
3. Open **Settings → Pages** and change **Build and deployment → Source** to **GitHub Actions**.
4. Open the **Actions** tab, select **Deploy WDD231 site**, and choose **Run workflow** on the `main` branch.
5. Wait for the run to finish successfully, then open `https://luisadam24.github.io/wdd231/chamber/index.html` in a private window.

The workflow refreshes the weather data about every three hours and also runs after changes are pushed to `main`. Never put the key in a JavaScript, HTML, or JSON file in the repository.
