<h1 align=center>Markdown Swagger</h1>

<div align=center>
  <img src="https://github.com/rmariuzzo/markdown-swagger/raw/master/banner.png" />
</div>

Generate markdown API docs (swagger).

## Installation

```shell
npm install markdown-swagger
```

### Usage

```shell
markdown-swagger ./api/swagger/swagger.yaml ./README.md
```

This will read the specified swagger file and generate a table describing the API inside the target markdown file.

The `markdown-swagger` script will look for the for the following piece of text inside the target markdown file to do its stuff:

```markdown
<!-- markdown-swagger -->
  Everything here will be replaced by markdown-swagger
<!-- /markdown-swagger -->
```
