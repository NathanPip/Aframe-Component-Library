
# ARTFX Systems
A library of systems to be used in Aframe scenes.
- **UI System**: A fully customizeable UI system with integrated settings, optional navbar and networked aframe features for text and voice chat
- **Loading Screen and Manager**: Optional Loading screen and loading manager for Aframe scenes. Replaces built-in Aframe loading screen.
- **Settings System**: fully integrated settings system for adjusting scene audio and other user settings.
# Usage
## Setup
Artfx Systems are dependent on Aframe and optionally Networked Aframe so you must include the system's `<script>` tag in your 
programs `<head>` underneath any Aframe or Networked Aframe `<script>` tags. You must also include a `<link>` to the system's stylesheet. 
```
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <title>Example</title>

    <!-- Aframe -->
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>

    <!-- Networked Aframe -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.4.0/socket.io.slim.js"></script>
    <script src="https://unpkg.com/open-easyrtc@^2.0.13/api/easyrtc.js"></script>
    <script src="https://unpkg.com/networked-aframe@0.9.1/dist/networked-aframe.min.js"></script>

    <!-- Artfx Systems -->
    <script src="./artfx-systems.js"></script>

    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="./components/ui-system/artfx-system-style.css" />

  </head>
```
## Loading Manager and Screen
The loading screen and loading manager are meant to add on top of Aframe's built in loading system to add more functionality and customizeability.

### Loading Manager
The loading manager is an [Aframe System](https://aframe.io/docs/1.3.0/core/systems.html) which runs it's logic after the "loaded" event is fired by Aframe.
The loading manager consists of three main functions, **preLoad,** **load,** and **postLoad**
- **preLoad:** runs directly after Aframe emits the "loaded" event.
- **load:** an asynchronous functions which runs all asynchronous logic within components as well as waits for a specified delay.
- **postLoad:** runs after the load function has completed and fires the "scene-loaded" event upon completion.
To integrate components into the loading manager you must include a function with the same name as one of these three properties.
```
AFRAME.registerComponent('foo', {
  schema: {},
  init: function () {},
  update: function () {},
  tick: function () {},
  remove: function () {},
  preLoad: function() {},
  load: async function() {}, // IMPORTANT MUST BE ASYNC
  postLoad: function() {}
});
```
### Loading Screen
The loading screen functions as a seperate THREE.js scene which is layed overtop the main Aframe scene. Customizablity options are available through
the loading manager.
#### OPTIONS 
| Parameter | Type     | Description                | Default Value |
| :-------- | :------- | :------------------------- | :-------------|
| `enabled` | `boolean` | enabled or disables loading manager and loading screen | `true` |
| `loadScreenEnabled` | `boolean` | enabled or disables loading loading screen | `true` |
| `clickToStart` | `boolean` | whether the loading screen requires user interaction to dissappear. | `true` |
| `loadSelf` | `boolean` | whether the scene should search it's own components for load functions | `true` |
| `bgColor` | `hexadecimal string` | the color of the loading screen's background | `#000000` |
| `ambientColor` | `hexadecimal string` | the color of the ambient light in the loading scene | `#ffffff` |
| `forelightColor` | `hexadecimal string` | the color of the forelights shining on the torus | `#ffffff` |
| `backlightColor` | `hexadecimal string` | the color of the backlights shining on the torus | `#0000ff` |

