# Robotica Picture Validation

Based on https://docs.microsoft.com/en-us/azure/developer/javascript/how-to/with-web-app/azure-function-file-upload

## Local development

`yarn install` -> install all packages
`yarn start-azurite` -> start local storage account
`yarn start` -> start function locally

### Example upload

```sh
curl -X POST \
    -F 'filename=@robot.jpg' \
    -H 'Content-Type: image/jpg' \
    'http://localhost:7071/api/robotica-picture-validation?filename=robot.jpg&robotName=robot1' --verbose
```
