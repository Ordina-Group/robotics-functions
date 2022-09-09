# robotics-functions

### Troubleshooting

- Make sure the `FUNCTIONS_WORKER_RUNTIME` is set to `node` for enviornment variables to be available in runtime.
- For now it looks like you need a Windows based FunctionApp if you want to use the `FUNCTIONS_WORKER_RUNTIME` to work correctly.
- Uses `node-fetch` v2.x because of compability with Azure Function runtime
