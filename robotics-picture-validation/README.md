# Robotics Picture Validation

Based on https://docs.microsoft.com/en-us/azure/developer/javascript/how-to/with-web-app/azure-function-file-upload

## Configuration

The `local.settings.json` file needs te be created in the root of this repository. At this point you can copy the contents of `local.settings.example.json` and you're almost good to go. Make sure both `COGNITIVE_API_URL` and `COGNITIVE_API_KEY` are set correctly.

## Local development

`yarn install` -> install all packages

`yarn start-azurite` -> start local storage account

`yarn start` -> start function locally

### Example upload

```sh
curl -X POST \
    -F 'filename=@auto.jpg' \
    -H 'Content-Type: image/jpg' \
    'http://localhost:7071/api/robotics-picture-validation?filename=robot.jpg&robotName=robot1' --verbose
```

## Production

Please make sure to use the correct `<CODE>` and path to the file.

```sh
curl \
    --location \
    --request POST 'https://fa-robotica-johnny-5.azurewebsites.net/api/robotica-picture-validation?code=<CODE>&filename=robot1.jpg&robotName=robot1' \
    --form 'F=@"/Users/my-user/Desktop/robot.jpg"'
```
