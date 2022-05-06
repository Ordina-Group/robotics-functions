# Robotica Picture Validation

Based on https://docs.microsoft.com/en-us/azure/developer/javascript/how-to/with-web-app/azure-function-file-upload

### Example upload

```sh
curl -X POST \
    -F 'filename=@test-file.txt' \
    -H 'Content-Type: text/plain' \
    'http://localhost:7071/api/upload?filename=test-file.txt&username=robot1' --verbose
```
