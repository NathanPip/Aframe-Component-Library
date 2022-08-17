
# Portal Component

Portal Components are used to create a "doorway" between two locations in a ThreeJS scene. They can link to another portal in your
scene or have a link attached to them that redirects the user upon collision.


## API

| Property | Description     | Default Value      |
| :-------- | :------- | :----------------------- |
| `width` | **Required** The width dimension of the portal. Will be calculated in SI units. | 2.0 |
| `height` | **Required** The height dimension of the portal. Will be calculated in SI units. | 3.0 |
| `destination` | **Optional** The element ID of the portal element this portal will link to. Is not required if `href` property value is present. *Note: either the destination property or href property must have a value attached*| "" |
| `href` | **Optional** A link the page will be redirected to when the user collides with the portal. WARNING: Use of a navmesh behind the portal is recommended as the user will walk through the portal mesh before the window is redirected without one. (Still working on solution). *Note: either the destination property or href property must have a value attached* | "" |
| `img` | **Optional** Path to image texture displayed on portal. Path must be a file path in your directory not an image object already loaded into the scene. | "" *EX:* `img: /assets/images/texture.png` |
| `enableTeleport` | **Optional** Whether a user can teleport through the portal. | `true` |
| `teleportCooldown` | **Optional** The time (in milliseconds) in between which a user cannot teleport through the portal. Used to prevent infinite portal teleporting as user collides with portal upon exiting. | 150 |
| `maxRecursion` | **Optional** The amount of times portals are recursively rendered. Recursive rendering is required for portal mirroring effects. **WARNING: Any value greater than 0 causes heavy performance impacts**  | 0 |

## Use

### Linked Portals
```html
<a-entity id="portal1" rotation="0 180 0"  portal="destination: #portal2; width: 2.63; height: 2.76;" position="5 1.8 -5"></a-entity>
<a-entity id="portal2" rotation="0 0 0"  portal="destination: #portal1; width: 2.63; height: 2.76;" position="10 1.8 5"></a-entity>
```

### Href Portals 
```html
<a-entity id="portal" rotation="0 0 0"  portal="href: https://google.com; img:/imgs/texture.png; width: 2.63; height: 2.76;" position="0 0 0"></a-entity>
```