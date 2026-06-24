# InspectorAI Review Fun Wonky

Separate GitHub Pages package for an InspectAid project option extension.

Suggested public URL:

`https://garrisoncameron-dotcom.github.io/InspectorAI-ReviewFunWonky/`

## Publish

1. Create a new GitHub repository named `InspectorAI-ReviewFunWonky`.
2. Add the files in this folder to the repo root.
3. In GitHub, open **Settings > Pages**.
4. Set **Deploy from a branch**, choose `main`, and select `/root`.
5. Save. GitHub Pages will publish the separate URL.

The app is static and has no build step.

If this folder is already a local git repository, publish it with:

```sh
chmod +x publish-template.sh
./publish-template.sh git@github.com:garrisoncameron-dotcom/InspectorAI-ReviewFunWonky.git
```
