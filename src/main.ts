import WebGL from 'three/examples/jsm/capabilities/WebGL';
import Game from './Game';

window.addEventListener('DOMContentLoaded', () => {
  if (WebGL.isWebGLAvailable()) {
    const P = new Game();
    P.start();
  } else {
    // Display error message if webgl is not supported
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
  }
});
