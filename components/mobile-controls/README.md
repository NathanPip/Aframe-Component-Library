
# Mobile Controls Components

## Twoway Movement
The `twoway-movement` component controls the user through tap inputs on a mobile screen and is built off of the built in wasd-controls component. Tap and hold one finger on the screen and two fingers to move back. Drag your finger to rotate the camera.



| Property | Description     | Default Value      |
| :-------- | :------- | :----------------------- |
| `speed` | **Optional** Acceleration and speed of wasd controls | 2.0 |


## Use

### Example Player Controller
```html
<a-entity id="player"
      camera="near:0.01;"
      look-controls="pointerLockEnabled: false"
      position="-18.098 2.2 27.009"
      wasd-controls="acceleration:20;"
      twoway-movement="speed: 20;"
    ></a-entity>
```