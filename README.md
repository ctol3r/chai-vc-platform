# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Partner Portal Templates

The `frontend` folder includes a simple theming system for building white-labeled partner portals.

### Building a Theme

Run the build script from the `frontend` directory with the desired theme name. The generated HTML and CSS will be written to `frontend/dist`.

```bash
cd frontend
python build.py [theme-name]
```

For example, to build the sample partner theme:

```bash
python build.py partner_sample
```

Customize the files under `frontend/themes/<your-theme>` to create a branded portal.
