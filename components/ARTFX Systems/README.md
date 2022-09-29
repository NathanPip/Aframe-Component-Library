
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
The loading screen and loading manager are meant to build on top of Aframe's built in loading system to add more functionality and customizability.

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

### OPTIONS 
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

#### Changing OPTIONS
To change options you must add the `loading-manager` attribute to the `<a-scene>` element and include the settings you wish to  change in the attribute
value. Formatting is the same as defining schema in A-frame components: `option name: option value;`  
EX: `loading-manger="bgColor: #ff0000;"`
## UI and Settings System
The UI and Settings System are a seamless set of systems that add easy to use, clean UI as well as built in audio and Networked Aframe settings
that automatically update scene and site data.

### UI System
WIP. Will have full customizability for a custom navbar, custom classes, and custom ui boxes

### Settings System
When the System is initialized an object on element titled `settings` will appear with default values corresponding to different
settings and preferences within the site and scene. When the values in this object are manipulated funtions are called which update
data in the scene and site corresponding to whatever value has been changed. A custom event named `settings-changed` is also emitted
with an object of the settings that have been changed and their new values attatched to the `details` of the event. Custom properties
can be added to the settings object.

### Usage
To instantiate both the UI and the settings system you must first declare a custom HTML property `<artfx-systems>` and place it somewhere in the 
document body or `a-scene` element. Attributes added to the `<artfx-systems>` change different properties of the UI and settings.  
Ex:  
```
<artfx-systems 
  settings="isNetworked: true; voiceEnabled: false;" 
  preferences="sound" 
  info-buttons="Controls, btn controls-btn;" 
/>
```

### Attributes
#### **wait-for-load**  
`wait-for-load` is a `boolean` value that dictates whether the UI system will initialize and render before the 
loading screen has been removed. Default value is `true`.  
#### **settings**  
Custom Settings are declared similarly to A-Frame component scheme properties. `settings="parameter: value;"`
| Parameter | Type     | Description                | Default Value |
| :-------- | :------- | :------------------------- | :-------------|
| `enabled` | `boolean` | enables or disables the UI system. | `true` |
| `settingsEnabled` | `boolean` | enables or disables scene and site settings system. | `true` |
| `isNetworked` | `boolean` | whether or not the system includes Networked Aframe functionality. | `false` |
| `chatEnabled` | `boolean` | enables or disables the chat system. **Requires isNetworked**| `true` |
| `voiceEnabled` | `boolean` | enables or disables the voice chat system. **Requires isNetworked**| `true` |

#### **preferences**
Preferences are instantiated by setting a list of strings, each corresponding to a preference the user can adjust.  
Ex: `preferences="sound,"`
| Setting | Description
| :-------- | :------- 
| `sound` | volume and mute preferences.

#### **info-buttons**
Custom info buttons are instantiated by declaring two strings seperated by a comma for each custom button. The first string is the 
text applied to the button element attatched to the ui. The second string is the name of the class/classes attatched to that element. 
If multiple custom elements are being declared, each element declaration should be seperated by a comma.
Ex: `info-buttons="Controls, btn control-info-btn; Contributors, btn contributor-info-btn;"`