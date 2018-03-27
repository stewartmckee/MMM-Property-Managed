# MMM-Property-Managed

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Todo: Insert description here!

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-Property-Managed',
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `token`        | *Required* Authentication token obtained from www.property-managed.com
| `useColor`        | *Optional* Specifies whether to use color in display. true (default) or false
| `updateInterval`        | *Optional* Interval to wait between updates (default 60000)
| `retryDelay`        | *Optional* Interval to wait between retries (default 5000)
